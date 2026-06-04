const Category = require('../models/Category');
const MenuItem = require('../models/MenuItem');
const Combo = require('../models/Combo');
const DishReplacement = require('../models/DishReplacement');
const mongoose = require('mongoose');
const csv = require('csvtojson');
const fs = require('fs');
const logAudit = require('../utils/auditLogger');
const asyncHandler = require('../utils/asyncHandler');

const parseVariantGroups = (rawVariantGroups) => {
  if (!rawVariantGroups) return [];
  const parsed = typeof rawVariantGroups === 'string' ? JSON.parse(rawVariantGroups) : rawVariantGroups;

  return parsed.map((group) => ({
    name: String(group.name || '').trim(),
    type: group.type || 'Add-on',
    options: (group.options || [])
      .filter((option) => String(option.name || '').trim() !== '')
      .map((option) => ({
        name: String(option.name || '').trim(),
        price: Number(option.price ?? option.priceValue ?? 0) || 0,
      })),
  })).filter((group) => group.name && group.options.length > 0);
};

// --- Category Controllers ---

// @desc    Get all categories
// @route   GET /api/menu/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({}).sort({ rank: 1 });
  res.json(categories);
});

// @desc    Create category
// @route   POST /api/menu/categories
// @access  Private/Admin
const createCategory = asyncHandler(async (req, res) => {
  const name = String(req.body.name || '').trim();
  const description = String(req.body.description || '').trim();
  let rank = parseInt(req.body.rank, 10);
  if (isNaN(rank) || rank < 0) rank = 0;
  const image = req.file ? req.file.path : '';

  if (!name) {
    res.status(400);
    throw new Error('Category name is required');
  }

  // Case-insensitive duplicate name check
  const categoryExists = await Category.findOne({
    name: { $regex: new RegExp(`^${name}$`, 'i') }
  });

  if (categoryExists) {
    res.status(400);
    throw new Error('Category already exists');
  }

  const category = await Category.create({
    name,
    description,
    image,
    rank,
    status: req.body.status || 'Active',
  });

  await logAudit(req.user._id, 'CREATE_CATEGORY', 'MENU', `Category created: ${name}`, req.ip);

  res.status(201).json(category);
});

// @desc    Update category
// @route   PUT /api/menu/categories/:id
// @access  Private/Admin
const updateCategory = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid Category ID format');
  }

  const category = await Category.findById(req.params.id);

  if (category) {
    if (req.body.name !== undefined) category.name = String(req.body.name).trim() || category.name;
    if (req.body.description !== undefined) category.description = String(req.body.description).trim();
    if (req.body.rank !== undefined) {
      let rank = parseInt(req.body.rank, 10);
      if (isNaN(rank) || rank < 0) rank = 0;
      category.rank = rank;
    }
    category.status = req.body.status || category.status;

    if (req.file) {
      category.image = req.file.path;
    }

    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } else {
    res.status(404);
    throw new Error('Category not found');
  }
});

// --- MenuItem Controllers ---

// @desc    Get all menu items
// @route   GET /api/menu/items
// @access  Public
const getMenuItems = asyncHandler(async (req, res) => {
  const items = await MenuItem.find({}).populate('category').sort({ rank: 1 });
  res.json(items);
});

// @desc    Create menu item
// @route   POST /api/menu/items
// @access  Private/Admin
const createMenuItem = asyncHandler(async (req, res) => {
  const name = String(req.body.name || '').trim();
  const description = String(req.body.description || '').trim();
  const category = req.body.category;
  const price = Number(req.body.price);
  const type = req.body.type;
  const shortCode = String(req.body.shortCode || '').trim().toUpperCase();
  let rank = parseInt(req.body.rank, 10);
  if (isNaN(rank) || rank < 0) rank = 0;
  const image = req.file ? req.file.path : '';
  const parsedVariantGroups = parseVariantGroups(req.body.variantGroups);

  if (!name) {
    res.status(400);
    throw new Error('Item name is required');
  }

  if (!category) {
    res.status(400);
    throw new Error('Category is required');
  }

  if (!mongoose.Types.ObjectId.isValid(category)) {
    res.status(400);
    throw new Error('Invalid Category ID format');
  }

  if (!Number.isFinite(price) || price < 0) {
    res.status(400);
    throw new Error('Price must be a valid non-negative number');
  }

  // Check for duplicate shortCode
  if (shortCode) {
    const existingCode = await MenuItem.findOne({ shortCode });
    if (existingCode) {
      res.status(400);
      throw new Error(`Short code "${shortCode}" is already assigned to ${existingCode.name}`);
    }
  }

  // Check for duplicate name in same category (case-insensitive check)
  const existingName = await MenuItem.findOne({
    name: { $regex: new RegExp(`^${name}$`, 'i') },
    category
  });
  if (existingName) {
    res.status(400);
    throw new Error(`Item "${name}" already exists in this category`);
  }

  const menuItem = await MenuItem.create({
    name,
    description,
    category,
    price,
    type,
    image,
    shortCode,
    rank,
    status: req.body.status || 'Available',
    variantGroups: parsedVariantGroups,
  });

  await logAudit(req.user._id, 'CREATE_MENU_ITEM', 'MENU', `Menu item created: ${name}`, req.ip);

  res.status(201).json(menuItem);
});

// @desc    Update menu item
// @route   PUT /api/menu/items/:id
// @access  Private/Admin
const updateMenuItem = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid Menu Item ID format');
  }

  const item = await MenuItem.findById(req.params.id);

  if (item) {
    if (req.body.name !== undefined) item.name = String(req.body.name).trim() || item.name;
    if (req.body.description !== undefined) item.description = String(req.body.description).trim();
    
    if (req.body.category !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(req.body.category)) {
        res.status(400);
        throw new Error('Invalid Category ID format');
      }
      item.category = req.body.category;
    }
    
    if (req.body.price !== undefined) {
      const price = Number(req.body.price);
      if (!Number.isFinite(price) || price < 0) {
        res.status(400);
        throw new Error('Price must be a valid non-negative number');
      }
      item.price = price;
    }
    if (req.body.type !== undefined) item.type = req.body.type;
    
    // Check for duplicate shortCode if changed
    if (req.body.shortCode && req.body.shortCode !== item.shortCode) {
      const existingCode = await MenuItem.findOne({ shortCode: req.body.shortCode });
      if (existingCode) {
        res.status(400);
        throw new Error(`Short code "${req.body.shortCode}" is already assigned to ${existingCode.name}`);
      }
    }
    
    if (req.body.shortCode !== undefined) item.shortCode = String(req.body.shortCode).trim().toUpperCase();
    if (req.body.rank !== undefined) {
      let rank = parseInt(req.body.rank, 10);
      if (isNaN(rank) || rank < 0) rank = 0;
      item.rank = rank;
    }
    if (req.body.status !== undefined) item.status = req.body.status;

    if (req.body.variantGroups) {
      item.variantGroups = parseVariantGroups(req.body.variantGroups);
    }

    if (req.file) {
      item.image = req.file.path;
    }

    const updatedItem = await item.save();
    res.json(updatedItem);
  } else {
    res.status(404);
    throw new Error('Menu item not found');
  }
});

// --- Bulk Upload ---

// @desc    Bulk upload menu from CSV
// @route   POST /api/menu/bulk-upload
// @access  Private/Admin
const bulkUploadMenu = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Please upload a CSV file');
  }

  try {
    const jsonArray = await csv().fromFile(req.file.path);
    
    // Process CSV items
    for (const row of jsonArray) {
      // 1. Find or create Category (case-insensitive check)
      let category = await Category.findOne({ name: { $regex: new RegExp(`^${row.Category}$`, 'i') } });
      if (!category) {
        category = await Category.create({ name: row.Category });
      }

      // 2. Parse Variations
      const variantGroups = [];
      if (row.Variation_group_name) {
        const group = {
          name: row.Variation_group_name,
          options: []
        };
        
        if (row.Variation) group.options.push({ name: row.Variation, price: Number(row.Variation_Price) || 0 });
        if (row.field30) group.options.push({ name: row.field30, price: Number(row.field31) || 0 });
        if (row.field34) group.options.push({ name: row.field34, price: Number(row.field35) || 0 });
        
        if (group.options.length > 0) {
          variantGroups.push(group);
        }
      }

      // 3. Create or Update MenuItem
      const menuItemData = {
        name: row.Name,
        description: row.Description || '',
        category: category._id,
        price: Number(row.Price) || 0,
        type: (row.Attributes || 'veg').toLowerCase(),
        shortCode: row.Short_Code,
        rank: Number(row.Rank) || 0,
        variantGroups,
      };

      await MenuItem.findOneAndUpdate(
        { name: { $regex: new RegExp(`^${row.Name}$`, 'i') }, category: category._id },
        menuItemData,
        { upsert: true, new: true }
      );
    }

    res.json({ message: 'Menu bulk upload successful' });
  } catch (error) {
    console.error(error);
    res.status(500);
    throw new Error('Error processing CSV file');
  } finally {
    // Delete local temp file to prevent server storage leaks
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error('Failed to remove temp file:', err);
      }
    }
  }
});

// @desc    Delete category
// @route   DELETE /api/menu/categories/:id
// @access  Private/Admin
const deleteCategory = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid Category ID format');
  }

  const category = await Category.findById(req.params.id);
  if (category) {
    // Delete items in this category first
    await MenuItem.deleteMany({ category: category._id });
    const catName = category.name;
    await category.deleteOne();
    
    await logAudit(req.user._id, 'DELETE_CATEGORY', 'MENU', `Category and its items removed: ${catName}`, req.ip);
    
    res.json({ message: 'Category and its items removed' });
  } else {
    res.status(404);
    throw new Error('Category not found');
  }
});

// @desc    Delete menu item
// @route   DELETE /api/menu/items/:id
// @access  Private/Admin
const deleteMenuItem = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid Menu Item ID format');
  }

  const item = await MenuItem.findById(req.params.id);
  if (item) {
    const itemId = item._id;
    const itemName = item.name;
    
    // 1. Delete item
    await item.deleteOne();
    
    // 2. Cascade delete replacement rules referencing this dish
    await DishReplacement.deleteMany({
      $or: [{ originalDish: itemId }, { replacementDish: itemId }]
    });
    
    // 3. Remove this item from all Combos' elements list
    await Combo.updateMany(
      { 'elements.item': itemId },
      { $pull: { elements: { item: itemId } } }
    );
    
    // 4. Delete combos that end up with 0 elements
    await Combo.deleteMany({ elements: { $size: 0 } });
    
    await logAudit(req.user._id, 'DELETE_MENU_ITEM', 'MENU', `Menu item removed and references cleaned: ${itemName}`, req.ip);
    
    res.json({ message: 'Menu item removed' });
  } else {
    res.status(404);
    throw new Error('Menu item not found');
  }
});

// @desc    Bulk update menu items
// @route   POST /api/menu/items/bulk-update
// @access  Private/Admin
const bulkUpdateMenuItems = asyncHandler(async (req, res) => {
  const { ids, updates } = req.body;
  
  if (!ids || !Array.isArray(ids)) {
    res.status(400);
    throw new Error('Please provide an array of IDs');
  }

  for (const id of ids) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400);
      throw new Error(`Invalid ID format in bulk update: ${id}`);
    }
  }

  await MenuItem.updateMany({ _id: { $in: ids } }, { $set: updates });
  res.json({ message: 'Bulk update successful' });
});

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  bulkUploadMenu,
  bulkUpdateMenuItems,
};
