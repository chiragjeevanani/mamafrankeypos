const express = require('express');
const router = express.Router();
const {
  adminLogin,
  posLogin,
  getUserProfile,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/admin/login', adminLogin);
router.post('/pos/login', posLogin);
router.get('/profile', protect, getUserProfile);

module.exports = router;
