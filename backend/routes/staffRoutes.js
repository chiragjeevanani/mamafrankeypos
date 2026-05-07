const express = require('express');
const router = express.Router();
const {
  getStaff,
  registerStaff,
  updateStaff,
  deleteStaff,
  loginStaff,
} = require('../controllers/staffController');
const { protect, admin } = require('../middleware/authMiddleware');

const {
  getAttendance,
  updateAttendance
} = require('../controllers/attendanceController');

router.route('/')
  .get(protect, getStaff)
  .post(protect, admin, registerStaff);

router.get('/attendance', protect, admin, getAttendance);
router.put('/attendance/:id', protect, admin, updateAttendance);

router.post('/login', loginStaff);

router.route('/:id')
  .put(protect, admin, updateStaff)
  .delete(protect, admin, deleteStaff);

module.exports = router;
