const express = require('express');
const router = express.Router();
const {
  processOrder,
  updateOrder,
  getActiveOrder,
  markKOTPrinted,
  cancelKOTItem,
  billOrder,
  settleOrder,
  getOrders,
  getSalesSummary,
  getAdjustmentAudit,
  cancelOrder
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getOrders)
  .post(protect, processOrder);

router.route('/:id')
  .put(protect, updateOrder);

router.route('/adjustment-audit')
  .get(protect, admin, getAdjustmentAudit);

router.route('/summary')
  .get(protect, admin, getSalesSummary);

router.route('/active/:identifier')
  .get(protect, getActiveOrder);

router.route('/:id/kot/:kotId/print')
  .patch(protect, markKOTPrinted);

router.route('/:id/kot/:kotId/items/:itemId/cancel')
  .patch(protect, cancelKOTItem);

router.route('/:id/bill')
  .post(protect, billOrder);

router.route('/:id/settle')
  .post(protect, settleOrder);

router.route('/:id/cancel')
  .post(protect, cancelOrder);

module.exports = router;
