const express = require('express');
const router = express.Router();
const {
  getCustomers,
  getCustomerByPhone,
  upsertCustomer,
  updateCustomerStats,
} = require('../controllers/customerController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getCustomers)
  .post(protect, upsertCustomer);

router.route('/phone/:phone')
  .get(protect, getCustomerByPhone);

router.route('/:id/stats')
  .patch(protect, updateCustomerStats);

module.exports = router;
