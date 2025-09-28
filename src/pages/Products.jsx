// pages/Products.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsAPI, cartAPI, handleAPIError } from '../services/api';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  CardMedia,
  Typography,
  Button,
  Box,
  TextField,
  Alert,
  CircularProgress,
  Chip,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  Skeleton,
} from '@mui/material';
import {
  Search as SearchIcon,
  ShoppingCart as ShoppingCartIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Store as StoreIcon,
} from '@mui/icons-material';

const Products = () => {
  // Products state
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Filter and search state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterBy, setFilterBy] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  
  // Cart state
  const [addingToCart, setAddingToCart] = useState(new Set());
  
  // User authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Hooks
  const navigate = useNavigate();

  // Check authentication status
  useEffect(() => {
    const tokens = localStorage.getItem('tokens');
    setIsAuthenticated(!!tokens);
  }, []);

  // Load products on component mount
  useEffect(() => {
    loadProducts();
  }, []);

  // Clear messages after delay
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Load products from API
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await productsAPI.getProducts();
      const productsData = response.data || [];
      
      setProducts(productsData);
      
    } catch (err) {
      console.error('Error loading products:', err);
      const errorInfo = handleAPIError(err);
      setError(errorInfo.message);
      
      // Fallback to sample data for demo purposes
      if (process.env.NODE_ENV === 'development') {
        setProducts([
          {
            id: '1',
            name: 'Sample Product 1',
            description: 'This is a sample product for demonstration',
            price: 29.99,
            quantity: 10,
            vendor_name: 'Demo Vendor',
          },
          {
            id: '2',
            name: 'Sample Product 2',
            description: 'Another sample product with longer description',
            price: 49.99,
            quantity: 5,
            vendor_name: 'Demo Vendor',
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products];
    
    // Search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(product =>
        product.name?.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower) ||
        product.vendor_name?.toLowerCase().includes(searchLower)
      );
    }
    
    // Stock filter
    if (filterBy === 'in-stock') {
      filtered = filtered.filter(product => product.quantity > 0);
    } else if (filterBy === 'out-of-stock') {
      filtered = filtered.filter(product => product.quantity === 0);
    }
    
    // Price range filter
    if (priceRange.min !== '' || priceRange.max !== '') {
      filtered = filtered.filter(product => {
        const price = parseFloat(product.price || 0);
        const min = parseFloat(priceRange.min) || 0;
        const max = parseFloat(priceRange.max) || Infinity;
        return price >= min && price <= max;
      });
    }
    
    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'price-low':
          return parseFloat(a.price || 0) - parseFloat(b.price || 0);
        case 'price-high':
          return parseFloat(b.price || 0) - parseFloat(a.price || 0);
        case 'stock':
          return parseInt(b.quantity || 0) - parseInt(a.quantity || 0);
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [products, searchTerm, sortBy, filterBy, priceRange]);

  // Handle search input change
  const handleSearchChange = useCallback((event) => {
    setSearchTerm(event.target.value);
  }, []);

  // Handle sort change
  const handleSortChange = useCallback((event) => {
    setSortBy(event.target.value);
  }, []);

  // Handle filter change
  const handleFilterChange = useCallback((event) => {
    setFilterBy(event.target.value);
  }, []);

  // Handle price range change
  const handlePriceRangeChange = useCallback((field) => (event) => {
    const value = event.target.value;
    
    // Validate price input
    if (value !== '' && (isNaN(value) || parseFloat(value) < 0)) {
      return;
    }
    
    setPriceRange(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setSortBy('name');
    setFilterBy('all');
    setPriceRange({ min: '', max: '' });
  }, []);

  // Add product to cart
  const handleAddToCart = useCallback(async (product) => {
    // Check authentication
    if (!isAuthenticated) {
      setError('Please login to add products to cart');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }
    
    // Check stock
    if (product.quantity <= 0) {
      setError('This product is out of stock');
      return;
    }
    
    // Add to adding state
    setAddingToCart(prev => new Set([...prev, product.id]));
    setError('');
    
    try {
      await cartAPI.addToCart({
        product_id: product.id,
        quantity: 1
      });
      
      setSuccess(`Added "${product.name}" to cart!`);
      
    } catch (err) {
      console.error('Error adding to cart:', err);
      const errorInfo = handleAPIError(err);
      
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(`Failed to add to cart: ${errorInfo.message}`);
      }
    } finally {
      // Remove from adding state
      setAddingToCart(prev => {
        const newSet = new Set(prev);
        newSet.delete(product.id);
        return newSet;
      });
    }
  }, [isAuthenticated, navigate]);

  // Product card component
  const ProductCard = useCallback(({ product }) => {
    const isAddingToCart = addingToCart.has(product.id);
    const isOutOfStock = product.quantity <= 0;
    const price = parseFloat(product.price || 0);
    
    return (
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          opacity: isOutOfStock ? 0.7 : 1,
        }}
      >
        {/* Product Image Placeholder */}
        <CardMedia
          sx={{
            height: 200,
            backgroundColor: 'grey.200',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <StoreIcon sx={{ fontSize: 60, color: 'grey.400' }} />
        </CardMedia>
        
        <CardContent sx={{ flexGrow: 1 }}>
          {/* Product Name */}
          <Typography variant="h6" gutterBottom noWrap>
            {product.name || 'Unnamed Product'}
          </Typography>
          
          {/* Product Description */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              mb: 2,
              minHeight: 60,
            }}
          >
            {product.description || 'No description available'}
          </Typography>
          
          {/* Price */}
          <Typography variant="h5" color="primary" sx={{ mb: 1, fontWeight: 'bold' }}>
            ${price.toFixed(2)}
          </Typography>
          
          {/* Chips for stock and vendor */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label={`Stock: ${product.quantity || 0}`}
              size="small"
              color={isOutOfStock ? 'error' : 'success'}
              variant="outlined"
            />
            {product.vendor_name && (
              <Chip
                label={product.vendor_name}
                size="small"
                color="default"
                variant="outlined"
              />
            )}
          </Box>
        </CardContent>
        
        <CardActions sx={{ p: 2, pt: 0 }}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            disabled={isOutOfStock || isAddingToCart}
            onClick={() => handleAddToCart(product)}
            startIcon={
              isAddingToCart ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <ShoppingCartIcon />
              )
            }
          >
            {isOutOfStock
              ? 'Out of Stock'
              : isAddingToCart
              ? 'Adding...'
              : 'Add to Cart'
            }
          </Button>
        </CardActions>
      </Card>
    );
  }, [addingToCart, handleAddToCart]);

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      {/* Page Header */}
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Products
        {filteredAndSortedProducts.length > 0 && (
          <Chip
            label={`${filteredAndSortedProducts.length} products`}
            color="primary"
            sx={{ ml: 2 }}
          />
        )}
      </Typography>

      {/* Search and Filter Controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            {/* Search Field */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search products..."
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setSearchTerm('')}>
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            {/* Sort Dropdown */}
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Sort by</InputLabel>
                <Select value={sortBy} onChange={handleSortChange} label="Sort by">
                  <MenuItem value="name">Name</MenuItem>
                  <MenuItem value="price-low">Price: Low to High</MenuItem>
                  <MenuItem value="price-high">Price: High to Low</MenuItem>
                  <MenuItem value="stock">Stock Level</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {/* Filter Dropdown */}
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Filter</InputLabel>
                <Select value={filterBy} onChange={handleFilterChange} label="Filter">
                  <MenuItem value="all">All Products</MenuItem>
                  <MenuItem value="in-stock">In Stock</MenuItem>
                  <MenuItem value="out-of-stock">Out of Stock</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {/* Price Range */}
            <Grid item xs={6} md={1.5}>
              <TextField
                fullWidth
                label="Min Price"
                type="number"
                value={priceRange.min}
                onChange={handlePriceRangeChange('min')}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            
            <Grid item xs={6} md={1.5}>
              <TextField
                fullWidth
                label="Max Price"
                type="number"
                value={priceRange.max}
                onChange={handlePriceRangeChange('max')}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            
            {/* Clear Filters */}
            <Grid item xs={12} md={1}>
              <Tooltip title="Clear all filters">
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={clearFilters}
                  startIcon={<ClearIcon />}
                >
                  Clear
                </Button>
              </Tooltip>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Messages */}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          onClose={() => setSuccess('')}
        >
          {success}
        </Alert>
      )}

      {/* Loading State */}
      {loading ? (
        <Grid container spacing={3}>
          {[...Array(6)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card sx={{ height: 400 }}>
                <Skeleton variant="rectangular" height={200} />
                <CardContent>
                  <Skeleton variant="text" height={32} />
                  <Skeleton variant="text" height={60} />
                  <Skeleton variant="text" width="60%" height={40} />
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <Skeleton variant="rectangular" width={80} height={24} />
                    <Skeleton variant="rectangular" width={100} height={24} />
                  </Box>
                </CardContent>
                <CardActions sx={{ p: 2 }}>
                  <Skeleton variant="rectangular" width="100%" height={36} />
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <>
          {/* Products Grid */}
          {filteredAndSortedProducts.length === 0 ? (
            <Card sx={{ textAlign: 'center', p: 4 }}>
              <CardContent>
                <StoreIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  {searchTerm || filterBy !== 'all' || priceRange.min || priceRange.max
                    ? 'No products match your filters'
                    : 'No products available'
                  }
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {searchTerm || filterBy !== 'all' || priceRange.min || priceRange.max
                    ? 'Try adjusting your search or filter criteria'
                    : 'Check back later for new products'
                  }
                </Typography>
                {(searchTerm || filterBy !== 'all' || priceRange.min || priceRange.max) && (
                  <Button
                    variant="contained"
                    onClick={clearFilters}
                    startIcon={<ClearIcon />}
                  >
                    Clear Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <Grid container spacing={3}>
              {filteredAndSortedProducts.map((product) => (
                <Grid item xs={12} sm={6} md={4} key={product.id}>
                  <ProductCard product={product} />
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      {/* Authentication Prompt */}
      {!isAuthenticated && (
        <Card sx={{ mt: 4, textAlign: 'center' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Want to add products to your cart?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Sign in to start shopping and save your favorite items
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                onClick={() => navigate('/login')}
              >
                Sign In
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/signup')}
              >
                Create Account
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default Products;