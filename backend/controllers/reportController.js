const Order = require('../models/Order');
const mongoose = require('mongoose');

// @desc    Get comprehensive sales report
// @route   GET /api/reports/sales
// @access  Private/Admin
const getSalesReport = async (req, res) => {
  try {
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
    
    // Date Range Filter
    if (startDate || endDate) {
      matchStage.completedAt = {};
      if (startDate) matchStage.completedAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchStage.completedAt.$lte = end;
      }
    }

    // Status filter - only completed orders for revenue, but we might need all for cancellation stats
    // We'll handle cancellation stats separately or use a facet
    
    if (paymentMethod) matchStage.paymentMethod = paymentMethod;
    if (orderType) matchStage.orderType = orderType;
    if (waiter) matchStage.waiter = new mongoose.Types.ObjectId(waiter);
    if (table) matchStage.table = new mongoose.Types.ObjectId(table);
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
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$completedAt" } },
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
                _id: { $hour: "$completedAt" },
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

    res.json(result);
  } catch (error) {
    console.error('Reporting Error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSalesReport
};
