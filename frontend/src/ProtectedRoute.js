// ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute = ({ element }) => {
  const { isAuthenticated } = useAuth();
  console.log("ProtectedRoute",isAuthenticated);

  return isAuthenticated ? element : <Navigate to="/login" />;
};

export default ProtectedRoute;
