const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Order = require('../models/Order');
const StoreSettings = require('../models/StoreSettings');
const { commitAdjustments } = require('../controllers/settingsController');

dotenv.config({ path: path.join(__dirname, '../.env') });

const runTest = async () => {
  try {
    console.log('--- STARTING AUTO-COMMIT SETTINGS TEST ---');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // 1. Clean up and set up initial state
    await Order.deleteMany({ orderNumber: /^TEST-CMT-/ });
    let settings = await StoreSettings.findOne();
    if (!settings) {
      settings = await StoreSettings.create({});
    }

    // 2. Create mock order (Dine-In, Completed)
    // Items: 2 units of Item A at 200 each = 400 subtotal
    const testOrder = await Order.create({
      orderNumber: 'TEST-CMT-001',
      orderType: 'DINE-IN',
      orderStatus: 'COMPLETED',
      subtotal: 400.00,
      totalAmount: 400.00,
      taxes: [
        { name: 'SGST', rate: 2.5, amount: 9.52 },
        { name: 'CGST', rate: 2.5, amount: 9.52 }
      ],
      kots: [{
        kotNumber: '999',
        total: 400,
        items: [{
          menuItem: new mongoose.Types.ObjectId(),
          name: 'Item A',
          quantity: 2,
          price: 200.00,
          status: 'pending'
        }]
      }]
    });
    console.log('✅ Mock Order Seeded:', testOrder.orderNumber);

    // 3. Configure store settings with visibility decrement
    settings.visibilityDecrement = 50; // 50% decrement
    settings.adjustedOrderIds = [testOrder._id.toString()];
    await settings.save();
    console.log('✅ Store Settings Configured');

    // 4. Invoke commitAdjustments controller directly and wait for response
    const req = {
      user: { _id: new mongoose.Types.ObjectId() },
      ip: '127.0.0.1'
    };
    
    let jsonResponse = null;
    const res = {
      statusCode: 200,
      status: function(code) { this.statusCode = code; return this; }
    };

    console.log('⚡ Invoking commitAdjustments controller...');
    
    await new Promise((resolve, reject) => {
      res.json = function(data) {
        jsonResponse = data;
        resolve();
      };
      
      commitAdjustments(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    console.log('✅ Controller response:', jsonResponse);

    // 5. Assert database state after commit
    const updatedOrder = await Order.findById(testOrder._id);
    const updatedSettings = await StoreSettings.findOne();

    console.log('\n--- VERIFICATION ASSERTIONS ---');
    
    // Order Assertions:
    // With 50% decrement on 400 subtotal, the target subtotal is 200.
    // 2 units at 200 each -> reduced to 1 unit at 200 each.
    // So subtotal = 200, totalAmount = 200 (since taxes are inclusive), SGST/CGST scaled by 0.5 (9.52 * 0.5 = 4.76).
    console.log(`Subtotal: expected 200.00, actual ${updatedOrder.subtotal}`);
    console.log(`TotalAmount: expected 200.00, actual ${updatedOrder.totalAmount}`);
    console.log(`SGST: expected 4.76, actual ${updatedOrder.taxes[0].amount}`);
    console.log(`Item Qty: expected 1, actual ${updatedOrder.kots[0].items[0].quantity}`);

    const orderPassed = Math.abs(updatedOrder.subtotal - 200.00) < 0.01 &&
                        Math.abs(updatedOrder.totalAmount - 200.00) < 0.01 &&
                        Math.abs(updatedOrder.taxes[0].amount - 4.76) < 0.01 &&
                        updatedOrder.kots[0].items[0].quantity === 1;

    console.log(orderPassed ? '✅ Order Permanent Commit Passed' : '❌ Order Permanent Commit Failed');

    // Settings Assertions:
    console.log(`visibilityDecrement: expected 0, actual ${updatedSettings.visibilityDecrement}`);
    console.log(`adjustedOrderIds length: expected 0, actual ${updatedSettings.adjustedOrderIds.length}`);

    const settingsPassed = updatedSettings.visibilityDecrement === 0 &&
                           updatedSettings.adjustedOrderIds.length === 0;

    console.log(settingsPassed ? '✅ Store Settings Reset Passed' : '❌ Store Settings Reset Failed');

    // Clean up
    await Order.deleteMany({ orderNumber: /^TEST-CMT-/ });
    console.log('\n✅ Cleanup completed');

    await mongoose.connection.close();
    if (orderPassed && settingsPassed) {
      console.log('🎉 ALL AUTO-COMMIT CONTROLLER TESTS PASSED SUCCESSFULLY!');
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
