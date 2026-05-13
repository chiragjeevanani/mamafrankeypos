const Order = require('../models/Order');
const Table = require('../models/Table');
const Counter = require('../models/Counter');
const StoreSettings = require('../models/StoreSettings');
const logAudit = require('../utils/auditLogger');

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
    order.waiter = body.staffId;
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
const processOrder = async (req, res) => {
  const { 
    tableId, 
    orderType, 
    carNumber, 
    items, 
    total, 
    staffId, 
    counterId,
    orderId, // Optional: if provided, add KOT to this order
    customer
  } = req.body;

  try {
    let order;

    if (orderId) {
      order = await Order.findById(orderId);
    } else if (tableId) {
      // Find active order for this table
      order = await Order.findOne({ table: tableId, orderStatus: 'RUNNING' });
    }

    // Prepare KOT
    const kotTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const newKOT = {
      items: items.map(item => ({
        menuItem: item.baseId || item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        variants: item.variants || [],
        instructions: item.instructions || ''
      })),
      staff: staffId,
      time: new Date(),
      status: 'pending',
      total: kotTotal
    };

    if (order) {
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
        { new: true }
      ).populate('table waiter');
    } else {
      // Create new order
      // 1. Get Counter and increment number ATOMICALLY
      const counter = await Counter.findByIdAndUpdate(
        counterId,
        { $inc: { currentNum: 1 } },
        { new: false } // Get value BEFORE increment
      );

      if (!counter) {
        res.status(400);
        throw new Error('Invalid Counter ID');
      }

      const orderNumber = `${counter.prefix}-${String(counter.currentNum).padStart(3, '0')}`;

      order = await Order.create({
        orderNumber,
        table: tableId,
        orderType: orderType || 'DINE-IN',
        carNumber,
        waiter: staffId,
        customer: normalizeCustomerPayload(customer),
        kots: [newKOT],
        subtotal: kotTotal,
        totalAmount: kotTotal,
        counter: counterId,
        orderStatus: 'RUNNING'
      });

      // Update table status if dine-in
      if (tableId) {
        await Table.findByIdAndUpdate(tableId, { status: 'running-kot', currentOrder: order._id });
      }
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
};

// @desc    Update active order metadata
// @route   PUT /api/orders/:id
// @access  Private
const updateOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    if (order.orderStatus === 'COMPLETED' || order.orderStatus === 'CANCELLED') {
      res.status(400);
      throw new Error(`Order cannot be updated in ${order.orderStatus} state`);
    }

    applyOrderMetadata(order, req.body);
    await order.save();

    const populatedOrder = await Order.findById(order._id).populate('table waiter counter');
    res.json(populatedOrder);
  } catch (error) {
    console.error('Update order error:', error);
    res.status(res.statusCode && res.statusCode !== 200 ? res.statusCode : 500).json({ message: error.message });
  }
};

// @desc    Get order by ID or Table ID
// @route   GET /api/orders/active/:identifier
// @access  Private
const getActiveOrder = async (req, res) => {
  const { identifier } = req.params;
  
  // Try finding by table ID first
  let order = await Order.findOne({ table: identifier, orderStatus: 'RUNNING' }).populate('kots.items.menuItem');
  
  if (!order) {
     // Try finding by car number
     order = await Order.findOne({ carNumber: identifier, orderStatus: 'RUNNING' }).populate('kots.items.menuItem');
  }

  if (order) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error('No active order found');
  }
};

// @desc    Mark KOT as printed
// @route   PATCH /api/orders/:id/kot/:kotId/print
// @access  Private
const markKOTPrinted = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (order) {
    const kot = order.kots.id(req.params.kotId);
    if (kot) {
      kot.status = 'printed';
      await order.save();
      
      // Update table status if all KOTs are printed
      if (order.table && order.kots.every(k => k.status === 'printed')) {
        await Table.findByIdAndUpdate(order.table, { status: 'printed' });
      }
      
      res.json(order);
    } else {
      res.status(404);
      throw new Error('KOT not found');
    }
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
};

// @desc    Mark order as BILLED
// @route   POST /api/orders/:id/bill
// @access  Private
const billOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    // --- Inclusive Tax Reverse Calculation ---
    const settings = await StoreSettings.findOne();
    const activeTaxes = settings?.taxes?.filter(t => t.active) || [];
    
    let subtotal = order.totalAmount;
    let taxes = [];

    if (activeTaxes.length > 0) {
      const totalTaxRate = activeTaxes.reduce((sum, t) => sum + t.percentage, 0);
      const baseAmount = order.totalAmount / (1 + (totalTaxRate / 100));
      subtotal = Number(baseAmount.toFixed(2));
      taxes = activeTaxes.map(t => ({
        name: t.name,
        rate: t.percentage,
        amount: Number((baseAmount * (t.percentage / 100)).toFixed(2))
      }));
    }

    // Atomic update with condition: only update if totalAmount hasn't changed 
    // since we read it for the calculation. This prevents "lost updates".
    const updatedOrder = await Order.findOneAndUpdate(
      { _id: req.params.id, totalAmount: order.totalAmount },
      {
        $set: {
          subtotal,
          taxes,
          orderStatus: 'BILLED',
          billedAt: new Date()
        }
      },
      { new: true }
    ).populate('table waiter');

    if (!updatedOrder) {
      res.status(409).json({ message: 'Order total changed during billing. Please retry.' });
      return;
    }

    if (updatedOrder.table) {
      await Table.findByIdAndUpdate(updatedOrder.table, { status: 'printed' });
    }

    res.json(updatedOrder);
  } catch (error) {
    console.error("Billing error:", error);
    res.status(500).json({ message: error.message });
  }
};

const settleOrder = async (req, res) => {
  try {
    const { paymentMethod, taxes, totalAmount } = req.body;

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
          completedAt: new Date()
        }
      },
      { new: true }
    ).populate('table waiter');

    if (order) {
      if (order.table) {
        await Table.findByIdAndUpdate(order.table, { status: 'blank', currentOrder: null });
      }
      
      await logAudit(
        req.user?._id || order.waiter || '000000000000000000000000',
        'ORDER_SETTLED',
        'ORDERS',
        `Order ${order.orderNumber} settled for ₹${totalAmount}`,
        req.ip
      );

      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found or already completed' });
    }
  } catch (error) {
    console.error("Settlement error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel a KOT item
// @route   PATCH /api/orders/:id/kot/:kotId/items/:itemId/cancel
// @access  Private
const cancelKOTItem = async (req, res) => {
  try {
    const { reason } = req.body;
    const { id, kotId, itemId } = req.params;

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
        $inc: { subtotal: -reduction, totalAmount: -reduction }
      },
      {
        arrayFilters: [{ "k._id": kotId }, { "i._id": itemId }],
        new: true
      }
    ).populate('table waiter');

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order history
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
  const query = {};

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

  const orders = await Order.find(query)
    .sort({ createdAt: -1 })
    .populate('table waiter counter');
  res.json(orders);
};

// @desc    Get sales summary
// @route   GET /api/orders/summary
// @access  Private/Admin
const getSalesSummary = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [todaySales, mtdSales] = await Promise.all([
      Order.aggregate([
        { $match: { orderStatus: 'COMPLETED', completedAt: { $gte: today } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } }
      ]),
      Order.aggregate([
        { $match: { orderStatus: 'COMPLETED', completedAt: { $gte: firstDayOfMonth } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } }
      ])
    ]);

    res.json({
      today: todaySales[0] || { total: 0, count: 0 },
      mtd: mtdSales[0] || { total: 0, count: 0 }
    });
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
};

// @desc    Get orders for Adjustment Audit (System Protocols)
// @route   GET /api/orders/adjustment-audit
// @access  Private/Admin
const getAdjustmentAudit = async (req, res) => {
  try {
    const { startDate, endDate, paymentMode, orderType, billNo, itemName, outlet, priceRange } = req.query;
    
    let query = { orderStatus: 'COMPLETED' };

    // 1. Date Range Filter
    if (startDate && endDate) {
      query.completedAt = {
        $gte: new Date(startDate),
        $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
      };
    }

    // 2. Payment Mode
    if (paymentMode && paymentMode !== '--All Modes--') {
      query.paymentMethod = paymentMode;
    }

    // 3. Order Type (Bill Type)
    if (orderType && orderType !== '--All Types--') {
      const typeMap = {
        'TABLE BILL': 'DINE-IN',
        'TAKE WAY': 'PICKUP',
        'CAR SERVICE': 'CAR-SERVICE'
      };
      query.orderType = typeMap[orderType] || orderType;
    }

    // 4. Bill Number (Order Number)
    if (billNo) {
      query.orderNumber = { $regex: billNo, $options: 'i' };
    }

    // 5. Item Name Filter
    if (itemName && itemName !== '--Replace this item--') {
      query['kots.items.name'] = { $regex: itemName, $options: 'i' };
    }

    // 6. Outlet Filter
    if (outlet && outlet !== '--All Outlets--') {
      query.outlet = outlet;
    }

    // 7. Price Range Filter
    if (priceRange) {
       if (priceRange.includes('Premium')) {
          query.totalAmount = { $gt: 1000 };
       } else if (priceRange.includes('Economy')) {
          query.totalAmount = { $lt: 300 };
       }
    }

    const orders = await Order.find(query)
      .sort({ completedAt: -1 })
      .populate('table waiter counter');
      
    res.json(orders);
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
};

// @desc    Cancel Order
// @route   POST /api/orders/:id/cancel
// @access  Private/Admin
const cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;
    
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
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Apply discount to order
// @route   POST /api/orders/:id/discount
// @access  Private
const applyDiscount = async (req, res) => {
  try {
    const { type, value, reason, couponCode } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    if (order.orderStatus === 'COMPLETED' || order.orderStatus === 'CANCELLED') {
      res.status(400).json({ message: 'Cannot apply discount to finalized order' });
      return;
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
    ).populate('table waiter');

    await logAudit(
      req.user?._id || '000000000000000000000000',
      'ORDER_DISCOUNT_APPLIED',
      'ORDERS',
      `Applied ${value}${type === 'PERCENTAGE' ? '%' : ' FLAT'} discount to Order ${order.orderNumber}.${couponCode ? ' Coupon: ' + couponCode : ''} Reason: ${reason || 'N/A'}`,
      req.ip
    );

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Apply discount to specific item in KOT
// @route   PATCH /api/orders/:id/kot/:kotId/item/:itemId/discount
// @access  Private
const applyItemDiscount = async (req, res) => {
  try {
    const { type, value } = req.body;
    const { id, kotId, itemId } = req.params;

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const kot = order.kots.id(kotId);
    if (!kot) return res.status(404).json({ message: 'KOT not found' });

    const item = kot.items.id(itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    if (item.status === 'cancelled') return res.status(400).json({ message: 'Cannot discount cancelled item' });

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
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  processOrder,
  updateOrder,
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
  applyItemDiscount
};
