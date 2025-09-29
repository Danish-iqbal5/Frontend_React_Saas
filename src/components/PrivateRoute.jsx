// components/PrivateRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CircularProgress, Box } from '@mui/material';

/**
 * PrivateRoute - Protects routes that require authentication
 * @param {React.ReactNode} children - The component to render if authorized
 * @param {string|string[]} allowedRoles - Role(s) required to access this route
 * @param {string} redirectTo - Where to redirect if not authorized
 */
const PrivateRoute = ({ 
  children, 
  allowedRoles = null, 
  redirectTo = "/login" 
}) => {
  const { isAuthenticated, getUserRole, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <CircularProgress size={50} />
      </Box>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated()) {
    // Save the location they were trying to access
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check if user has required role
  if (allowedRoles) {
    const userRole = getUserRole();
    const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    
    if (!rolesArray.includes(userRole)) {
      // Redirect based on user's actual role
      const redirectPath = userRole === 'superuser' ? '/admin' : 
                          userRole === 'vendor' ? '/vendor' : 
                          '/products';
      
      return <Navigate to={redirectPath} replace />;
    }
  }

  return children;
};

export default PrivateRoute;
