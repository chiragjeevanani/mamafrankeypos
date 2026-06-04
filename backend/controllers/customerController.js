const Customer = require('../models/Customer');
const mongoose = require('mongoose');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all customers
// @route   GET /api/customers
// @access  Private
const getCustomers = asyncHandler(async (req, res) => {
  const query = {};
  const page = req.query.page ? parseInt(req.query.page, 10) : null;
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : null;

  if (page && limit) {
    const skip = (page - 1) * limit;
    const total = await Customer.countDocuments(query);
    const data = await Customer.find(query)
      .sort({ updatedAt: -1 })
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
    const customers = await Customer.find(query).sort({ updatedAt: -1 });
    res.json(customers);
  }
});

// @desc    Get customer by phone
// @route   GET /api/customers/phone/:phone
// @access  Private
const getCustomerByPhone = asyncHandler(async (req, res) => {
  const customer = await Customer.findOne({ phone: req.params.phone });
  if (customer) {
    res.json(customer);
  } else {
    res.status(404);
    throw new Error('Customer not found');
  }
});

// @desc    Create or Update customer
// @route   POST /api/customers
// @access  Private
const upsertCustomer = asyncHandler(async (req, res) => {
  const { name, phone, email, address } = req.body;

  const customerExists = await Customer.findOne({ phone });

  if (customerExists) {
    customerExists.name = name || customerExists.name;
    customerExists.email = email || customerExists.email;
    customerExists.address = address || customerExists.address;
    const updatedCustomer = await customerExists.save();
    res.json(updatedCustomer);
  } else {
    const customer = await Customer.create({
      name,
      phone,
      email,
      address,
    });
    res.status(201).json(customer);
  }
});

// @desc    Update customer stats (internal call usually)
// @route   PATCH /api/customers/:id/stats
// @access  Private
const updateCustomerStats = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid Customer ID format');
  }

  const { amount } = req.body;
  const incrementAmount = Number(amount) || 0;

  const customer = await Customer.findByIdAndUpdate(
    req.params.id,
    {
      $inc: {
        totalVisits: 1,
        totalSpent: incrementAmount,
        loyaltyPoints: Math.floor(incrementAmount / 100)
      },
      $set: { lastVisit: new Date() }
    },
    { new: true }
  );

  if (customer) {
    res.json(customer);
  } else {
    res.status(404);
    throw new Error('Customer not found');
  }
});

module.exports = {
  getCustomers,
  getCustomerByPhone,
  upsertCustomer,
  updateCustomerStats,
};
