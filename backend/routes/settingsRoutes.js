const express = require('express');
const router = express.Router();
const {
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
  purgeReportsData,
  commitAdjustments
} = require('../controllers/settingsController');
const { protect, checkPermission } = require('../middleware/authMiddleware');

// Store
router.route('/store')
  .get(getStoreSettings)
  .put(protect, checkPermission('canManageSettings'), updateStoreSettings);

router.route('/store/commit-adjustments')
  .post(protect, checkPermission('canManageSettings'), commitAdjustments);

router.route('/reports/purge')
  .post(protect, checkPermission('canManageSettings'), purgeReportsData);

// Taxes
router.route('/taxes')
  .get(getTaxes)
  .post(protect, checkPermission('canManageSettings'), createTax);

router.route('/taxes/:id')
  .put(protect, checkPermission('canManageSettings'), updateTax)
  .delete(protect, checkPermission('canManageSettings'), deleteTax);

// Counters
router.route('/counters')
  .get(getCounters)
  .post(protect, checkPermission('canManageSettings'), createCounter);

router.route('/counters/:id')
  .put(protect, checkPermission('canManageSettings'), updateCounter)
  .delete(protect, checkPermission('canManageSettings'), deleteCounter);

module.exports = router;
