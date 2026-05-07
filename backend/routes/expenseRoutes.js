const express = require('express');
const router = express.Router();
const {
  getExpenses,
  createExpense,
  deleteExpense,
  getExpenseSummary,
} = require('../controllers/expenseController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, admin, getExpenses)
  .post(protect, admin, createExpense);

router.route('/summary')
  .get(protect, admin, getExpenseSummary);

router.route('/:id')
  .delete(protect, admin, deleteExpense);

module.exports = router;
