const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const {
  getStaff,
  registerStaff,
  updateStaff,
  deleteStaff,
  loginStaff,
} = require('../controllers/staffController');
const { protect, admin, checkPermission } = require('../middleware/authMiddleware');

const {
  getAttendance,
  updateAttendance
} = require('../controllers/attendanceController');

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

const registerStaffValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Staff name is required'),
  body('role')
    .trim()
    .notEmpty()
    .withMessage('Role is required'),
  body('email')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isEmail()
    .withMessage('A valid email address is required'),
  body('phone')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .notEmpty()
    .withMessage('Phone number cannot be empty if provided'),
  body('pin')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ min: 4, max: 4 })
    .withMessage('PIN must be exactly 4 digits')
    .isNumeric()
    .withMessage('PIN must contain only numbers'),
  body('password')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  validateRequest
];

const updateStaffValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid Staff ID format'),
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Staff name cannot be empty'),
  body('role')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Role cannot be empty'),
  body('email')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isEmail()
    .withMessage('A valid email address is required'),
  body('pin')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ min: 4, max: 4 })
    .withMessage('PIN must be exactly 4 digits')
    .isNumeric()
    .withMessage('PIN must contain only numbers'),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  validateRequest
];

const loginStaffValidation = [
  body('staffId')
    .trim()
    .notEmpty()
    .withMessage('Staff ID or Email is required'),
  body('pin')
    .trim()
    .isLength({ min: 4, max: 4 })
    .withMessage('PIN must be exactly 4 digits')
    .isNumeric()
    .withMessage('PIN must contain only numbers'),
  validateRequest
];

const updateAttendanceValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid Attendance ID format'),
  body('checkIn')
    .optional()
    .trim()
    .isISO8601()
    .withMessage('Valid check-in date/time is required (ISO8601 format)'),
  body('checkOut')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isISO8601()
    .withMessage('Valid check-out date/time is required (ISO8601 format)')
    .custom((value, { req }) => {
      if (req.body.checkIn && new Date(value) < new Date(req.body.checkIn)) {
        throw new Error('Check-out cannot be earlier than check-in');
      }
      return true;
    }),
  body('status')
    .optional()
    .isIn(['In', 'Out'])
    .withMessage('Status must be either "In" or "Out"'),
  validateRequest
];

const deleteStaffValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid Staff ID format'),
  validateRequest
];

router.route('/')
  .get(protect, getStaff)
  .post(protect, checkPermission('canManageStaff'), registerStaffValidation, registerStaff);

router.get('/attendance', protect, checkPermission('canManageStaff'), getAttendance);
router.put('/attendance/:id', protect, checkPermission('canManageStaff'), updateAttendanceValidation, updateAttendance);

router.post('/login', loginStaffValidation, loginStaff);

router.route('/:id')
  .put(protect, checkPermission('canManageStaff'), updateStaffValidation, updateStaff)
  .delete(protect, checkPermission('canManageStaff'), deleteStaffValidation, deleteStaff);

module.exports = router;
