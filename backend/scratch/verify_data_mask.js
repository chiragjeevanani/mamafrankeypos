const { maskOrder } = require('../utils/dataMask');

const runTest = () => {
  console.log('--- STARTING DATA MASK TAX CALCULATIONS TEST ---');

  const rules = {
    visibilityDecrement: 0,
    maskQuantity: false,
    adjustedOrderIds: ['order123', 'order456', 'order789'],
    taxes: [
      { name: 'SGST', percentage: 2.5, active: true },
      { name: 'CGST', percentage: 2.5, active: true }
    ]
  };

  // Test Case 1: Old Order Format (Exclusive Subtotal in DB)
  // E.g. MF-134
  const oldOrder = {
    _id: 'order123',
    orderNumber: 'MF-134',
    orderStatus: 'COMPLETED',
    subtotal: 380.95, // stored as exclusive
    totalAmount: 400.00, // stored as inclusive
    taxes: [
      { name: 'SGST', rate: 2.5, amount: 9.52 },
      { name: 'CGST', rate: 2.5, amount: 9.52 }
    ],
    kots: [
      {
        total: 400,
        items: [
          { name: 'wertghj', quantity: 1, price: 400.00, status: 'pending' }
        ]
      }
    ]
  };

  const maskedOld = maskOrder(oldOrder, rules);
  console.log('\n1. Test Case: Old Order (Exclusive Subtotal)');
  console.log(`Expected Subtotal: 400.00 (Inclusive)`);
  console.log(`Actual Subtotal: ${maskedOld.subtotal.toFixed(2)}`);
  console.log(`Expected Total Amount: 400.00 (Inclusive, NOT 420.00)`);
  console.log(`Actual Total Amount: ${maskedOld.totalAmount.toFixed(2)}`);
  console.log(`Expected Tax Amount (SGST): 9.52`);
  console.log(`Actual Tax Amount (SGST): ${maskedOld.taxes[0].amount.toFixed(2)}`);

  const oldPassed = Math.abs(maskedOld.subtotal - 400.00) < 0.01 && 
                     Math.abs(maskedOld.totalAmount - 400.00) < 0.01 && 
                     Math.abs(maskedOld.taxes[0].amount - 9.52) < 0.01;
  console.log(oldPassed ? '✅ Passed' : '❌ Failed');

  // Test Case 2: New Order Format (Inclusive Subtotal in DB)
  const newOrder = {
    _id: 'order456',
    orderNumber: 'MF-200',
    orderStatus: 'COMPLETED',
    subtotal: 400.00, // stored as inclusive
    totalAmount: 400.00, // stored as inclusive
    taxes: [
      { name: 'SGST', rate: 2.5, amount: 9.52 },
      { name: 'CGST', rate: 2.5, amount: 9.52 }
    ],
    kots: [
      {
        total: 400,
        items: [
          { name: 'wertghj', quantity: 1, price: 400.00, status: 'pending' }
        ]
      }
    ]
  };

  const maskedNew = maskOrder(newOrder, rules);
  console.log('\n2. Test Case: New Order (Inclusive Subtotal)');
  console.log(`Expected Subtotal: 400.00`);
  console.log(`Actual Subtotal: ${maskedNew.subtotal.toFixed(2)}`);
  console.log(`Expected Total Amount: 400.00`);
  console.log(`Actual Total Amount: ${maskedNew.totalAmount.toFixed(2)}`);
  console.log(`Expected Tax Amount (SGST): 9.52`);
  console.log(`Actual Tax Amount (SGST): ${maskedNew.taxes[0].amount.toFixed(2)}`);

  const newPassed = Math.abs(maskedNew.subtotal - 400.00) < 0.01 && 
                     Math.abs(maskedNew.totalAmount - 400.00) < 0.01 && 
                     Math.abs(maskedNew.taxes[0].amount - 9.52) < 0.01;
  console.log(newPassed ? '✅ Passed' : '❌ Failed');

  // Test Case 3: Masking reduction with visibility decrement (50%)
  const multiItemOrder = {
    _id: 'order789',
    orderNumber: 'MF-300',
    orderStatus: 'COMPLETED',
    subtotal: 200.00,
    totalAmount: 200.00,
    taxes: [
      { name: 'SGST', rate: 2.5, amount: 4.76 },
      { name: 'CGST', rate: 2.5, amount: 4.76 }
    ],
    kots: [
      {
        total: 200,
        items: [
          { name: 'Item A', quantity: 2, price: 100.00, status: 'pending' }
        ]
      }
    ]
  };

  const reductionRules = { ...rules, visibilityDecrement: 50 };
  const maskedReduced = maskOrder(multiItemOrder, reductionRules);
  console.log('\n3. Test Case: Proportional Decrement (50%)');
  console.log(`Expected Subtotal: 100.00`);
  console.log(`Actual Subtotal: ${maskedReduced.subtotal.toFixed(2)}`);
  console.log(`Expected Total Amount: 100.00`);
  console.log(`Actual Total Amount: ${maskedReduced.totalAmount.toFixed(2)}`);
  console.log(`Expected Tax Amount (SGST): 2.38 (original 4.76 * 0.5)`);
  console.log(`Actual Tax Amount (SGST): ${maskedReduced.taxes[0].amount.toFixed(2)}`);

  const reductionPassed = Math.abs(maskedReduced.subtotal - 100.00) < 0.01 && 
                           Math.abs(maskedReduced.totalAmount - 100.00) < 0.01 && 
                           Math.abs(maskedReduced.taxes[0].amount - 2.38) < 0.01;
  console.log(reductionPassed ? '✅ Passed' : '❌ Failed');

  if (oldPassed && newPassed && reductionPassed) {
    console.log('\n🎉 ALL DATA MASK TAX CALCULATIONS TESTS PASSED SUCCESSFULLY!');
    process.exit(0);
  } else {
    process.exit(1);
  }
};

runTest();
