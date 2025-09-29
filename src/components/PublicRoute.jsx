// components/PublicRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CircularProgress, Box } from '@mui/material';

/**
 * PublicRoute - Redirects authenticated users away from public pages (login, signup)
 * Useful for preventing logged-in users from accessing login/signup pages
 * @param {React.ReactNode} children - The component to render if not authenticated
 */
const PublicRoute = ({ children }) => {
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

  // If user is authenticated, redirect them to their dashboard
  if (isAuthenticated()) {
    const role = getUserRole();
    
    // Check if there's a saved location to return to
    const from = location.state?.from?.pathname;
    
    // Determine redirect destination
    let redirectTo = '/products'; // default for regular users
    
    if (from && from !== '/login' && from !== '/signup') {
      // Return to where they came from (unless it was login/signup)
      redirectTo = from;
    } else {
      // Redirect based on role
      if (role === 'superuser') {
        redirectTo = '/admin';
      } else if (role === 'vendor') {
        redirectTo = '/vendor';
      }
    }
    
    return <Navigate to={redirectTo} replace />;
  }

  // User is not authenticated, show the public page
  return children;
};

export default PublicRoute;
