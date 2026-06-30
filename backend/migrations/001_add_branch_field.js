/**
 * Migration: 001_add_branch_field.js
 *
 * Run ONCE before deploying the new multi-branch code.
 * Creates two branches (Sadar and Highway) and migrates
 * all existing data to the Sadar branch.
 *
 * Usage:
 *   cd backend
 *   node migrations/001_add_branch_field.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

// Models
const Branch = require('../models/Branch');
const Staff = require('../models/Staff');
const Section = require('../models/Section');
const Table = require('../models/Table');
const Order = require('../models/Order');
const Expense = require('../models/Expense');
const Counter = require('../models/Counter');
const Attendance = require('../models/Attendance');
const StoreSettings = require('../models/StoreSettings');

const MONGO_URI = process.env.MONGO_URI;

async function migrate() {
  console.log('🔌 Connecting to MongoDB Atlas...');
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected.');

  // -----------------------------------------------
  // 1. Create or find the two branches
  // -----------------------------------------------
  console.log('\n📌 Step 1: Creating branches...');

  let sadarBranch = await Branch.findOne({ slug: 'sadar' });
  if (!sadarBranch) {
    sadarBranch = await Branch.create({
      name: 'Sadar',
      slug: 'sadar',
      isActive: true,
    });
    console.log('  ✅ Created Sadar branch:', sadarBranch._id);
  } else {
    console.log('  ℹ️  Sadar branch already exists:', sadarBranch._id);
  }

  let highwayBranch = await Branch.findOne({ slug: 'highway' });
  if (!highwayBranch) {
    highwayBranch = await Branch.create({
      name: 'Highway',
      slug: 'highway',
      isActive: true,
    });
    console.log('  ✅ Created Highway branch:', highwayBranch._id);
  } else {
    console.log('  ℹ️  Highway branch already exists:', highwayBranch._id);
  }

  const sadarId = sadarBranch._id;

  // -----------------------------------------------
  // 2. Migrate Staff: Admin gets null, everyone else gets Sadar
  // -----------------------------------------------
  console.log('\n📌 Step 2: Migrating staff...');
  const staffUpdateResult = await Staff.updateMany(
    { branch: { $exists: false }, role: { $ne: 'Admin' } },
    { $set: { branch: sadarId } }
  );
  console.log(`  ✅ Updated ${staffUpdateResult.modifiedCount} non-admin staff to Sadar branch.`);

  const adminUpdateResult = await Staff.updateMany(
    { branch: { $exists: false }, role: 'Admin' },
    { $set: { branch: null } }
  );
  console.log(`  ✅ Set ${adminUpdateResult.modifiedCount} Admin staff to branch: null (global access).`);

  // -----------------------------------------------
  // 3. Migrate Sections
  // -----------------------------------------------
  console.log('\n📌 Step 3: Migrating sections...');
  const sectionsResult = await Section.updateMany(
    { branch: { $exists: false } },
    { $set: { branch: sadarId } }
  );
  console.log(`  ✅ Updated ${sectionsResult.modifiedCount} sections to Sadar branch.`);

  // -----------------------------------------------
  // 4. Migrate Tables
  // -----------------------------------------------
  console.log('\n📌 Step 4: Migrating tables...');
  const tablesResult = await Table.updateMany(
    { branch: { $exists: false } },
    { $set: { branch: sadarId } }
  );
  console.log(`  ✅ Updated ${tablesResult.modifiedCount} tables to Sadar branch.`);

  // -----------------------------------------------
  // 5. Migrate Orders (replace outlet string with branch ObjectId)
  // -----------------------------------------------
  console.log('\n📌 Step 5: Migrating orders...');
  const ordersResult = await Order.updateMany(
    { branch: { $exists: false } },
    { $set: { branch: sadarId } }
  );
  console.log(`  ✅ Updated ${ordersResult.modifiedCount} orders to Sadar branch.`);

  // -----------------------------------------------
  // 6. Migrate Expenses
  // -----------------------------------------------
  console.log('\n📌 Step 6: Migrating expenses...');
  const expensesResult = await Expense.updateMany(
    { branch: { $exists: false } },
    { $set: { branch: sadarId } }
  );
  console.log(`  ✅ Updated ${expensesResult.modifiedCount} expenses to Sadar branch.`);

  // -----------------------------------------------
  // 7. Migrate Counters
  // -----------------------------------------------
  console.log('\n📌 Step 7: Migrating counters...');
  const countersResult = await Counter.updateMany(
    { branch: { $exists: false } },
    { $set: { branch: sadarId } }
  );
  console.log(`  ✅ Updated ${countersResult.modifiedCount} counters to Sadar branch.`);

  // -----------------------------------------------
  // 8. Migrate Attendance
  // -----------------------------------------------
  console.log('\n📌 Step 8: Migrating attendance...');
  const attendanceResult = await Attendance.updateMany(
    { branch: { $exists: false } },
    { $set: { branch: sadarId } }
  );
  console.log(`  ✅ Updated ${attendanceResult.modifiedCount} attendance records to Sadar branch.`);

  // -----------------------------------------------
  // 9. Migrate StoreSettings — clone existing into Sadar, create blank for Highway
  // -----------------------------------------------
  console.log('\n📌 Step 9: Migrating StoreSettings...');

  const globalSettings = await StoreSettings.findOne({ branch: { $exists: false } });

  let sadarSettings = await StoreSettings.findOne({ branch: sadarId });
  if (!sadarSettings && globalSettings) {
    // Set the existing global settings to belong to Sadar
    await StoreSettings.updateOne(
      { _id: globalSettings._id },
      { $set: { branch: sadarId } }
    );
    console.log('  ✅ Assigned existing global StoreSettings to Sadar branch.');
  } else if (!sadarSettings) {
    await StoreSettings.create({ branch: sadarId });
    console.log('  ✅ Created new StoreSettings for Sadar branch.');
  } else {
    console.log('  ℹ️  Sadar StoreSettings already exists.');
  }

  let highwaySettings = await StoreSettings.findOne({ branch: highwayBranch._id });
  if (!highwaySettings) {
    await StoreSettings.create({ branch: highwayBranch._id });
    console.log('  ✅ Created blank StoreSettings for Highway branch.');
  } else {
    console.log('  ℹ️  Highway StoreSettings already exists.');
  }

  // -----------------------------------------------
  // 10. Verification
  // -----------------------------------------------
  console.log('\n📌 Step 10: Verification...');
  const unmigratedOrders = await Order.countDocuments({ branch: { $exists: false } });
  const unmigratedStaff = await Staff.countDocuments({ branch: { $exists: false } });
  const unmigratedTables = await Table.countDocuments({ branch: { $exists: false } });
  const unmigratedSections = await Section.countDocuments({ branch: { $exists: false } });

  console.log(`  Orders without branch:   ${unmigratedOrders}`);
  console.log(`  Staff without branch:    ${unmigratedStaff}`);
  console.log(`  Tables without branch:   ${unmigratedTables}`);
  console.log(`  Sections without branch: ${unmigratedSections}`);

  if (unmigratedOrders === 0 && unmigratedStaff === 0 && unmigratedTables === 0 && unmigratedSections === 0) {
    console.log('\n🎉 Migration completed successfully! All records migrated.');
  } else {
    console.warn('\n⚠️  Some records may not have been migrated. Please check above counts.');
  }

  await mongoose.connection.close();
  console.log('🔌 Disconnected from MongoDB.');
}

migrate().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
