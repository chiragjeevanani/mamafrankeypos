const Category = require('../models/Category');
const MenuItem = require('../models/MenuItem');
const csv = require('csvtojson');
const logAudit = require('../utils/auditLogger');

// --- Category Controllers ---

// @desc    Get all categories
// @route   GET /api/menu/categories
// @access  Public
const getCategories = async (req, res) => {
  const categories = await Category.find({}).sort({ rank: 1 });
  res.json(categories);
};

// @desc    Create category
// @route   POST /api/menu/categories
// @access  Private/Admin
const createCategory = async (req, res) => {
  const { name, description, rank } = req.body;
  const image = req.file ? req.file.path : '';

  const categoryExists = await Category.findOne({ name });

  if (categoryExists) {
    res.status(400);
    throw new Error('Category already exists');
  }

  const category = await Category.create({
    name,
    description,
    image,
    rank,
  });

  await logAudit(req.user._id, 'CREATE_CATEGORY', 'MENU', `Category created: ${name}`, req.ip);

  res.status(201).json(category);
};

// @desc    Update category
// @route   PUT /api/menu/categories/:id
// @access  Private/Admin
const updateCategory = async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (category) {
    category.name = req.body.name || category.name;
    category.description = req.body.description || category.description;
    category.rank = req.body.rank || category.rank;
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
};

// --- MenuItem Controllers ---

// @desc    Get all menu items
// @route   GET /api/menu/items
// @access  Public
const getMenuItems = async (req, res) => {
  const items = await MenuItem.find({}).populate('category').sort({ rank: 1 });
  res.json(items);
};

// @desc    Create menu item
// @route   POST /api/menu/items
// @access  Private/Admin
const createMenuItem = async (req, res) => {
  const { name, description, category, price, type, shortCode, rank, variantGroups } = req.body;
  const image = req.file ? req.file.path : '';

  // Check for duplicate shortCode
  if (shortCode) {
    const existingCode = await MenuItem.findOne({ shortCode });
    if (existingCode) {
      res.status(400);
      throw new Error(`Short code "${shortCode}" is already assigned to ${existingCode.name}`);
    }
  }

  // Check for duplicate name in same category
  const existingName = await MenuItem.findOne({ name, category });
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
    variantGroups: variantGroups ? JSON.parse(variantGroups) : [],
  });

  await logAudit(req.user._id, 'CREATE_MENU_ITEM', 'MENU', `Menu item created: ${name}`, req.ip);

  res.status(201).json(menuItem);
};

// @desc    Update menu item
// @route   PUT /api/menu/items/:id
// @access  Private/Admin
const updateMenuItem = async (req, res) => {
  const item = await MenuItem.findById(req.params.id);

  if (item) {
    item.name = req.body.name || item.name;
    item.description = req.body.description || item.description;
    item.category = req.body.category || item.category;
    item.price = req.body.price || item.price;
    item.type = req.body.type || item.type;
    
    // Check for duplicate shortCode if changed
    if (req.body.shortCode && req.body.shortCode !== item.shortCode) {
      const existingCode = await MenuItem.findOne({ shortCode: req.body.shortCode });
      if (existingCode) {
        res.status(400);
        throw new Error(`Short code "${req.body.shortCode}" is already assigned to ${existingCode.name}`);
      }
    }
    
    item.shortCode = req.body.shortCode || item.shortCode;
    item.rank = req.body.rank || item.rank;
    item.status = req.body.status || item.status;

    if (req.body.variantGroups) {
      item.variantGroups = JSON.parse(req.body.variantGroups);
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
};

// --- Bulk Upload ---

// @desc    Bulk upload menu from CSV
// @route   POST /api/menu/bulk-upload
// @access  Private/Admin
const bulkUploadMenu = async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Please upload a CSV file');
  }

  try {
    const jsonArray = await csv().fromFile(req.file.path);
    
    // Process CSV items
    for (const row of jsonArray) {
      // 1. Find or create Category
      let category = await Category.findOne({ name: row.Category });
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
        
        // CSV has Variation, Variation_Price columns repeated
        // We'll handle the first 3 variations as per the CSV structure seen
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
        { name: row.Name, category: category._id },
        menuItemData,
        { upsert: true, new: true }
      );
    }

    res.json({ message: 'Menu bulk upload successful' });
  } catch (error) {
    console.error(error);
    res.status(500);
    throw new Error('Error processing CSV file');
  }
};

// @desc    Delete category
// @route   DELETE /api/menu/categories/:id
// @access  Private/Admin
const deleteCategory = async (req, res) => {
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
};

// @desc    Delete menu item
// @route   DELETE /api/menu/items/:id
// @access  Private/Admin
const deleteMenuItem = async (req, res) => {
  const item = await MenuItem.findById(req.params.id);
  if (item) {
    const itemName = item.name;
    await item.deleteOne();
    
    await logAudit(req.user._id, 'DELETE_MENU_ITEM', 'MENU', `Menu item removed: ${itemName}`, req.ip);
    
    res.json({ message: 'Menu item removed' });
  } else {
    res.status(404);
    throw new Error('Menu item not found');
  }
};

// @desc    Bulk update menu items
// @route   POST /api/menu/items/bulk-update
// @access  Private/Admin
const bulkUpdateMenuItems = async (req, res) => {
  const { ids, updates } = req.body;
  
  if (!ids || !Array.isArray(ids)) {
    res.status(400);
    throw new Error('Please provide an array of IDs');
  }

  await MenuItem.updateMany({ _id: { $in: ids } }, { $set: updates });
  res.json({ message: 'Bulk update successful' });
};

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
