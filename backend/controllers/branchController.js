const Branch = require('../models/Branch');
const StoreSettings = require('../models/StoreSettings');
const Order = require('../models/Order');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all active branches
// @route   GET /api/branches
// @access  Private/Admin
const getBranches = asyncHandler(async (req, res) => {
  const branches = await Branch.find({ isActive: true }).sort({ createdAt: 1 });
  res.json(branches);
});

// @desc    Get all branches including inactive (admin only)
// @route   GET /api/branches/all
// @access  Private/Admin
const getAllBranches = asyncHandler(async (req, res) => {
  const branches = await Branch.find({}).sort({ createdAt: 1 });
  res.json(branches);
});

// @desc    Create a new branch
// @route   POST /api/branches
// @access  Private/Admin
const createBranch = asyncHandler(async (req, res) => {
  const { name, slug, address, phone, city, state, pincode, gstNumber, fssai, legalName } = req.body;

  if (!name || !slug) {
    res.status(400);
    throw new Error('Branch name and slug are required');
  }

  const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-');

  const existingBranch = await Branch.findOne({ slug: cleanSlug });
  if (existingBranch) {
    res.status(400);
    throw new Error(`A branch with slug "${cleanSlug}" already exists`);
  }

  const branch = await Branch.create({
    name: name.trim(),
    slug: cleanSlug,
    address: address || '',
    phone: phone || '',
    city: city || '',
    state: state || '',
    pincode: pincode || '',
    gstNumber: gstNumber || '',
    fssai: fssai || '',
    legalName: legalName || '',
    isActive: true,
  });

  // Auto-create a default StoreSettings document for the new branch
  await StoreSettings.create({
    storeName: name.trim(),
    branch: branch._id,
    address: address || '',
    phone: phone || '',
    city: city || '',
    state: state || '',
    pincode: pincode || '',
    gstNumber: gstNumber || '',
    fssai: fssai || '',
    legalName: legalName || '',
  });

  res.status(201).json(branch);
});

// @desc    Update branch details
// @route   PUT /api/branches/:id
// @access  Private/Admin
const updateBranch = asyncHandler(async (req, res) => {
  const branch = await Branch.findById(req.params.id);

  if (!branch) {
    res.status(404);
    throw new Error('Branch not found');
  }

  const { name, address, phone, city, state, pincode, gstNumber, fssai, legalName, isActive } = req.body;

  if (name !== undefined) branch.name = name.trim();
  if (address !== undefined) branch.address = address;
  if (phone !== undefined) branch.phone = phone;
  if (city !== undefined) branch.city = city;
  if (state !== undefined) branch.state = state;
  if (pincode !== undefined) branch.pincode = pincode;
  if (gstNumber !== undefined) branch.gstNumber = gstNumber;
  if (fssai !== undefined) branch.fssai = fssai;
  if (legalName !== undefined) branch.legalName = legalName;
  if (isActive !== undefined) branch.isActive = isActive;

  const updatedBranch = await branch.save();
  res.json(updatedBranch);
});

// @desc    Deactivate a branch (soft delete)
// @route   DELETE /api/branches/:id
// @access  Private/Admin
const deleteBranch = asyncHandler(async (req, res) => {
  const branch = await Branch.findById(req.params.id);

  if (!branch) {
    res.status(404);
    throw new Error('Branch not found');
  }

  // Block if branch has active orders
  const activeOrders = await Order.countDocuments({
    branch: branch._id,
    orderStatus: { $in: ['RUNNING', 'BILLED'] },
  });

  if (activeOrders > 0) {
    res.status(400);
    throw new Error(`Cannot deactivate branch: ${activeOrders} active order(s) still running.`);
  }

  branch.isActive = false;
  await branch.save();

  res.json({ message: `Branch "${branch.name}" has been deactivated.` });
});

module.exports = {
  getBranches,
  getAllBranches,
  createBranch,
  updateBranch,
  deleteBranch,
};
