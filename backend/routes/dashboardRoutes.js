const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboardController');
const { protect, admin, checkPermission } = require('../middleware/authMiddleware');
const { resolveBranch } = require('../middleware/branchMiddleware');

router.get('/stats', protect, resolveBranch, checkPermission('canViewReports'), getDashboardStats);

module.exports = router;
