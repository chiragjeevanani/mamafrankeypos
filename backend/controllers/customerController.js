const Customer = require('../models/Customer');

// @desc    Get all customers
// @route   GET /api/customers
// @access  Private
const getCustomers = async (req, res) => {
  const customers = await Customer.find({}).sort({ updatedAt: -1 });
  res.json(customers);
};

// @desc    Get customer by phone
// @route   GET /api/customers/phone/:phone
// @access  Private
const getCustomerByPhone = async (req, res) => {
  const customer = await Customer.findOne({ phone: req.params.phone });
  if (customer) {
    res.json(customer);
  } else {
    res.status(404);
    throw new Error('Customer not found');
  }
};

// @desc    Create or Update customer
// @route   POST /api/customers
// @access  Private
const upsertCustomer = async (req, res) => {
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
};

// @desc    Update customer stats (internal call usually)
// @route   PATCH /api/customers/:id/stats
// @access  Private
const updateCustomerStats = async (req, res) => {
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
};

module.exports = {
  getCustomers,
  getCustomerByPhone,
  upsertCustomer,
  updateCustomerStats,
};
