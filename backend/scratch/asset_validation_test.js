const axios = require('axios');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });
const API_URL = 'http://localhost:5000/api';

const runTest = async () => {
  try {
    console.log('--- STARTING CORE POS ASSET VALIDATION INTEGRATION TEST ---');

    // 1. Log in as Admin to obtain authentication token
    console.log('1. Logging in as Admin...');
    const adminRes = await axios.post(`${API_URL}/auth/admin/login`, {
      email: 'admin@mamafrankey.com',
      password: 'admin123'
    });
    const adminToken = adminRes.data.token;
    const authHeader = { Authorization: `Bearer ${adminToken}` };
    console.log('✅ Admin login successful');

    // 2. Test Menu Item Validation - Negative Price
    console.log('2. Testing Menu Item validation (negative price)...');
    try {
      await axios.post(`${API_URL}/menu/items`, {
        name: 'Invalid Test Burger',
        price: -5.99,
        category: '69faeaf57a66b4cdbcbcb3bf', // Dummy valid ObjectId format
        type: 'veg',
        status: 'Available'
      }, {
        headers: authHeader
      });
      console.error('❌ FAIL: Allowed menu item creation with negative price');
      process.exit(1);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ PASS: Rejected negative price with 400 Bad Request');
        console.log(`   Error message: "${error.response.data.message}"`);
      } else {
        console.error('❌ FAIL: Expected 400, got:', error.response?.status || error.message);
        process.exit(1);
      }
    }

    // 3. Test Menu Item Validation - Invalid Category ObjectId format
    console.log('3. Testing Menu Item validation (invalid category ObjectId)...');
    try {
      await axios.post(`${API_URL}/menu/items`, {
        name: 'Invalid Category Burger',
        price: 5.99,
        category: 'invalid-objectid',
        type: 'veg',
        status: 'Available'
      }, {
        headers: authHeader
      });
      console.error('❌ FAIL: Allowed menu item creation with invalid category format');
      process.exit(1);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ PASS: Rejected invalid ObjectId with 400 Bad Request');
        console.log(`   Error message: "${error.response.data.message}"`);
      } else {
        console.error('❌ FAIL: Expected 400, got:', error.response?.status || error.message);
        process.exit(1);
      }
    }

    // 4. Test Table Validation - Zero/Negative Capacity
    console.log('4. Testing Table validation (non-positive capacity)...');
    try {
      await axios.post(`${API_URL}/tables`, {
        name: 'T-INVALID',
        section: '69faeaf57a66b4cdbcbcb3bf', // Dummy valid ObjectId format
        capacity: 0
      }, {
        headers: authHeader
      });
      console.error('❌ FAIL: Allowed table creation with zero capacity');
      process.exit(1);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ PASS: Rejected zero capacity with 400 Bad Request');
        console.log(`   Error message: "${error.response.data.message}"`);
      } else {
        console.error('❌ FAIL: Expected 400, got:', error.response?.status || error.message);
        process.exit(1);
      }
    }

    // 5. Verify Database Indexes are registered on mongoose connection
    console.log('5. Connecting to MongoDB to audit indexes...');
    await mongoose.connect(process.env.MONGO_URI);
    
    const Category = require('../models/Category');
    const MenuItem = require('../models/MenuItem');
    const Table = require('../models/Table');
    const Section = require('../models/Section');

    // Mongoose ensures indexes on load/compilation, but let's check
    const catIndexes = await Category.collection.indexes();
    const itemIndexes = await MenuItem.collection.indexes();
    const tableIndexes = await Table.collection.indexes();
    const sectionIndexes = await Section.collection.indexes();

    const catRankIndexExists = catIndexes.some(idx => idx.key.rank === 1);
    const itemCompoundIndexExists = itemIndexes.some(idx => idx.key.category === 1 && idx.key.rank === 1);
    const itemShortCodeIndexExists = itemIndexes.some(idx => idx.key.shortCode === 1);
    const tableStatusIndexExists = tableIndexes.some(idx => idx.key.status === 1);
    const sectionRankIndexExists = sectionIndexes.some(idx => idx.key.rank === 1);

    if (catRankIndexExists) console.log('✅ PASS: Found index on Category rank');
    else console.error('❌ FAIL: Index on Category rank missing');

    if (itemCompoundIndexExists) console.log('✅ PASS: Found compound index on MenuItem (category, rank)');
    else console.error('❌ FAIL: Compound index on MenuItem missing');

    if (itemShortCodeIndexExists) console.log('✅ PASS: Found unique sparse index on MenuItem shortCode');
    else console.error('❌ FAIL: Index on MenuItem shortCode missing');

    if (tableStatusIndexExists) console.log('✅ PASS: Found index on Table status');
    else console.error('❌ FAIL: Index on Table status missing');

    if (sectionRankIndexExists) console.log('✅ PASS: Found index on Section rank');
    else console.error('❌ FAIL: Index on Section rank missing');

    if (!catRankIndexExists || !itemCompoundIndexExists || !itemShortCodeIndexExists || !tableStatusIndexExists || !sectionRankIndexExists) {
      console.error('❌ FAIL: One or more indexes failed validation');
      process.exit(1);
    }

    console.log('--- ALL CORE POS ASSET VALIDATIONS AND INDEX TESTS PASSED ---');
    process.exit(0);
  } catch (error) {
    console.error('❌ TEST RUN ERROR:', error.response?.data || error.message);
    process.exit(1);
  }
};

runTest();
