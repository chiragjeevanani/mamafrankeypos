const Staff = require('../models/Staff');
const Role = require('../models/Role');
const mongoose = require('mongoose');

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();
const normalizePhone = (phone) => String(phone || '').trim();
const normalizeRole = (role) => String(role || '').trim();
const normalizeName = (name) => String(name || '').trim();
const normalizePin = (pin) => String(pin || '').trim();

const validateRoleExists = async (roleName) => {
  const role = await Role.findOne({ name: roleName });
  return !!role;
};

// @desc    Get all staff
// @route   GET /api/staff
// @access  Private/Admin
const getStaff = async (req, res) => {
  const staff = await Staff.find({}).select('-password -pin');
  res.json(staff);
};

// @desc    Register a new staff member
// @route   POST /api/staff
// @access  Private/Admin
const registerStaff = async (req, res) => {
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

  const staffExists = await Staff.findOne({ email });

  if (staffExists && email) {
    res.status(400);
    throw new Error('Staff already exists with this email');
  }

  const staff = await Staff.create({
    name,
    email,
    phone,
    password,
    pin,
    role,
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
};

// @desc    Update staff
// @route   PUT /api/staff/:id
// @access  Private/Admin
const updateStaff = async (req, res) => {
  const staff = await Staff.findById(req.params.id);

  if (staff) {
    if (req.body.name !== undefined) staff.name = normalizeName(req.body.name) || staff.name;
    if (req.body.email !== undefined) {
      const email = normalizeEmail(req.body.email);
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        res.status(400);
        throw new Error('A valid email address is required');
      }

      const emailExists = await Staff.findOne({ email, _id: { $ne: staff._id } });
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
      staff.role = role;
    }
    if (req.body.status !== undefined) staff.status = req.body.status;

    if (req.body.password) {
      staff.password = req.body.password;
    }

    if (req.body.pin) {
      const pin = normalizePin(req.body.pin);
      if (!/^\d{4}$/.test(pin)) {
        res.status(400);
        throw new Error('PIN must be exactly 4 digits');
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
};

// @desc    Delete staff
// @route   DELETE /api/staff/:id
// @access  Private/Admin
const deleteStaff = async (req, res) => {
  const staff = await Staff.findById(req.params.id);

  if (staff) {
    await staff.deleteOne();
    res.json({ message: 'Staff member removed' });
  } else {
    res.status(404);
    throw new Error('Staff member not found');
  }
};
// @desc    Staff Login with PIN
// @route   POST /api/staff/login
// @access  Public
const loginStaff = async (req, res) => {
  const { staffId, pin } = req.body;

  // Search by name or email or ID
  const staff = await Staff.findOne({
    $or: [
      { _id: mongoose.Types.ObjectId.isValid(staffId) ? staffId : null },
      { name: { $regex: new RegExp(`^${staffId}$`, 'i') } },
      { email: staffId }
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
};

module.exports = {
  getStaff,
  registerStaff,
  updateStaff,
  deleteStaff,
  loginStaff,
};
