const Combo = require('../models/Combo');

// @desc    Get all combos
// @route   GET /api/menu/combos
// @access  Public
const getCombos = async (req, res) => {
  const combos = await Combo.find({}).populate('elements.item');
  res.json(combos);
};

// @desc    Create combo
// @route   POST /api/menu/combos
// @access  Private/Admin
const createCombo = async (req, res) => {
  const { name, price, code, elements, active } = req.body;

  const combo = await Combo.create({
    name,
    price,
    code,
    elements,
    active,
  });

  res.status(201).json(combo);
};

// @desc    Update combo
// @route   PUT /api/menu/combos/:id
// @access  Private/Admin
const updateCombo = async (req, res) => {
  const combo = await Combo.findById(req.params.id);

  if (combo) {
    combo.name = req.body.name || combo.name;
    combo.price = req.body.price || combo.price;
    combo.code = req.body.code || combo.code;
    combo.elements = req.body.elements || combo.elements;
    combo.active = req.body.active !== undefined ? req.body.active : combo.active;

    const updatedCombo = await combo.save();
    res.json(updatedCombo);
  } else {
    res.status(404);
    throw new Error('Combo not found');
  }
};

// @desc    Delete combo
// @route   DELETE /api/menu/combos/:id
// @access  Private/Admin
const deleteCombo = async (req, res) => {
  const combo = await Combo.findById(req.params.id);
  if (combo) {
    await combo.deleteOne();
    res.json({ message: 'Combo removed' });
  } else {
    res.status(404);
    throw new Error('Combo not found');
  }
};

module.exports = {
  getCombos,
  createCombo,
  updateCombo,
  deleteCombo,
};
