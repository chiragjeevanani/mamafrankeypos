const jwt = require('jsonwebtoken');

const generateToken = (id, branchId = null) => {
  return jwt.sign({ id, branchId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '24h',
  });
};

module.exports = generateToken;

