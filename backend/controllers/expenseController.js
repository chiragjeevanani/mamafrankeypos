const Expense = require('../models/Expense');

// @desc    Get all expenses
// @route   GET /api/expenses
// @access  Private/Admin
const getExpenses = async (req, res) => {
  const expenses = await Expense.find({}).sort({ date: -1 }).populate('staff', 'name');
  res.json(expenses);
};

// @desc    Create expense
// @route   POST /api/expenses
// @access  Private/Admin
const createExpense = async (req, res) => {
  const { title, category, amount, date, notes } = req.body;

  const expense = await Expense.create({
    title,
    category,
    amount,
    date: date || new Date(),
    notes,
    staff: req.user._id,
  });

  res.status(201).json(expense);
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private/Admin
const deleteExpense = async (req, res) => {
  const expense = await Expense.findById(req.params.id);
  if (expense) {
    await expense.deleteOne();
    res.json({ message: 'Expense removed' });
  } else {
    res.status(404);
    throw new Error('Expense not found');
  }
};

// @desc    Get expense summary (by category)
// @route   GET /api/expenses/summary
// @access  Private/Admin
const getExpenseSummary = async (req, res) => {
  const summary = await Expense.aggregate([
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' },
      },
    },
  ]);
  res.json(summary);
};

module.exports = {
  getExpenses,
  createExpense,
  deleteExpense,
  getExpenseSummary,
};
