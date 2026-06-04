const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Customer = require('../models/Customer');
const Expense = require('../models/Expense');
const StoreSettings = require('../models/StoreSettings');
const asyncHandler = require('../utils/asyncHandler');

// Utility helpers for timezone-aware date calculations
const getLocalMidnight = (date, timezone) => {
  const offsetMinutes = timezone === 'Asia/Kolkata' ? 330 : 0;
  const utcTime = date.getTime();
  const localTime = utcTime + (offsetMinutes * 60 * 1000);
  const localDate = new Date(localTime);
  localDate.setUTCHours(0, 0, 0, 0);
  return new Date(localDate.getTime() - (offsetMinutes * 60 * 1000));
};

const getStartOfWeek = (date, timezone) => {
  const offsetMinutes = timezone === 'Asia/Kolkata' ? 330 : 0;
  const utcTime = date.getTime();
  const localTime = utcTime + (offsetMinutes * 60 * 1000);
  const localDate = new Date(localTime);
  localDate.setUTCHours(0, 0, 0, 0);
  localDate.setUTCDate(localDate.getUTCDate() - localDate.getUTCDay());
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

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  // Fetch Store settings for timezone
  const settings = await StoreSettings.findOne() || {};
  const timezone = settings.timezone || 'Asia/Kolkata';

  const today = getLocalMidnight(new Date(), timezone);
  const firstDayOfWeek = getStartOfWeek(new Date(), timezone);
  const firstDayOfMonth = getStartOfMonth(new Date(), timezone);

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
    { $match: { 'kots.items.status': { $ne: 'cancelled' } } }, // Exclude cancelled items from statistics
    { $group: { _id: '$kots.items.name', count: { $sum: '$kots.items.quantity' }, revenue: { $sum: { $multiply: ['$kots.items.price', '$kots.items.quantity'] } } } },
    { $sort: { count: -1 } },
    { $limit: 5 }
  ]);

  // Hourly Sales (Today) - timezone-aware hour grouping
  const hourlySales = await Order.aggregate([
    { $match: { orderStatus: 'COMPLETED', completedAt: { $gte: today } } },
    { 
      $group: { 
        _id: { $hour: { date: '$completedAt', timezone: timezone } }, 
        total: { $sum: '$totalAmount' } 
      } 
    },
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
});

module.exports = {
  getDashboardStats,
};
