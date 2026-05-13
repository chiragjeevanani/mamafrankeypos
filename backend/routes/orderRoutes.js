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
  cancelOrder,
  applyDiscount,
  applyItemDiscount
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getOrders)
  .post(protect, processOrder);

router.route('/adjustment-audit')
  .get(protect, admin, getAdjustmentAudit);

router.route('/summary')
  .get(protect, admin, getSalesSummary);

router.route('/active/:identifier')
  .get(protect, getActiveOrder);

router.route('/:id')
  .put(protect, updateOrder);

router.route('/:id/kot/:kotId/print')
  .patch(protect, markKOTPrinted);

router.route('/:id/kot/:kotId/items/:itemId/cancel')
  .patch(protect, cancelKOTItem);

router.route('/:id/bill')
  .post(protect, billOrder);

router.route('/:id/settle')
  .post(protect, settleOrder);

router.post('/:id/discount', protect, applyDiscount);
router.patch('/:id/kot/:kotId/item/:itemId/discount', protect, applyItemDiscount);
router.post('/:id/cancel', protect, admin, cancelOrder);

module.exports = router;
