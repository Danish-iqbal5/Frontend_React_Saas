import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  TextField,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import api from '../services/api';

function Products() {
  const navigate = useNavigate();
  
  // State for products
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // User info
  const [userInfo, setUserInfo] = useState({
    token: localStorage.getItem('token'),
    role: localStorage.getItem('role')
  });

  // Load products when component mounts
  useEffect(() => {
    fetchProducts();
  }, []);

  // Function to fetch products from API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Call the API to get products
      const response = await api.get('/products/');
      
      // Check if response has data
      if (response.data) {
        setProducts(response.data);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again later.');
      
      // For testing, use sample data if API fails
      setProducts([
        {
          id: 1,
          name: 'Sample Product 1',
          description: 'This is a sample product',
          price: 29.99,
          quantity: 10,
          vendor_name: 'Test Vendor'
        },
        {
          id: 2,
          name: 'Sample Product 2',
          description: 'Another sample product',
          price: 49.99,
          quantity: 5,
          vendor_name: 'Test Vendor'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Function to add product to cart
  const handleAddToCart = async (productId) => {
    // Check if user is logged in
    if (!userInfo.token) {
      alert('Please login to add products to cart');
      navigate('/login');
      return;
    }

    try {
      // Call API to add to cart
      await api.post('/cart/', {
        product_id: productId,
        quantity: 1
      });
      
      alert('Product added to cart successfully!');
    } catch (err) {
      console.error('Error adding to cart:', err);
      alert('Failed to add product to cart. Please try again.');
    }
  };

  // Filter products based on search
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Products
      </Typography>

      {/* Search Box */}
      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          label="Search products..."
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Box>

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Loading Spinner */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <Alert severity="info">
              No products found. Please check back later.
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {filteredProducts.map((product) => (
                <Grid item xs={12} sm={6} md={4} key={product.id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        {product.name}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {product.description}
                      </Typography>
                      
                      <Typography variant="h5" color="primary">
                        ${product.price}
                      </Typography>
                      
                      <Box sx={{ mt: 1 }}>
                        <Chip 
                          label={`Stock: ${product.quantity}`} 
                          size="small"
                          color={product.quantity > 0 ? 'success' : 'error'}
                        />
                        {product.vendor_name && (
                          <Chip 
                            label={`Vendor: ${product.vendor_name}`} 
                            size="small"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Box>
                    </CardContent>
                    
                    <CardActions>
                      <Button 
                        size="small" 
                        variant="contained"
                        fullWidth
                        onClick={() => handleAddToCart(product.id)}
                        disabled={product.quantity === 0}
                      >
                        {product.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}
    </Container>
  );
}

export default Products;
