const DishReplacement = require('../models/DishReplacement');

const getReplacementStatus = (startDate, endDate) => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (now >= start && now <= end) return 'Active';
  if (now < start) return 'Scheduled';
  return 'Expired';
};

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

  if (!originalDish || !replacementDish || !startDate || !endDate) {
    res.status(400);
    throw new Error('Original dish, replacement dish, start date, and end date are required');
  }

  if (originalDish === replacementDish) {
    res.status(400);
    throw new Error('Original dish and replacement dish must be different');
  }

  if (new Date(endDate) < new Date(startDate)) {
    res.status(400);
    throw new Error('End date cannot be before start date');
  }

  const replacement = await DishReplacement.create({
    originalDish,
    replacementDish,
    startDate,
    endDate,
    status: getReplacementStatus(startDate, endDate),
  });

  res.status(201).json(replacement);
};

// @desc    Update replacement
// @route   PUT /api/menu/replacements/:id
// @access  Private/Admin
const updateReplacement = async (req, res) => {
  const replacement = await DishReplacement.findById(req.params.id);

  if (replacement) {
    if (req.body.originalDish !== undefined) replacement.originalDish = req.body.originalDish;
    if (req.body.replacementDish !== undefined) replacement.replacementDish = req.body.replacementDish;
    if (req.body.startDate !== undefined) replacement.startDate = req.body.startDate;
    if (req.body.endDate !== undefined) replacement.endDate = req.body.endDate;

    if (String(replacement.originalDish) === String(replacement.replacementDish)) {
      res.status(400);
      throw new Error('Original dish and replacement dish must be different');
    }

    if (new Date(replacement.endDate) < new Date(replacement.startDate)) {
      res.status(400);
      throw new Error('End date cannot be before start date');
    }

    replacement.status = getReplacementStatus(replacement.startDate, replacement.endDate);

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
