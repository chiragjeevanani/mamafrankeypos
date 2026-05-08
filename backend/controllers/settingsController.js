const Tax = require('../models/Tax');
const Counter = require('../models/Counter');

// --- Tax Controllers ---

// @desc    Get all taxes
// @route   GET /api/settings/taxes
// @access  Public
const getTaxes = async (req, res) => {
  const taxes = await Tax.find({});
  res.json(taxes);
};

// @desc    Create tax
// @route   POST /api/settings/taxes
// @access  Private/Admin
const createTax = async (req, res) => {
  const { name, rate, enabled } = req.body;
  const tax = await Tax.create({ name, rate, enabled });
  res.status(201).json(tax);
};

// @desc    Update tax
// @route   PUT /api/settings/taxes/:id
// @access  Private/Admin
const updateTax = async (req, res) => {
  const tax = await Tax.findById(req.params.id);
  if (tax) {
    tax.name = req.body.name || tax.name;
    tax.rate = req.body.rate !== undefined ? req.body.rate : tax.rate;
    tax.enabled = req.body.enabled !== undefined ? req.body.enabled : tax.enabled;
    const updatedTax = await tax.save();
    res.json(updatedTax);
  } else {
    res.status(404);
    throw new Error('Tax not found');
  }
};

// @desc    Delete tax
// @route   DELETE /api/settings/taxes/:id
// @access  Private/Admin
const deleteTax = async (req, res) => {
  const tax = await Tax.findById(req.params.id);
  if (tax) {
    await tax.deleteOne();
    res.json({ message: 'Tax removed' });
  } else {
    res.status(404);
    throw new Error('Tax not found');
  }
};

// --- Counter Controllers ---

// @desc    Get all counters
// @route   GET /api/settings/counters
// @access  Public
const getCounters = async (req, res) => {
  const counters = await Counter.find({});
  res.json(counters);
};

// @desc    Create counter
// @route   POST /api/settings/counters
// @access  Private/Admin
const createCounter = async (req, res) => {
  const { name, prefix, startNum } = req.body;
  const counter = await Counter.create({ name, prefix, startNum, currentNum: startNum });
  res.status(201).json(counter);
};

// @desc    Update counter
// @route   PUT /api/settings/counters/:id
// @access  Private/Admin
const updateCounter = async (req, res) => {
  const counter = await Counter.findById(req.params.id);
  if (counter) {
    counter.name = req.body.name || counter.name;
    counter.prefix = req.body.prefix || counter.prefix;
    counter.startNum = req.body.startNum !== undefined ? req.body.startNum : counter.startNum;
    counter.isActive = req.body.isActive !== undefined ? req.body.isActive : counter.isActive;
    const updatedCounter = await counter.save();
    res.json(updatedCounter);
  } else {
    res.status(404);
    throw new Error('Counter not found');
  }
};

// @desc    Delete counter
// @route   DELETE /api/settings/counters/:id
// @access  Private/Admin
const deleteCounter = async (req, res) => {
  const counter = await Counter.findById(req.params.id);
  if (counter) {
    await counter.deleteOne();
    res.json({ message: 'Counter removed' });
  } else {
    res.status(404);
    throw new Error('Counter not found');
  }
};

const StoreSettings = require('../models/StoreSettings');
const logAudit = require('../utils/auditLogger');

// --- Store Settings Controllers ---

// @desc    Get store settings
// @route   GET /api/settings/store
// @access  Public
const getStoreSettings = async (req, res) => {
  let settings = await StoreSettings.findOne();
  if (!settings) {
    settings = await StoreSettings.create({});
  }
  res.json(settings);
};

// @desc    Update store settings
// @route   PUT /api/settings/store
// @access  Private/Admin
const updateStoreSettings = async (req, res) => {
  let settings = await StoreSettings.findOne();
  if (!settings) {
    settings = await StoreSettings.create(req.body);
  } else {
    settings.storeName = req.body.storeName || settings.storeName;
    settings.address = req.body.address || settings.address;
    settings.phone = req.body.phone || settings.phone;
    settings.currency = req.body.currency || settings.currency;
    settings.currencySymbol = req.body.currencySymbol || settings.currencySymbol;
    settings.timezone = req.body.timezone || settings.timezone;
    settings.gstNumber = req.body.gstNumber || settings.gstNumber;
    
    // Adjustment Protocols
    if (req.body.visibilityDecrement !== undefined) {
      settings.visibilityDecrement = req.body.visibilityDecrement;
    }
    if (req.body.maskQuantity !== undefined) {
      settings.maskQuantity = req.body.maskQuantity;
    }
    if (req.body.itemReplacements !== undefined) {
      settings.itemReplacements = req.body.itemReplacements;
    }
    if (req.body.targetOutlet !== undefined) {
      settings.targetOutlet = req.body.targetOutlet;
    }
    if (req.body.protocolPriceRange !== undefined) {
      settings.protocolPriceRange = req.body.protocolPriceRange;
    }
    
    await settings.save();

    // Log the adjustment protocol update
    if (req.body.visibilityDecrement !== undefined || req.body.itemReplacements !== undefined) {
      await logAudit(
        req.user?._id || '000000000000000000000000', // Fallback for manual seeds/tests
        'UPDATE_ADJUSTMENT_PROTOCOL',
        'SYSTEM_SETTINGS',
        `Visibility: ${req.body.visibilityDecrement}%, MaskQty: ${req.body.maskQuantity}, Replacements: ${req.body.itemReplacements?.length || 0}`,
        req.ip
      );
    }
  }
  res.json(settings);
};

module.exports = {
  getTaxes,
  createTax,
  updateTax,
  deleteTax,
  getCounters,
  createCounter,
  updateCounter,
  deleteCounter,
  getStoreSettings,
  updateStoreSettings
};
