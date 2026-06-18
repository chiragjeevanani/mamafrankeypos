const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Order = require('../models/Order');

// Load environment variables from the backend folder
dotenv.config({ path: path.join(__dirname, '../.env') });

const runTest = async () => {
  try {
    console.log('--- STARTING PAYMENT METHOD REGEX QUERY TEST ---');
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not set in environment variables');
    }
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clean up any existing test verification orders
    await Order.deleteMany({ orderNumber: /^TEST-ADJ-/ });

    // Seed mock orders
    const testOrders = [
      { orderNumber: 'TEST-ADJ-001', paymentMethod: 'CASH', totalAmount: 100, orderStatus: 'COMPLETED' },
      { orderNumber: 'TEST-ADJ-002', paymentMethod: 'Cash', totalAmount: 150, orderStatus: 'COMPLETED' },
      { orderNumber: 'TEST-ADJ-003', paymentMethod: 'Cash (Tendered: ₹500)', totalAmount: 200, orderStatus: 'COMPLETED' },
      { orderNumber: 'TEST-ADJ-004', paymentMethod: 'CASHLESS', totalAmount: 250, orderStatus: 'COMPLETED' },
      { orderNumber: 'TEST-ADJ-005', paymentMethod: 'Cashless', totalAmount: 300, orderStatus: 'COMPLETED' },
      { orderNumber: 'TEST-ADJ-006', paymentMethod: 'UPI', totalAmount: 350, orderStatus: 'COMPLETED' }
    ];

    await Order.insertMany(testOrders);
    console.log('✅ Seeding completed');

    const runQuery = async (paymentMode) => {
      let query = { orderNumber: /^TEST-ADJ-/, orderStatus: 'COMPLETED' };
      if (paymentMode && paymentMode !== '--All Payment Modes--' && paymentMode !== '--All Modes--') {
        if (paymentMode === 'CASH') {
          query.paymentMethod = { $regex: /^cash(?!less)/i };
        } else if (paymentMode === 'CASHLESS') {
          query.paymentMethod = { $regex: /^cashless/i };
        } else {
          query.paymentMethod = paymentMode;
        }
      } else {
        query.$or = [
          { paymentMethod: { $regex: /^cash(?!less)/i } },
          { paymentMethod: { $regex: /^cashless/i } }
        ];
      }
      return await Order.find(query);
    };

    // Test Case 1: All Payment Modes
    const allModesResults = await runQuery('--All Payment Modes--');
    console.log(`\n1. Testing filter '--All Payment Modes--'`);
    console.log(`Expected: 5 orders (TEST-ADJ-001 to TEST-ADJ-005)`);
    console.log(`Actual: ${allModesResults.length} orders found`);
    const allPassed = allModesResults.length === 5 && !allModesResults.some(o => o.paymentMethod === 'UPI');
    console.log(allPassed ? '✅ Passed' : '❌ Failed');
    if (!allPassed) {
      console.log('Found:', allModesResults.map(o => o.paymentMethod));
    }

    // Test Case 2: CASH filter
    const cashResults = await runQuery('CASH');
    console.log(`\n2. Testing filter 'CASH'`);
    console.log(`Expected: 3 orders (TEST-ADJ-001, TEST-ADJ-002, TEST-ADJ-003)`);
    console.log(`Actual: ${cashResults.length} orders found`);
    const cashPassed = cashResults.length === 3 && cashResults.every(o => o.paymentMethod.match(/^cash(?!less)/i));
    console.log(cashPassed ? '✅ Passed' : '❌ Failed');
    if (!cashPassed) {
      console.log('Found:', cashResults.map(o => o.paymentMethod));
    }

    // Test Case 3: CASHLESS filter
    const cashlessResults = await runQuery('CASHLESS');
    console.log(`\n3. Testing filter 'CASHLESS'`);
    console.log(`Expected: 2 orders (TEST-ADJ-004, TEST-ADJ-005)`);
    console.log(`Actual: ${cashlessResults.length} orders found`);
    const cashlessPassed = cashlessResults.length === 2 && cashlessResults.every(o => o.paymentMethod.match(/^cashless/i));
    console.log(cashlessPassed ? '✅ Passed' : '❌ Failed');
    if (!cashlessPassed) {
      console.log('Found:', cashlessResults.map(o => o.paymentMethod));
    }

    // Clean up
    await Order.deleteMany({ orderNumber: /^TEST-ADJ-/ });
    console.log('\n✅ Cleanup completed');

    await mongoose.connection.close();
    if (allPassed && cashPassed && cashlessPassed) {
      console.log('\n🎉 ALL REGEX QUERY TESTS PASSED SUCCESSFULLY!');
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ TEST FAILED:', error);
    process.exit(1);
  }
};

runTest();
