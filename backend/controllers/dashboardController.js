const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Customer = require('../models/Customer');
const Expense = require('../models/Expense');

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDayOfWeek = new Date(today);
    firstDayOfWeek.setDate(today.getDate() - today.getDay());

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [todayStats, weekStats, monthStats, totalCustomers, totalExpenses] = await Promise.all([
      Order.aggregate([
        { $match: { orderStatus: 'COMPLETED', completedAt: { $gte: today } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } }
      ]),
      Order.aggregate([
        { $match: { orderStatus: 'COMPLETED', completedAt: { $gte: firstDayOfWeek } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } }
      ]),
      Order.aggregate([
        { $match: { orderStatus: 'COMPLETED', completedAt: { $gte: firstDayOfMonth } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } }
      ]),
      Customer.countDocuments({}),
      Expense.aggregate([
        { $match: { date: { $gte: firstDayOfMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    // Top Selling Items (MTD)
    const topItems = await Order.aggregate([
      { $match: { orderStatus: 'COMPLETED', completedAt: { $gte: firstDayOfMonth } } },
      { $unwind: '$kots' },
      { $unwind: '$kots.items' },
      { $group: { _id: '$kots.items.name', count: { $sum: '$kots.items.quantity' }, revenue: { $sum: { $multiply: ['$kots.items.price', '$kots.items.quantity'] } } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Hourly Sales (Today)
    const hourlySales = await Order.aggregate([
      { $match: { orderStatus: 'COMPLETED', completedAt: { $gte: today } } },
      { $group: { _id: { $hour: '$completedAt' }, total: { $sum: '$totalAmount' } } },
      { $sort: { '_id': 1 } }
    ]);

    res.json({
      sales: {
        today: todayStats[0] || { total: 0, count: 0 },
        week: weekStats[0] || { total: 0, count: 0 },
        month: monthStats[0] || { total: 0, count: 0 }
      },
      customers: totalCustomers,
      expenses: totalExpenses[0]?.total || 0,
      topItems,
      hourlySales
    });
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
};

module.exports = {
  getDashboardStats,
};
