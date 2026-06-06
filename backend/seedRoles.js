const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Role = require('./models/Role');
const connectDB = require('./config/db');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });
connectDB();

const seedRoles = async () => {
  try {
    await Role.deleteMany({ isSystemRole: true });

    const roles = [
      {
        name: 'Admin',
        description: 'Full system access',
        isSystemRole: true,
        permissions: {
          canAccessPOS: true,
          canCreateOrder: true,
          canCancelOrder: true,
          canApplyDiscount: true,
          canSettleBill: true,
          canVoidKOT: true,
          canManageMenu: true,
          canManageStaff: true,
          canViewReports: true,
          canManageSettings: true,
          canManageTables: true,
        }
      },
      {
        name: 'Biller',
        description: 'Counter billing operations',
        isSystemRole: true,
        permissions: {
          canAccessPOS: true,
          canCreateOrder: true,
          canCancelOrder: false,
          canApplyDiscount: true,
          canSettleBill: true,
          canVoidKOT: false,
          canManageMenu: false,
          canManageStaff: false,
          canViewReports: false,
          canManageSettings: false,
          canManageTables: false,
        }
      },
      {
        name: 'Waiter',
        description: 'Order taking only',
        isSystemRole: true,
        permissions: {
          canAccessPOS: false,
          canCreateOrder: true,
          canCancelOrder: false,
          canApplyDiscount: false,
          canSettleBill: false,
          canVoidKOT: false,
          canManageMenu: false,
          canManageStaff: false,
          canViewReports: false,
          canManageSettings: false,
          canManageTables: false,
        }
      }
    ];

    await Role.insertMany(roles);
    console.log('Roles seeded successfully');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedRoles();
