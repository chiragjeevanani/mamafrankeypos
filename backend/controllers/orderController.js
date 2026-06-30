const Order = require('../models/Order');
const Table = require('../models/Table');
const Counter = require('../models/Counter');
const StoreSettings = require('../models/StoreSettings');
const mongoose = require('mongoose');
const logAudit = require('../utils/auditLogger');
const asyncHandler = require('../utils/asyncHandler');
const { getMaskingRules, maskOrder, maskCurrencyValue, maskQuantityValue } = require('../utils/dataMask');
const { getDailySequenceNextValue } = require('../utils/counterHelper');
const { runInTransaction } = require('../utils/transactionHelper');

// Utility helpers for timezone-aware date calculations
const getLocalMidnight = (date, timezone) => {
  const offsetMinutes = timezone === 'Asia/Kolkata' ? 330 : 0;
  const utcTime = date.getTime();
  const localTime = utcTime + (offsetMinutes * 60 * 1000);
  const localDate = new Date(localTime);
  localDate.setUTCHours(0, 0, 0, 0);
  return new Date(localDate.getTime() - (offsetMinutes * 60 * 1000));
};

const getStartOfMonth = (date, timezone) => {
  const offsetMinutes = timezone === 'Asia/Kolkata' ? 330 : 0;
  const utcTime = date.getTime();
  const localTime = utcTime + (offsetMinutes * 60 * 1000);
  const localDate = new Date(localTime);
  localDate.setUTCHours(0, 0, 0, 0);
  localDate.setUTCDate(1);
  return new Date(localDate.getTime() - (offsetMinutes * 60 * 1000));
};

const ORDER_TYPE_QUERY_MAP = {
  CAR: 'CAR-SERVICE',
  'CAR-SERVICE': 'CAR-SERVICE',
  PICKUP: 'PICKUP',
  'DINE-IN': 'DINE-IN',
  DINEIN: 'DINE-IN',
};

const ORDER_STATUS_QUERY_MAP = {
  'running-kot': 'RUNNING',
  running: 'RUNNING',
  billed: 'BILLED',
  printed: 'BILLED',
  paid: 'COMPLETED',
  completed: 'COMPLETED',
  cancelled: 'CANCELLED',
};

const normalizeCustomerPayload = (customer = {}) => {
  const normalized = {
    name: String(customer.name || '').trim(),
    phone: String(customer.phone || customer.mobile || '').trim(),
    address: String(customer.address || '').trim(),
    locality: String(customer.locality || '').trim(),
    notes: String(customer.notes || customer.extra || '').trim(),
  };

  return Object.values(normalized).some(Boolean) ? normalized : undefined;
};

const applyOrderMetadata = (order, body = {}) => {
  const normalizedCustomer = normalizeCustomerPayload(body.customer);

  if (body.staffId) {
    if (mongoose.Types.ObjectId.isValid(body.staffId)) {
      order.waiter = body.staffId;
    }
  }

  if (body.orderType) {
    order.orderType = body.orderType;
  }

  if (normalizedCustomer) {
    order.customer = normalizedCustomer;
  }

  return order;
};

// @desc    Create new order or add KOT to existing order
// @route   POST /api/orders
// @access  Private
const processOrder = asyncHandler(async (req, res) => {
  const { 
    tableId, 
    orderType, 
    carNumber, 
    items, 
    total, 
    staffId, 
    counterId,
    orderId, // Optional: if provided, add KOT to this order
    customer,
    markPrinted
  } = req.body;

  if (tableId && !mongoose.Types.ObjectId.isValid(tableId)) {
    res.status(400);
    throw new Error('Invalid Table ID format');
  }

  if (staffId && !mongoose.Types.ObjectId.isValid(staffId)) {
    res.status(400);
    throw new Error('Invalid Staff ID format');
  }

  if (counterId && !mongoose.Types.ObjectId.isValid(counterId)) {
    res.status(400);
    throw new Error('Invalid Counter ID format');
  }

  if (orderId && !mongoose.Types.ObjectId.isValid(orderId)) {
    res.status(400);
    throw new Error('Invalid Order ID format');
  }

  if (!items || !Array.isArray(items)) {
    res.status(400);
    throw new Error('Items array is required');
  }

  for (const item of items) {
    const mItem = item.baseId || item.id;
    if (!mItem || !mongoose.Types.ObjectId.isValid(mItem)) {
      res.status(400);
      throw new Error(`Invalid menu item ID format: ${mItem}`);
    }
  }

  // Run database creation/mutation inside a transaction session
  const populatedOrder = await runInTransaction(async (session) => {
    const sessionOpts = session ? { session } : {};
    const sessionOptsNew = session ? { session, new: true } : { new: true };

    let order;

    if (orderId) {
      order = await Order.findById(orderId).session(session);
    } else if (tableId) {
      // Find active order for this table
      order = await Order.findOne({ table: tableId, orderStatus: 'RUNNING' }).session(session);
    }

    // Prepare KOT
    const kotTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const newKOT = {
      items: items.map(item => ({
        menuItem: item.baseId || item.id,
        itemModel: item.itemModel || 'MenuItem',
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        variants: item.variants || [],
        instructions: item.instructions || ''
      })),
      staff: staffId,
      time: new Date(),
      status: markPrinted ? 'printed' : 'pending',
      total: kotTotal
    };

    if (order) {
      const kotVal = await getDailySequenceNextValue('DAILY_KOT_COUNTER', 'KOT', 1);
      newKOT.kotNumber = String(kotVal);

      // Add KOT to existing order ATOMICALLY
      const updatePayload = {
        $push: { kots: newKOT },
        $inc: { subtotal: kotTotal, totalAmount: kotTotal }
      };

      // Handle metadata updates if provided
      if (orderType) updatePayload.orderType = orderType;
      if (staffId) updatePayload.waiter = staffId;
      if (customer) updatePayload.customer = normalizeCustomerPayload(customer);

      order = await Order.findByIdAndUpdate(
        order._id,
        updatePayload,
        sessionOptsNew
      );

      if (markPrinted && order.table) {
        await Table.findByIdAndUpdate(order.table, { status: 'running-kot' }, sessionOpts);
      }
    } else {
      // Check-and-set table status atomically first if it's a Dine-in table order
      if (tableId) {
        const table = await Table.findOneAndUpdate(
          { _id: tableId, status: 'blank' },
          { status: 'running-kot' },
          sessionOptsNew
        );

        if (!table) {
          // Concurrency fallback: another session got the table! Find the running order
          order = await Order.findOne({ table: tableId, orderStatus: 'RUNNING' }).session(session);
          if (order) {
            const kotVal = await getDailySequenceNextValue('DAILY_KOT_COUNTER', 'KOT', 1);
            newKOT.kotNumber = String(kotVal);

            order = await Order.findByIdAndUpdate(
              order._id,
              {
                $push: { kots: newKOT },
                $inc: { subtotal: kotTotal, totalAmount: kotTotal }
              },
              sessionOptsNew
            );

            if (markPrinted && order.table) {
              await Table.findByIdAndUpdate(order.table, { status: 'running-kot' }, sessionOpts);
            }
            
            return await Order.findById(order._id).populate('table waiter biller').session(session);
          } else {
            res.status(409);
            throw new Error('Table is currently occupied. Please refresh and try again.');
          }
        }
      }

      // Create new order
      // 1. Get Counter and increment number ATOMICALLY
      const counter = await Counter.findByIdAndUpdate(
        counterId,
        { $inc: { currentNum: 1 } },
        sessionOpts
      );

      if (!counter) {
        res.status(400);
        throw new Error('Invalid Counter ID');
      }

      const orderNumber = `${counter.prefix}-${String(counter.currentNum).padStart(3, '0')}`;

      // Get daily token number for all orders
      const tokenVal = await getDailySequenceNextValue('DAILY_TOKEN_COUNTER', 'TKN', 1);
      const tokenNo = String(tokenVal);

      const kotVal = await getDailySequenceNextValue('DAILY_KOT_COUNTER', 'KOT', 1);
      newKOT.kotNumber = String(kotVal);

      const createdOrders = await Order.create([{
        orderNumber,
        tokenNo,
        table: tableId,
        orderType: orderType || 'DINE-IN',
        carNumber,
        waiter: staffId,
        customer: normalizeCustomerPayload(customer),
        kots: [newKOT],
        subtotal: kotTotal,
        totalAmount: kotTotal,
        counter: counterId,
        orderStatus: 'RUNNING',
        branch: req.branchId || null,
      }], sessionOpts);
      
      order = createdOrders[0];

      // Update table pointer if dine-in
      if (tableId) {
        await Table.findByIdAndUpdate(tableId, { currentOrder: order._id }, sessionOpts);
      }
    }

    return await Order.findById(order._id).populate('table waiter biller').session(session);
  });

  res.status(201).json(populatedOrder);
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid Order ID format');
  }

  const order = await Order.findById(req.params.id)
    .populate('table waiter counter biller')
    .populate('kots.items.menuItem');

  if (order) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Update active order metadata
// @route   PUT /api/orders/:id
// @access  Private
const updateOrder = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid Order ID format');
  }

  if (req.body.staffId && !mongoose.Types.ObjectId.isValid(req.body.staffId)) {
    res.status(400);
    throw new Error('Invalid Staff ID format');
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Allow admin to override status directly
  if (req.body.orderStatus && req.body.orderStatus !== order.orderStatus) {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Only administrators can override order status');
    }

    const newStatus = req.body.orderStatus;
    const oldStatus = order.orderStatus;

    if (!['RUNNING', 'COMPLETED', 'CANCELLED', 'BILLED'].includes(newStatus)) {
      res.status(400);
      throw new Error('Invalid order status value');
    }

    order.orderStatus = newStatus;

    // Handle state transitions for table status
    if (newStatus === 'CANCELLED') {
      order.cancellationReason = req.body.cancellationReason || 'Cancelled by Administrator via status override';
      order.cancelledAt = new Date();
      if (order.table) {
        await Table.findByIdAndUpdate(order.table, { status: 'blank', currentOrder: null });
      }
    } else if (newStatus === 'COMPLETED') {
      order.paymentStatus = 'PAID';
      order.paymentMethod = req.body.paymentMethod || 'CASH';
      order.completedAt = new Date();
      order.biller = req.user?._id;
      if (order.table) {
        await Table.findByIdAndUpdate(order.table, { status: 'blank', currentOrder: null });
      }
    } else if (newStatus === 'RUNNING' || newStatus === 'BILLED') {
      // Reverting from COMPLETED or CANCELLED to RUNNING/BILLED
      order.paymentStatus = 'PENDING';
      order.completedAt = undefined;
      order.cancelledAt = undefined;
      order.cancellationReason = undefined;
      
      if (order.table) {
        // Find if table status needs to be running-kot or printed
        const tableStatus = newStatus === 'BILLED' ? 'printed' : 'running-kot';
        await Table.findByIdAndUpdate(order.table, { status: tableStatus, currentOrder: order._id });
      }
    }

    await logAudit(
      req.user._id,
      'ORDER_STATUS_OVERRIDE',
      'ORDERS',
      `Order ${order.orderNumber} status overridden from ${oldStatus} to ${newStatus}`,
      req.ip
    );
  } else {
    // If not updating status, block metadata updates on completed/cancelled orders
    if (order.orderStatus === 'COMPLETED' || order.orderStatus === 'CANCELLED') {
      res.status(400);
      throw new Error(`Order cannot be updated in ${order.orderStatus} state`);
    }
  }

  applyOrderMetadata(order, req.body);
  await order.save();

  const populatedOrder = await Order.findById(order._id).populate('table waiter counter biller');
  res.json(populatedOrder);
});

// @desc    Get order by ID or Table ID
// @route   GET /api/orders/active/:identifier
// @access  Private
const getActiveOrder = asyncHandler(async (req, res) => {
  const { identifier } = req.params;
  
  let order;
  // Try finding by table ID if it is a valid ObjectId
  if (mongoose.Types.ObjectId.isValid(identifier)) {
    order = await Order.findOne({ table: identifier, orderStatus: 'RUNNING' })
      .populate('table waiter biller')
      .populate('kots.items.menuItem');
  } else {
    // Try finding by car number
    order = await Order.findOne({ carNumber: identifier, orderStatus: 'RUNNING' })
      .populate('table waiter biller')
      .populate('kots.items.menuItem');
  }

  if (order) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error('No active order found');
  }
});

// @desc    Mark KOT as printed
// @route   PATCH /api/orders/:id/kot/:kotId/print
// @access  Private
const markKOTPrinted = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid Order ID format');
  }

  if (!mongoose.Types.ObjectId.isValid(req.params.kotId)) {
    res.status(400);
    throw new Error('Invalid KOT ID format');
  }

  const order = await Order.findById(req.params.id);
  if (order) {
    const kot = order.kots.id(req.params.kotId);
    if (kot) {
      kot.status = 'printed';
      await order.save();
      
      // Update table status if all KOTs are printed (keep as running-kot)
      if (order.table && order.kots.every(k => k.status === 'printed')) {
        await Table.findByIdAndUpdate(order.table, { status: 'running-kot' });
      }
      
      const populatedOrder = await Order.findById(order._id).populate('table waiter biller');
      res.json(populatedOrder);
    } else {
      res.status(404);
      throw new Error('KOT not found');
    }
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Mark order as BILLED
// @route   POST /api/orders/:id/bill
// @access  Private
const billOrder = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid Order ID format');
  }

  const updatedOrder = await runInTransaction(async (session) => {
    const sessionOpts = session ? { session } : {};
    const sessionOptsNew = session ? { session, new: true } : { new: true };

    const order = await Order.findById(req.params.id).session(session);
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    if (order.orderStatus === 'COMPLETED') {
      res.status(400);
      throw new Error('Cannot bill a completed order');
    }

    if (order.orderStatus === 'CANCELLED') {
      res.status(400);
      throw new Error('Cannot bill a cancelled order');
    }

    // --- Inclusive Tax Reverse Calculation ---
    const settings = await StoreSettings.findOne().session(session);
    const activeTaxes = settings?.taxes?.filter(t => t.active) || [];
    
    let subtotal = order.subtotal || (order.totalAmount + (order.discount?.amount || 0));
    let taxes = [];

    if (activeTaxes.length > 0) {
      const totalTaxRate = activeTaxes.reduce((sum, t) => sum + t.percentage, 0);
      const baseAmount = order.totalAmount / (1 + (totalTaxRate / 100));
      taxes = activeTaxes.map(t => ({
        name: t.name,
        rate: t.percentage,
        amount: Number((baseAmount * (t.percentage / 100)).toFixed(2))
      }));
    }

    // Atomic update with condition: only update if totalAmount hasn't changed 
    // since we read it for the calculation. This prevents "lost updates".
    const updated = await Order.findOneAndUpdate(
      { _id: req.params.id, totalAmount: order.totalAmount },
      {
        $set: {
          subtotal,
          taxes,
          orderStatus: 'BILLED',
          billedAt: new Date()
        }
      },
      sessionOptsNew
    ).populate('table waiter biller');

    if (!updated) {
      res.status(409);
      throw new Error('Order total changed during billing. Please retry.');
    }

    if (updated.table) {
      await Table.findByIdAndUpdate(
        updated.table._id || updated.table,
        { status: 'printed' },
        sessionOpts
      );
    }

    return updated;
  });

  res.json(updatedOrder);
});

// @desc    Settle order (Mark as COMPLETED)
// @route   POST /api/orders/:id/settle
// @access  Private
const settleOrder = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid Order ID format');
  }

  const { paymentMethod, taxes, totalAmount } = req.body;

  const settledOrder = await runInTransaction(async (session) => {
    const sessionOpts = session ? { session } : {};
    const sessionOptsNew = session ? { session, new: true } : { new: true };

    // Use findOneAndUpdate with status check to prevent double settlement
    const order = await Order.findOneAndUpdate(
      { 
        _id: req.params.id, 
        orderStatus: { $ne: 'COMPLETED' } 
      },
      {
        $set: {
          paymentMethod,
          taxes,
          totalAmount,
          paymentStatus: 'PAID',
          orderStatus: 'COMPLETED',
          completedAt: new Date(),
          biller: req.user?._id
        }
      },
      sessionOptsNew
    ).populate('table waiter biller');

    if (!order) {
      res.status(404);
      throw new Error('Order not found or already completed');
    }

    if (order.table) {
      await Table.findByIdAndUpdate(
        order.table._id || order.table,
        { status: 'blank', currentOrder: null },
        sessionOpts
      );
    }
    
    await logAudit(
      req.user?._id || order.waiter || '000000000000000000000000',
      'ORDER_SETTLED',
      'ORDERS',
      `Order ${order.orderNumber} settled for ₹${totalAmount}`,
      req.ip
    );

    return order;
  });

  res.json(settledOrder);
});

// @desc    Cancel a KOT item
// @route   PATCH /api/orders/:id/kot/:kotId/items/:itemId/cancel
// @access  Private
const cancelKOTItem = asyncHandler(async (req, res) => {
  const { id, kotId, itemId } = req.params;
  const { reason } = req.body || {};

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error('Invalid Order ID format');
  }

  if (!mongoose.Types.ObjectId.isValid(kotId)) {
    res.status(400);
    throw new Error('Invalid KOT ID format');
  }

  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    res.status(400);
    throw new Error('Invalid Item ID format');
  }

  const order = await Order.findById(id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  const kot = order.kots.id(kotId);
  const item = kot?.items?.id(itemId);

  if (!kot || !item) {
    res.status(404);
    throw new Error('KOT or Item not found');
  }

  if (item.status === 'cancelled') {
    res.status(400);
    throw new Error('Item already cancelled');
  }

  const reduction = item.price * item.quantity;

  const updatedOrder = await Order.findOneAndUpdate(
    { _id: id, "kots._id": kotId, "kots.items._id": itemId },
    {
      $set: { 
        "kots.$[k].items.$[i].status": 'cancelled',
        "kots.$[k].items.$[i].cancellationReason": reason || 'No reason provided'
      },
      $inc: { 
        subtotal: -reduction, 
        totalAmount: -reduction,
        "kots.$[k].total": -reduction
      }
    },
    {
      arrayFilters: [{ "k._id": kotId }, { "i._id": itemId }],
      new: true
    }
  ).populate('table waiter biller');

  res.json(updatedOrder);
});

const cleanStuckOrdersInternal = async () => {
  try {
    const activeOrders = await Order.find({ orderStatus: { $in: ['RUNNING', 'BILLED'] } });
    for (const order of activeOrders) {
      const activeItems = (order.kots || []).flatMap(k => k.items || []).filter(i => i.status !== 'cancelled');
      if (activeItems.length === 0) {
        order.orderStatus = 'CANCELLED';
        order.cancellationReason = 'Automatically cancelled: All items voided';
        order.cancelledAt = new Date();
        await order.save();

        if (order.table) {
          await Table.findByIdAndUpdate(order.table, {
            status: 'blank',
            currentOrder: null
          });
        }
      }
    }
  } catch (err) {
    console.error("cleanStuckOrdersInternal error:", err);
  }
};

// @desc    Get order history
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
  const query = {};

  // Apply branch filter
  if (req.activeBranchId) {
    query.branch = req.activeBranchId;
  }

  if (req.query.type) {
    const mappedType = ORDER_TYPE_QUERY_MAP[String(req.query.type).trim().toUpperCase()];
    if (mappedType) {
      query.orderType = mappedType;
    }
  }

  if (req.query.status) {
    const mappedStatus = ORDER_STATUS_QUERY_MAP[String(req.query.status).trim().toLowerCase()];
    if (mappedStatus) {
      query.orderStatus = mappedStatus;
    }
  }

  if (req.query.active === 'true') {
    await cleanStuckOrdersInternal();
    query.orderStatus = { $in: ['RUNNING', 'BILLED'] };
  }

  if (req.query.search) {
    const searchVal = String(req.query.search).trim();
    if (searchVal) {
      const searchRegex = new RegExp(searchVal, 'i');
      query.$or = [
        { orderNumber: searchRegex },
        { 'customer.name': searchRegex },
        { 'customer.phone': searchRegex },
        { carNumber: searchRegex }
      ];
    }
  }

  const page = req.query.page ? parseInt(req.query.page, 10) : null;
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : null;
  
  const isAdminRequest = req.headers['x-module'] === 'admin';
  const rules = isAdminRequest ? await getMaskingRules() : null;

  if (page && limit) {
    const skip = (page - 1) * limit;
    const total = await Order.countDocuments(query);
    const data = await Order.find(query)
      .sort({ createdAt: -1 })
      .populate('table waiter counter biller')
      .skip(skip)
      .limit(limit);
      
    const responseData = isAdminRequest ? data.map(o => maskOrder(o, rules)) : data;

    res.json({
      data: responseData,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } else {
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .populate('table waiter counter biller');
      
    const responseData = isAdminRequest ? orders.map(o => maskOrder(o, rules)) : orders;
    res.json(responseData);
  }
});

// @desc    Get sales summary
// @route   GET /api/orders/summary
// @access  Private/Admin
const getSalesSummary = asyncHandler(async (req, res) => {
  const settings = await StoreSettings.findOne() || {};
  const timezone = settings.timezone || 'Asia/Kolkata';

  const today = getLocalMidnight(new Date(), timezone);
  const firstDayOfMonth = getStartOfMonth(new Date(), timezone);

  const branchMatch = req.activeBranchId ? { branch: new mongoose.Types.ObjectId(req.activeBranchId) } : {};

  const [todaySales, mtdSales] = await Promise.all([
    Order.aggregate([
      { $match: { ...branchMatch, orderStatus: 'COMPLETED', completedAt: { $gte: today } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } }
    ]),
    Order.aggregate([
      { $match: { ...branchMatch, orderStatus: 'COMPLETED', completedAt: { $gte: firstDayOfMonth } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } }
    ])
  ]);

  let todayTotal = todaySales[0]?.total || 0;
  let mtdTotal = mtdSales[0]?.total || 0;
  let todayCount = todaySales[0]?.count || 0;
  let mtdCount = mtdSales[0]?.count || 0;

  const isAdminRequest = req.headers['x-module'] === 'admin';
  if (isAdminRequest) {
    const rules = await getMaskingRules();
    todayTotal = maskCurrencyValue(todayTotal, null, rules);
    mtdTotal = maskCurrencyValue(mtdTotal, null, rules);
    todayCount = maskQuantityValue(todayCount, rules);
    mtdCount = maskQuantityValue(mtdCount, rules);
  }

  res.json({
    today: {
      total: todayTotal,
      count: todayCount
    },
    mtd: {
      total: mtdTotal,
      count: mtdCount
    }
  });
});

// @desc    Get orders for Adjustment Audit (System Protocols)
// @route   GET /api/orders/adjustment-audit
// @access  Private/Admin
const getAdjustmentAudit = asyncHandler(async (req, res) => {
  const { startDate, endDate, paymentMode, orderType, billNo, itemName, outlet, priceRange } = req.query;
  
  let query = { orderStatus: 'COMPLETED' };

  const settings = await StoreSettings.findOne() || {};
  const timezone = settings.timezone || 'Asia/Kolkata';

  // 1. Date Range Filter
  if (startDate && endDate) {
    const offsetMinutes = timezone === 'Asia/Kolkata' ? 330 : 0;
    
    // Parse start date as local midnight
    const start = new Date(startDate);
    start.setUTCHours(0, 0, 0, 0);
    const startUtc = new Date(start.getTime() - (offsetMinutes * 60 * 1000));

    // Parse end date as local end of day
    const end = new Date(endDate);
    end.setUTCHours(23, 59, 59, 999);
    const endUtc = new Date(end.getTime() - (offsetMinutes * 60 * 1000));

    query.completedAt = {
      $gte: startUtc,
      $lte: endUtc
    };
  }

  // 2. Payment Mode (Strictly CASH & CASHLESS)
  if (paymentMode && paymentMode !== '--All Payment Modes--' && paymentMode !== '--All Modes--') {
    if (paymentMode === 'CASH') {
      query.paymentMethod = { $regex: /^cash(?!less)/i };
    } else if (paymentMode === 'CASHLESS') {
      query.paymentMethod = { $regex: /^cashless/i };
    } else {
      query.paymentMethod = paymentMode;
    }
  } else {
    query.$or = [
      { paymentMethod: { $regex: /^cash(?!less)/i } },
      { paymentMethod: { $regex: /^cashless/i } }
    ];
  }

  // 3. Order Type (Bill Type)
  if (orderType && orderType !== '--All Types--') {
    if (mongoose.Types.ObjectId.isValid(orderType)) {
      // It's a Section ID! Find all tables belonging to this section
      const tables = await Table.find({ section: orderType });
      const tableIds = tables.map(t => t._id);
      query.table = { $in: tableIds };
      query.orderType = 'DINE-IN';
    } else {
      const typeMap = {
        'DINE-IN': 'DINE-IN',
        'PICKUP': 'PICKUP',
        'CAR-SERVICE': 'CAR-SERVICE',
        'TABLE BILL': 'DINE-IN',
        'TAKE WAY': 'PICKUP',
        'CAR SERVICE': 'CAR-SERVICE'
      };
      query.orderType = typeMap[orderType] || orderType;
    }
  }

  // 4. Bill Number (Order Number)
  if (billNo) {
    query.orderNumber = { $regex: billNo, $options: 'i' };
  }

  // 5. Item Name Filter
  if (itemName && itemName !== '--Filter by item--') {
    query['kots.items.name'] = { $regex: itemName, $options: 'i' };
  }

  // 6. Price Range Filter
  if (priceRange) {
     if (priceRange.includes('Premium') || priceRange.includes('High')) {
        query.totalAmount = { $gt: 1000 };
     } else if (priceRange.includes('Economy') || priceRange.includes('Low')) {
        query.totalAmount = { $lt: 300 };
     }
  }

  const orders = await Order.find(query)
    .sort({ completedAt: -1 })
    .populate('table waiter counter biller');
    
  // Always apply masking — this route is admin-only (protect + admin middleware)
  // regardless of x-module header to prevent unmasked data leaking via API tools
  const rules = await getMaskingRules();
  const maskedOrders = orders.map(o => maskOrder(o, rules));
  res.json(maskedOrders);
});

// @desc    Cancel Order
// @route   POST /api/orders/:id/cancel
// @access  Private/Admin
const cancelOrder = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid Order ID format');
  }

  // Use findOneAndUpdate to ensure we only cancel if NOT already completed/cancelled
  const order = await Order.findOneAndUpdate(
    { 
      _id: req.params.id, 
      orderStatus: { $nin: ['COMPLETED', 'CANCELLED'] } 
    },
    {
      $set: {
        orderStatus: 'CANCELLED',
        cancellationReason: reason || 'Cancelled by Administrator',
        cancelledAt: new Date()
      }
    },
    { new: true }
  );

  if (!order) {
    // Check if it exists at all to give better error
    const exists = await Order.findById(req.params.id);
    if (!exists) {
      res.status(404);
      throw new Error('Order not found');
    }
    res.status(400);
    throw new Error(`Order cannot be cancelled. Current status: ${exists.orderStatus}`);
  }

  // Free the table if it was running
  if (order.table) {
    await Table.findByIdAndUpdate(order.table, { status: 'blank', currentOrder: null });
  }

  await logAudit(
    req.user?._id || '000000000000000000000000',
    'ORDER_CANCELLED',
    'ORDERS',
    `Order ${order.orderNumber} cancelled. Reason: ${reason || 'N/A'}`,
    req.ip
  );

  res.json({ message: 'Order cancelled successfully', order });
});

// @desc    Apply discount to order
// @route   POST /api/orders/:id/discount
// @access  Private
const applyDiscount = asyncHandler(async (req, res) => {
  const { type, value, reason, couponCode } = req.body;

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid Order ID format');
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.orderStatus === 'COMPLETED' || order.orderStatus === 'CANCELLED') {
    res.status(400);
    throw new Error('Cannot apply discount to finalized order');
  }

  let discountAmount = 0;
  if (type === 'PERCENTAGE') {
    discountAmount = (order.subtotal * value) / 100;
  } else {
    discountAmount = value;
  }

  // Prevent negative billing
  if (discountAmount > order.subtotal) {
    discountAmount = order.subtotal;
  }

  const updatedOrder = await Order.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        'discount.type': type,
        'discount.value': value,
        'discount.amount': Math.round(discountAmount),
        'discount.reason': reason,
        'discount.couponCode': couponCode,
        'discount.appliedBy': req.user?._id,
        totalAmount: Math.round(order.subtotal - discountAmount)
      }
    },
    { new: true }
  ).populate('table waiter biller');

  await logAudit(
    req.user?._id || '000000000000000000000000',
    'ORDER_DISCOUNT_APPLIED',
    'ORDERS',
    `Applied ${value}${type === 'PERCENTAGE' ? '%' : ' FLAT'} discount to Order ${order.orderNumber}.${couponCode ? ' Coupon: ' + couponCode : ''} Reason: ${reason || 'N/A'}`,
    req.ip
  );

  res.json(updatedOrder);
});

// @desc    Apply discount to specific item in KOT
// @route   PATCH /api/orders/:id/kot/:kotId/item/:itemId/discount
// @access  Private
const applyItemDiscount = asyncHandler(async (req, res) => {
  const { type, value } = req.body;
  const { id, kotId, itemId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error('Invalid Order ID format');
  }

  if (!mongoose.Types.ObjectId.isValid(kotId)) {
    res.status(400);
    throw new Error('Invalid KOT ID format');
  }

  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    res.status(400);
    throw new Error('Invalid Item ID format');
  }

  const order = await Order.findById(id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  const kot = order.kots.id(kotId);
  if (!kot) {
    res.status(404);
    throw new Error('KOT not found');
  }

  const item = kot.items.id(itemId);
  if (!item) {
    res.status(404);
    throw new Error('Item not found');
  }

  if (item.status === 'cancelled') {
    res.status(400);
    throw new Error('Cannot discount cancelled item');
  }

  const itemPrice = item.price * item.quantity;
  let oldDiscountAmt = item.discount?.amount || 0;
  
  let newDiscountAmt = 0;
  if (type === 'PERCENTAGE') {
    newDiscountAmt = (itemPrice * value) / 100;
  } else {
    newDiscountAmt = value;
  }

  // Prevent negative price
  if (newDiscountAmt > itemPrice) newDiscountAmt = itemPrice;

  item.discount = {
    type,
    value,
    amount: Math.round(newDiscountAmt)
  };

  // Adjust order totals
  const diff = Math.round(newDiscountAmt - oldDiscountAmt);
  kot.total -= diff;
  order.subtotal -= diff;
  order.totalAmount -= diff;

  await order.save();

  await logAudit(
    req.user?._id,
    'ITEM_DISCOUNT_APPLIED',
    'ORDERS',
    `Applied ${value}${type === 'PERCENTAGE' ? '%' : ' FLAT'} discount to ${item.name} in Order ${order.orderNumber}`,
    req.ip
  );

  res.json(order);
});

// @desc    Auto Clear Empty Order
// @route   POST /api/orders/:id/auto-clear-empty
// @access  Private
const autoClearEmptyOrder = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid Order ID format');
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Count active items
  const activeItemsCount = (order.kots || []).flatMap(k => k.items || []).filter(i => i.status !== 'cancelled').length;

  if (activeItemsCount > 0) {
    res.status(400);
    throw new Error('Cannot auto-clear order: Order has active items. Manager PIN is required.');
  }

  // Update order status to CANCELLED and free the table
  order.orderStatus = 'CANCELLED';
  order.cancellationReason = 'Automatically cancelled: All items voided';
  order.cancelledAt = new Date();
  await order.save();

  if (order.table) {
    await Table.findByIdAndUpdate(order.table, {
      status: 'blank',
      currentOrder: null
    });
  }

  res.json({ message: 'Empty order cleared successfully', order });
});

module.exports = {
  processOrder,
  updateOrder,
  getOrderById,
  getActiveOrder,
  markKOTPrinted,
  cancelKOTItem,
  billOrder,
  settleOrder,
  cancelOrder,
  getOrders,
  getSalesSummary,
  getAdjustmentAudit,
  applyDiscount,
  applyItemDiscount,
  autoClearEmptyOrder
};
