const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboardController');
const { protect, admin, checkPermission } = require('../middleware/authMiddleware');

router.get('/stats', protect, checkPermission('canViewReports'), getDashboardStats);

module.exports = router;
