const VariantGroup = require('../models/VariantGroup');

// @desc    Get all variant groups
// @route   GET /api/menu/variants
// @access  Public
const getVariantGroups = async (req, res) => {
  const groups = await VariantGroup.find({});
  res.json(groups);
};

// @desc    Create variant group
// @route   POST /api/menu/variants
// @access  Private/Admin
const createVariantGroup = async (req, res) => {
  const { name, options, type } = req.body;

  const groupExists = await VariantGroup.findOne({ name });

  if (groupExists) {
    res.status(400);
    throw new Error('Variant group already exists');
  }

  const group = await VariantGroup.create({
    name,
    options,
    type,
  });

  res.status(201).json(group);
};

// @desc    Update variant group
// @route   PUT /api/menu/variants/:id
// @access  Private/Admin
const updateVariantGroup = async (req, res) => {
  const group = await VariantGroup.findById(req.params.id);

  if (group) {
    group.name = req.body.name || group.name;
    group.options = req.body.options || group.options;
    group.type = req.body.type || group.type;

    const updatedGroup = await group.save();
    res.json(updatedGroup);
  } else {
    res.status(404);
    throw new Error('Variant group not found');
  }
};

// @desc    Delete variant group
// @route   DELETE /api/menu/variants/:id
// @access  Private/Admin
const deleteVariantGroup = async (req, res) => {
  const group = await VariantGroup.findById(req.params.id);
  if (group) {
    await group.deleteOne();
    res.json({ message: 'Variant group removed' });
  } else {
    res.status(404);
    throw new Error('Variant group not found');
  }
};

module.exports = {
  getVariantGroups,
  createVariantGroup,
  updateVariantGroup,
  deleteVariantGroup,
};
