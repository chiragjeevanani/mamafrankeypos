const Order = require('../models/Order');
const StoreSettings = require('../models/StoreSettings');
const mongoose = require('mongoose');
const asyncHandler = require('../utils/asyncHandler');
const { getMaskingRules, maskOrder, maskCurrencyValue, maskQuantityValue, getReplacedName } = require('../utils/dataMask');

// @desc    Get comprehensive sales report
// @route   GET /api/reports/sales
// @access  Private/Admin
const getSalesReport = asyncHandler(async (req, res) => {
  const { 
    startDate, 
    endDate, 
    paymentMethod, 
    orderType, 
    waiter, 
    table, 
    outlet 
  } = req.query;

  // 1. Build Match Filter
  const matchStage = {};
  
  const settings = await StoreSettings.findOne() || {};
  const timezone = settings.timezone || 'Asia/Kolkata';
  const offsetMinutes = timezone === 'Asia/Kolkata' ? 330 : 0;

  // Date Range Filter
  if (startDate || endDate) {
    matchStage.completedAt = {};
    if (startDate) {
      const parts = String(startDate).split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const utcMidnight = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
        matchStage.completedAt.$gte = new Date(utcMidnight.getTime() - (offsetMinutes * 60 * 1000));
      } else {
        matchStage.completedAt.$gte = new Date(startDate);
      }
    }
    if (endDate) {
      const parts = String(endDate).split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const utcMidnightEnd = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));
        matchStage.completedAt.$lte = new Date(utcMidnightEnd.getTime() - (offsetMinutes * 60 * 1000));
      } else {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchStage.completedAt.$lte = end;
      }
    }
  }

  if (paymentMethod) matchStage.paymentMethod = paymentMethod;
  if (orderType) matchStage.orderType = orderType;

  if (waiter) {
    if (!mongoose.Types.ObjectId.isValid(waiter)) {
      res.status(400);
      throw new Error('Invalid Waiter ID format');
    }
    matchStage.waiter = new mongoose.Types.ObjectId(waiter);
  }

  if (table) {
    if (!mongoose.Types.ObjectId.isValid(table)) {
      res.status(400);
      throw new Error('Invalid Table ID format');
    }
    matchStage.table = new mongoose.Types.ObjectId(table);
  }

  if (outlet) matchStage.outlet = outlet;

  const isAdminRequest = req.headers['x-module'] === 'admin';

  if (isAdminRequest) {
    const rules = await getMaskingRules();

    // Query both completed and cancelled orders matching the filters
    const rawOrders = await Order.find(matchStage).populate('table waiter counter').lean();

    // Filter completed and cancelled raw orders
    const completedOrders = rawOrders.filter(o => o.orderStatus === 'COMPLETED');
    const cancelledOrders = rawOrders.filter(o => o.orderStatus === 'CANCELLED');

    // Mask them in-memory
    const maskedCompleted = completedOrders.map(o => maskOrder(o, rules));
    const maskedCancelled = cancelledOrders.map(o => maskOrder(o, rules));

    // A. REVENUE SUMMARY
    const totalRevenue = maskedCompleted.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const netRevenue = maskedCompleted.reduce((sum, o) => sum + (o.subtotal || 0), 0);
    const taxAmount = maskedCompleted.reduce((sum, o) => {
      const orderTaxesSum = (o.taxes || []).reduce((tsum, t) => tsum + (t.amount || 0), 0);
      return sum + orderTaxesSum;
    }, 0);
    const orderCount = maskedCompleted.length;
    const avgOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;

    const summary = {
      totalRevenue,
      netRevenue,
      taxAmount,
      orderCount: maskQuantityValue(orderCount, rules),
      avgOrderValue
    };

    // B. SALES TRENDS (Daily)
    const trendsMap = {};
    maskedCompleted.forEach(o => {
      const date = new Date(o.completedAt);
      const localTime = date.getTime() + (offsetMinutes * 60 * 1000);
      const dateStr = new Date(localTime).toISOString().split('T')[0];
      if (!trendsMap[dateStr]) {
        trendsMap[dateStr] = { _id: dateStr, revenue: 0, orders: 0 };
      }
      trendsMap[dateStr].revenue += o.totalAmount || 0;
      trendsMap[dateStr].orders += 1;
    });

    const trends = Object.values(trendsMap).map(t => ({
      _id: t._id,
      revenue: t.revenue,
      orders: maskQuantityValue(t.orders, rules)
    })).sort((a, b) => a._id.localeCompare(b._id));

    // C. TOP SELLING ITEMS
    const itemMap = {};
    maskedCompleted.forEach(o => {
      if (o.kots && Array.isArray(o.kots)) {
        o.kots.forEach(kot => {
          if (kot.items && Array.isArray(kot.items)) {
            kot.items.forEach(item => {
              if (item.status !== 'cancelled') {
                const menuItemId = item.menuItem?.toString() || item.name;
                const itemName = item.name; // Already masked/renamed by backend maskOrder!
                if (!itemMap[itemName]) {
                  itemMap[itemName] = { _id: menuItemId, name: itemName, quantity: 0, revenue: 0 };
                }
                itemMap[itemName].quantity += item.quantity;
                itemMap[itemName].revenue += item.price * item.quantity;
              }
            });
          }
        });
      }
    });

    const topItems = Object.values(itemMap).map(item => ({
      _id: item._id,
      name: item.name,
      quantity: maskQuantityValue(item.quantity, rules),
      revenue: item.revenue
    })).sort((a, b) => b.quantity - a.quantity).slice(0, 10);

    // D. PAYMENT BREAKDOWN
    const paymentMap = {};
    maskedCompleted.forEach(o => {
      const method = o.paymentMethod || 'Cash';
      if (!paymentMap[method]) {
        paymentMap[method] = { _id: method, revenue: 0, count: 0 };
      }
      paymentMap[method].revenue += o.totalAmount || 0;
      paymentMap[method].count += 1;
    });
    const paymentBreakdown = Object.values(paymentMap).map(p => ({
      _id: p._id,
      revenue: p.revenue,
      count: maskQuantityValue(p.count, rules)
    }));

    // E. HOURLY SALES
    const hourlyMap = {};
    maskedCompleted.forEach(o => {
      const date = new Date(o.completedAt);
      const localTime = date.getTime() + (offsetMinutes * 60 * 1000);
      const hour = new Date(localTime).getUTCHours();
      if (!hourlyMap[hour]) {
        hourlyMap[hour] = { _id: hour, revenue: 0, orders: 0 };
      }
      hourlyMap[hour].revenue += o.totalAmount || 0;
      hourlyMap[hour].orders += 1;
    });
    const hourlySales = Object.values(hourlyMap).map(h => ({
      _id: h._id,
      revenue: h.revenue,
      orders: maskQuantityValue(h.orders, rules)
    })).sort((a, b) => a._id - b._id);

    // F. CANCELLATION ANALYTICS
    const cancelMap = {};
    maskedCancelled.forEach(o => {
      const reason = o.cancellationReason || 'Cancelled by Administrator';
      if (!cancelMap[reason]) {
        cancelMap[reason] = { _id: reason, count: 0, potentialRevenue: 0 };
      }
      cancelMap[reason].count += 1;
      cancelMap[reason].potentialRevenue += o.totalAmount || 0;
    });
    const cancellations = Object.values(cancelMap).map(c => ({
      _id: c._id,
      count: maskQuantityValue(c.count, rules),
      potentialRevenue: c.potentialRevenue
    }));

    // G. TAX SUMMARY
    const taxMap = {};
    maskedCompleted.forEach(o => {
      if (o.taxes && Array.isArray(o.taxes)) {
        o.taxes.forEach(t => {
          const taxName = t.name;
          taxMap[taxName] = (taxMap[taxName] || 0) + (t.amount || 0);
        });
      }
    });
    const taxSummary = Object.entries(taxMap).map(([name, amount]) => ({
      _id: name,
      amount: amount
    }));

    return res.json({
      summary,
      trends,
      topItems,
      paymentBreakdown,
      hourlySales,
      cancellations,
      taxSummary
    });
  }

  // Non-Admin (POS) path - uses high-performance database aggregations
  const stats = await Order.aggregate([
    {
      $facet: {
        summary: [
          { $match: { ...matchStage, orderStatus: 'COMPLETED' } },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: '$totalAmount' },
              netRevenue: { $sum: '$subtotal' },
              taxAmount: { $sum: { $reduce: { input: '$taxes', initialValue: 0, in: { $add: ['$$value', '$$this.amount'] } } } },
              orderCount: { $sum: 1 },
              avgOrderValue: { $avg: '$totalAmount' }
            }
          }
        ],
        trends: [
          { $match: { ...matchStage, orderStatus: 'COMPLETED' } },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m-%d", date: "$completedAt", timezone: timezone } },
              revenue: { $sum: "$totalAmount" },
              orders: { $sum: 1 }
            }
          },
          { $sort: { "_id": 1 } }
        ],
        topItems: [
          { $match: { ...matchStage, orderStatus: 'COMPLETED' } },
          { $unwind: "$kots" },
          { $unwind: "$kots.items" },
          { $match: { "kots.items.status": { $ne: 'cancelled' } } },
          {
            $group: {
              _id: "$kots.items.menuItem",
              name: { $first: "$kots.items.name" },
              quantity: { $sum: "$kots.items.quantity" },
              revenue: { $sum: { $multiply: ["$kots.items.price", "$kots.items.quantity"] } }
            }
          },
          { $sort: { quantity: -1 } },
          { $limit: 10 }
        ],
        paymentBreakdown: [
          { $match: { ...matchStage, orderStatus: 'COMPLETED' } },
          {
            $group: {
              _id: "$paymentMethod",
              revenue: { $sum: "$totalAmount" },
              count: { $sum: 1 }
            }
          }
        ],
        hourlySales: [
          { $match: { ...matchStage, orderStatus: 'COMPLETED' } },
          {
            $group: {
              _id: { $hour: { date: "$completedAt", timezone: timezone } },
              revenue: { $sum: "$totalAmount" },
              orders: { $sum: 1 }
            }
          },
          { $sort: { "_id": 1 } }
        ],
        cancellations: [
          { $match: { ...matchStage, orderStatus: 'CANCELLED' } },
          {
            $group: {
              _id: "$cancellationReason",
              count: { $sum: 1 },
              potentialRevenue: { $sum: "$totalAmount" }
            }
          }
        ],
        taxSummary: [
          { $match: { ...matchStage, orderStatus: 'COMPLETED' } },
          { $unwind: "$taxes" },
          {
            $group: {
              _id: "$taxes.name",
              amount: { $sum: "$taxes.amount" }
            }
          }
        ]
      }
    }
  ]);

  const result = stats[0];
  
  result.summary = result.summary[0] || {
    totalRevenue: 0,
    netRevenue: 0,
    taxAmount: 0,
    orderCount: 0,
    avgOrderValue: 0
  };

  res.json(result);
});

module.exports = {
  getSalesReport
};
