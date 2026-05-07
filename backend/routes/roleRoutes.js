const express = require('express');
const router = express.Router();
const {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
} = require('../controllers/roleController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, admin, getRoles)
  .post(protect, admin, createRole);

router.route('/:id')
  .put(protect, admin, updateRole)
  .delete(protect, admin, deleteRole);

module.exports = router;
