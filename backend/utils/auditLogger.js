const AuditLog = require('../models/AuditLog');

const logAudit = async (staffId, action, module, details = '', ipAddress = '') => {
  try {
    await AuditLog.create({
      staff: staffId,
      action,
      module,
      details,
      ipAddress,
    });
  } catch (error) {
    console.error('Audit Log Error:', error);
  }
};

module.exports = logAudit;
