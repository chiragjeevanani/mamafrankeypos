const express = require('express');
const router = express.Router();
const { query, validationResult } = require('express-validator');
const { getAuditLogs, getAuditSummary, deleteAuditLogs } = require('../controllers/auditController');
const { protect, admin, checkPermission } = require('../middleware/authMiddleware');

// Validation error handler middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    const firstError = errors.array()[0];
    throw new Error(`${firstError.path || 'Field'}: ${firstError.msg}`);
  }
  next();
};

const getAuditLogsValidation = [
  query('startDate')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isISO8601()
    .withMessage('Start date must be a valid ISO8601 date'),
  query('endDate')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isISO8601()
    .withMessage('End date must be a valid ISO8601 date'),
  query('staffId')
    .optional({ nullable: true, checkFalsy: true })
    .isMongoId()
    .withMessage('Invalid Staff ID format'),
  validateRequest
];

const deleteAuditLogsValidation = [
  query('retentionDays')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ gt: 0 })
    .withMessage('Retention days must be a positive integer'),
  validateRequest
];

router.get('/', protect, checkPermission('canViewReports'), getAuditLogsValidation, getAuditLogs);
router.get('/summary', protect, checkPermission('canViewReports'), getAuditSummary);
router.delete('/cleanup', protect, admin, deleteAuditLogsValidation, deleteAuditLogs);

module.exports = router;
