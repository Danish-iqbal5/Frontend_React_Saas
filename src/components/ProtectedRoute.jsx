// components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CircularProgress, Box } from '@mui/material';

const ProtectedRoute = ({ children, requiredRole = null, redirectTo = "/login" }) => {
  const { isAuthenticated, hasRole, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress size={50} />
      </Box>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated()) {
    // Redirect to login with return url
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check if user has required role
  if (requiredRole && !hasRole(requiredRole)) {
    // Redirect to home or appropriate page based on role
    return <Navigate to="/" replace />;
  }

  return children;
};

// Component for redirecting authenticated users away from login/signup pages
export const PublicRoute = ({ children }) => {
  const { isAuthenticated, getUserRole, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress size={50} />
      </Box>
    );
  }

  // If user is authenticated, redirect them based on their role
  if (isAuthenticated()) {
    const role = getUserRole();
    const from = location.state?.from?.pathname || 
                 (role === 'superuser' ? '/admin' : 
                  role === 'vendor' ? '/vendor' : 
                  '/products');
    
    return <Navigate to={from} replace />;
  }

  return children;
};

export default ProtectedRoute;