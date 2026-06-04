const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Role = require('./models/Role');
const Staff = require('./models/Staff');
const connectDB = require('./config/db');

dotenv.config({ path: path.join(__dirname, '.env') });

const run = async () => {
  await connectDB();
  const roles = await Role.find({});
  const staff = await Staff.find({ isDeleted: { $ne: true } });
  console.log('--- ROLES IN DATABASE ---');
  console.log(roles.map(r => ({ _id: r._id, name: r.name, isSystemRole: r.isSystemRole })));
  console.log('--- STAFF IN DATABASE ---');
  console.log(staff.map(s => ({ _id: s._id, name: s.name, role: s.role, email: s.email, pin: s.pin })));
  process.exit(0);
};

run();
