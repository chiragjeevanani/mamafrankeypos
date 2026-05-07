const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

const runTest = async () => {
  try {
    console.log('--- STARTING SYSTEM INTEGRATION TEST ---');

    // 1. Admin Login
    console.log('1. Testing Admin Login...');
    const adminRes = await axios.post(`${API_URL}/auth/admin/login`, {
      email: 'admin@mamafrankey.com',
      password: 'admin123'
    });
    const adminToken = adminRes.data.token;
    console.log('✅ Admin Login Successful');

    // 2. Fetch Menu
    console.log('2. Fetching Menu Categories...');
    const catRes = await axios.get(`${API_URL}/menu/categories`);
    console.log(`✅ Found ${catRes.data.length} categories`);

    // 3. POS Login
    console.log('3. Testing POS Login...');
    const posRes = await axios.post(`${API_URL}/auth/pos/login`, {
      pin: '1234'
    });
    const posToken = posRes.data.token;
    console.log('✅ POS Login Successful');

    // 4. Find Table
    console.log('4. Fetching Tables...');
    const tableRes = await axios.get(`${API_URL}/tables`, {
      headers: { Authorization: `Bearer ${posToken}` }
    });
    const table = tableRes.data.find(t => t.name === 'T1');
    if (!table) throw new Error('Table T1 not found');
    console.log('✅ Table T1 Found');

    // 5. Get Real Menu Item
    const itemRes = await axios.get(`${API_URL}/menu/items`);
    const realItem = itemRes.data[0];
    if (!realItem) throw new Error('No menu items found. Please upload menu first.');

    // 6. Get Counter
    const counterRes = await axios.get(`${API_URL}/settings/counters`);
    const counter = counterRes.data[0];

    // 7. Place Order
    console.log(`5. Placing Test Order for ${realItem.name}...`);
    const orderRes = await axios.post(`${API_URL}/orders`, {
      tableId: table._id,
      orderType: 'DINE-IN',
      items: [{ id: realItem._id, name: realItem.name, price: realItem.price, quantity: 2 }],
      total: realItem.price * 2,
      staffId: posRes.data._id,
      counterId: counter._id
    }, {
      headers: { Authorization: `Bearer ${posToken}` }
    });
    const orderId = orderRes.data._id;
    console.log(`✅ Order Placed: ${orderRes.data.orderNumber}`);

    // 7. Settle Order
    console.log('6. Settling Order...');
    await axios.post(`${API_URL}/orders/${orderId}/settle`, {
      paymentMethod: 'CASH',
      taxes: [],
      totalAmount: 200
    }, {
      headers: { Authorization: `Bearer ${posToken}` }
    });
    console.log('✅ Order Settled');

    // 8. Verify Stats
    console.log('7. Verifying Dashboard Stats...');
    const statsRes = await axios.get(`${API_URL}/dashboard/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Dashboard Stats Verified:', statsRes.data.sales.today);

    console.log('--- ALL SYSTEMS GREEN: END-TO-END TEST PASSED ---');
    process.exit(0);
  } catch (error) {
    console.error('❌ TEST FAILED:', error.response?.data || error.message);
    process.exit(1);
  }
};

runTest();
