const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Staff = require('./models/Staff');
const Counter = require('./models/Counter');
const connectDB = require('./config/db');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

connectDB();

const importData = async () => {
  try {
    await Staff.deleteMany();
    await Counter.deleteMany();

    await Counter.create({
      name: 'Main Counter',
      prefix: 'MF',
      startNum: 1,
      currentNum: 1,
      isActive: true
    });

    const admin = {
      name: 'Admin User',
      email: 'admin@restaurant.com',
      password: 'admin123',
      role: 'Admin',
      status: 'Active',
    };

    const biller = {
      name: 'Biller One',
      pin: '1234',
      role: 'Biller',
      status: 'Active',
    };

    await Staff.create(admin);
    await Staff.create(biller);
    await Staff.create({ name: 'Waiter 1', role: 'Waiter', status: 'Active' });
    await Staff.create({ name: 'Waiter 2', role: 'Waiter', status: 'Active' });

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Staff.deleteMany();

    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
