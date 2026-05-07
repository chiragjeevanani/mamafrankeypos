const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Category = require('./models/Category');
const MenuItem = require('./models/MenuItem');
const Section = require('./models/Section');
const Table = require('./models/Table');
const Staff = require('./models/Staff');
const connectDB = require('./config/db');

dotenv.config({ path: path.join(__dirname, '.env') });
connectDB();

const verifyData = async () => {
  try {
    const counts = {
      categories: await Category.countDocuments(),
      menuItems: await MenuItem.countDocuments(),
      sections: await Section.countDocuments(),
      tables: await Table.countDocuments(),
      staff: await Staff.countDocuments(),
    };

    console.log('--- Database Audit ---');
    console.log(`Categories: ${counts.categories}`);
    console.log(`Menu Items: ${counts.menuItems}`);
    console.log(`Sections: ${counts.sections}`);
    console.log(`Tables: ${counts.tables}`);
    console.log(`Staff Members: ${counts.staff}`);
    console.log('----------------------');

    if (counts.menuItems > 200 && counts.tables > 60) {
      console.log('VERIFICATION SUCCESS: Data matches expected seeding volume.');
    } else {
      console.log('VERIFICATION WARNING: Data volume is lower than expected.');
    }

    process.exit();
  } catch (error) {
    console.error('Audit failed:', error);
    process.exit(1);
  }
};

verifyData();
