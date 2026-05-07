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
  const { name, description, permissions } = req.body;

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
    role.name = req.body.name || role.name;
    role.description = req.body.description || role.description;
    role.permissions = req.body.permissions || role.permissions;

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
