const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Customer = require('../models/Customer');
const Expense = require('../models/Expense');
const StoreSettings = require('../models/StoreSettings');
const asyncHandler = require('../utils/asyncHandler');
const { getMaskingRules, maskOrder, maskCurrencyValue, maskQuantityValue, getReplacedName } = require('../utils/dataMask');

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

const getLocalHour = (date, timezone) => {
  const offsetMinutes = timezone === 'Asia/Kolkata' ? 330 : 0;
  const utcTime = date instanceof Date ? date.getTime() : new Date(date).getTime();
  const localTime = utcTime + (offsetMinutes * 60 * 1000);
  const localDate = new Date(localTime);
  return localDate.getUTCHours();
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

  const isAdminRequest = req.headers['x-module'] === 'admin';

  if (isAdminRequest) {
    const rules = await getMaskingRules();

    // Fetch raw completed orders for the month, total customers count, and expenses
    const [orders, totalCustomers, totalExpenses] = await Promise.all([
      Order.find({ orderStatus: 'COMPLETED', completedAt: { $gte: firstDayOfMonth } }).populate('table waiter counter').lean(),
      Customer.countDocuments({}),
      Expense.aggregate([
        { $match: { date: { $gte: firstDayOfMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    // Apply backend masking engine to all orders
    const maskedOrders = orders.map(o => maskOrder(o, rules));

    // Filter orders by date ranges
    const todayOrders = maskedOrders.filter(o => new Date(o.completedAt) >= today);
    const weekOrders = maskedOrders.filter(o => new Date(o.completedAt) >= firstDayOfWeek);
    const monthOrders = maskedOrders;

    // Aggregate totals in-memory
    const todayTotal = todayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    let todayCount = todayOrders.length;
    const weekTotal = weekOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    let weekCount = weekOrders.length;
    const monthTotal = monthOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    let monthCount = monthOrders.length;
    let expensesTotal = totalExpenses[0]?.total || 0;

    // Apply global mask to count & expenses
    todayCount = maskQuantityValue(todayCount, rules);
    weekCount = maskQuantityValue(weekCount, rules);
    monthCount = maskQuantityValue(monthCount, rules);
    expensesTotal = maskCurrencyValue(expensesTotal, null, rules);

    // Group items for Top Selling Items (MTD)
    const groupedItems = {};
    monthOrders.forEach(o => {
      if (o.kots && Array.isArray(o.kots)) {
        o.kots.forEach(kot => {
          if (kot.items && Array.isArray(kot.items)) {
            kot.items.forEach(item => {
              if (item.status !== 'cancelled') {
                const itemName = item.name; // Already masked/renamed by backend maskOrder!
                if (!groupedItems[itemName]) {
                  groupedItems[itemName] = { _id: itemName, count: 0, revenue: 0 };
                }
                groupedItems[itemName].count += item.quantity;
                groupedItems[itemName].revenue += item.price * item.quantity;
              }
            });
          }
        });
      }
    });

    // Apply global quantity mask on topItems for count
    const mappedTopItems = Object.values(groupedItems).map(item => ({
      _id: item._id,
      count: maskQuantityValue(item.count, rules),
      revenue: item.revenue
    })).sort((a, b) => b.count - a.count).slice(0, 5);

    // Group hourly sales (Today)
    const hourlyMap = {};
    todayOrders.forEach(o => {
      const hour = getLocalHour(o.completedAt, timezone);
      hourlyMap[hour] = (hourlyMap[hour] || 0) + (o.totalAmount || 0);
    });
    const mappedHourlySales = Object.entries(hourlyMap).map(([hour, total]) => ({
      _id: parseInt(hour, 10),
      total: total
    })).sort((a, b) => a._id - b._id);

    return res.json({
      sales: {
        today: { total: todayTotal, count: todayCount },
        week: { total: weekTotal, count: weekCount },
        month: { total: monthTotal, count: monthCount }
      },
      customers: totalCustomers,
      expenses: expensesTotal,
      topItems: mappedTopItems,
      hourlySales: mappedHourlySales
    });
  }

  // Non-Admin (POS) path - uses high-performance database aggregations
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

  const topItems = await Order.aggregate([
    { $match: { orderStatus: 'COMPLETED', completedAt: { $gte: firstDayOfMonth } } },
    { $unwind: '$kots' },
    { $unwind: '$kots.items' },
    { $match: { 'kots.items.status': { $ne: 'cancelled' } } },
    { $group: { _id: '$kots.items.name', count: { $sum: '$kots.items.quantity' }, revenue: { $sum: { $multiply: ['$kots.items.price', '$kots.items.quantity'] } } } },
    { $sort: { count: -1 } },
    { $limit: 5 }
  ]);

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
      today: { total: todayStats[0]?.total || 0, count: todayStats[0]?.count || 0 },
      week: { total: weekStats[0]?.total || 0, count: weekStats[0]?.count || 0 },
      month: { total: monthStats[0]?.total || 0, count: monthStats[0]?.count || 0 }
    },
    customers: totalCustomers,
    expenses: totalExpenses[0]?.total || 0,
    topItems: topItems,
    hourlySales: hourlySales
  });
});

module.exports = {
  getDashboardStats,
};
