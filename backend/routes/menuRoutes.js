const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const MenuItem = require('../models/MenuItem');
const {
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
} = require('../controllers/menuController');
const {
  getReplacements,
  createReplacement,
  updateReplacement,
  deleteReplacement,
} = require('../controllers/replacementController');
const {
  getCombos,
  createCombo,
  updateCombo,
  deleteCombo,
} = require('../controllers/comboController');
const { protect, admin, checkPermission } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');
const multer = require('multer');
const localUpload = multer({ dest: 'uploads/' });
const logger = require('../utils/logger');

// Validation error handler middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    const firstError = errors.array()[0];
    throw new Error(`${firstError.path || 'Field'}: ${firstError.msg}`);
  }
  next();
};

// Safe Cloudinary file upload middleware wrapper
const handleUpload = (fieldname) => (req, res, next) => {
  upload.single(fieldname)(req, res, (err) => {
    if (err) {
      logger.error(`Image upload failed for field "${fieldname}":`, err);
      res.status(400);
      const isCloudinaryConfigError = err.message && (
        err.message.includes('cloud_name') || 
        err.message.includes('must supply') || 
        err.message.includes('apiKey') ||
        err.message.includes('api_key')
      );
      if (isCloudinaryConfigError) {
        return next(new Error('Image upload failed: Cloudinary storage is not properly configured or credentials are invalid.'));
      }
      return next(new Error(`Image upload failed: ${err.message}`));
    }
    next();
  });
};

const categoryValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Category name is required'),
  body('rank')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Rank must be a non-negative integer'),
  body('status')
    .optional()
    .isIn(['Active', 'Inactive'])
    .withMessage('Status must be Active or Inactive'),
  validateRequest
];

const updateCategoryValidation = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Category name cannot be empty'),
  body('rank')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Rank must be a non-negative integer'),
  body('status')
    .optional()
    .isIn(['Active', 'Inactive'])
    .withMessage('Status must be Active or Inactive'),
  validateRequest
];

const menuItemValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Menu item name is required'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a non-negative number'),
  body('category')
    .isMongoId()
    .withMessage('Invalid Category ID format'),
  body('type')
    .optional()
    .isIn(['veg', 'non-veg', 'egg'])
    .withMessage('Type must be veg, non-veg, or egg'),
  body('status')
    .optional()
    .isIn(['Available', 'Out of Stock'])
    .withMessage('Status must be Available or Out of Stock'),
  body('rank')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Rank must be a non-negative integer'),
  validateRequest
];

const updateMenuItemValidation = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Menu item name cannot be empty'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a non-negative number'),
  body('category')
    .optional()
    .isMongoId()
    .withMessage('Invalid Category ID format'),
  body('type')
    .optional()
    .isIn(['veg', 'non-veg', 'egg'])
    .withMessage('Type must be veg, non-veg, or egg'),
  body('status')
    .optional()
    .isIn(['Available', 'Out of Stock'])
    .withMessage('Status must be Available or Out of Stock'),
  body('rank')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Rank must be a non-negative integer'),
  validateRequest
];

// Categories
router.route('/categories')
  .get(getCategories)
  .post(protect, checkPermission('canManageMenu'), handleUpload('image'), categoryValidation, createCategory);

router.route('/categories/:id')
  .put(protect, checkPermission('canManageMenu'), handleUpload('image'), updateCategoryValidation, updateCategory)
  .delete(protect, checkPermission('canManageMenu'), deleteCategory);

// Menu Items
router.route('/items')
  .get(getMenuItems)
  .post(protect, checkPermission('canManageMenu'), handleUpload('image'), menuItemValidation, createMenuItem);

router.post('/items/bulk-update', protect, checkPermission('canManageMenu'), updateMenuItemValidation, bulkUpdateMenuItems);

router.route('/items/:id')
  .put(protect, checkPermission('canManageMenu'), handleUpload('image'), updateMenuItemValidation, updateMenuItem)
  .delete(protect, checkPermission('canManageMenu'), deleteMenuItem);

// Bulk Upload (uses local disk temporarily for CSV parsing)
router.post('/bulk-upload', protect, checkPermission('canManageMenu'), localUpload.single('file'), bulkUploadMenu);

// Dish Replacements
router.route('/replacements')
  .get(getReplacements)
  .post(protect, checkPermission('canManageMenu'), createReplacement);

router.route('/replacements/:id')
  .put(protect, checkPermission('canManageMenu'), updateReplacement)
  .delete(protect, checkPermission('canManageMenu'), deleteReplacement);

// Combo Meals
router.route('/combos')
  .get(getCombos)
  .post(protect, checkPermission('canManageMenu'), createCombo);

router.route('/combos/:id')
  .put(protect, checkPermission('canManageMenu'), updateCombo)
  .delete(protect, checkPermission('canManageMenu'), deleteCombo);

module.exports = router;
