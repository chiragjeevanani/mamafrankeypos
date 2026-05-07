const express = require('express');
const router = express.Router();
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
  getVariantGroups,
  createVariantGroup,
  updateVariantGroup,
  deleteVariantGroup,
} = require('../controllers/variantController');
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
const { protect, admin } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');
const multer = require('multer');
const localUpload = multer({ dest: 'uploads/' });

// Categories
router.route('/categories')
  .get(getCategories)
  .post(protect, admin, upload.single('image'), createCategory);

router.route('/categories/:id')
  .put(protect, admin, upload.single('image'), updateCategory)
  .delete(protect, admin, deleteCategory);

// Menu Items
router.route('/items')
  .get(getMenuItems)
  .post(protect, admin, upload.single('image'), createMenuItem);

router.route('/items/:id')
  .put(protect, admin, upload.single('image'), updateMenuItem)
  .delete(protect, admin, deleteMenuItem);

router.post('/items/bulk-update', protect, admin, bulkUpdateMenuItems);

// Bulk Upload (uses local disk temporarily for CSV parsing)
router.post('/bulk-upload', protect, admin, localUpload.single('file'), bulkUploadMenu);

// Variants / Modifiers
router.route('/variants')
  .get(getVariantGroups)
  .post(protect, admin, createVariantGroup);

router.route('/variants/:id')
  .put(protect, admin, updateVariantGroup)
  .delete(protect, admin, deleteVariantGroup);

// Dish Replacements
router.route('/replacements')
  .get(getReplacements)
  .post(protect, admin, createReplacement);

router.route('/replacements/:id')
  .put(protect, admin, updateReplacement)
  .delete(protect, admin, deleteReplacement);

// Combo Meals
router.route('/combos')
  .get(getCombos)
  .post(protect, admin, createCombo);

router.route('/combos/:id')
  .put(protect, admin, updateCombo)
  .delete(protect, admin, deleteCombo);

module.exports = router;
