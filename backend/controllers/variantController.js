const VariantGroup = require('../models/VariantGroup');
const mongoose = require('mongoose');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all variant groups
// @route   GET /api/menu/variants
// @access  Public
const getVariantGroups = asyncHandler(async (req, res) => {
  const groups = await VariantGroup.find({});
  res.json(groups);
});

// @desc    Create variant group
// @route   POST /api/menu/variants
// @access  Private/Admin
const createVariantGroup = asyncHandler(async (req, res) => {
  const name = String(req.body.name || '').trim();
  const options = (req.body.options || [])
    .filter((option) => String(option.name || '').trim() !== '')
    .map((option) => ({
      name: String(option.name || '').trim(),
      price: Number(option.price ?? option.priceValue ?? 0) || 0,
    }));
  const type = req.body.type;

  if (!name) {
    res.status(400);
    throw new Error('Variant group name is required');
  }

  if (options.length === 0) {
    res.status(400);
    throw new Error('At least one variant option is required');
  }

  const groupExists = await VariantGroup.findOne({
    name: { $regex: new RegExp(`^${name}$`, 'i') }
  });

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
});

// @desc    Update variant group
// @route   PUT /api/menu/variants/:id
// @access  Private/Admin
const updateVariantGroup = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid Variant Group ID format');
  }

  const group = await VariantGroup.findById(req.params.id);

  if (group) {
    if (req.body.name !== undefined) group.name = String(req.body.name).trim() || group.name;
    if (req.body.options !== undefined) {
      const options = req.body.options
        .filter((option) => String(option.name || '').trim() !== '')
        .map((option) => ({
          name: String(option.name || '').trim(),
          price: Number(option.price ?? option.priceValue ?? 0) || 0,
        }));

      if (options.length === 0) {
        res.status(400);
        throw new Error('At least one variant option is required');
      }

      group.options = options;
    }
    if (req.body.type !== undefined) group.type = req.body.type;

    const updatedGroup = await group.save();
    res.json(updatedGroup);
  } else {
    res.status(404);
    throw new Error('Variant group not found');
  }
});

// @desc    Delete variant group
// @route   DELETE /api/menu/variants/:id
// @access  Private/Admin
const deleteVariantGroup = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid Variant Group ID format');
  }

  const group = await VariantGroup.findById(req.params.id);
  if (group) {
    await group.deleteOne();
    res.json({ message: 'Variant group removed' });
  } else {
    res.status(404);
    throw new Error('Variant group not found');
  }
});

module.exports = {
  getVariantGroups,
  createVariantGroup,
  updateVariantGroup,
  deleteVariantGroup,
};
