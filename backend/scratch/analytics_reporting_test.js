const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const axios = require('axios');
const mongoose = require('mongoose');

// Register models
require('../models/AuditLog');

const API_URL = 'http://localhost:5000/api';

const runAnalyticsReportingTest = async () => {
  try {
    console.log('--- STARTING ANALYTICS & REPORTING INTEGRATION TEST ---');

    // 1. Logins
    console.log('1. Admin & POS Logins...');
    const adminRes = await axios.post(`${API_URL}/auth/admin/login`, {
      email: 'admin@mamafrankey.com',
      password: 'admin123'
    });
    const adminToken = adminRes.data.token;
    const adminHeader = { headers: { Authorization: `Bearer ${adminToken}`, 'x-module': 'admin' } };

    const posRes = await axios.post(`${API_URL}/auth/pos/login`, {
      pin: '1234'
    });
    const posToken = posRes.data.token;
    const posHeader = { headers: { Authorization: `Bearer ${posToken}` } };

    // 2. Test Dashboard Stats
    console.log('2. Fetching Dashboard Stats...');
    const adminDashboardRes = await axios.get(`${API_URL}/dashboard/stats`, adminHeader);
    console.log('✅ Admin dashboard stats fetched successfully');

    // POS user (Biller) should be blocked since they lack canViewReports permission
    try {
      await axios.get(`${API_URL}/dashboard/stats`, posHeader);
      throw new Error('FAIL: Dashboard stats accessed by unauthorized POS Biller!');
    } catch (err) {
      if (err.response?.status === 403) {
        console.log('✅ PASS: Unauthorized POS Biller correctly blocked from dashboard stats with 403');
      } else {
        throw new Error(`FAIL: Unexpected response for unauthorized Biller dashboard fetch: ${err.response?.status} - ${err.response?.data?.message || err.message}`);
      }
    }

    // Assert dashboard properties
    if (!adminDashboardRes.data.sales || !adminDashboardRes.data.topItems || !adminDashboardRes.data.hourlySales) {
      throw new Error('FAIL: Dashboard stats missing core stats properties');
    }

    // 3. Test Sales Reports & Validations
    console.log('3. Fetching Sales Reports...');
    const salesReportRes = await axios.get(`${API_URL}/reports/sales`, adminHeader);
    console.log('✅ Admin sales report fetched successfully');

    if (!salesReportRes.data.summary || !salesReportRes.data.trends || !salesReportRes.data.topItems) {
      throw new Error('FAIL: Sales report missing core reporting fields');
    }

    console.log('Testing invalid filter parameter validations...');
    try {
      await axios.get(`${API_URL}/reports/sales?startDate=invalid-date-format`, adminHeader);
      throw new Error('FAIL: Invalid start date accepted on sales report!');
    } catch (err) {
      if (err.response?.status === 400 && err.response.data.message?.includes('must be a valid ISO8601 date')) {
        console.log('✅ PASS: Invalid startDate parameter correctly rejected:', err.response.data.message);
      } else {
        throw new Error(`FAIL: Unexpected validation response on invalid startDate: ${err.response?.data?.message || err.message}`);
      }
    }

    try {
      await axios.get(`${API_URL}/reports/sales?waiter=invalid-mongo-id`, adminHeader);
      throw new Error('FAIL: Invalid waiter MongoId accepted on sales report!');
    } catch (err) {
      if (err.response?.status === 400 && err.response.data.message?.includes('Invalid Waiter ID format')) {
        console.log('✅ PASS: Invalid waiter parameter correctly rejected:', err.response.data.message);
      } else {
        throw new Error(`FAIL: Unexpected validation response on invalid waiter: ${err.response?.data?.message || err.message}`);
      }
    }

    // 4. Test Audit Log Cleanup
    console.log('4. Testing Audit Logs Cleanup & Retention...');
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) throw new Error('MONGO_URI not defined in .env');

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }

    const AuditLog = mongoose.model('AuditLog');

    // Seed dummy audit logs (one older than 100 days, one fresh)
    const oldLog = await AuditLog.create({
      action: 'TEST_OLD_PURGE',
      module: 'AUDIT',
      details: 'Old log 100 days ago'
    });
    
    await mongoose.connection.collection('auditlogs').updateOne(
      { _id: oldLog._id },
      { $set: { createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000) } }
    );

    const freshLog = await AuditLog.create({
      action: 'TEST_FRESH_LOG',
      module: 'AUDIT',
      details: 'Fresh log created now'
    });

    console.log('✅ Seeded dummy audit logs in database');

    // Trigger cleanup for logs older than 90 days
    console.log('Triggering cleanup API with retentionDays=90...');
    const cleanupRes = await axios.delete(`${API_URL}/audit/cleanup?retentionDays=90`, adminHeader);
    console.log(`✅ Cleanup API succeeded. PURGED count: ${cleanupRes.data.deletedCount}`);

    // Verify Log A is purged and Log B still exists
    const checkOld = await AuditLog.findById(oldLog._id);
    const checkFresh = await AuditLog.findById(freshLog._id);

    if (checkOld) {
      throw new Error('FAIL: Old audit log older than 90 days was NOT purged!');
    } else {
      console.log('✅ Verified: Old log was successfully deleted.');
    }

    if (!checkFresh) {
      throw new Error('FAIL: Fresh audit log was incorrectly deleted!');
    } else {
      console.log('✅ Verified: Fresh log remains in the database.');
    }

    // Verify AUDIT_CLEANUP log was created
    const cleanupAuditLog = await AuditLog.findOne({ action: 'AUDIT_CLEANUP' });
    if (cleanupAuditLog) {
      console.log('✅ Verified: AUDIT_CLEANUP log was created in the system audit trail:', cleanupAuditLog.details);
    } else {
      throw new Error('FAIL: AUDIT_CLEANUP log entry was not found!');
    }

    // Clean up fresh test log
    await AuditLog.deleteOne({ _id: freshLog._id });
    await AuditLog.deleteOne({ _id: cleanupAuditLog._id });
    console.log('✅ Test cleanup logs removed.');

    console.log('--- ALL ANALYTICS, REPORTING AND AUDIT CLEANUP TESTS PASSED ---');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ INTEGRATION TEST FAILED:', error.response?.data || error.message);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
};

runAnalyticsReportingTest();
