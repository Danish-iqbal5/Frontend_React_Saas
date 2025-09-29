import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  Alert,
  IconButton,
  Badge,
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import HomeIcon from '@mui/icons-material/Home';
import StorefrontIcon from '@mui/icons-material/Storefront';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import StoreIcon from '@mui/icons-material/Store';

function Homepage() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({
    token: null,
    role: null,
    email: null
  });


  useEffect(() => {
    const checkUserStatus = () => {
      const token = localStorage.getItem('tokens');
      const role = localStorage.getItem('role');
      const email = localStorage.getItem('email');
      
      setUserInfo({
        token: token,
        role: role,
        email: email
      });
    };

    checkUserStatus();
    

    window.addEventListener('storage', checkUserStatus);
    
    return () => {
      window.removeEventListener('storage', checkUserStatus);
    };
  }, []);

  
  const handleLogout = () => {

    localStorage.clear();
    
    
    setUserInfo({
      token: null,
      role: null,
      email: null
    });
    

    navigate('/');
  };

  
  const isLoggedIn = !!userInfo.token;
  const isAdmin = userInfo.role === 'admin';
  const isVendor = userInfo.role === 'vendor';

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <StoreIcon sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Product Store
          </Typography>
          
          
          <Button 
            color="inherit" 
            component={Link} 
            to="/"
            startIcon={<HomeIcon />}
          >
            Home
          </Button>
          
          <Button 
            color="inherit" 
            component={Link} 
            to="/products"
            startIcon={<StorefrontIcon />}
          >
            Products
          </Button>

          
          {isLoggedIn && (
            <Button 
              color="inherit" 
              component={Link} 
              to="/cart"
              startIcon={<ShoppingCartIcon />}
            >
              Cart
            </Button>
          )}

        
          {isAdmin && (
            <Button 
              color="inherit" 
              component={Link} 
              to="/admin"
              startIcon={<AdminPanelSettingsIcon />}
            >
              Admin
            </Button>
          )}
          
         
          {isVendor && (
            <Button 
              color="inherit" 
              component={Link} 
              to="/vendor"
              startIcon={<StoreIcon />}
            >
              Vendor
            </Button>
          )}
          
    
          {!isLoggedIn ? (
            <>
              <Button 
                color="inherit" 
                component={Link} 
                to="/login"
                startIcon={<LoginIcon />}
              >
                Login
              </Button>
              <Button 
                color="inherit" 
                component={Link} 
                to="/signup"
                startIcon={<PersonAddIcon />}
              >
                Sign Up
              </Button>
            </>
          ) : (
            <Button 
              color="inherit" 
              onClick={handleLogout}
              startIcon={<LogoutIcon />}
            >
              Logout
            </Button>
          )}
        </Toolbar>
      </AppBar>

    
      <Container sx={{ mt: 4 }}>
        <Typography variant="h3" gutterBottom align="center">
          Welcome to Product Store
        </Typography>
        
    
        {isLoggedIn && (
          <Alert severity="info" sx={{ mb: 3 }}>
            Welcome back! You are logged in as <strong>{userInfo.email}</strong> ({userInfo.role})
          </Alert>
        )}

        
        <Grid container spacing={3} sx={{ mt: 4 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h5" gutterBottom color="primary">
                  Quality Products
                </Typography>
                <Typography variant="body1">
                  Browse through our collection of high-quality products from verified vendors.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h5" gutterBottom color="primary">
                  Secure Shopping
                </Typography>
                <Typography variant="body1">
                  Shop with confidence. All transactions are secure and protected.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h5" gutterBottom color="primary">
                  Fast Delivery
                </Typography>
                <Typography variant="body1">
                  Get your products delivered quickly to your doorstep.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

    
        <Box sx={{ mt: 6, textAlign: 'center', p: 4 }}>
          {!isLoggedIn ? (
            <Card sx={{ p: 3, backgroundColor: '#f5f5f5' }}>
              <Typography variant="h4" gutterBottom>
                Join Our Community!
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                Sign up today to start shopping and get exclusive deals
              </Typography>
              <Box>
                <Button 
                  variant="contained" 
                  size="large" 
                  component={Link} 
                  to="/signup"
                  sx={{ mr: 2 }}
                  startIcon={<PersonAddIcon />}
                >
                  Sign Up Now
                </Button>
                <Button 
                  variant="outlined" 
                  size="large" 
                  component={Link} 
                  to="/login"
                  startIcon={<LoginIcon />}
                >
                  Login
                </Button>
              </Box>
            </Card>
          ) : (
            <Card sx={{ p: 3, backgroundColor: '#e3f2fd' }}>
              <Typography variant="h4" gutterBottom>
                Start Shopping Today!
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                Explore our wide range of products
              </Typography>
              <Button 
                variant="contained" 
                size="large" 
                component={Link} 
                to="/products"
                startIcon={<StorefrontIcon />}
              >
                Browse Products
              </Button>
            </Card>
          )}
        </Box>

    
        <Box sx={{ mt: 6 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Why Choose Us?
          </Typography>
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="primary">
                  ✓ Verified Vendors
                </Typography>
                <Typography variant="body2">
                  All our vendors are verified and trusted
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="primary">
                  ✓ Best Prices
                </Typography>
                <Typography variant="body2">
                  Competitive prices on all products
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="primary">
                  ✓ 24/7 Support
                </Typography>
                <Typography variant="body2">
                  Customer support available anytime
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="primary">
                  ✓ Easy Returns
                </Typography>
                <Typography variant="body2">
                  Hassle-free return policy
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}

export default Homepage;
