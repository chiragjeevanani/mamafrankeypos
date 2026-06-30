const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const {
  getSections,
  createSection,
  updateSection,
  deleteSection,
  getTables,
  createTable,
  updateTable,
  deleteTable,
  updateTableStatus,
} = require('../controllers/tableController');
const { protect, admin, checkPermission } = require('../middleware/authMiddleware');
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

const sectionValidation = [
  body('label')
    .trim()
    .notEmpty()
    .withMessage('Section label is required'),
  body('rank')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Rank must be a non-negative integer'),
  body('status')
    .optional()
    .isIn(['Active', 'Inactive'])
    .withMessage('Status must be Active or Inactive'),
  body('type')
    .optional()
    .isIn(['DINE-IN', 'CAR-SERVICE'])
    .withMessage('Type must be DINE-IN or CAR-SERVICE'),
  validateRequest
];

const updateSectionValidation = [
  body('label')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Section label cannot be empty'),
  body('rank')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Rank must be a non-negative integer'),
  body('status')
    .optional()
    .isIn(['Active', 'Inactive'])
    .withMessage('Status must be Active or Inactive'),
  body('type')
    .optional()
    .isIn(['DINE-IN', 'CAR-SERVICE'])
    .withMessage('Type must be DINE-IN or CAR-SERVICE'),
  validateRequest
];

const tableValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Table name is required'),
  body('section')
    .isMongoId()
    .withMessage('Invalid Section ID format'),
  body('capacity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Capacity must be a positive integer'),
  validateRequest
];

const updateTableValidation = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Table name cannot be empty'),
  body('section')
    .optional()
    .isMongoId()
    .withMessage('Invalid Section ID format'),
  body('capacity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Capacity must be a positive integer'),
  validateRequest
];

router.route('/sections')
  .get(resolveBranch, getSections)
  .post(protect, resolveBranch, checkPermission('canManageTables'), sectionValidation, createSection);

router.route('/sections/:id')
  .put(protect, resolveBranch, checkPermission('canManageTables'), updateSectionValidation, updateSection)
  .delete(protect, resolveBranch, checkPermission('canManageTables'), deleteSection);

router.route('/')
  .get(resolveBranch, getTables)
  .post(protect, resolveBranch, checkPermission('canManageTables'), tableValidation, createTable);

router.route('/:id')
  .put(protect, resolveBranch, checkPermission('canManageTables'), updateTableValidation, updateTable)
  .delete(protect, resolveBranch, checkPermission('canManageTables'), deleteTable);

router.route('/:id/status')
  .patch(protect, resolveBranch, updateTableStatus);

module.exports = router;
