const AuditLog = require('../models/AuditLog');

// @desc    Get all audit logs
// @route   GET /api/audit
// @access  Private/Admin
const getAuditLogs = async (req, res) => {
  try {
    const { startDate, endDate, staffId, moduleName } = req.query;
    
    let query = {};

    // 1. Date Range Filter
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
      };
    }

    // 2. Staff Filter
    if (staffId) {
      query.staff = staffId;
    }

    // 3. Module Filter
    if (moduleName && moduleName !== 'ALL') {
      query.module = moduleName;
    }

    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .populate('staff', 'name role')
      .limit(500); // Increased limit for better visibility
      
    res.json(logs);
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
};

// @desc    Get audit stats (Summary Cards)
// @route   GET /api/audit/summary
// @access  Private/Admin
const getAuditSummary = async (req, res) => {
  try {
    const totalEvents = await AuditLog.countDocuments();
    const criticalExceptions = await AuditLog.countDocuments({
      action: { $in: ['LOGIN_FAILED', 'LOGIN_FAILED_PIN', 'UNAUTHORIZED_ACCESS'] }
    });

    res.json({
      totalEvents,
      criticalExceptions
    });
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
};

module.exports = {
  getAuditLogs,
  getAuditSummary
};
