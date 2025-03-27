import React, { useEffect } from 'react';
import { useLocation, Navigate, matchPath } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute = ({ element }) => {
  const { isAuthenticated, loading, checkAuth } = useAuth();
  const location = useLocation();

  // List of routes that don't require authentication
  const publicRoutes = [
    '/forgot-password',
    '/privacy-policy',
    '/reset-password/:token',
  ];

  const isPublicRoute = publicRoutes.some((route) =>
    matchPath(route, location.pathname)
  );

  useEffect(() => {
    if (!isPublicRoute) {
      checkAuth();
    }
  }, [location.pathname, checkAuth, isPublicRoute]);

  if (isPublicRoute) {
    return element;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return element;
};

export default ProtectedRoute;
