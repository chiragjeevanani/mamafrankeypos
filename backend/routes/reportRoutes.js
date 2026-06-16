const express = require('express');
const router = express.Router();
const { query, validationResult } = require('express-validator');
const { getSalesReport } = require('../controllers/reportController');

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

const getSalesReportValidation = [
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
  query('orderType')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isIn(['DINE-IN', 'CAR-SERVICE', 'PICKUP'])
    .withMessage('Invalid Order Type filter'),
  query('waiter')
    .optional({ nullable: true, checkFalsy: true })
    .isMongoId()
    .withMessage('Invalid Waiter ID format'),
  query('table')
    .optional({ nullable: true, checkFalsy: true })
    .isMongoId()
    .withMessage('Invalid Table ID format'),
  validateRequest
];

router.get('/sales', protect, checkPermission('canViewReports'), getSalesReportValidation, getSalesReport);

module.exports = router;
