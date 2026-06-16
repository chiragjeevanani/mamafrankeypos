const express = require('express');
const router = express.Router();
const {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
} = require('../controllers/roleController');
const { protect, admin, checkPermission } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, checkPermission('canManageStaff'), getRoles)
  .post(protect, checkPermission('canManageStaff'), createRole);

router.route('/:id')
  .put(protect, checkPermission('canManageStaff'), updateRole)
  .delete(protect, checkPermission('canManageStaff'), deleteRole);

module.exports = router;
