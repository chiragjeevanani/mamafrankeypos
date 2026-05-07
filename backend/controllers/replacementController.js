const DishReplacement = require('../models/DishReplacement');

// @desc    Get all replacements
// @route   GET /api/menu/replacements
// @access  Public
const getReplacements = async (req, res) => {
  const replacements = await DishReplacement.find({})
    .populate('originalDish')
    .populate('replacementDish');
  res.json(replacements);
};

// @desc    Create replacement
// @route   POST /api/menu/replacements
// @access  Private/Admin
const createReplacement = async (req, res) => {
  const { originalDish, replacementDish, startDate, endDate } = req.body;

  const replacement = await DishReplacement.create({
    originalDish,
    replacementDish,
    startDate,
    endDate,
  });

  res.status(201).json(replacement);
};

// @desc    Update replacement
// @route   PUT /api/menu/replacements/:id
// @access  Private/Admin
const updateReplacement = async (req, res) => {
  const replacement = await DishReplacement.findById(req.params.id);

  if (replacement) {
    replacement.originalDish = req.body.originalDish || replacement.originalDish;
    replacement.replacementDish = req.body.replacementDish || replacement.replacementDish;
    replacement.startDate = req.body.startDate || replacement.startDate;
    replacement.endDate = req.body.endDate || replacement.endDate;

    const updatedReplacement = await replacement.save();
    res.json(updatedReplacement);
  } else {
    res.status(404);
    throw new Error('Replacement rule not found');
  }
};

// @desc    Delete replacement
// @route   DELETE /api/menu/replacements/:id
// @access  Private/Admin
const deleteReplacement = async (req, res) => {
  const replacement = await DishReplacement.findById(req.params.id);
  if (replacement) {
    await replacement.deleteOne();
    res.json({ message: 'Replacement rule removed' });
  } else {
    res.status(404);
    throw new Error('Replacement rule not found');
  }
};

module.exports = {
  getReplacements,
  createReplacement,
  updateReplacement,
  deleteReplacement,
};
