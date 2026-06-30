const jwt = require('jsonwebtoken');
const Staff = require('../models/Staff');
const generateToken = require('../utils/generateToken');
const logAudit = require('../utils/auditLogger');
const asyncHandler = require('../utils/asyncHandler');
const crypto = require('crypto');
const StoreSettings = require('../models/StoreSettings');

const getLocalMidnight = (date, timezone) => {
  const offsetMinutes = timezone === 'Asia/Kolkata' ? 330 : 0;
  const utcTime = date.getTime();
  const localTime = utcTime + (offsetMinutes * 60 * 1000);
  const localDate = new Date(localTime);
  localDate.setUTCHours(0, 0, 0, 0);
  return new Date(localDate.getTime() - (offsetMinutes * 60 * 1000));
};

// @desc    Auth admin & get token
// @route   POST /api/auth/admin/login
// @access  Public
const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await Staff.findOne({ email, role: 'Admin', isDeleted: { $ne: true } });

  if (user && (await user.matchPassword(password))) {
    await logAudit(user._id, 'LOGIN', 'AUTH', 'Admin login successful', req.ip);
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      branchId: null, // Admin has global access (no branch restriction)
      token: generateToken(user._id, null),
    });
  } else {
    // Log failed login attempt
    const failedUser = await Staff.findOne({ email, isDeleted: { $ne: true } });
    await logAudit(
      failedUser?._id || '000000000000000000000000',
      'LOGIN_FAILED',
      'AUTH',
      `Failed admin login attempt for email: ${email}`,
      req.ip
    );
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Auth POS staff via PIN & get token
// @route   POST /api/auth/pos/login
// @access  Public
const posLogin = asyncHandler(async (req, res) => {
  const { pin } = req.body;
  const Role = require('../models/Role');
  const Attendance = require('../models/Attendance');

  if (!pin) {
    res.status(400);
    throw new Error('PIN is required');
  }

  const hashedPin = crypto.createHash('sha256').update(pin).digest('hex');
  
  // 1. Fast O(1) indexed query lookup
  let authorizedStaff = await Staff.findOne({
    pinHash: hashedPin,
    status: 'Active',
    isDeleted: { $ne: true }
  });

  // 2. Slow O(n) fallback for legacy records that don't have pinHash yet
  if (!authorizedStaff) {
    const legacyStaff = await Staff.find({
      pinHash: { $exists: false },
      status: 'Active',
      isDeleted: { $ne: true }
    });
    for (const s of legacyStaff) {
      if (s.pin && await s.matchPin(pin)) {
        authorizedStaff = s;
        // Automatically migrate to fast pinHash
        s.pinHash = hashedPin;
        await s.save();
        break;
      }
    }
  }

  if (authorizedStaff) {
    // 1. Fetch permissions for this staff's role
    const roleData = await Role.findOne({ name: authorizedStaff.role });
    
    // Check if the role is allowed to access POS
    let isAllowed = false;
    if (roleData && roleData.permissions) {
      isAllowed = roleData.permissions.canAccessPOS === true;
    } else {
      // Fallback for system roles if role data is missing from DB
      if (authorizedStaff.role === 'Admin' || authorizedStaff.role === 'Biller') {
        isAllowed = true;
      }
    }

    if (!isAllowed) {
      await logAudit(
        authorizedStaff._id,
        'LOGIN_FAILED_POS_UNAUTHORIZED',
        'AUTH',
        `POS login denied: Role '${authorizedStaff.role}' does not have POS access permissions.`,
        req.ip
      );
      res.status(403);
      throw new Error(`Access Denied: Role '${authorizedStaff.role}' is not authorized to access the POS terminal.`);
    }

    // 2. Handle Attendance
    const settings = await StoreSettings.findOne() || {};
    const timezone = settings.timezone || 'Asia/Kolkata';
    const today = getLocalMidnight(new Date(), timezone);

    const existingAttendance = await Attendance.findOne({
      staff: authorizedStaff._id,
      date: today
    });

    if (!existingAttendance) {
      await Attendance.create({
        staff: authorizedStaff._id,
        staffName: authorizedStaff.name,
        date: today,
        checkIn: new Date(),
        status: 'In',
        terminal: req.body.terminal || 'POS-Terminal',
        branch: authorizedStaff.branch || null,
      });
      await logAudit(authorizedStaff._id, 'ATTENDANCE', 'CHECK-IN', 'Automated check-in on login', req.ip);
    }

    await logAudit(authorizedStaff._id, 'LOGIN', 'AUTH', `POS login successful (${authorizedStaff.role})`, req.ip);
    
    // Populate branch info for the token & response
    const Branch = require('../models/Branch');
    let branchInfo = null;
    if (authorizedStaff.branch) {
      branchInfo = await Branch.findById(authorizedStaff.branch).select('name slug');
    }

    res.json({
      _id: authorizedStaff._id,
      name: authorizedStaff.name,
      role: authorizedStaff.role,
      permissions: roleData ? roleData.permissions : {},
      branchId: authorizedStaff.branch || null,
      branchName: branchInfo ? branchInfo.name : null,
      branchSlug: branchInfo ? branchInfo.slug : null,
      token: generateToken(authorizedStaff._id, authorizedStaff.branch || null),
    });
  } else {
    // Log failed PIN attempt
    await logAudit(
      '000000000000000000000000',
      'LOGIN_FAILED_PIN',
      'AUTH',
      `Unauthorized PIN entry attempt detected`,
      req.ip
    );
    res.status(401);
    throw new Error('Invalid PIN');
  }
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await Staff.findOne({ _id: req.user._id, isDeleted: { $ne: true } });

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Verify POS Manager PIN (Admin or Manager)
// @route   POST /api/auth/pos/verify-manager
// @access  Public
const verifyManagerPin = asyncHandler(async (req, res) => {
  const { pin } = req.body;

  if (!pin) {
    res.status(400);
    throw new Error('PIN is required');
  }

  const hashedPin = crypto.createHash('sha256').update(pin).digest('hex');
  
  // 1. Fast O(1) indexed query lookup
  let authorizedStaff = await Staff.findOne({
    pinHash: hashedPin,
    status: 'Active',
    isDeleted: { $ne: true }
  });

  // 2. Slow O(n) fallback for legacy records that don't have pinHash yet
  if (!authorizedStaff) {
    const legacyStaff = await Staff.find({
      pinHash: { $exists: false },
      status: 'Active',
      isDeleted: { $ne: true }
    });
    for (const s of legacyStaff) {
      if (s.pin && await s.matchPin(pin)) {
        authorizedStaff = s;
        // Automatically migrate to fast pinHash
        s.pinHash = hashedPin;
        await s.save();
        break;
      }
    }
  }

  if (authorizedStaff) {
    const Role = require('../models/Role');
    const roleObj = await Role.findOne({ name: { $regex: new RegExp(`^${authorizedStaff.role}$`, 'i') } });
    
    const isAuthorized = roleObj?.permissions?.canCancelOrder || 
                         authorizedStaff.role.toLowerCase() === 'admin' || 
                         authorizedStaff.role.toLowerCase() === 'manager';
    
    if (isAuthorized) {
      res.json({
        success: true,
        managerName: authorizedStaff.name,
        role: authorizedStaff.role
      });
      return;
    }
  }

  res.status(401);
  throw new Error('Invalid Manager PIN or Unauthorized Role');
});

module.exports = {
  adminLogin,
  posLogin,
  getUserProfile,
  verifyManagerPin,
};
