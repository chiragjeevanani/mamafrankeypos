const express = require('express');
const router = express.Router();
const { getSalesReport } = require('../controllers/reportController');

const { protect, admin } = require('../middleware/authMiddleware');

router.get('/sales', protect, admin, getSalesReport);

module.exports = router;
