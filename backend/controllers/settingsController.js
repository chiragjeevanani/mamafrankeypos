const Counter = require('../models/Counter');
const StoreSettings = require('../models/StoreSettings');
const Order = require('../models/Order');
const Attendance = require('../models/Attendance');
const Expense = require('../models/Expense');
const AuditLog = require('../models/AuditLog');
const Table = require('../models/Table');
const mongoose = require('mongoose');
const logAudit = require('../utils/auditLogger');
const asyncHandler = require('../utils/asyncHandler');

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
const getTaxes = asyncHandler(async (req, res) => {
  const settings = await getOrCreateStoreSettings();
  res.json(settings.taxes || []);
});

// @desc    Create tax
// @route   POST /api/settings/taxes
// @access  Private/Admin
const createTax = asyncHandler(async (req, res) => {
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
});

// @desc    Update tax
// @route   PUT /api/settings/taxes/:id
// @access  Private/Admin
const updateTax = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid Tax ID format');
  }

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
});

// @desc    Delete tax
// @route   DELETE /api/settings/taxes/:id
// @access  Private/Admin
const deleteTax = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid Tax ID format');
  }

  const settings = await getOrCreateStoreSettings();
  const tax = settings.taxes.id(req.params.id);

  if (!tax) {
    res.status(404);
    throw new Error('Tax not found');
  }

  tax.deleteOne();
  await settings.save();
  res.json({ message: 'Tax removed' });
});

// --- Counter Controllers ---

// @desc    Get all counters
// @route   GET /api/settings/counters
// @access  Public
const getCounters = asyncHandler(async (req, res) => {
  const counters = await Counter.find({});
  res.json(counters);
});

// @desc    Create counter
// @route   POST /api/settings/counters
// @access  Private/Admin
const createCounter = asyncHandler(async (req, res) => {
  const name = String(req.body.name || '').trim();
  const prefix = String(req.body.prefix || '').trim().toUpperCase();
  const startNum = req.body.startNum !== undefined ? Number(req.body.startNum) : 1;

  if (!name) {
    res.status(400);
    throw new Error('Counter name is required');
  }

  if (!prefix) {
    res.status(400);
    throw new Error('Counter prefix is required');
  }

  if (!Number.isInteger(startNum) || startNum < 0) {
    res.status(400);
    throw new Error('Start number must be a valid non-negative integer');
  }

  const prefixExists = await Counter.findOne({ prefix: { $regex: new RegExp(`^${prefix}$`, 'i') } });
  if (prefixExists) {
    res.status(400);
    throw new Error(`Counter prefix "${prefix}" is already in use`);
  }

  const counter = await Counter.create({ name, prefix, startNum, currentNum: startNum });
  res.status(201).json(counter);
});

// @desc    Update counter
// @route   PUT /api/settings/counters/:id
// @access  Private/Admin
const updateCounter = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid Counter ID format');
  }

  const counter = await Counter.findById(req.params.id);
  if (!counter) {
    res.status(404);
    throw new Error('Counter not found');
  }

  if (req.body.name !== undefined) {
    const name = String(req.body.name).trim();
    if (!name) {
      res.status(400);
      throw new Error('Counter name is required');
    }
    counter.name = name;
  }

  if (req.body.prefix !== undefined) {
    const prefix = String(req.body.prefix).trim().toUpperCase();
    if (!prefix) {
      res.status(400);
      throw new Error('Counter prefix is required');
    }
    const duplicate = await Counter.findOne({
      _id: { $ne: counter._id },
      prefix: { $regex: new RegExp(`^${prefix}$`, 'i') }
    });
    if (duplicate) {
      res.status(400);
      throw new Error(`Counter prefix "${prefix}" is already in use`);
    }
    counter.prefix = prefix;
  }

  if (req.body.startNum !== undefined) {
    const startNum = Number(req.body.startNum);
    if (!Number.isInteger(startNum) || startNum < 0) {
      res.status(400);
      throw new Error('Start number must be a valid non-negative integer');
    }
    counter.startNum = startNum;
  }

  if (req.body.isActive !== undefined) {
    counter.isActive = req.body.isActive;
  }

  const updatedCounter = await counter.save();
  res.json(updatedCounter);
});

// @desc    Delete counter
// @route   DELETE /api/settings/counters/:id
// @access  Private/Admin
const deleteCounter = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid Counter ID format');
  }

  const counter = await Counter.findById(req.params.id);
  if (!counter) {
    res.status(404);
    throw new Error('Counter not found');
  }

  const count = await Counter.countDocuments({});
  if (count <= 1) {
    res.status(400);
    throw new Error('Cannot delete the only counter. At least one billing counter is required.');
  }

  await counter.deleteOne();
  res.json({ message: 'Counter removed' });
});

// --- Store Settings Controllers ---

// @desc    Get store settings
// @route   GET /api/settings/store
// @access  Public
const getStoreSettings = asyncHandler(async (req, res) => {
  const settings = await getOrCreateStoreSettings();
  res.json(settings);
});

// @desc    Update store settings
// @route   PUT /api/settings/store
// @access  Private/Admin
const updateStoreSettings = asyncHandler(async (req, res) => {
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
    if (req.body.adjustedOrderIds !== undefined) {
      settings.adjustedOrderIds = req.body.adjustedOrderIds;
    }
    
    // Taxes with Input Validation
    if (req.body.taxes !== undefined) {
      if (!Array.isArray(req.body.taxes)) {
        res.status(400);
        throw new Error('Taxes must be a valid array');
      }

      const uniqueNames = new Set();
      const validatedTaxes = [];

      for (const t of req.body.taxes) {
        const name = String(t.name || '').trim();
        const percentage = Number(t.percentage !== undefined ? t.percentage : (t.rate !== undefined ? t.rate : 0));
        const active = t.active !== undefined ? t.active : (t.enabled !== undefined ? t.enabled : true);

        if (!name) {
          res.status(400);
          throw new Error('Tax name is required');
        }

        if (!Number.isFinite(percentage) || percentage < 0) {
          res.status(400);
          throw new Error('Tax percentage must be a valid non-negative number');
        }

        const lowerName = name.toLowerCase();
        if (uniqueNames.has(lowerName)) {
          res.status(400);
          throw new Error(`Duplicate tax identity detected: ${name}`);
        }
        uniqueNames.add(lowerName);

        validatedTaxes.push({ name, percentage, active });
      }

      settings.taxes = validatedTaxes;
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
});

// @desc    Purge reports history
// @route   POST /api/settings/reports/purge
// @access  Private/Admin
const purgeReportsData = asyncHandler(async (req, res) => {
  // Delete all orders
  await Order.deleteMany({});
  
  // Delete all attendance logs
  await Attendance.deleteMany({});
  
  // Delete all expenses ledger logs
  await Expense.deleteMany({});
  
  // Delete all audit logs
  await AuditLog.deleteMany({});
  
  // Log the purge activity itself as a fresh audit log
  await logAudit(
    req.user?._id || '000000000000000000000000',
    'SYSTEM_PURGE',
    'SYSTEM_SETTINGS',
    'All sales metrics, ledger expenses, attendance logs, and audit logs have been purged.',
    req.ip
  );
  
  res.json({ message: 'All report history purged successfully.' });
});

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
  updateStoreSettings,
  purgeReportsData
};
