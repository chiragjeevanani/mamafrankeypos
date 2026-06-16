const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const {
  getExpenses,
  createExpense,
  deleteExpense,
  getExpenseSummary,
} = require('../controllers/expenseController');
const { protect, admin } = require('../middleware/authMiddleware');

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

const createExpenseValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Expense title is required'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Expense category is required')
    .isIn(['Supplies', 'Salary', 'Utility', 'Rent', 'Maintenance', 'Marketing', 'Other'])
    .withMessage('Valid expense category is required'),
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ gt: 0 })
    .withMessage('Amount must be a positive number'),
  body('date')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isISO8601()
    .withMessage('Valid date is required (ISO8601 format)'),
  body('notes')
    .optional()
    .trim(),
  validateRequest
];

const deleteExpenseValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid Expense ID format'),
  validateRequest
];

router.route('/')
  .get(protect, admin, getExpenses)
  .post(protect, admin, createExpenseValidation, createExpense);

router.route('/summary')
  .get(protect, admin, getExpenseSummary);

router.route('/:id')
  .delete(protect, admin, deleteExpenseValidation, deleteExpense);

module.exports = router;
