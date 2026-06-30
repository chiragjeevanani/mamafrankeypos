const Staff = require('../models/Staff');
const Role = require('../models/Role');
const mongoose = require('mongoose');
const asyncHandler = require('../utils/asyncHandler');
const crypto = require('crypto');

const normalizeEmail = (email) => email ? String(email).trim().toLowerCase() : undefined;
const normalizePhone = (phone) => phone ? String(phone).trim() : undefined;
const normalizeRole = (role) => String(role || '').trim();
const normalizeName = (name) => String(name || '').trim();
const normalizePin = (pin) => pin ? String(pin).trim() : undefined;

const validateRoleExists = async (roleName) => {
  const role = await Role.findOne({ name: roleName });
  return !!role;
};

// @desc    Get all staff
// @route   GET /api/staff
// @access  Private/Admin
const getStaff = asyncHandler(async (req, res) => {
  const query = { isDeleted: { $ne: true } };
  // Branch filter: branch staff see only their branch, Admin with specific branch sees that branch, Admin 'all' sees everyone
  if (req.activeBranchId) {
    query.branch = req.activeBranchId;
  }
  const page = req.query.page ? parseInt(req.query.page, 10) : null;
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : null;

  if (page && limit) {
    const skip = (page - 1) * limit;
    const total = await Staff.countDocuments(query);
    const data = await Staff.find(query)
      .select('-password -pin')
      .populate('branch', 'name slug')
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
    const staff = await Staff.find(query).select('-password -pin').populate('branch', 'name slug');
    res.json(staff);
  }
});

// @desc    Register a new staff member
// @route   POST /api/staff
// @access  Private/Admin
const registerStaff = asyncHandler(async (req, res) => {
  const name = normalizeName(req.body.name);
  const email = normalizeEmail(req.body.email);
  const phone = normalizePhone(req.body.phone);
  const password = req.body.password;
  const pin = normalizePin(req.body.pin);
  const role = normalizeRole(req.body.role);

  if (!name) {
    res.status(400);
    throw new Error('Staff name is required');
  }

  if (!role) {
    res.status(400);
    throw new Error('Role is required');
  }

  if (!(await validateRoleExists(role))) {
    res.status(400);
    throw new Error('Selected role does not exist');
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400);
    throw new Error('A valid email address is required');
  }

  if (pin && !/^\d{4}$/.test(pin)) {
    res.status(400);
    throw new Error('PIN must be exactly 4 digits');
  }

  if (role === 'Admin' && !password) {
    res.status(400);
    throw new Error('Password is required for admin staff');
  }

  // Check for duplicate PIN hash on active staff
  if (pin) {
    const pinHash = crypto.createHash('sha256').update(pin).digest('hex');
    const pinExists = await Staff.findOne({ pinHash, isDeleted: { $ne: true } });
    if (pinExists) {
      res.status(400);
      throw new Error('This PIN is already assigned to another staff member. Please choose a unique PIN.');
    }
  }

  // Only check for duplicate emails on non-deleted staff if email is provided
  const staffExists = email ? await Staff.findOne({ email, isDeleted: { $ne: true } }) : null;

  if (email && staffExists) {
    res.status(400);
    throw new Error('Staff already exists with this email');
  }

  // Determine which branch to assign
  // Admin can pass a branchId in req.body to assign to a specific branch
  // Non-admin staff are auto-assigned to their own branch
  const assignedBranch = req.body.branchId || req.activeBranchId || null;

  const staff = await Staff.create({
    name,
    email,
    phone,
    password,
    pin,
    role,
    branch: assignedBranch,
  });

  if (staff) {
    res.status(201).json({
      _id: staff._id,
      name: staff.name,
      email: staff.email,
      phone: staff.phone,
      role: staff.role,
      status: staff.status,
    });
  } else {
    res.status(400);
    throw new Error('Invalid staff data');
  }
});

// @desc    Update staff
// @route   PUT /api/staff/:id
// @access  Private/Admin
const updateStaff = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid Staff ID format');
  }

  const staff = await Staff.findOne({ _id: req.params.id, isDeleted: { $ne: true } });

  if (staff) {
    if (req.body.name !== undefined) staff.name = normalizeName(req.body.name) || staff.name;
    if (req.body.email !== undefined) {
      const email = normalizeEmail(req.body.email);
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        res.status(400);
        throw new Error('A valid email address is required');
      }

      const emailExists = await Staff.findOne({ email, _id: { $ne: staff._id }, isDeleted: { $ne: true } });
      if (email && emailExists) {
        res.status(400);
        throw new Error('Another staff member already uses this email');
      }

      staff.email = email;
    }
    if (req.body.phone !== undefined) staff.phone = normalizePhone(req.body.phone);
    if (req.body.role !== undefined) {
      const role = normalizeRole(req.body.role);
      if (!role) {
        res.status(400);
        throw new Error('Role is required');
      }
      if (!(await validateRoleExists(role))) {
        res.status(400);
        throw new Error('Selected role does not exist');
      }
      
      // If setting from Admin to non-Admin, check if this is the last active Admin
      if (staff.role === 'Admin' && role !== 'Admin') {
        const activeAdminCount = await Staff.countDocuments({ role: 'Admin', isDeleted: { $ne: true } });
        if (activeAdminCount <= 1) {
          res.status(400);
          throw new Error('Cannot change role: must have at least one active Administrator');
        }
      }
      
      staff.role = role;
    }
    
    // If setting to Inactive and this user is Admin, check if this is the last active Admin
    if (req.body.status !== undefined) {
      if (staff.role === 'Admin' && req.body.status === 'Inactive' && staff.status === 'Active') {
        const activeAdminCount = await Staff.countDocuments({ role: 'Admin', status: 'Active', isDeleted: { $ne: true } });
        if (activeAdminCount <= 1) {
          res.status(400);
          throw new Error('Cannot set status to Inactive: must have at least one active Administrator');
        }
      }
      staff.status = req.body.status;
    }

    if (req.body.password) {
      staff.password = req.body.password;
    }

    if (req.body.pin) {
      const pin = normalizePin(req.body.pin);
      if (!/^\d{4}$/.test(pin)) {
        res.status(400);
        throw new Error('PIN must be exactly 4 digits');
      }

      const pinHash = crypto.createHash('sha256').update(pin).digest('hex');
      const pinExists = await Staff.findOne({ pinHash, _id: { $ne: staff._id }, isDeleted: { $ne: true } });
      if (pinExists) {
        res.status(400);
        throw new Error('This PIN is already assigned to another staff member. Please choose a unique PIN.');
      }

      staff.pin = pin;
    }

    if (staff.role === 'Admin' && !staff.password && !req.body.password) {
      res.status(400);
      throw new Error('Admin staff must have a password');
    }

    const updatedStaff = await staff.save();

    res.json({
      _id: updatedStaff._id,
      name: updatedStaff.name,
      email: updatedStaff.email,
      phone: updatedStaff.phone,
      role: updatedStaff.role,
      status: updatedStaff.status,
    });
  } else {
    res.status(404);
    throw new Error('Staff member not found');
  }
});

// @desc    Delete staff (soft-delete)
// @route   DELETE /api/staff/:id
// @access  Private/Admin
const deleteStaff = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid Staff ID format');
  }

  const staff = await Staff.findOne({ _id: req.params.id, isDeleted: { $ne: true } });

  if (staff) {
    // Prevent deleting the last Administrator
    if (staff.role === 'Admin') {
      const activeAdminCount = await Staff.countDocuments({ role: 'Admin', isDeleted: { $ne: true } });
      if (activeAdminCount <= 1) {
        res.status(400);
        throw new Error('Cannot delete the last active Administrator account');
      }
    }

    // Restrict deleting staff with active orders
    const Order = require('../models/Order');
    const activeOrdersCount = await Order.countDocuments({
      waiter: staff._id,
      orderStatus: { $in: ['RUNNING', 'BILLED'] }
    });

    if (activeOrdersCount > 0) {
      res.status(400);
      throw new Error('Cannot delete staff member who is currently assigned to active running/billed orders');
    }

    staff.isDeleted = true;
    await staff.save();
    res.json({ message: 'Staff member removed' });
  } else {
    res.status(404);
    throw new Error('Staff member not found');
  }
});

// @desc    Staff Login with PIN
// @route   POST /api/staff/login
// @access  Public
const loginStaff = asyncHandler(async (req, res) => {
  const { staffId, pin } = req.body;

  // Search by exact ID or email only (no regex name lookup) and not deleted
  const staff = await Staff.findOne({
    $and: [
      { isDeleted: { $ne: true } },
      {
        $or: [
          { _id: mongoose.Types.ObjectId.isValid(staffId) ? staffId : null },
          { email: staffId }
        ]
      }
    ]
  });

  if (staff && (await staff.matchPin(pin))) {
    res.json({
      _id: staff._id,
      name: staff.name,
      role: staff.role,
      status: staff.status
    });
  } else {
    res.status(401);
    throw new Error('Invalid Staff ID or PIN');
  }
});

module.exports = {
  getStaff,
  registerStaff,
  updateStaff,
  deleteStaff,
  loginStaff,
};
