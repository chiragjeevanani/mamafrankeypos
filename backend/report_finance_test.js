const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

const runTest = async () => {
  try {
    console.log('--- STARTING REPORT & FINANCE AUDIT INTEGRATION TEST ---');

    // 1. Admin Login
    console.log('1. Testing Admin Login...');
    const adminRes = await axios.post(`${API_URL}/auth/admin/login`, {
      email: 'admin@mamafrankey.com',
      password: 'admin123'
    });
    const adminToken = adminRes.data.token;
    const authHeader = { headers: { Authorization: `Bearer ${adminToken}` } };
    console.log('✅ Admin Login Successful');

    // 2. Fetch Sales Reports
    console.log('2. Fetching Sales Reports...');
    const salesReportRes = await axios.get(`${API_URL}/reports/sales`, authHeader);
    const reportData = salesReportRes.data;
    if (reportData.summary && reportData.trends && reportData.topItems && reportData.hourlySales) {
      console.log('✅ Sales Reports structure verified');
    } else {
      throw new Error('Malformed Sales Reports response');
    }

    // 3. Test waiter validation format
    console.log('3. Verifying waiter ID validation checks...');
    try {
      await axios.get(`${API_URL}/reports/sales?waiter=invalid-waiter-id`, authHeader);
      throw new Error('Invalid waiter ID format did not fail!');
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.message?.includes('Invalid Waiter ID format')) {
        console.log('✅ Correctly blocked invalid waiter ID format');
      } else {
        throw err;
      }
    }

    // 4. Test Expense Validation: Empty Title
    console.log('4. Verifying Expense validation: Empty Title...');
    try {
      await axios.post(`${API_URL}/expenses`, {
        title: '',
        category: 'Supplies',
        amount: 1500
      }, authHeader);
      throw new Error('Expense with empty title did not fail!');
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.message?.includes('Expense title is required')) {
        console.log('✅ Correctly blocked empty title');
      } else {
        throw err;
      }
    }

    // 5. Test Expense Validation: Invalid Category
    console.log('5. Verifying Expense validation: Invalid Category...');
    try {
      await axios.post(`${API_URL}/expenses`, {
        title: 'Office Supplies',
        category: 'InvalidCategory',
        amount: 1500
      }, authHeader);
      throw new Error('Expense with invalid category did not fail!');
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.message?.includes('Valid expense category is required')) {
        console.log('✅ Correctly blocked invalid category');
      } else {
        throw err;
      }
    }

    // 6. Test Expense Validation: Negative Amount
    console.log('6. Verifying Expense validation: Negative Amount...');
    try {
      await axios.post(`${API_URL}/expenses`, {
        title: 'Office Supplies',
        category: 'Supplies',
        amount: -50
      }, authHeader);
      throw new Error('Expense with negative amount did not fail!');
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.message?.includes('Amount must be a positive number')) {
        console.log('✅ Correctly blocked negative amount');
      } else {
        throw err;
      }
    }

    // 7. Create Valid Expense
    console.log('7. Creating Valid Expense...');
    const validExpenseRes = await axios.post(`${API_URL}/expenses`, {
      title: 'Audit Supplies',
      category: 'Supplies',
      amount: 1250,
      notes: 'Testing notes validation',
      date: '2026-06-04'
    }, authHeader);
    const expenseId = validExpenseRes.data._id;
    console.log('✅ Valid Expense Created:', validExpenseRes.data.title);

    // 8. Fetch Expenses (Pagination)
    console.log('8. Testing Expense Pagination...');
    const paginatedRes = await axios.get(`${API_URL}/expenses?page=1&limit=2`, authHeader);
    if (paginatedRes.data.data && paginatedRes.data.total !== undefined && paginatedRes.data.totalPages !== undefined) {
      console.log('✅ Expense Pagination verified');
    } else {
      throw new Error('Expense pagination response malformed');
    }

    // 9. Fetch Expenses (Unpaginated)
    console.log('9. Testing Unpaginated Expenses...');
    const unpaginatedRes = await axios.get(`${API_URL}/expenses`, authHeader);
    if (Array.isArray(unpaginatedRes.data)) {
      console.log('✅ Unpaginated Expenses format verified');
    } else {
      throw new Error('Unpaginated Expenses response is not an array');
    }

    // 10. Delete Expense
    console.log('10. Deleting Created Expense...');
    const deleteRes = await axios.delete(`${API_URL}/expenses/${expenseId}`, authHeader);
    if (deleteRes.data.message === 'Expense removed') {
      console.log('✅ Expense deleted successfully');
    } else {
      throw new Error('Failed to delete expense');
    }

    console.log('--- ALL REPORT & FINANCE AUDIT CHECKS PASSED SUCCESSFULLY ---');
    process.exit(0);
  } catch (error) {
    console.error('❌ TEST FAILED:', error.response?.data || error.message);
    process.exit(1);
  }
};

runTest();
