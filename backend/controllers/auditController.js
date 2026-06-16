const AuditLog = require('../models/AuditLog');
const mongoose = require('mongoose');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all audit logs
// @route   GET /api/audit
// @access  Private/Admin
const getAuditLogs = asyncHandler(async (req, res) => {
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
    if (!mongoose.Types.ObjectId.isValid(staffId)) {
      res.status(400);
      throw new Error('Invalid Staff ID format');
    }
    query.staff = staffId;
  }

  // 3. Module Filter
  if (moduleName && moduleName !== 'ALL') {
    query.module = moduleName;
  }

  const page = req.query.page ? parseInt(req.query.page, 10) : null;
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : null;

  if (page && limit) {
    const skip = (page - 1) * limit;
    const total = await AuditLog.countDocuments(query);
    const data = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .populate('staff', 'name role')
      .skip(skip)
      .limit(limit);
    res.json({
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } else {
    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .populate('staff', 'name role')
      .limit(500); // Increased limit for better visibility
    res.json(logs);
  }
});

// @desc    Get audit stats (Summary Cards)
// @route   GET /api/audit/summary
// @access  Private/Admin
const getAuditSummary = asyncHandler(async (req, res) => {
  const totalEvents = await AuditLog.countDocuments();
  const criticalExceptions = await AuditLog.countDocuments({
    action: { $in: ['LOGIN_FAILED', 'LOGIN_FAILED_PIN', 'UNAUTHORIZED_ACCESS'] }
  });

  res.json({
    totalEvents,
    criticalExceptions
  });
});

// @desc    Clear older audit logs (Cleanup)
// @route   DELETE /api/audit/cleanup
// @access  Private/Admin
const deleteAuditLogs = asyncHandler(async (req, res) => {
  const retentionDays = parseInt(req.query.retentionDays || req.body.retentionDays, 10) || 90;

  if (Number.isNaN(retentionDays) || retentionDays <= 0) {
    res.status(400);
    throw new Error('Retention days must be a positive integer');
  }

  const logAudit = require('../utils/auditLogger');
  const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

  // Execute deletion
  const deleteResult = await AuditLog.deleteMany({
    createdAt: { $lt: cutoffDate }
  });

  // Log cleanup audit event itself
  await logAudit(
    req.user?._id || '000000000000000000000000',
    'AUDIT_CLEANUP',
    'AUDIT',
    `Cleared ${deleteResult.deletedCount} audit logs older than ${retentionDays} days`,
    req.ip
  );

  res.json({
    message: `Successfully purged older audit logs`,
    deletedCount: deleteResult.deletedCount,
    retentionDays
  });
});

module.exports = {
  getAuditLogs,
  getAuditSummary,
  deleteAuditLogs
};
