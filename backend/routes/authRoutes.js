const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const {
  adminLogin,
  posLogin,
  getUserProfile,
  verifyManagerPin,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

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

// Admin login validation rules
const adminLoginValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Must be a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  validateRequest
];

// POS login validation rules
const posLoginValidation = [
  body('pin')
    .trim()
    .isNumeric()
    .withMessage('PIN must contain numbers only')
    .isLength({ min: 4, max: 6 })
    .withMessage('PIN must be between 4 and 6 digits long'),
  validateRequest
];

router.post('/admin/login', adminLoginValidation, adminLogin);
router.post('/pos/login', posLoginValidation, posLogin);
router.post('/pos/verify-manager', posLoginValidation, verifyManagerPin);
router.get('/profile', protect, getUserProfile);

module.exports = router;
