const Attendance = require('../models/Attendance');
const StoreSettings = require('../models/StoreSettings');
const mongoose = require('mongoose');
const asyncHandler = require('../utils/asyncHandler');

const getLocalMidnight = (date, timezone) => {
  const offsetMinutes = timezone === 'Asia/Kolkata' ? 330 : 0;
  const utcTime = date.getTime();
  const localTime = utcTime + (offsetMinutes * 60 * 1000);
  const localDate = new Date(localTime);
  localDate.setUTCHours(0, 0, 0, 0);
  return new Date(localDate.getTime() - (offsetMinutes * 60 * 1000));
};

const parseDateTimeInTimezone = (dateStr, timezone) => {
  if (!dateStr) return null;
  const match = String(dateStr).match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!match) {
    const parsed = new Date(dateStr);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  
  const [_, y, m, d, hr, min] = match;
  const year = parseInt(y, 10);
  const month = parseInt(m, 10) - 1;
  const day = parseInt(d, 10);
  const hours = parseInt(hr, 10);
  const minutes = parseInt(min, 10);
  
  const offsetMinutes = timezone === 'Asia/Kolkata' ? 330 : 0;
  const utcTime = Date.UTC(year, month, day, hours, minutes, 0, 0);
  return new Date(utcTime - (offsetMinutes * 60 * 1000));
};

// @desc    Get all attendance records for today
// @route   GET /api/staff/attendance
// @access  Private/Admin
const getAttendance = asyncHandler(async (req, res) => {
  const { date } = req.query;
  let query = {};
  let searchDate;
  
  const settings = await StoreSettings.findOne() || {};
  const timezone = settings.timezone || 'Asia/Kolkata';

  if (date && date !== 'all') {
    // Safely parse YYYY-MM-DD to local midnight of the store timezone to avoid UTC shifting
    const parts = String(date).split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const offsetMinutes = timezone === 'Asia/Kolkata' ? 330 : 0;
      const utcMidnight = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
      searchDate = new Date(utcMidnight.getTime() - (offsetMinutes * 60 * 1000));
    } else {
      searchDate = getLocalMidnight(new Date(date), timezone);
    }
    query.date = searchDate;
  } else if (date === 'all') {
    // Fetch all attendance records (bypass date filter)
  } else {
    searchDate = getLocalMidnight(new Date(), timezone);
    query.date = searchDate;
  }

  const attendance = await Attendance.find(query).sort({ checkIn: -1 });
  res.json(attendance);
});

// @desc    Update attendance (manual override)
// @route   PUT /api/staff/attendance/:id
// @access  Private/Admin
const updateAttendance = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid Attendance ID format');
  }

  const record = await Attendance.findById(req.params.id);

  if (record) {
    const settings = await StoreSettings.findOne() || {};
    const timezone = settings.timezone || 'Asia/Kolkata';

    if (req.body.checkIn !== undefined) {
      const checkIn = parseDateTimeInTimezone(req.body.checkIn, timezone);
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
        const checkOut = parseDateTimeInTimezone(req.body.checkOut, timezone);
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
});

module.exports = {
  getAttendance,
  updateAttendance,
};
