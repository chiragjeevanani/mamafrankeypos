const mongoose = require('mongoose');
const dotenv = require('dotenv');
const axios = require('axios');
const path = require('path');
const Counter = require('./models/Counter');
const Order = require('./models/Order');
const Table = require('./models/Table');
const Attendance = require('./models/Attendance');
const Expense = require('./models/Expense');
const AuditLog = require('./models/AuditLog');

dotenv.config({ path: path.join(__dirname, '.env') });

const API_URL = 'http://localhost:5000/api';

const runTest = async () => {
  try {
    console.log('--- STARTING ADMIN SYSTEM SETTINGS INTEGRATION TEST ---');

    // Connect to DB for verification checks
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas');

    // 1. Admin Login
    console.log('1. Testing Admin Login...');
    const adminRes = await axios.post(`${API_URL}/auth/admin/login`, {
      email: 'admin@mamafrankey.com',
      password: 'admin123'
    });
    const adminToken = adminRes.data.token;
    const authHeader = { headers: { Authorization: `Bearer ${adminToken}` } };
    console.log('✅ Admin Login Successful');

    // 2. Fetch Initial Counters
    console.log('2. Fetching counters...');
    const initialCountersRes = await axios.get(`${API_URL}/settings/counters`, authHeader);
    const initialCounters = initialCountersRes.data;
    console.log(`✅ Found ${initialCounters.length} counters`);

    // Ensure we have at least one counter to work with
    let testCounterId;
    if (initialCounters.length === 0) {
      const createCounterRes = await axios.post(`${API_URL}/settings/counters`, {
        name: 'Test Counter Initial',
        prefix: 'TCI',
        startNum: 1
      }, authHeader);
      testCounterId = createCounterRes.data._id;
    } else {
      testCounterId = initialCounters[0]._id;
    }

    // 3. Counter Validation: Duplicate Prefix
    console.log('3. Verifying counter duplicate prefix prevention...');
    // Create a temporary counter to get its prefix
    const tempCounterRes = await axios.post(`${API_URL}/settings/counters`, {
      name: 'Temp Counter',
      prefix: 'TPL',
      startNum: 1
    }, authHeader);
    const tempCounter = tempCounterRes.data;

    try {
      await axios.post(`${API_URL}/settings/counters`, {
        name: 'Duplicate Counter',
        prefix: 'tpl', // lowercase to test case insensitivity
        startNum: 10
      }, authHeader);
      throw new Error('Counter duplicate prefix was not blocked!');
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.message?.includes('is already in use')) {
        console.log('✅ Correctly blocked duplicate counter prefix (case-insensitive)');
      } else {
        throw err;
      }
    }

    // 4. Counter Validation: Missing Name/Prefix or Negative startNum
    console.log('4. Verifying Counter missing inputs or negative start number validations...');
    try {
      await axios.post(`${API_URL}/settings/counters`, {
        name: '',
        prefix: 'TST',
        startNum: 1
      }, authHeader);
      throw new Error('Counter with empty name did not fail!');
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.message?.includes('name is required')) {
        console.log('✅ Correctly blocked empty counter name');
      } else {
        throw err;
      }
    }

    try {
      await axios.post(`${API_URL}/settings/counters`, {
        name: 'Test Counter Negative',
        prefix: 'TST',
        startNum: -5
      }, authHeader);
      throw new Error('Counter with negative start number did not fail!');
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.message?.includes('non-negative integer')) {
        console.log('✅ Correctly blocked negative startNum');
      } else {
        throw err;
      }
    }

    // Clean up temporary counter
    await axios.delete(`${API_URL}/settings/counters/${tempCounter._id}`, authHeader);

    // 5. Counter Last-One Deletion Protection
    console.log('5. Verifying Counter deletion safeguards (preserving the last counter)...');
    // Get list again
    const listRes = await axios.get(`${API_URL}/settings/counters`, authHeader);
    const activeCounters = listRes.data;
    
    // Delete all except the last one
    for (let i = 0; i < activeCounters.length - 1; i++) {
      await axios.delete(`${API_URL}/settings/counters/${activeCounters[i]._id}`, authHeader);
    }

    // Now try to delete the last remaining counter
    const lastCounterListRes = await axios.get(`${API_URL}/settings/counters`, authHeader);
    const lastCounter = lastCounterListRes.data[0];
    try {
      await axios.delete(`${API_URL}/settings/counters/${lastCounter._id}`, authHeader);
      throw new Error('Last counter deletion was not blocked!');
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.message?.includes('Cannot delete the only counter')) {
        console.log('✅ Correctly blocked deletion of the last remaining billing counter');
      } else {
        throw err;
      }
    }

    // 6. Tax Validations: Duplicates, Negative Percentages, Empty Names
    console.log('6. Verifying store settings tax validations...');
    // Try setting a duplicate tax identity (GST and gst)
    try {
      await axios.put(`${API_URL}/settings/store`, {
        taxes: [
          { name: 'GST', percentage: 5, active: true },
          { name: 'gst', percentage: 12, active: true }
        ]
      }, authHeader);
      throw new Error('Duplicate tax identities did not fail!');
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.message?.includes('Duplicate tax identity')) {
        console.log('✅ Correctly blocked duplicate tax identity (case-insensitive)');
      } else {
        throw err;
      }
    }

    // Try setting a negative tax rate
    try {
      await axios.put(`${API_URL}/settings/store`, {
        taxes: [
          { name: 'VAT', percentage: -5, active: true }
        ]
      }, authHeader);
      throw new Error('Negative tax rate did not fail!');
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.message?.includes('percentage must be a valid non-negative number')) {
        console.log('✅ Correctly blocked negative tax percentage');
      } else {
        throw err;
      }
    }

    // Try setting an empty tax name
    try {
      await axios.put(`${API_URL}/settings/store`, {
        taxes: [
          { name: '', percentage: 5, active: true }
        ]
      }, authHeader);
      throw new Error('Empty tax name did not fail!');
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.message?.includes('Tax name is required')) {
        console.log('✅ Correctly blocked empty tax name');
      } else {
        throw err;
      }
    }

    // 7. Attendance Date All-time Retrieval
    console.log('7. Verifying all-time attendance fetch parameter...');
    const allAttendanceRes = await axios.get(`${API_URL}/staff/attendance?date=all`, authHeader);
    if (Array.isArray(allAttendanceRes.data)) {
      console.log('✅ All-time attendance fetch succeeded');
    } else {
      throw new Error('Attendance list response is not an array');
    }

    // 8. Test Reports & Reset Purge Functionality
    console.log('8. Seeding mock report data to test Purge transaction...');
    // Clean up any leftovers first
    await Order.deleteMany({ orderNumber: 'TEST-PURGE-01' });
    
    // Seed dummy order
    const dummyOrder = await Order.create({
      orderNumber: 'TEST-PURGE-01',
      orderType: 'DINE-IN',
      orderStatus: 'COMPLETED',
      table: new mongoose.Types.ObjectId(),
      totalAmount: 9999,
      completedAt: new Date()
    });

    // Seed dummy attendance
    const dummyAttendance = await Attendance.create({
      staff: new mongoose.Types.ObjectId(),
      staffName: 'Purge Dummy Staff',
      date: new Date(),
      checkIn: new Date(),
      status: 'In'
    });

    // Seed dummy expense
    const dummyExpense = await Expense.create({
      title: 'Purge Dummy Expense',
      category: 'Rent',
      amount: 5000,
      date: new Date(),
      staff: new mongoose.Types.ObjectId()
    });

    console.log('Seeded dummy metrics: Order, Attendance, Expense');

    // Trigger Purge API call
    console.log('Calling purge API: POST /settings/reports/purge...');
    const purgeRes = await axios.post(`${API_URL}/settings/reports/purge`, {}, authHeader);
    if (purgeRes.data.message?.includes('purged successfully')) {
      console.log('✅ Purge API returned success message');
    } else {
      throw new Error('Purge API failed or returned unexpected response');
    }

    // Verify all seeded data are gone
    const ordersCount = await Order.countDocuments({});
    const attendanceCount = await Attendance.countDocuments({});
    const expensesCount = await Expense.countDocuments({});
    
    if (ordersCount === 0 && attendanceCount === 0 && expensesCount === 0) {
      console.log('✅ Verified: All orders, attendances, and expenses successfully cleared from collections');
    } else {
      throw new Error(`Data leak during purge: orders=${ordersCount}, attendance=${attendanceCount}, expenses=${expensesCount}`);
    }

    console.log('--- ALL ADMIN SYSTEM SETTINGS INTEGRATION TESTS PASSED ---');
    process.exit(0);
  } catch (error) {
    console.error('❌ TEST FAILED:', error.response?.data || error.message);
    process.exit(1);
  }
};

runTest();
