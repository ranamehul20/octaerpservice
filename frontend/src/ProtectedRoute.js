// ProtectedRoute.js
import React, { useEffect } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute = ({ element }) => {
  const { isAuthenticated, loading, checkAuth } = useAuth();
  const location = useLocation();

  // List of routes that don't require authentication
  const publicRoutes = ['/forgot-password'];

  useEffect(() => {
    // Only check authentication if the route is not public
    if (!publicRoutes.includes(location.pathname)) {
      checkAuth();
    }
  }, [location.pathname, checkAuth]);

  // Allow access to public routes
  if (publicRoutes.includes(location.pathname)) {
    return element;
  }

  // Show a loading state until the authentication check completes
  if (loading) {
    return <div>Loading...</div>;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the protected element
  return element;
};

export default ProtectedRoute;
