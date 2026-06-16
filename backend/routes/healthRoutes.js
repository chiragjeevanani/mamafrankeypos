const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// @desc    Get system health status
// @route   GET /api/health
// @access  Public
router.get('/', (req, res) => {
  const dbState = mongoose.connection.readyState;
  
  // readyState values: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  const dbStatus = dbState === 1 ? 'connected' : 'disconnected';
  const status = dbState === 1 ? 'UP' : 'DOWN';

  const healthData = {
    status,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: dbStatus,
    memory: {
      rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024 * 100) / 100} MB`,
      heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100} MB`,
      heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100} MB`,
      external: `${Math.round(process.memoryUsage().external / 1024 / 1024 * 100) / 100} MB`,
    }
  };

  if (status === 'UP') {
    res.status(200).json(healthData);
  } else {
    res.status(503).json(healthData);
  }
});

module.exports = router;
