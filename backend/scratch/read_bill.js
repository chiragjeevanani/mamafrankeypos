const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const Order = require('../models/Order');
    const order = await Order.findOne({ orderNumber: 'MF-134' }).lean();
    console.log('ORDER DATA:', JSON.stringify(order, null, 2));
    await mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
};

run();
