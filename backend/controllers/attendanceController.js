const Attendance = require('../models/Attendance');

// @desc    Get all attendance records for today
// @route   GET /api/staff/attendance
// @access  Private/Admin
const getAttendance = async (req, res) => {
  const { date } = req.query;
  let query = {};
  
  if (date) {
    const searchDate = new Date(date);
    searchDate.setHours(0, 0, 0, 0);
    query.date = searchDate;
  } else {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    query.date = today;
  }

  const attendance = await Attendance.find(query).sort({ checkIn: -1 });
  res.json(attendance);
};

// @desc    Update attendance (manual override)
// @route   PUT /api/staff/attendance/:id
// @access  Private/Admin
const updateAttendance = async (req, res) => {
  const record = await Attendance.findById(req.params.id);

  if (record) {
    record.checkIn = req.body.checkIn || record.checkIn;
    record.checkOut = req.body.checkOut || record.checkOut;
    record.status = req.body.status || record.status;
    record.terminal = req.body.terminal || record.terminal;

    const updatedRecord = await record.save();
    res.json(updatedRecord);
  } else {
    res.status(404);
    throw new Error('Attendance record not found');
  }
};

module.exports = {
  getAttendance,
  updateAttendance,
};
