const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Role = require('../models/Role');
const connectDB = require('../config/db');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const run = async () => {
  await connectDB();
  const roles = await Role.find({});
  console.log('--- ALL ROLES WITH PERMISSIONS ---');
  console.log(JSON.stringify(roles, null, 2));
  process.exit(0);
};

run();
