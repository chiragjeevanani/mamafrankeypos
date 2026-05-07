const mongoose = require('mongoose');

const roleSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
    },
    permissions: {
      // POS Permissions
      canCreateOrder: { type: Boolean, default: true },
      canCancelOrder: { type: Boolean, default: false },
      canApplyDiscount: { type: Boolean, default: false },
      canSettleBill: { type: Boolean, default: true },
      canVoidKOT: { type: Boolean, default: false },
      
      // Admin Permissions
      canManageMenu: { type: Boolean, default: false },
      canManageStaff: { type: Boolean, default: false },
      canViewReports: { type: Boolean, default: false },
      canManageSettings: { type: Boolean, default: false },
      canManageTables: { type: Boolean, default: false },
    },
    isSystemRole: {
      type: Boolean,
      default: false,
    }
  },
  {
    timestamps: true,
  }
);

const Role = mongoose.model('Role', roleSchema);

module.exports = Role;
