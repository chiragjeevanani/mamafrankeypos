import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const BranchContext = createContext();

export const useBranchContext = () => {
  const ctx = useContext(BranchContext);
  if (!ctx) throw new Error('useBranchContext must be used inside BranchProvider');
  return ctx;
};

export const BranchProvider = ({ children }) => {
  const [branches, setBranches] = useState([]);
  const [activeBranch, setActiveBranchState] = useState(() => {
    // Restore from localStorage (survives page refresh)
    return localStorage.getItem('admin_active_branch') || 'all';
  });
  const [loading, setLoading] = useState(false);

  const activeBranchLabel = activeBranch === 'all'
    ? 'All Branches'
    : branches.find(b => b._id === activeBranch)?.name || 'Branch';

  const setActiveBranch = useCallback((branchId) => {
    setActiveBranchState(branchId);
    localStorage.setItem('admin_active_branch', branchId);
  }, []);

  const fetchBranches = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/branches');
      setBranches(data || []);
    } catch (err) {
      console.error('Failed to fetch branches:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Fetch branches only if admin token exists
    const adminToken = localStorage.getItem('admin_access');
    if (adminToken) {
      fetchBranches();
    }
  }, [fetchBranches]);

  return (
    <BranchContext.Provider value={{
      branches,
      activeBranch,
      setActiveBranch,
      activeBranchLabel,
      loading,
      fetchBranches,
    }}>
      {children}
    </BranchContext.Provider>
  );
};

export default BranchContext;
