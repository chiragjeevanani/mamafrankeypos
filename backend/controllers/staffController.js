const Staff = require('../models/Staff');
const mongoose = require('mongoose');

// @desc    Get all staff
// @route   GET /api/staff
// @access  Private/Admin
const getStaff = async (req, res) => {
  const staff = await Staff.find({});
  res.json(staff);
};

// @desc    Register a new staff member
// @route   POST /api/staff
// @access  Private/Admin
const registerStaff = async (req, res) => {
  const { name, email, phone, password, pin, role } = req.body;

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
    staff.name = req.body.name || staff.name;
    staff.email = req.body.email || staff.email;
    staff.phone = req.body.phone || staff.phone;
    staff.role = req.body.role || staff.role;
    staff.status = req.body.status || staff.status;

    if (req.body.password) {
      staff.password = req.body.password;
    }

    if (req.body.pin) {
      staff.pin = req.body.pin;
    }

    const updatedStaff = await staff.save();

    res.json({
      _id: updatedStaff._id,
      name: updatedStaff.name,
      email: updatedStaff.email,
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
