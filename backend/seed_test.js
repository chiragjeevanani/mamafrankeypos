const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Staff = require('./models/Staff');
const Section = require('./models/Section');
const Table = require('./models/Table');
const Counter = require('./models/Counter');

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB for seeding...');

    // 1. Seed Admin
    const adminExists = await Staff.findOne({ email: 'admin@mamafrankey.com' });
    if (!adminExists) {
      await Staff.create({
        name: 'Super Admin',
        email: 'admin@mamafrankey.com',
        password: 'admin123',
        role: 'Admin',
        status: 'Active'
      });
      console.log('Admin seeded: admin@mamafrankey.com / admin123');
    }

    // 2. Seed Biller
    const billerExists = await Staff.findOne({ role: 'Biller' });
    if (!billerExists) {
      await Staff.create({
        name: 'Main Biller',
        pin: '1234',
        role: 'Biller',
        status: 'Active'
      });
      console.log('Biller seeded: PIN 1234');
    }

    // 3. Seed Section & Table
    const section = await Section.findOneAndUpdate(
      { name: 'main' },
      { name: 'main', label: 'Main Hall', rank: 1 },
      { upsert: true, new: true }
    );

    const tableExists = await Table.findOne({ name: 'T1' });
    if (!tableExists) {
      await Table.create({
        name: 'T1',
        section: section._id,
        capacity: 4,
        status: 'blank'
      });
      console.log('Table T1 seeded');
    }

    // 4. Seed Counter
    const counterExists = await Counter.findOne({ prefix: 'MF' });
    if (!counterExists) {
      await Counter.create({
        name: 'Main Counter',
        prefix: 'MF',
        startNum: 1,
        currentNum: 1
      });
      console.log('Counter MF seeded');
    }

    console.log('Seeding complete!');
    process.exit();
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seed();
