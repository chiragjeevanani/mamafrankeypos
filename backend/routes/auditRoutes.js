const express = require('express');
const router = express.Router();
const { getAuditLogs, getAuditSummary } = require('../controllers/auditController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', protect, admin, getAuditLogs);
router.get('/summary', protect, admin, getAuditSummary);

module.exports = router;
