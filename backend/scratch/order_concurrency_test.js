const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const axios = require('axios');
const mongoose = require('mongoose');

// Register models
require('../models/Table');
require('../models/Order');

const API_URL = 'http://localhost:5000/api';

const runConcurrencyTest = async () => {
  try {
    console.log('--- STARTING CONCURRENCY / TRANSACTION TEST ---');

    // 1. POS Login
    console.log('1. POS Login...');
    const posRes = await axios.post(`${API_URL}/auth/pos/login`, {
      pin: '1234'
    });
    const posToken = posRes.data.token;
    const staffId = posRes.data._id;
    console.log('✅ POS Login Successful');

    // 2. Fetch Tables
    const tableRes = await axios.get(`${API_URL}/tables`, {
      headers: { Authorization: `Bearer ${posToken}` }
    });
    const table = tableRes.data.find(t => t.name === 'T2') || tableRes.data.find(t => t.name === 'T1');
    if (!table) throw new Error('No test table found');
    console.log(`✅ Using Table: ${table.name} (${table._id})`);

    // 3. Connect to DB to reset table status
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) throw new Error('MONGO_URI is not defined in .env');
    
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }
    
    const TableModel = mongoose.model('Table');
    const OrderModel = mongoose.model('Order');

    // Reset Table status and any old running order to avoid conflicts
    await TableModel.findByIdAndUpdate(table._id, { status: 'blank', currentOrder: null });
    await OrderModel.updateMany({ table: table._id, orderStatus: 'RUNNING' }, { orderStatus: 'CANCELLED' });
    console.log('✅ Table and running orders reset in database.');

    // Fetch menu items and counter
    const itemRes = await axios.get(`${API_URL}/menu/items`);
    const realItem = itemRes.data[0];
    if (!realItem) throw new Error('No menu items found.');

    const counterRes = await axios.get(`${API_URL}/settings/counters`);
    const counter = counterRes.data[0];
    if (!counter) throw new Error('No counters found.');

    // 4. Send two concurrent order placement requests
    console.log('Sending two concurrent order placement requests...');
    const orderPayload1 = {
      tableId: table._id,
      orderType: 'DINE-IN',
      items: [{ id: realItem._id, name: realItem.name, price: realItem.price, quantity: 1 }],
      total: realItem.price,
      staffId,
      counterId: counter._id
    };

    const orderPayload2 = {
      tableId: table._id,
      orderType: 'DINE-IN',
      items: [{ id: realItem._id, name: realItem.name + ' (Concurrent)', price: realItem.price, quantity: 2 }],
      total: realItem.price * 2,
      staffId,
      counterId: counter._id
    };

    const startTime = Date.now();
    const results = await Promise.allSettled([
      axios.post(`${API_URL}/orders`, orderPayload1, { headers: { Authorization: `Bearer ${posToken}` } }),
      axios.post(`${API_URL}/orders`, orderPayload2, { headers: { Authorization: `Bearer ${posToken}` } })
    ]);

    console.log(`Concurrent requests resolved in ${Date.now() - startTime}ms`);

    let successCount = 0;
    let orderDetails = [];
    results.forEach((r, idx) => {
      if (r.status === 'fulfilled') {
        successCount++;
        orderDetails.push(r.value.data);
        console.log(`Request ${idx + 1} succeeded. Order ID: ${r.value.data._id}, Order Number: ${r.value.data.orderNumber}`);
      } else {
        console.log(`Request ${idx + 1} failed:`, r.reason.response?.data || r.reason.message);
      }
    });

    console.log(`Success count: ${successCount}`);

    // Verify merging / transaction results
    if (successCount === 2) {
      const order1 = orderDetails[0];
      const order2 = orderDetails[1];

      if (order1._id.toString() === order2._id.toString()) {
        console.log('🎉 SUCCESS: Both requests were merged into the same Order ID! Transactional integrity and fallback work perfectly.');
        
        // Verify order has 2 KOTs
        const finalOrder = await OrderModel.findById(order1._id);
        console.log(`Order ${finalOrder.orderNumber} has ${finalOrder.kots.length} KOT(s).`);
        if (finalOrder.kots.length === 2) {
          console.log('✅ Verified: Order contains exactly 2 KOTs.');
        } else {
          throw new Error(`Expected 2 KOTs, but found ${finalOrder.kots.length}`);
        }
      } else {
        throw new Error(`FAIL: Separate orders were created: ${order1._id} and ${order2._id}`);
      }
    } else if (successCount === 1) {
      console.log('One request succeeded and one failed. Let\'s verify the table is occupied and only one order exists.');
      const tableDoc = await TableModel.findById(table._id);
      console.log(`Table status: ${tableDoc.status}, Current Order: ${tableDoc.currentOrder}`);
      if (tableDoc.status === 'running-kot' && tableDoc.currentOrder) {
        console.log('✅ Table status updated correctly to running-kot.');
      } else {
        throw new Error(`Expected table to be occupied, but status is ${tableDoc.status}`);
      }
    } else {
      throw new Error('FAIL: Both requests failed.');
    }

    // 5. Test Double Settle / Bill Race conditions
    console.log('5. Testing double-settlement prevention...');
    const activeOrder = orderDetails[0] || await OrderModel.findOne({ table: table._id, orderStatus: 'RUNNING' });
    if (!activeOrder) throw new Error('No active order found to test settlement.');

    console.log('Sending two concurrent settlement requests...');
    const settlePayload = {
      paymentMethod: 'CASH',
      taxes: [],
      totalAmount: activeOrder.totalAmount
    };

    const settleResults = await Promise.allSettled([
      axios.post(`${API_URL}/orders/${activeOrder._id}/settle`, settlePayload, { headers: { Authorization: `Bearer ${posToken}` } }),
      axios.post(`${API_URL}/orders/${activeOrder._id}/settle`, settlePayload, { headers: { Authorization: `Bearer ${posToken}` } })
    ]);

    let settleSuccess = 0;
    let settleFail = 0;
    settleResults.forEach((r, idx) => {
      if (r.status === 'fulfilled') {
        settleSuccess++;
        console.log(`Settlement request ${idx + 1} succeeded`);
      } else {
        settleFail++;
        console.log(`Settlement request ${idx + 1} failed (Expected):`, r.reason.response?.data?.message || r.reason.message);
      }
    });

    if (settleSuccess === 1 && settleFail === 1) {
      console.log('✅ Double-settlement successfully prevented! Only one settlement succeeded, the other failed.');
    } else {
      throw new Error(`FAIL: Expected 1 success and 1 failure, but got ${settleSuccess} success(es) and ${settleFail} failure(s)`);
    }

    // Cleanup Table
    await TableModel.findByIdAndUpdate(table._id, { status: 'blank', currentOrder: null });
    console.log('✅ Cleanup complete. Table reset to blank.');

    console.log('--- CONCURRENCY / TRANSACTION TEST PASSED ---');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ CONCURRENCY TEST FAILED:', error.message);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
};

runConcurrencyTest();
