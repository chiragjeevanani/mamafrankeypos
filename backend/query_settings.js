const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const run = async () => {
  try {
    await connectDB();
    const collection = mongoose.connection.collection('storesettings');
    const settings = await collection.findOne();
    console.log('--- DATABASE STORESETTINGS DOCUMENT ---');
    console.log(JSON.stringify(settings, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
