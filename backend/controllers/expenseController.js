const Expense = require('../models/Expense');
const StoreSettings = require('../models/StoreSettings');
const mongoose = require('mongoose');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all expenses
// @route   GET /api/expenses
// @access  Private/Admin
const getExpenses = asyncHandler(async (req, res) => {
  const query = {};
  const page = req.query.page ? parseInt(req.query.page, 10) : null;
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : null;

  if (page && limit) {
    const skip = (page - 1) * limit;
    const total = await Expense.countDocuments(query);
    const data = await Expense.find(query)
      .sort({ date: -1 })
      .populate('staff', 'name')
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
    const expenses = await Expense.find(query).sort({ date: -1 }).populate('staff', 'name');
    res.json(expenses);
  }
});

// @desc    Create expense
// @route   POST /api/expenses
// @access  Private/Admin
const createExpense = asyncHandler(async (req, res) => {
  const title = String(req.body.title || '').trim();
  const category = String(req.body.category || '').trim();
  const amount = Number(req.body.amount);
  const { date, notes } = req.body;

  if (!title) {
    res.status(400);
    throw new Error('Expense title is required');
  }

  const validCategories = ['Supplies', 'Salary', 'Utility', 'Rent', 'Maintenance', 'Marketing', 'Other'];
  if (!category || !validCategories.includes(category)) {
    res.status(400);
    throw new Error('Valid expense category is required');
  }

  if (Number.isNaN(amount) || amount <= 0) {
    res.status(400);
    throw new Error('Amount must be a positive number');
  }

  const settings = await StoreSettings.findOne() || {};
  const timezone = settings.timezone || 'Asia/Kolkata';
  const offsetMinutes = timezone === 'Asia/Kolkata' ? 330 : 0;

  let parsedDate = new Date();
  if (date) {
    const parts = String(date).split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const utcMidnight = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
      parsedDate = new Date(utcMidnight.getTime() - (offsetMinutes * 60 * 1000));
    } else {
      parsedDate = new Date(date);
    }
  }

  const expense = await Expense.create({
    title,
    category,
    amount,
    date: parsedDate,
    notes: String(notes || '').trim(),
    staff: req.user._id,
  });

  res.status(201).json(expense);
});

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private/Admin
const deleteExpense = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid Expense ID format');
  }

  const expense = await Expense.findById(req.params.id);
  if (expense) {
    await expense.deleteOne();
    res.json({ message: 'Expense removed' });
  } else {
    res.status(404);
    throw new Error('Expense not found');
  }
});

// @desc    Get expense summary (by category)
// @route   GET /api/expenses/summary
// @access  Private/Admin
const getExpenseSummary = asyncHandler(async (req, res) => {
  const summary = await Expense.aggregate([
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' },
      },
    },
  ]);
  res.json(summary);
});

module.exports = {
  getExpenses,
  createExpense,
  deleteExpense,
  getExpenseSummary,
};
