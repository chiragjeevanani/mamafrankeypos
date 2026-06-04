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
} = require('../controllers/settingsController');
const { protect, admin } = require('../middleware/authMiddleware');

// Store
router.route('/store')
  .get(getStoreSettings)
  .put(protect, admin, updateStoreSettings);

router.route('/reports/purge')
  .post(protect, admin, purgeReportsData);

// Taxes
router.route('/taxes')
  .get(getTaxes)
  .post(protect, admin, createTax);

router.route('/taxes/:id')
  .put(protect, admin, updateTax)
  .delete(protect, admin, deleteTax);

// Counters
router.route('/counters')
  .get(getCounters)
  .post(protect, admin, createCounter);

router.route('/counters/:id')
  .put(protect, admin, updateCounter)
  .delete(protect, admin, deleteCounter);

module.exports = router;
