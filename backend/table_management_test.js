const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Table = require('./models/Table');
const Section = require('./models/Section');
const Order = require('./models/Order');

// Load env vars
dotenv.config();

const runTest = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    // Clean up from previous tests
    await Section.deleteMany({ name: { $in: ['test-main-hall', 'test-car-service'] } });
    await Table.deleteMany({ name: { $in: ['TEST-T1', 'TEST-T2'] } });

    // Create sections
    const mainSection = await Section.create({ name: 'test-main-hall', label: 'Test Main Hall', rank: 1, type: 'DINE-IN' });
    const carSection = await Section.create({ name: 'test-car-service', label: 'Test Car Service', rank: 2, type: 'CAR-SERVICE' });

    // Create a table
    const table = await Table.create({ name: 'TEST-T1', section: mainSection._id, capacity: 4 });

    // 1. Test Unsafe Table Deletion
    console.log('\n--- 1. Testing Unsafe Table Deletion ---');
    table.status = 'running-kot';
    table.currentOrder = new mongoose.Types.ObjectId();
    await table.save();
    const { deleteTable, updateTable, deleteSection } = require('./controllers/tableController');
    const runController = (controller, req, res) => {
      return new Promise((resolve, reject) => {
        const oldJson = res.json;
        res.json = (data) => {
          if (oldJson) oldJson(data);
          resolve();
        };
        res.status = (code) => res;
        controller(req, res, (err) => {
          if (err) reject(err);
        });
      });
    };

    let errorThrown = false;
    try {
      await runController(deleteTable, { params: { id: table._id } }, { json: () => {} });
    } catch (error) {
      errorThrown = true;
      console.log('✅ Blocked unsafe table deletion:', error.message);
    }
    if (!errorThrown) throw new Error('❌ Failed to block unsafe table deletion');

    // 2. Test Unsafe Section Deletion
    console.log('\n--- 2. Testing Unsafe Section Deletion ---');
    errorThrown = false;
    try {
      await runController(deleteSection, { params: { id: mainSection._id } }, { json: () => {} });
    } catch (error) {
      errorThrown = true;
      console.log('✅ Blocked unsafe section deletion:', error.message);
    }
    if (!errorThrown) throw new Error('❌ Failed to block unsafe section deletion');

    // 3. Test Moving Table to CAR-SERVICE
    console.log('\n--- 3. Testing Moving Table to CAR-SERVICE ---');
    errorThrown = false;
    try {
      await runController(updateTable, { params: { id: table._id }, body: { section: carSection._id } }, { json: () => {} });
    } catch (error) {
      errorThrown = true;
      console.log('✅ Blocked moving table to CAR-SERVICE:', error.message);
    }
    if (!errorThrown) throw new Error('❌ Failed to block moving table to CAR-SERVICE');

    // 4. Test Ghost Order Fix (Admin forcing to blank)
    console.log('\n--- 4. Testing Ghost Order Fix (Force to Blank) ---');
    const resMock = { json: (data) => console.log('✅ Table updated, status:', data.status, 'currentOrder:', data.currentOrder) };
    await runController(updateTable, { params: { id: table._id }, body: { status: 'blank' } }, resMock);

    const updatedTable = await Table.findById(table._id);
    if (updatedTable.currentOrder !== null) {
      throw new Error('❌ Failed to reset currentOrder when forcing status to blank');
    }

    // Now it should be deletable
    console.log('\n--- 5. Testing Safe Deletion ---');
    await runController(deleteTable, { params: { id: table._id } }, { json: () => console.log('✅ Safely deleted table') });
    await runController(deleteSection, { params: { id: mainSection._id } }, { json: () => console.log('✅ Safely deleted section') });

    console.log('\n🎉 All table management safety tests passed!');
  } catch (err) {
    console.error('\n❌ Test failed:', err.message);
    process.exit(1);
  } finally {
    // Cleanup
    await Section.deleteMany({ name: { $in: ['test-main-hall', 'test-car-service'] } });
    await Table.deleteMany({ name: { $in: ['TEST-T1', 'TEST-T2'] } });
    mongoose.connection.close();
  }
};

runTest();
