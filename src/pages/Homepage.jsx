import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  Alert,
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  Login as LoginIcon,
  Storefront as StorefrontIcon,
} from '@mui/icons-material';

function Homepage() {
  const navigate = useNavigate();
  const { isAuthenticated, user, getUserRole } = useAuth();

  const isLoggedIn = isAuthenticated();
  const userRole = getUserRole();

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Main Content */}
      <Container sx={{ mt: 4, mb: 4, px: { xs: 2, sm: 3 } }}>
        <Typography variant="h3" gutterBottom align="center" sx={{ fontWeight: 'bold' }}>
          Welcome to MyStore
        </Typography>
        
        {/* User Welcome Message */}
        {isLoggedIn && (
          <Alert severity="info" sx={{ mb: 3 }}>
            Welcome back, <strong>{user?.email}</strong>! 
            {userRole === 'superuser' && ' (Administrator)'}
            {userRole === 'vendor' && ' (Vendor)'}
          </Alert>
        )}

        {/* Feature Cards */}
        <Grid container spacing={3} sx={{ mt: 4 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
              <CardContent>
                <Typography variant="h5" gutterBottom color="primary" sx={{ fontWeight: 'bold' }}>
                  Quality Products
                </Typography>
                <Typography variant="body1">
                  Browse through our collection of high-quality products from verified vendors.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
              <CardContent>
                <Typography variant="h5" gutterBottom color="primary" sx={{ fontWeight: 'bold' }}>
                  Secure Shopping
                </Typography>
                <Typography variant="body1">
                  Shop with confidence. All transactions are secure and protected.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
              <CardContent>
                <Typography variant="h5" gutterBottom color="primary" sx={{ fontWeight: 'bold' }}>
                  Fast Delivery
                </Typography>
                <Typography variant="body1">
                  Get your products delivered quickly to your doorstep.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Call to Action */}
        <Box sx={{ mt: 6, textAlign: 'center', p: 4 }}>
          {!isLoggedIn ? (
            <Card sx={{ p: 4, backgroundColor: 'primary.light', color: 'primary.contrastText' }}>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                Join Our Community!
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, fontSize: '1.1rem' }}>
                Sign up today to start shopping and get exclusive deals
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button 
                  variant="contained" 
                  size="large" 
                  onClick={() => navigate('/signup')}
                  startIcon={<PersonAddIcon />}
                  sx={{ 
                    backgroundColor: 'white',
                    color: 'primary.main',
                    '&:hover': {
                      backgroundColor: 'grey.100'
                    }
                  }}
                >
                  Sign Up Now
                </Button>
                <Button 
                  variant="outlined" 
                  size="large" 
                  onClick={() => navigate('/login')}
                  startIcon={<LoginIcon />}
                  sx={{ 
                    borderColor: 'white',
                    color: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                >
                  Login
                </Button>
              </Box>
            </Card>
          ) : (
            <Card sx={{ p: 4, backgroundColor: 'success.light', color: 'success.contrastText' }}>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                Start Shopping Today!
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, fontSize: '1.1rem' }}>
                Explore our wide range of products
              </Typography>
              <Button 
                variant="contained" 
                size="large" 
                onClick={() => navigate('/products')}
                startIcon={<StorefrontIcon />}
                sx={{ 
                  backgroundColor: 'white',
                  color: 'success.main',
                  '&:hover': {
                    backgroundColor: 'grey.100'
                  }
                }}
              >
                Browse Products
              </Button>
            </Card>
          )}
        </Box>

        {/* Why Choose Us Section */}
        <Box sx={{ mt: 8 }}>
          <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
            Why Choose Us?
          </Typography>
          <Grid container spacing={4} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h3" color="primary" gutterBottom>
                  ✓
                </Typography>
                <Typography variant="h6" color="primary" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Verified Vendors
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  All our vendors are verified and trusted
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h3" color="primary" gutterBottom>
                  ✓
                </Typography>
                <Typography variant="h6" color="primary" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Best Prices
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Competitive prices on all products
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h3" color="primary" gutterBottom>
                  ✓
                </Typography>
                <Typography variant="h6" color="primary" gutterBottom sx={{ fontWeight: 'bold' }}>
                  24/7 Support
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Customer support available anytime
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h3" color="primary" gutterBottom>
                  ✓
                </Typography>
                <Typography variant="h6" color="primary" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Easy Returns
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Hassle-free return policy
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Role-specific Quick Actions */}
        {isLoggedIn && (
          <Box sx={{ mt: 6 }}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                Quick Actions
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6} md={4}>
                  <Button
                    fullWidth
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/products')}
                    startIcon={<StorefrontIcon />}
                  >
                    Browse Products
                  </Button>
                </Grid>
                {userRole === 'vendor' && (
                  <Grid item xs={12} sm={6} md={4}>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="large"
                      onClick={() => navigate('/vendor')}
                      color="primary"
                    >
                      Manage Products
                    </Button>
                  </Grid>
                )}
                {userRole === 'superuser' && (
                  <Grid item xs={12} sm={6} md={4}>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="large"
                      onClick={() => navigate('/admin')}
                      color="primary"
                    >
                      Admin Panel
                    </Button>
                  </Grid>
                )}
              </Grid>
            </Card>
          </Box>
        )}
      </Container>
    </Box>
  );
}

export default Homepage;
