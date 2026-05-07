import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * A wrapper component for routes that require authentication.
 * @param {Object} props
 * @param {string} props.authKey - The key in localStorage to check for authentication (e.g., 'pos_access', 'admin_access')
 * @param {string} props.redirectPath - The path to redirect to if authentication fails
 * @param {React.ReactNode} props.children - The children to render if authenticated
 */
const ProtectedRoute = ({ authKey, redirectPath, children }) => {
  const isAuthenticated = localStorage.getItem(authKey);
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login page but save the current location they were trying to access
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
