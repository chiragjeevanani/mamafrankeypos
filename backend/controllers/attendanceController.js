const Attendance = require('../models/Attendance');

const parseDateTime = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

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
    if (req.body.checkIn !== undefined) {
      const checkIn = parseDateTime(req.body.checkIn);
      if (!checkIn) {
        res.status(400);
        throw new Error('Valid check-in date/time is required');
      }
      record.checkIn = checkIn;
    }

    if (req.body.checkOut !== undefined) {
      if (req.body.checkOut === '' || req.body.checkOut === null) {
        record.checkOut = undefined;
      } else {
        const checkOut = parseDateTime(req.body.checkOut);
        if (!checkOut) {
          res.status(400);
          throw new Error('Valid check-out date/time is required');
        }
        record.checkOut = checkOut;
      }
    }

    if (req.body.status !== undefined) record.status = req.body.status;
    if (req.body.terminal !== undefined) record.terminal = req.body.terminal;

    if (record.checkOut && record.checkOut < record.checkIn) {
      res.status(400);
      throw new Error('Check-out cannot be earlier than check-in');
    }

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
