const Counter = require('../models/Counter');
const StoreSettings = require('../models/StoreSettings');
const logAudit = require('../utils/auditLogger');

const getOrCreateStoreSettings = async () => {
  let settings = await StoreSettings.findOne();
  if (!settings) {
    settings = await StoreSettings.create({});
  }
  return settings;
};

const normalizeTax = (tax = {}) => ({
  name: String(tax.name || '').trim(),
  percentage: Number(tax.percentage ?? tax.rate ?? 0),
  active: tax.active !== undefined ? tax.active : (tax.enabled !== undefined ? tax.enabled : true),
});

// --- Tax Controllers ---

// @desc    Get all taxes
// @route   GET /api/settings/taxes
// @access  Public
const getTaxes = async (req, res) => {
  const settings = await getOrCreateStoreSettings();
  res.json(settings.taxes || []);
};

// @desc    Create tax
// @route   POST /api/settings/taxes
// @access  Private/Admin
const createTax = async (req, res) => {
  const settings = await getOrCreateStoreSettings();
  const tax = normalizeTax(req.body);

  if (!tax.name) {
    res.status(400);
    throw new Error('Tax name is required');
  }

  if (!Number.isFinite(tax.percentage) || tax.percentage < 0) {
    res.status(400);
    throw new Error('Tax percentage must be a valid non-negative number');
  }

  if (settings.taxes.some((existing) => existing.name.toLowerCase() === tax.name.toLowerCase())) {
    res.status(400);
    throw new Error('Tax already exists');
  }

  settings.taxes.push(tax);
  await settings.save();
  res.status(201).json(settings.taxes[settings.taxes.length - 1]);
};

// @desc    Update tax
// @route   PUT /api/settings/taxes/:id
// @access  Private/Admin
const updateTax = async (req, res) => {
  const settings = await getOrCreateStoreSettings();
  const tax = settings.taxes.id(req.params.id);

  if (!tax) {
    res.status(404);
    throw new Error('Tax not found');
  }

  const updates = normalizeTax({ ...tax.toObject(), ...req.body });
  if (!updates.name) {
    res.status(400);
    throw new Error('Tax name is required');
  }
  if (!Number.isFinite(updates.percentage) || updates.percentage < 0) {
    res.status(400);
    throw new Error('Tax percentage must be a valid non-negative number');
  }

  const duplicate = settings.taxes.find((existing) =>
    String(existing._id) !== String(tax._id) &&
    existing.name.toLowerCase() === updates.name.toLowerCase()
  );
  if (duplicate) {
    res.status(400);
    throw new Error('Tax already exists');
  }

  tax.name = updates.name;
  tax.percentage = updates.percentage;
  tax.active = updates.active;
  await settings.save();
  res.json(tax);
};

// @desc    Delete tax
// @route   DELETE /api/settings/taxes/:id
// @access  Private/Admin
const deleteTax = async (req, res) => {
  const settings = await getOrCreateStoreSettings();
  const tax = settings.taxes.id(req.params.id);

  if (!tax) {
    res.status(404);
    throw new Error('Tax not found');
  }

  tax.deleteOne();
  await settings.save();
  res.json({ message: 'Tax removed' });
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

// --- Store Settings Controllers ---

// @desc    Get store settings
// @route   GET /api/settings/store
// @access  Public
const getStoreSettings = async (req, res) => {
  const settings = await getOrCreateStoreSettings();
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
    
    // Taxes
    if (req.body.taxes !== undefined) {
      settings.taxes = req.body.taxes.map(t => ({
        name: t.name,
        percentage: Number(t.percentage || t.rate || 0),
        active: t.active !== undefined ? t.active : (t.enabled !== undefined ? t.enabled : true)
      }));
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
