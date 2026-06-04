const Role = require('../models/Role');
const Staff = require('../models/Staff');
const mongoose = require('mongoose');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all roles
// @route   GET /api/roles
// @access  Private/Admin
const getRoles = asyncHandler(async (req, res) => {
  const roles = await Role.find({});
  res.json(roles);
});

// @desc    Create a role
// @route   POST /api/roles
// @access  Private/Admin
const createRole = asyncHandler(async (req, res) => {
  const name = String(req.body.name || '').trim();
  const description = String(req.body.description || '').trim();
  const permissions = req.body.permissions || {};

  if (!name) {
    res.status(400);
    throw new Error('Role name is required');
  }

  const roleExists = await Role.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
  if (roleExists) {
    res.status(400);
    throw new Error('Role already exists');
  }

  const role = await Role.create({
    name,
    description,
    permissions,
  });

  res.status(201).json(role);
});

// @desc    Update a role
// @route   PUT /api/roles/:id
// @access  Private/Admin
const updateRole = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid Role ID format');
  }

  const role = await Role.findById(req.params.id);

  if (role) {
    const oldName = role.name;
    let nameChanged = false;
    let newName = '';

    if (req.body.name !== undefined) {
      newName = String(req.body.name).trim();
      if (!newName) {
        res.status(400);
        throw new Error('Role name is required');
      }

      if (newName !== oldName) {
        if (role.isSystemRole) {
          res.status(400);
          throw new Error('System roles cannot be renamed');
        }

        const existingRole = await Role.findOne({ name: { $regex: new RegExp(`^${newName}$`, 'i') }, _id: { $ne: role._id } });
        if (existingRole) {
          res.status(400);
          throw new Error('Role already exists');
        }

        role.name = newName;
        nameChanged = true;
      }
    }
    if (req.body.description !== undefined) role.description = String(req.body.description).trim();
    if (req.body.permissions !== undefined) role.permissions = req.body.permissions;

    const updatedRole = await role.save();

    // Cascade role name updates to Staff
    if (nameChanged) {
      await Staff.updateMany({ role: oldName }, { role: newName });
    }

    res.json(updatedRole);
  } else {
    res.status(404);
    throw new Error('Role not found');
  }
});

// @desc    Delete a role
// @route   DELETE /api/roles/:id
// @access  Private/Admin
const deleteRole = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid Role ID format');
  }

  const role = await Role.findById(req.params.id);

  if (role) {
    if (role.isSystemRole) {
      res.status(400);
      throw new Error('System roles cannot be deleted');
    }

    // Verify no active staff members are assigned to this role
    const staffCount = await Staff.countDocuments({ role: role.name, isDeleted: { $ne: true } });
    if (staffCount > 0) {
      res.status(400);
      throw new Error(`Cannot delete role: ${staffCount} active staff member(s) are assigned to this role.`);
    }

    await role.deleteOne();
    res.json({ message: 'Role removed' });
  } else {
    res.status(404);
    throw new Error('Role not found');
  }
});

module.exports = {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
};
