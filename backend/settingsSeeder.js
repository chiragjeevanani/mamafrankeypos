const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tax = require('./models/Tax');
const Counter = require('./models/Counter');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const importSettingsData = async () => {
  try {
    await Tax.deleteMany();
    await Counter.deleteMany();

    const taxes = [
      { name: 'CGST', rate: 2.5, enabled: true },
      { name: 'SGST', rate: 2.5, enabled: true }
    ];

    const counters = [
      { name: 'Counter 1', prefix: 'C1', startNum: 1, currentNum: 1 },
      { name: 'Counter 2', prefix: 'C2', startNum: 1, currentNum: 1 },
      { name: 'Billing Desk', prefix: 'BD', startNum: 100, currentNum: 100 }
    ];

    await Tax.insertMany(taxes);
    await Counter.insertMany(counters);

    console.log('Settings Data (Taxes & Counters) Imported Successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

importSettingsData();
