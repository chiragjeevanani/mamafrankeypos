const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Staff = require('../models/Staff');
const connectDB = require('../config/db');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const run = async () => {
  try {
    await connectDB();
    
    // Print current staff details
    const staff = await Staff.find({ isDeleted: { $ne: true } });
    console.log('--- CURRENT STAFF ---');
    for (const s of staff) {
      console.log(`Name: ${s.name}, Role: ${s.role}, pinHash: ${s.pinHash || 'None'}`);
    }

    // Update PINs in safe sequence to prevent unique pinHash collisions
    const updates = [
      { name: 'Waiter 1', pin: '5678' },
      { name: 'Waiter 2', pin: '9012' },
      { name: 'Mohammad Furqanuddin', pin: '7777' },
      { name: 'biller 1', pin: '4321' },
      { name: 'MP board', pin: '8888' },
      { name: 'Main Biller', pin: '1234' }, // Safe now, since Waiter 1 is no longer 1234
    ];

    for (const u of updates) {
      const s = await Staff.findOne({ name: u.name });
      if (s) {
        s.pin = u.pin;
        await s.save();
        console.log(`✅ Updated ${u.name} PIN to ${u.pin} (Hash: ${s.pinHash})`);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

run();
