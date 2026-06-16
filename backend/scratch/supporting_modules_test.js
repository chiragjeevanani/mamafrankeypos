const axios = require('axios');
const API_URL = 'http://localhost:5000/api';

const runSupportingModulesTest = async () => {
  try {
    console.log('--- STARTING SUPPORTING MODULES INTEGRATION TEST ---');

    // 1. Logins
    console.log('1. Admin & POS Logins...');
    const adminRes = await axios.post(`${API_URL}/auth/admin/login`, {
      email: 'admin@mamafrankey.com',
      password: 'admin123'
    });
    const adminToken = adminRes.data.token;
    const adminHeader = { headers: { Authorization: `Bearer ${adminToken}` } };

    const posRes = await axios.post(`${API_URL}/auth/pos/login`, {
      pin: '1234'
    });
    const posToken = posRes.data.token;
    const posHeader = { headers: { Authorization: `Bearer ${posToken}` } };

    // Get table and counter for orders placement
    const tableRes = await axios.get(`${API_URL}/tables`, posHeader);
    const table = tableRes.data.find(t => t.name === 'T1');
    if (!table) throw new Error('Table T1 not found');

    const itemRes = await axios.get(`${API_URL}/menu/items`);
    const realItem = itemRes.data[0];
    if (!realItem) throw new Error('No menu items found');

    const counterRes = await axios.get(`${API_URL}/settings/counters`);
    const counter = counterRes.data[0];
    if (!counter) throw new Error('No counters found');

    // 2. Test Staff Deletion Safeguard
    console.log('2. Testing Staff Deletion Safeguards...');
    // Create new staff
    const tempStaffPin = String(Math.floor(1000 + Math.random() * 9000));
    const staffRegisterRes = await axios.post(`${API_URL}/staff`, {
      name: 'Temp Waiter',
      role: 'Waiter',
      pin: tempStaffPin
    }, adminHeader);
    const waiterId = staffRegisterRes.data._id;
    console.log(`✅ Temp Waiter created: ${waiterId}`);

    // Place active order with this waiter
    const orderRes = await axios.post(`${API_URL}/orders`, {
      tableId: table._id,
      orderType: 'DINE-IN',
      items: [{ id: realItem._id, name: realItem.name, price: realItem.price, quantity: 1 }],
      total: realItem.price,
      staffId: waiterId,
      counterId: counter._id
    }, posHeader);
    const activeOrderId = orderRes.data._id;
    console.log(`✅ Active Order created: ${orderRes.data.orderNumber} with waiter ${waiterId}`);

    // Attempt to delete staff (should fail)
    try {
      await axios.delete(`${API_URL}/staff/${waiterId}`, adminHeader);
      throw new Error('FAIL: Staff deletion succeeded while having an active order!');
    } catch (err) {
      if (err.response?.status === 400 && err.response.data.message?.includes('active running/billed orders')) {
        console.log('✅ PASS: Staff deletion blocked with correct error message:', err.response.data.message);
      } else {
        throw new Error(`FAIL: Unexpected error during staff deletion block: ${err.response?.data?.message || err.message}`);
      }
    }

    // 3. Test Customer Deletion Safeguard
    console.log('3. Testing Customer Deletion Safeguards...');
    const tempCustomerPhone = String(Math.floor(1000000000 + Math.random() * 9000000000));
    // Create customer record
    const customerRes = await axios.post(`${API_URL}/customers`, {
      name: 'Temp Customer',
      phone: tempCustomerPhone
    }, posHeader);
    const customerId = customerRes.data._id;
    console.log(`✅ Temp Customer created: ${customerId}`);

    // Place another active order under this customer's phone
    const customerOrderRes = await axios.post(`${API_URL}/orders`, {
      orderType: 'PICKUP',
      items: [{ id: realItem._id, name: realItem.name, price: realItem.price, quantity: 1 }],
      total: realItem.price,
      staffId: waiterId,
      counterId: counter._id,
      customer: {
        name: 'Temp Customer',
        phone: tempCustomerPhone
      }
    }, posHeader);
    const customerOrderId = customerOrderRes.data._id;
    console.log(`✅ Active Customer Order created: ${customerOrderRes.data.orderNumber} with phone ${tempCustomerPhone}`);

    // Attempt to delete customer (should fail)
    try {
      await axios.delete(`${API_URL}/customers/${customerId}`, posHeader);
      throw new Error('FAIL: Customer deletion succeeded while having an active order!');
    } catch (err) {
      if (err.response?.status === 400 && err.response.data.message?.includes('active running/billed orders')) {
        console.log('✅ PASS: Customer deletion blocked with correct error message:', err.response.data.message);
      } else {
        throw new Error(`FAIL: Unexpected error during customer deletion block: ${err.response?.data?.message || err.message}`);
      }
    }

    // 4. Settle both orders and retry deletion
    console.log('4. Settling active orders to clean up...');
    await axios.post(`${API_URL}/orders/${activeOrderId}/settle`, {
      paymentMethod: 'CASH',
      taxes: [],
      totalAmount: realItem.price
    }, posHeader);
    console.log('✅ First order settled');

    await axios.post(`${API_URL}/orders/${customerOrderId}/settle`, {
      paymentMethod: 'CASH',
      taxes: [],
      totalAmount: realItem.price
    }, posHeader);
    console.log('✅ Customer order settled');

    // Attempt to delete staff (should succeed now)
    await axios.delete(`${API_URL}/staff/${waiterId}`, adminHeader);
    console.log('✅ PASS: Staff member successfully soft-deleted after order completion.');

    // Attempt to delete customer (should succeed now)
    await axios.delete(`${API_URL}/customers/${customerId}`, posHeader);
    console.log('✅ PASS: Customer record successfully deleted after order completion.');

    // 5. Test Attendance Update Range validation
    console.log('5. Testing Attendance validations...');
    const attendanceRes = await axios.get(`${API_URL}/staff/attendance?date=all`, adminHeader);
    const attendanceRecord = attendanceRes.data[0];
    if (attendanceRecord) {
      console.log(`Using attendance record: ${attendanceRecord._id}`);
      const checkInTime = new Date(attendanceRecord.checkIn);
      const invalidCheckOut = new Date(checkInTime.getTime() - 2 * 60 * 60 * 1000); // 2 hours before checkIn

      try {
        await axios.put(`${API_URL}/staff/attendance/${attendanceRecord._id}`, {
          checkOut: invalidCheckOut.toISOString()
        }, adminHeader);
        throw new Error('FAIL: Attendance checkout update succeeded despite checkOut < checkIn!');
      } catch (err) {
        if (err.response?.status === 400 && err.response.data.message?.includes('earlier than check-in')) {
          console.log('✅ PASS: Attendance checkOut before checkIn update blocked correctly:', err.response.data.message);
        } else {
          throw new Error(`FAIL: Unexpected error during attendance validation: ${err.response?.data?.message || err.message}`);
        }
      }
    } else {
      console.log('⚠️ No attendance record found to test update validation.');
    }

    // 6. Test Expense Validations
    console.log('6. Testing Expense Validations...');
    // Negative amount
    try {
      await axios.post(`${API_URL}/expenses`, {
        title: 'Negative Expense',
        category: 'Supplies',
        amount: -100
      }, adminHeader);
      throw new Error('FAIL: Expense with negative amount accepted!');
    } catch (err) {
      if (err.response?.status === 400 && err.response.data.message?.includes('positive number')) {
        console.log('✅ PASS: Negative expense amount blocked correctly:', err.response.data.message);
      } else {
        throw new Error(`FAIL: Unexpected error on negative expense: ${err.response?.data?.message || err.message}`);
      }
    }

    // Invalid category
    try {
      await axios.post(`${API_URL}/expenses`, {
        title: 'Invalid Category Expense',
        category: 'InvalidCategoryName',
        amount: 200
      }, adminHeader);
      throw new Error('FAIL: Expense with invalid category accepted!');
    } catch (err) {
      if (err.response?.status === 400 && err.response.data.message?.includes('expense category is required')) {
        console.log('✅ PASS: Invalid expense category blocked correctly:', err.response.data.message);
      } else {
        throw new Error(`FAIL: Unexpected error on invalid category expense: ${err.response?.data?.message || err.message}`);
      }
    }

    console.log('--- ALL SUPPORTING MODULES VALIDATIONS AND SAFESTRAPS PASSED ---');
    process.exit(0);
  } catch (error) {
    console.error('❌ INTEGRATION TEST FAILED:', error.response?.data || error.message);
    process.exit(1);
  }
};

runSupportingModulesTest();
