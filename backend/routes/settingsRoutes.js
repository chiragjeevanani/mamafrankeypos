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
const { resolveBranch } = require('../middleware/branchMiddleware');

// Store
router.route('/store')
  .get(resolveBranch, getStoreSettings)
  .put(protect, resolveBranch, checkPermission('canManageSettings'), updateStoreSettings);

router.route('/store/commit-adjustments')
  .post(protect, resolveBranch, checkPermission('canManageSettings'), commitAdjustments);

router.route('/reports/purge')
  .post(protect, resolveBranch, checkPermission('canManageSettings'), purgeReportsData);

// Taxes
router.route('/taxes')
  .get(resolveBranch, getTaxes)
  .post(protect, resolveBranch, checkPermission('canManageSettings'), createTax);

router.route('/taxes/:id')
  .put(protect, resolveBranch, checkPermission('canManageSettings'), updateTax)
  .delete(protect, resolveBranch, checkPermission('canManageSettings'), deleteTax);

// Counters
router.route('/counters')
  .get(resolveBranch, getCounters)
  .post(protect, resolveBranch, checkPermission('canManageSettings'), createCounter);

router.route('/counters/:id')
  .put(protect, resolveBranch, checkPermission('canManageSettings'), updateCounter)
  .delete(protect, resolveBranch, checkPermission('canManageSettings'), deleteCounter);

module.exports = router;
