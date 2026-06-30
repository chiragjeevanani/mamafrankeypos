const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const {
  processOrder,
  updateOrder,
  getOrderById,
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
  applyItemDiscount,
  autoClearEmptyOrder
} = require('../controllers/orderController');
const { protect, admin, verifyManagerPinForVoid } = require('../middleware/authMiddleware');
const { resolveBranch } = require('../middleware/branchMiddleware');

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

const processOrderValidation = [
  body('tableId')
    .optional({ nullable: true, checkFalsy: true })
    .isMongoId()
    .withMessage('Invalid Table ID format'),
  body('counterId')
    .optional({ nullable: true, checkFalsy: true })
    .isMongoId()
    .withMessage('Invalid Counter ID format'),
  body('staffId')
    .optional({ nullable: true, checkFalsy: true })
    .isMongoId()
    .withMessage('Invalid Staff ID format'),
  body('orderId')
    .optional({ nullable: true, checkFalsy: true })
    .isMongoId()
    .withMessage('Invalid Order ID format'),
  body('items')
    .isArray({ min: 1 })
    .withMessage('Items must be a non-empty array'),
  body('items.*')
    .custom((item) => {
      const itemId = item.id || item.baseId;
      if (!itemId) {
        throw new Error('Each item must have an id or baseId');
      }
      return true;
    }),
  body('items.*.id')
    .optional({ nullable: true, checkFalsy: true })
    .isMongoId()
    .withMessage('Invalid Item ID format'),
  body('items.*.baseId')
    .optional({ nullable: true, checkFalsy: true })
    .isMongoId()
    .withMessage('Invalid Base Item ID format'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
  body('items.*.price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a non-negative number'),
  validateRequest
];

router.route('/')
  .get(protect, resolveBranch, getOrders)
  .post(protect, resolveBranch, processOrderValidation, processOrder);

router.route('/adjustment-audit')
  .get(protect, resolveBranch, admin, getAdjustmentAudit);

router.route('/summary')
  .get(protect, resolveBranch, admin, getSalesSummary);

router.route('/active/:identifier')
  .get(protect, resolveBranch, getActiveOrder);

router.route('/:id')
  .get(protect, resolveBranch, getOrderById)
  .put(protect, resolveBranch, updateOrder);

router.route('/:id/kot/:kotId/print')
  .patch(protect, resolveBranch, markKOTPrinted);

router.route('/:id/kot/:kotId/items/:itemId/cancel')
  .patch(protect, resolveBranch, verifyManagerPinForVoid, cancelKOTItem);

router.route('/:id/bill')
  .post(protect, resolveBranch, billOrder);

router.route('/:id/settle')
  .post(protect, resolveBranch, settleOrder);

router.post('/:id/discount', protect, resolveBranch, applyDiscount);
router.patch('/:id/kot/:kotId/item/:itemId/discount', protect, resolveBranch, applyItemDiscount);
router.post('/:id/cancel', protect, resolveBranch, verifyManagerPinForVoid, cancelOrder);
router.post('/:id/auto-clear-empty', protect, resolveBranch, autoClearEmptyOrder);

module.exports = router;
