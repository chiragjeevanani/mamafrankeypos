const Role = require('../models/Role');

// @desc    Get all roles
// @route   GET /api/roles
// @access  Private/Admin
const getRoles = async (req, res) => {
  const roles = await Role.find({});
  res.json(roles);
};

// @desc    Create a role
// @route   POST /api/roles
// @access  Private/Admin
const createRole = async (req, res) => {
  const name = String(req.body.name || '').trim();
  const description = String(req.body.description || '').trim();
  const permissions = req.body.permissions || {};

  if (!name) {
    res.status(400);
    throw new Error('Role name is required');
  }

  const roleExists = await Role.findOne({ name });
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
};

// @desc    Update a role
// @route   PUT /api/roles/:id
// @access  Private/Admin
const updateRole = async (req, res) => {
  const role = await Role.findById(req.params.id);

  if (role) {
    if (req.body.name !== undefined) {
      const newName = String(req.body.name).trim();
      if (!newName) {
        res.status(400);
        throw new Error('Role name is required');
      }

      const existingRole = await Role.findOne({ name: newName, _id: { $ne: role._id } });
      if (existingRole) {
        res.status(400);
        throw new Error('Role already exists');
      }

      role.name = newName;
    }
    if (req.body.description !== undefined) role.description = String(req.body.description).trim();
    if (req.body.permissions !== undefined) role.permissions = req.body.permissions;

    const updatedRole = await role.save();
    res.json(updatedRole);
  } else {
    res.status(404);
    throw new Error('Role not found');
  }
};

// @desc    Delete a role
// @route   DELETE /api/roles/:id
// @access  Private/Admin
const deleteRole = async (req, res) => {
  const role = await Role.findById(req.params.id);

  if (role) {
    if (role.isSystemRole) {
      res.status(400);
      throw new Error('System roles cannot be deleted');
    }
    await role.deleteOne();
    res.json({ message: 'Role removed' });
  } else {
    res.status(404);
    throw new Error('Role not found');
  }
};

module.exports = {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
};
