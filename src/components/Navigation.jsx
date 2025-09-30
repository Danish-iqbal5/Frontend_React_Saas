// components/Navigation.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Badge,
  Tooltip,
  Divider,
  Avatar,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  ShoppingCart as CartIcon,
  Store as StoreIcon,
  Menu as MenuIcon,
  Home as HomeIcon,
  Dashboard as DashboardIcon,
  AdminPanelSettings as AdminIcon,
  Logout as LogoutIcon,
  Login as LoginIcon,
  PersonAdd as SignupIcon,
} from '@mui/icons-material';

const Navigation = () => {
  const { isAuthenticated, getUserRole, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [anchorEl, setAnchorEl] = useState(null);

  const userRole = getUserRole();
  const isLoggedIn = isAuthenticated();

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  const handleNavigation = (path) => {
    handleMenuClose();
    navigate(path);
  };

  // Don't show navigation on login, signup pages
  const hideNav = ['/login', '/signup', '/verify-otp', '/forgot-password', '/reset-password'].includes(location.pathname);
  
  if (hideNav) {
    return null;
  }

  return (
    <AppBar position="sticky" sx={{ mb: 0 }}>
      <Toolbar>
        {/* Logo/Brand */}
        <Box
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            cursor: 'pointer', 
            flexGrow: 0,
            mr: 3 
          }}
          onClick={() => navigate('/')}
        >
          <StoreIcon sx={{ mr: 1, fontSize: 28 }} />
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              fontWeight: 'bold',
              display: { xs: 'none', sm: 'block' }
            }}
          >
            MyStore
          </Typography>
        </Box>

        {/* Desktop Navigation Links */}
        {!isMobile && (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexGrow: 1 }}>
            <Button
              color="inherit"
              startIcon={<HomeIcon />}
              onClick={() => navigate('/')}
              sx={{ textTransform: 'none' }}
            >
              Home
            </Button>

            {isLoggedIn && (
              <>
                <Button
                  color="inherit"
                  startIcon={<StoreIcon />}
                  onClick={() => navigate('/products')}
                  sx={{ textTransform: 'none' }}
                >
                  Products
                </Button>

                <Tooltip title="View Cart">
                  <IconButton
                    color="inherit"
                    onClick={() => navigate('/cart')}
                  >
                    <Badge badgeContent={0} color="error">
                      <CartIcon />
                    </Badge>
                  </IconButton>
                </Tooltip>

                {userRole === 'vendor' && (
                  <Button
                    color="inherit"
                    startIcon={<DashboardIcon />}
                    onClick={() => navigate('/vendor')}
                    sx={{ textTransform: 'none' }}
                  >
                    Dashboard
                  </Button>
                )}

                {userRole === 'superuser' && (
                  <Button
                    color="inherit"
                    startIcon={<AdminIcon />}
                    onClick={() => navigate('/admin')}
                    sx={{ textTransform: 'none' }}
                  >
                    Admin
                  </Button>
                )}
              </>
            )}
          </Box>
        )}

        {/* Spacer for mobile */}
        {isMobile && <Box sx={{ flexGrow: 1 }} />}

        {/* User Menu / Auth Buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isLoggedIn ? (
            <>
              {/* Desktop: Avatar + Menu */}
              {!isMobile && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" sx={{ mr: 1 }}>
                    {user?.email}
                  </Typography>
                  <Tooltip title="Account menu">
                    <IconButton
                      color="inherit"
                      onClick={handleMenuOpen}
                      size="small"
                    >
                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.dark' }}>
                        {user?.email?.charAt(0).toUpperCase() || 'U'}
                      </Avatar>
                    </IconButton>
                  </Tooltip>
                </Box>
              )}

              {/* Mobile: Hamburger Menu */}
              {isMobile && (
                <IconButton
                  color="inherit"
                  onClick={handleMenuOpen}
                  size="large"
                >
                  <MenuIcon />
                </IconButton>
              )}

              {/* Dropdown Menu */}
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                  sx: { minWidth: 200 }
                }}
              >
                {/* User Info */}
                <MenuItem disabled sx={{ opacity: 1, flexDirection: 'column', alignItems: 'flex-start' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    {user?.email}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {userRole === 'superuser' ? 'Administrator' : 
                     userRole === 'vendor' ? 'Vendor' : 
                     'Customer'}
                  </Typography>
                </MenuItem>
                <Divider />

                {/* Mobile Navigation Links */}
                {isMobile && (
                  <>
                    <MenuItem onClick={() => handleNavigation('/')}>
                      <HomeIcon sx={{ mr: 1 }} fontSize="small" /> Home
                    </MenuItem>
                    <MenuItem onClick={() => handleNavigation('/products')}>
                      <StoreIcon sx={{ mr: 1 }} fontSize="small" /> Products
                    </MenuItem>
                    <MenuItem onClick={() => handleNavigation('/cart')}>
                      <CartIcon sx={{ mr: 1 }} fontSize="small" /> Cart
                    </MenuItem>
                    {userRole === 'vendor' && (
                      <MenuItem onClick={() => handleNavigation('/vendor')}>
                        <DashboardIcon sx={{ mr: 1 }} fontSize="small" /> Dashboard
                      </MenuItem>
                    )}
                    {userRole === 'superuser' && (
                      <MenuItem onClick={() => handleNavigation('/admin')}>
                        <AdminIcon sx={{ mr: 1 }} fontSize="small" /> Admin Panel
                      </MenuItem>
                    )}
                    <Divider />
                  </>
                )}

                {/* Logout - Always visible */}
                <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                  <LogoutIcon sx={{ mr: 1 }} fontSize="small" /> Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            // Not logged in - Show Login/Signup
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                color="inherit"
                startIcon={!isMobile && <LoginIcon />}
                onClick={() => navigate('/login')}
                sx={{ textTransform: 'none' }}
              >
                Login
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                startIcon={!isMobile && <SignupIcon />}
                onClick={() => navigate('/signup')}
                sx={{ 
                  textTransform: 'none',
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  '&:hover': {
                    borderColor: 'rgba(255, 255, 255, 0.8)',
                  }
                }}
              >
                Sign Up
              </Button>
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;
