const jwt = require('jsonwebtoken');
const Staff = require('../models/Staff');
const Role = require('../models/Role');
const logger = require('../utils/logger');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await Staff.findOne({ _id: decoded.id, isDeleted: { $ne: true } }).select('-password -pin');

      next();
    } catch (error) {
      logger.error('Authentication token verification failed:', error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'Admin') {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as an admin');
  }
};

const checkPermission = (permissionName) => async (req, res, next) => {
  if (!req.user) {
    res.status(401);
    throw new Error('Not authorized, no user session found');
  }

  // Admin always has all permissions (super-user bypass)
  if (req.user.role === 'Admin') {
    return next();
  }

  try {
    const roleData = await Role.findOne({ name: req.user.role });

    if (roleData && roleData.permissions && roleData.permissions[permissionName] === true) {
      return next();
    }

    logger.warn(`Permission Denied: User ${req.user.name} (Role: ${req.user.role}) attempted to access endpoint requiring permission "${permissionName}"`);
    res.status(403);
    throw new Error(`Access Denied: You do not have the required permission (${permissionName}) to perform this action.`);
  } catch (error) {
    if (res.statusCode === 403) {
      throw error;
    }
    logger.error(`Error verifying permission "${permissionName}" for role "${req.user.role}":`, error);
    res.status(500);
    throw new Error('Internal server error verifying access permissions');
  }
};

module.exports = { protect, admin, checkPermission };
