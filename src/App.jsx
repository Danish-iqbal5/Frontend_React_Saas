import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';

import theme from './theme';
import Navigation from './components/Navigation';
import Signup from './pages/Signup';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import SetPassword from './pages/SetPassword';
import AdminDashboard from './pages/AdminDashboard';
import VendorDashboard from './pages/VendorDashboard';
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';
import VerifyOTP from './pages/VerifyOTP';
import Homepage from './pages/Homepage';
import Products from './pages/Products';
import Cart from './pages/Cart';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          bgcolor: 'background.default',
          color: 'text.primary',
          minHeight: '100vh',
        }}
      >
        <Navigation />
        <main>
          <Routes>
            {/* Public routes - accessible to all */}
            <Route path="/" element={<Homepage />} />
            
            {/* Auth routes - redirect to dashboard if already logged in */}
            <Route 
              path="/signup" 
              element={
                <PublicRoute>
                  <Signup />
                </PublicRoute>
              } 
            />
            <Route 
              path="/verify-otp" 
              element={
                <PublicRoute>
                  <VerifyOTP />
                </PublicRoute>
              } 
            />
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />
            <Route 
              path="/forgot-password" 
              element={
                <PublicRoute>
                  <ForgotPassword />
                </PublicRoute>
              } 
            />
            <Route 
              path="/reset-password" 
              element={
                <PublicRoute>
                  <ResetPassword />
                </PublicRoute>
              } 
            />
            <Route 
              path="/set-password/:userId" 
              element={
                <PublicRoute>
                  <SetPassword />
                </PublicRoute>
              } 
            />

            {/* Protected routes - require authentication */}
            <Route
              path="/products"
              element={
                <PrivateRoute>
                  <Products />
                </PrivateRoute>
              }
            />
            <Route
              path="/cart"
              element={
                <PrivateRoute>
                  <Cart />
                </PrivateRoute>
              }
            />

            {/* Role-based protected routes */}
            <Route
              path="/vendor"
              element={
                <PrivateRoute allowedRoles="vendor">
                  <VendorDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <PrivateRoute allowedRoles="superuser">
                  <AdminDashboard />
                </PrivateRoute>
              }
            />

            {/* 404 fallback - you can create a NotFound component later */}
            <Route 
              path="*" 
              element={
                <Box sx={{ textAlign: 'center', mt: 8 }}>
                  <h1>404 - Page Not Found</h1>
                  <p>The page you're looking for doesn't exist.</p>
                </Box>
              } 
            />
          </Routes>
        </main>
      </Box>
    </ThemeProvider>
  );
}
