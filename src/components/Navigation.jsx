// components/Navigation.jsx
import React from 'react';
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
} from '@mui/material';
import {
  ShoppingCart as CartIcon,
  Store as StoreIcon,
  AccountCircle as AccountIcon,
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
  const [anchorEl, setAnchorEl] = React.useState(null);

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
    <AppBar position="sticky" sx={{ mb: 3 }}>
      <Toolbar>
        {/* Logo/Brand */}
        <Box
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', flexGrow: 0 }}
          onClick={() => navigate('/')}
        >
          <StoreIcon sx={{ mr: 1, fontSize: 28 }} />
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
            MyStore
          </Typography>
        </Box>

        {/* Spacer */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Navigation Links */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, alignItems: 'center' }}>
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

        {/* User Menu / Auth Buttons */}
        <Box sx={{ ml: 2 }}>
          {isLoggedIn ? (
            <>
              <Tooltip title="Account">
                <IconButton
                  color="inherit"
                  onClick={handleMenuOpen}
                  sx={{ display: { xs: 'none', md: 'flex' } }}
                >
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.dark' }}>
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </Avatar>
                </IconButton>
              </Tooltip>

              {/* Mobile Menu */}
              <IconButton
                color="inherit"
                onClick={handleMenuOpen}
                sx={{ display: { xs: 'flex', md: 'none' } }}
              >
                <MenuIcon />
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                {/* User Info */}
                <MenuItem disabled sx={{ opacity: 1 }}>
                  <Box>
                    <Typography variant="subtitle2">{user?.email}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {userRole === 'superuser' ? 'Admin' : userRole?.charAt(0).toUpperCase() + userRole?.slice(1)}
                    </Typography>
                  </Box>
                </MenuItem>
                <Divider />

                {/* Mobile Navigation */}
                <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                  <MenuItem onClick={() => handleNavigation('/')}>
                    <HomeIcon sx={{ mr: 1 }} /> Home
                  </MenuItem>
                  <MenuItem onClick={() => handleNavigation('/products')}>
                    <StoreIcon sx={{ mr: 1 }} /> Products
                  </MenuItem>
                  <MenuItem onClick={() => handleNavigation('/cart')}>
                    <CartIcon sx={{ mr: 1 }} /> Cart
                  </MenuItem>
                  {userRole === 'vendor' && (
                    <MenuItem onClick={() => handleNavigation('/vendor')}>
                      <DashboardIcon sx={{ mr: 1 }} /> Dashboard
                    </MenuItem>
                  )}
                  {userRole === 'superuser' && (
                    <MenuItem onClick={() => handleNavigation('/admin')}>
                      <AdminIcon sx={{ mr: 1 }} /> Admin
                    </MenuItem>
                  )}
                  <Divider />
                </Box>

                {/* Logout */}
                <MenuItem onClick={handleLogout}>
                  <LogoutIcon sx={{ mr: 1 }} /> Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                color="inherit"
                startIcon={<LoginIcon />}
                onClick={() => navigate('/login')}
                sx={{ textTransform: 'none' }}
              >
                Login
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<SignupIcon />}
                onClick={() => navigate('/signup')}
                sx={{ textTransform: 'none' }}
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
