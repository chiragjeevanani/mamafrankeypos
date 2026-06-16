const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const {
  getCustomers,
  getCustomerByPhone,
  upsertCustomer,
  updateCustomerStats,
  deleteCustomer,
} = require('../controllers/customerController');
const { protect } = require('../middleware/authMiddleware');

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

const upsertCustomerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Customer name is required'),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .isLength({ min: 7 })
    .withMessage('Phone number must be at least 7 characters long'),
  body('email')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isEmail()
    .withMessage('A valid email address is required'),
  body('address')
    .optional()
    .trim(),
  validateRequest
];

const getCustomerByPhoneValidation = [
  param('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number parameter is required'),
  validateRequest
];

const updateCustomerStatsValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid Customer ID format'),
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isNumeric()
    .withMessage('Amount must be a number'),
  validateRequest
];

const deleteCustomerValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid Customer ID format'),
  validateRequest
];

router.route('/')
  .get(protect, getCustomers)
  .post(protect, upsertCustomerValidation, upsertCustomer);

router.route('/phone/:phone')
  .get(protect, getCustomerByPhoneValidation, getCustomerByPhone);

router.route('/:id/stats')
  .patch(protect, updateCustomerStatsValidation, updateCustomerStats);

router.route('/:id')
  .delete(protect, deleteCustomerValidation, deleteCustomer);

module.exports = router;
