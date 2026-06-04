const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

const runTest = async () => {
  try {
    console.log('--- STARTING STAFF MANAGEMENT INTEGRATION TEST ---');

    // 1. Admin Login
    console.log('1. Testing Admin Login...');
    const adminRes = await axios.post(`${API_URL}/auth/admin/login`, {
      email: 'admin@mamafrankey.com',
      password: 'admin123'
    });
    const adminToken = adminRes.data.token;
    const authHeader = { headers: { Authorization: `Bearer ${adminToken}` } };
    console.log('✅ Admin Login Successful');

    // Pre-test cleanup: delete existing Test Role / Updated Test Role / Audit Staff One if they exist
    console.log('Cleaning up any leftover test data...');
    const allRolesBefore = await axios.get(`${API_URL}/roles`, authHeader);
    for (const r of allRolesBefore.data) {
      if (r.name === 'Test Role' || r.name === 'Updated Test Role') {
        // Find staff members with this role and remove them or change their role first
        const allStaff = await axios.get(`${API_URL}/staff`, authHeader);
        const staffList = allStaff.data.data || allStaff.data;
        for (const s of staffList) {
          if (s.role === r.name) {
            await axios.delete(`${API_URL}/staff/${s._id}`, authHeader);
          }
        }
        await axios.delete(`${API_URL}/roles/${r._id}`, authHeader);
      }
    }
    
    // Also clean up staff named 'Audit Staff One'
    const allStaffBefore = await axios.get(`${API_URL}/staff`, authHeader);
    const staffListBefore = allStaffBefore.data.data || allStaffBefore.data;
    for (const s of staffListBefore) {
      if (s.name === 'Audit Staff One') {
        await axios.delete(`${API_URL}/staff/${s._id}`, authHeader);
      }
    }
    console.log('✅ Cleanup finished');

    // 2. Try creating a role "Test Role"
    console.log('2. Creating Test Role...');
    const createRoleRes = await axios.post(`${API_URL}/roles`, {
      name: 'Test Role',
      description: 'A test role for audit verification',
      permissions: { canCreateOrder: true }
    }, authHeader);
    const testRoleId = createRoleRes.data._id;
    console.log('✅ Test Role Created:', createRoleRes.data.name);

    // 3. Try creating a duplicate case-insensitive role "test role"
    console.log('3. Verifying case-insensitive duplicate role creation prevention...');
    try {
      await axios.post(`${API_URL}/roles`, {
        name: 'test role',
        description: 'Should fail',
        permissions: { canCreateOrder: true }
      }, authHeader);
      throw new Error('Case-insensitive duplicate role creation did not fail!');
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.message?.includes('already exists')) {
        console.log('✅ Correctly blocked case-insensitive duplicate role creation');
      } else {
        throw err;
      }
    }

    // 4. Try renaming a system role (fetch all roles first to find system role ID)
    console.log('4. Fetching all roles to find Admin system role...');
    const rolesRes = await axios.get(`${API_URL}/roles`, authHeader);
    const adminRole = rolesRes.data.find(r => r.isSystemRole && r.name === 'Admin');
    if (!adminRole) {
      throw new Error('System Admin role not found!');
    }

    console.log('Trying to rename Admin system role...');
    try {
      await axios.put(`${API_URL}/roles/${adminRole._id}`, {
        name: 'SuperAdmin'
      }, authHeader);
      throw new Error('Renaming system role did not fail!');
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.message?.includes('System roles cannot be renamed')) {
        console.log('✅ Correctly blocked renaming system role');
      } else {
        throw err;
      }
    }

    // 5. Try deleting a system role
    console.log('5. Trying to delete Admin system role...');
    try {
      await axios.delete(`${API_URL}/roles/${adminRole._id}`, authHeader);
      throw new Error('Deleting system role did not fail!');
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.message?.includes('System roles cannot be deleted')) {
        console.log('✅ Correctly blocked deleting system role');
      } else {
        throw err;
      }
    }

    // 6. Create Staff 1 with Role "Test Role" and PIN "9876"
    console.log('6. Creating Staff 1 with Role "Test Role" and PIN "9876"...');
    const email1 = `staff1_${Date.now()}@mamafrankey.com`;
    const staff1Res = await axios.post(`${API_URL}/staff`, {
      name: 'Audit Staff One',
      email: email1,
      phone: '9876543210',
      role: 'Test Role',
      pin: '9876'
    }, authHeader);
    const staff1Id = staff1Res.data._id;
    console.log('✅ Staff 1 Created successfully');

    // 7. Try to create Staff 2 with duplicate PIN "9876"
    console.log('7. Verifying duplicate PIN prevention on staff registration...');
    try {
      const email2 = `staff2_${Date.now()}@mamafrankey.com`;
      await axios.post(`${API_URL}/staff`, {
        name: 'Audit Staff Two',
        email: email2,
        phone: '9876543211',
        role: 'Test Role',
        pin: '9876'
      }, authHeader);
      throw new Error('Duplicate PIN registration did not fail!');
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.message?.includes('PIN is already assigned')) {
        console.log('✅ Correctly blocked registration of staff with duplicate PIN');
      } else {
        throw err;
      }
    }

    // 8. Try updating Staff 1 with its own PIN "9876" (should succeed)
    console.log('8. Updating Staff 1 with its own PIN "9876" (should succeed)...');
    await axios.put(`${API_URL}/staff/${staff1Id}`, {
      pin: '9876'
    }, authHeader);
    console.log('✅ Successfully updated staff PIN to its own value');

    // 9. Try updating Staff 1 to use a duplicate PIN of an existing active user (e.g., pos PIN is 1234)
    console.log('9. Updating Staff 1 with a duplicate PIN "1234" (should fail)...');
    try {
      await axios.put(`${API_URL}/staff/${staff1Id}`, {
        pin: '1234'
      }, authHeader);
      throw new Error('Duplicate PIN update did not fail!');
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.message?.includes('PIN is already assigned')) {
        console.log('✅ Correctly blocked update of staff with duplicate PIN');
      } else {
        throw err;
      }
    }

    // 10. Try deleting role "Test Role" while Staff 1 is assigned to it (should fail)
    console.log('10. Deleting role "Test Role" with assigned staff (should fail)...');
    try {
      await axios.delete(`${API_URL}/roles/${testRoleId}`, authHeader);
      throw new Error('Deleting role with active staff did not fail!');
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.message?.includes('active staff member')) {
        console.log('✅ Correctly blocked role deletion when staff are assigned');
      } else {
        throw err;
      }
    }

    // 11. Rename "Test Role" to "Updated Test Role" and verify cascading update
    console.log('11. Renaming "Test Role" to "Updated Test Role" (should cascade)...');
    const updateRoleRes2 = await axios.put(`${API_URL}/roles/${testRoleId}`, {
      name: 'Updated Test Role'
    }, authHeader);
    console.log('Role updated:', updateRoleRes2.data.name);

    // Verify Staff 1 role is now "Updated Test Role"
    const staffRes = await axios.get(`${API_URL}/staff`, authHeader);
    const updatedStaff1 = staffRes.data.data ? staffRes.data.data.find(s => s._id === staff1Id) : staffRes.data.find(s => s._id === staff1Id);
    if (!updatedStaff1) {
      throw new Error('Staff 1 not found in staff list!');
    }
    if (updatedStaff1.role === 'Updated Test Role') {
      console.log('✅ Cascade role rename succeeded. Staff 1 role updated to "Updated Test Role".');
    } else {
      throw new Error(`Cascade role rename failed. Staff 1 role is still "${updatedStaff1.role}"`);
    }

    // 12. Cleanup: Change Staff 1 role to "Waiter" so "Updated Test Role" is free
    console.log('12. Cleaning up: Assign Staff 1 to Waiter role...');
    await axios.put(`${API_URL}/staff/${staff1Id}`, {
      role: 'Waiter'
    }, authHeader);

    // Delete "Updated Test Role"
    console.log('Deleting "Updated Test Role"...');
    await axios.delete(`${API_URL}/roles/${testRoleId}`, authHeader);
    console.log('✅ Role deleted successfully');

    // Delete Staff 1 (soft delete)
    console.log('Deleting Staff 1...');
    await axios.delete(`${API_URL}/staff/${staff1Id}`, authHeader);
    console.log('✅ Staff 1 deleted successfully');

    console.log('--- ALL STAFF MANAGEMENT AUDIT CHECKS PASSED SUCCESSFULLY ---');
    process.exit(0);
  } catch (error) {
    console.error('❌ TEST FAILED:', error.response?.data || error.message);
    process.exit(1);
  }
};

runTest();
