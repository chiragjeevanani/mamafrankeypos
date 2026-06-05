const Order = require('../models/Order');
const StoreSettings = require('../models/StoreSettings');
const mongoose = require('mongoose');
const asyncHandler = require('../utils/asyncHandler');
const { getMaskingRules, maskCurrencyValue, maskQuantityValue, getReplacedName } = require('../utils/dataMask');

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

  // Status filter - only completed orders for revenue, but we might need all for cancellation stats
  // We'll handle cancellation stats separately or use a facet
  
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

  const stats = await Order.aggregate([
    {
      $facet: {
        // A. REVENUE SUMMARY
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

        // B. SALES TRENDS (Daily)
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

        // C. TOP SELLING ITEMS
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

        // D. PAYMENT BREAKDOWN
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

        // E. HOURLY SALES
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

        // F. CANCELLATION ANALYTICS
        cancellations: [
          { 
            $match: { 
              ...matchStage, 
              // For cancellations, we might use createdAt or updatedAt if completedAt is missing
              orderStatus: 'CANCELLED' 
            } 
          },
          {
            $group: {
              _id: "$cancellationReason",
              count: { $sum: 1 },
              potentialRevenue: { $sum: "$totalAmount" }
            }
          }
        ],

        // G. TAX SUMMARY
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
  
  // Flatten summary
  result.summary = result.summary[0] || {
    totalRevenue: 0,
    netRevenue: 0,
    taxAmount: 0,
    orderCount: 0,
    avgOrderValue: 0
  };

  const isAdminRequest = req.headers['x-module'] === 'admin';
  if (isAdminRequest) {
    const rules = await getMaskingRules();

    // Summary masking
    result.summary.totalRevenue = maskCurrencyValue(result.summary.totalRevenue, null, rules);
    result.summary.netRevenue = maskCurrencyValue(result.summary.netRevenue, null, rules);
    result.summary.taxAmount = maskCurrencyValue(result.summary.taxAmount, null, rules);
    result.summary.orderCount = maskQuantityValue(result.summary.orderCount, rules);
    result.summary.avgOrderValue = maskCurrencyValue(result.summary.avgOrderValue, null, rules);

    // Trends masking
    if (result.trends) {
      result.trends = result.trends.map(t => ({
        _id: t._id,
        revenue: maskCurrencyValue(t.revenue, null, rules),
        orders: maskQuantityValue(t.orders, rules)
      }));
    }

    // Top Items masking & grouping
    if (result.topItems) {
      const groupedItems = {};
      result.topItems.forEach(item => {
        const maskedName = getReplacedName(item.name, rules);
        const maskedQty = maskQuantityValue(item.quantity, rules);
        const maskedRevenue = maskCurrencyValue(item.revenue, item.name, rules);

        if (!groupedItems[maskedName]) {
          groupedItems[maskedName] = { _id: item._id, name: maskedName, quantity: 0, revenue: 0 };
        }
        groupedItems[maskedName].quantity += maskedQty;
        groupedItems[maskedName].revenue += maskedRevenue;
      });
      result.topItems = Object.values(groupedItems).sort((a, b) => b.quantity - a.quantity);
    }

    // Payment breakdown masking
    if (result.paymentBreakdown) {
      result.paymentBreakdown = result.paymentBreakdown.map(p => ({
        _id: p._id,
        revenue: maskCurrencyValue(p.revenue, null, rules),
        count: maskQuantityValue(p.count, rules)
      }));
    }

    // Hourly sales masking
    if (result.hourlySales) {
      result.hourlySales = result.hourlySales.map(h => ({
        _id: h._id,
        revenue: maskCurrencyValue(h.revenue, null, rules),
        orders: maskQuantityValue(h.orders, rules)
      }));
    }

    // Cancellations masking
    if (result.cancellations) {
      result.cancellations = result.cancellations.map(c => ({
        _id: c._id,
        count: maskQuantityValue(c.count, rules),
        potentialRevenue: maskCurrencyValue(c.potentialRevenue, null, rules)
      }));
    }

    // Tax summary masking
    if (result.taxSummary) {
      result.taxSummary = result.taxSummary.map(t => ({
        _id: t._id,
        amount: maskCurrencyValue(t.amount, null, rules)
      }));
    }
  }

  res.json(result);
});

module.exports = {
  getSalesReport
};
