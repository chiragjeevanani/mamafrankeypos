const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

const runVerification = async () => {
  try {
    console.log('--- STARTING POS LOGIN ACCESS GATE VERIFICATION ---');

    console.log('1. Logging in as Admin...');
    const adminLoginRes = await axios.post(`${API_URL}/auth/admin/login`, {
      email: 'admin@mamafrankey.com',
      password: 'admin123'
    });
    const token = adminLoginRes.data.token;
    const authHeader = { headers: { Authorization: `Bearer ${token}` } };
    console.log('✅ Admin login successful');

    // Clean up any existing test staff
    console.log('Cleaning up existing test staff...');
    const staffRes = await axios.get(`${API_URL}/staff`, authHeader);
    const staffList = staffRes.data.data || staffRes.data;
    console.log('Fetched staff list:', JSON.stringify(staffList, null, 2));
    for (const s of staffList) {
      if (s.name === 'Test Waiter' || s.name === 'Test Biller' || s.email === 'testwaiter@mamafrankey.com' || s.email === 'testbiller@mamafrankey.com') {
        await axios.delete(`${API_URL}/staff/${s._id}`, authHeader);
      }
    }

    // Create Test Waiter
    const waiterEmail = `testwaiter_${Date.now()}@mamafrankey.com`;
    console.log(`2. Creating Test Waiter with PIN 9991 and email ${waiterEmail}...`);
    await axios.post(`${API_URL}/staff`, {
      name: 'Test Waiter',
      role: 'Waiter',
      email: waiterEmail,
      pin: '9991'
    }, authHeader);
    console.log('✅ Test Waiter created');

    // Create Test Biller
    const billerEmail = `testbiller_${Date.now()}@mamafrankey.com`;
    console.log(`3. Creating Test Biller with PIN 9992 and email ${billerEmail}...`);
    await axios.post(`${API_URL}/staff`, {
      name: 'Test Biller',
      role: 'Biller',
      email: billerEmail,
      pin: '9992'
    }, authHeader);
    console.log('✅ Test Biller created');

    // Test Login 1: Waiter Login (should fail with 403)
    console.log('4. Attempting POS login as Test Waiter (PIN 9991)...');
    try {
      await axios.post(`${API_URL}/auth/pos/login`, { pin: '9991' });
      throw new Error('❌ Test Waiter was allowed to login, but should have been blocked!');
    } catch (err) {
      if (err.response && err.response.status === 403) {
        console.log('✅ Correctly blocked Waiter from POS login. Error message:', err.response.data.message);
      } else {
        throw new Error(`❌ Waiter login failed with unexpected response: ${err.message}`);
      }
    }

    // Test Login 2: Biller Login (should succeed with 200)
    console.log('5. Attempting POS login as Test Biller (PIN 9992)...');
    const billerLoginRes = await axios.post(`${API_URL}/auth/pos/login`, { pin: '9992' });
    if (billerLoginRes.status === 200 && billerLoginRes.data.token) {
      console.log('✅ Test Biller logged in successfully!');
    } else {
      throw new Error('❌ Test Biller login failed!');
    }

    // Clean up test staff
    console.log('6. Cleaning up test staff...');
    const finalStaffRes = await axios.get(`${API_URL}/staff`, authHeader);
    const finalStaffList = finalStaffRes.data.data || finalStaffRes.data;
    for (const s of finalStaffList) {
      if (s.name === 'Test Waiter' || s.name === 'Test Biller' || s.email === 'testwaiter@mamafrankey.com' || s.email === 'testbiller@mamafrankey.com') {
        await axios.delete(`${API_URL}/staff/${s._id}`, authHeader);
      }
    }
    console.log('✅ Cleanup successful');

    console.log('--- ALL POS LOGIN VERIFICATION CHECKS PASSED SUCCESSFULLY ---');
    process.exit(0);
  } catch (error) {
    console.error('❌ VERIFICATION FAILED:', error.response ? error.response.data : error.message);
    process.exit(1);
  }
};

runVerification();
