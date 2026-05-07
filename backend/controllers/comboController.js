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
  const name = String(req.body.name || '').trim();
  const price = Number(req.body.price);
  const code = String(req.body.code || '').trim().toUpperCase();
  const elements = (req.body.elements || []).filter((element) => element.item);
  const active = req.body.active;

  if (!name) {
    res.status(400);
    throw new Error('Combo name is required');
  }

  if (!Number.isFinite(price) || price < 0) {
    res.status(400);
    throw new Error('Combo price must be a valid non-negative number');
  }

  if (elements.length === 0) {
    res.status(400);
    throw new Error('At least one combo item is required');
  }

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
    if (req.body.name !== undefined) combo.name = String(req.body.name).trim() || combo.name;
    if (req.body.price !== undefined) {
      const price = Number(req.body.price);
      if (!Number.isFinite(price) || price < 0) {
        res.status(400);
        throw new Error('Combo price must be a valid non-negative number');
      }
      combo.price = price;
    }
    if (req.body.code !== undefined) combo.code = String(req.body.code).trim().toUpperCase();
    if (req.body.elements !== undefined) {
      const elements = req.body.elements.filter((element) => element.item);
      if (elements.length === 0) {
        res.status(400);
        throw new Error('At least one combo item is required');
      }
      combo.elements = elements;
    }
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
