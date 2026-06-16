const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

const runTest = async () => {
  try {
    console.log('--- STARTING AUTH & PERMISSION INTEGRATION TEST ---');

    // 1. Validate Input Validation - Admin Login (invalid email)
    console.log('1. Testing Admin Login input validation (invalid email)...');
    try {
      await axios.post(`${API_URL}/auth/admin/login`, {
        email: 'invalidemailrestaurant.com',
        password: 'admin'
      });
      console.error('❌ FAIL: Allowed invalid email format');
      process.exit(1);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ PASS: Rejected invalid email with 400 Bad Request');
        console.log(`   Error message: "${error.response.data.message}"`);
      } else {
        console.error('❌ FAIL: Expected 400, got:', error.response?.status || error.message);
        process.exit(1);
      }
    }

    // 2. Validate Input Validation - POS Login (invalid PIN length)
    console.log('2. Testing POS Login input validation (PIN too short)...');
    try {
      await axios.post(`${API_URL}/auth/pos/login`, {
        pin: '123'
      });
      console.error('❌ FAIL: Allowed PIN shorter than 4 digits');
      process.exit(1);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ PASS: Rejected short PIN with 400 Bad Request');
        console.log(`   Error message: "${error.response.data.message}"`);
      } else {
        console.error('❌ FAIL: Expected 400, got:', error.response?.status || error.message);
        process.exit(1);
      }
    }

    // 3. Test POS login with Biller PIN
    console.log('3. Logging in as Main Biller...');
    const posRes = await axios.post(`${API_URL}/auth/pos/login`, {
      pin: '1234'
    });
    const posToken = posRes.data.token;
    console.log(`✅ POS Login Successful. Role: ${posRes.data.role}`);

    // 4. Test RBAC - Biller attempting to create category (should be Forbidden 403)
    console.log('4. Testing RBAC - Biller attempting to create a category (requires canManageMenu)...');
    try {
      await axios.post(`${API_URL}/menu/categories`, {
        name: 'Forbidden Category'
      }, {
        headers: { Authorization: `Bearer ${posToken}` }
      });
      console.error('❌ FAIL: Biller was allowed to create a menu category');
      process.exit(1);
    } catch (error) {
      if (error.response && error.response.status === 403) {
        console.log('✅ PASS: Successfully blocked with 403 Forbidden');
        console.log(`   Error message: "${error.response.data.message}"`);
      } else {
        console.error('❌ FAIL: Expected 403, got:', error.response?.status || error.response?.data || error.message);
        process.exit(1);
      }
    }

    // 5. Test RBAC - Biller attempting to create a table (requires canManageTables)
    console.log('5. Testing RBAC - Biller attempting to create a table (requires canManageTables)...');
    try {
      await axios.post(`${API_URL}/tables`, {
        name: 'Forbidden Table'
      }, {
        headers: { Authorization: `Bearer ${posToken}` }
      });
      console.error('❌ FAIL: Biller was allowed to create a table');
      process.exit(1);
    } catch (error) {
      if (error.response && error.response.status === 403) {
        console.log('✅ PASS: Successfully blocked with 403 Forbidden');
        console.log(`   Error message: "${error.response.data.message}"`);
      } else {
        console.error('❌ FAIL: Expected 403, got:', error.response?.status || error.response?.data || error.message);
        process.exit(1);
      }
    }

    // 6. Test Admin super-user bypass
    console.log('6. Logging in as Admin...');
    const adminRes = await axios.post(`${API_URL}/auth/admin/login`, {
      email: 'admin@mamafrankey.com',
      password: 'admin123'
    });
    const adminToken = adminRes.data.token;
    console.log('✅ Admin login successful');

    console.log('7. Testing RBAC - Admin attempting to create a table (should bypass 403)...');
    try {
      // Send invalid table payload to trigger schema validation instead of RBAC block
      await axios.post(`${API_URL}/tables`, {
        name: ''
      }, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
    } catch (error) {
      // It should NOT be 403 Forbidden. It should be 400 Bad Request because the name is empty.
      if (error.response && error.response.status === 400) {
        console.log('✅ PASS: Admin successfully bypassed 403 Forbidden check (got 400 Validation Error)');
      } else {
        console.error('❌ FAIL: Expected 400 validation error, got:', error.response?.status || error.response?.data || error.message);
        process.exit(1);
      }
    }

    console.log('--- ALL AUTH & PERMISSION INTEGRATION TESTS PASSED ---');
    process.exit(0);
  } catch (error) {
    console.error('❌ TEST RUN ERROR:', error.response?.data || error.message);
    process.exit(1);
  }
};

runTest();
