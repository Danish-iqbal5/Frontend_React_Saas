import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsAPI, handleAPIError } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  Alert,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

function VendorDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  // State
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Dialog state
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    retail_price: '',
    whole_sale_price: '',
    stock_quantity: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [savingProduct, setSavingProduct] = useState(false);

  // Load products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Fetch vendor's products
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await productsAPI.getVendorProducts();
      setProducts(response.data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      const errorInfo = handleAPIError(err);
      setError(errorInfo.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Validate form
  const validateForm = useCallback(() => {
    const errors = {};
    
    // Name validation
    if (!formData.name.trim()) {
      errors.name = 'Product name is required';
    } else if (formData.name.length < 3) {
      errors.name = 'Product name must be at least 3 characters';
    }
    
    // Description validation
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      errors.description = 'Description must be at least 10 characters';
    }
    
    // Retail price validation
    if (!formData.retail_price) {
      errors.retail_price = 'Retail price is required';
    } else if (parseFloat(formData.retail_price) <= 0) {
      errors.retail_price = 'Retail price must be greater than 0';
    } else if (isNaN(formData.retail_price)) {
      errors.retail_price = 'Retail price must be a number';
    }
    
    // Wholesale price validation
    if (!formData.whole_sale_price) {
      errors.whole_sale_price = 'Wholesale price is required';
    } else if (parseFloat(formData.whole_sale_price) <= 0) {
      errors.whole_sale_price = 'Wholesale price must be greater than 0';
    } else if (isNaN(formData.whole_sale_price)) {
      errors.whole_sale_price = 'Wholesale price must be a number';
    } else if (parseFloat(formData.whole_sale_price) > parseFloat(formData.retail_price || 0)) {
      errors.whole_sale_price = 'Wholesale price must be less than retail price';
    }
    
    // Stock quantity validation
    if (!formData.stock_quantity && formData.stock_quantity !== 0) {
      errors.stock_quantity = 'Stock quantity is required';
    } else if (parseInt(formData.stock_quantity) < 0) {
      errors.stock_quantity = 'Stock quantity cannot be negative';
    } else if (!Number.isInteger(Number(formData.stock_quantity))) {
      errors.stock_quantity = 'Stock quantity must be a whole number';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  // Handle form input changes
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user types
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  }, [formErrors]);

  // Open dialog for adding product
  const handleAddProduct = useCallback(() => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      retail_price: '',
      whole_sale_price: '',
      stock_quantity: '',
    });
    setFormErrors({});
    setOpenDialog(true);
  }, []);

  // Open dialog for editing product
  const handleEditProduct = useCallback((product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      retail_price: product.retail_price?.toString() || product.price?.toString() || '',
      whole_sale_price: product.whole_sale_price?.toString() || product.wholesale_price?.toString() || '',
      stock_quantity: product.stock_quantity?.toString() || product.quantity?.toString() || '',
    });
    setFormErrors({});
    setOpenDialog(true);
  }, []);

  // Save product (add or update)
  const handleSaveProduct = useCallback(async () => {
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    try {
      setSavingProduct(true);
      setError('');
      
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        retail_price: parseFloat(formData.retail_price),
        whole_sale_price: parseFloat(formData.whole_sale_price),
        stock_quantity: parseInt(formData.stock_quantity),
      };
      
      if (editingProduct) {
        // Update existing product
        await productsAPI.updateProduct(editingProduct.id, productData);
        setSuccess('Product updated successfully!');
      } else {
        // Add new product
        await productsAPI.createProduct(productData);
        setSuccess('Product added successfully!');
      }
      
      // Refresh products list and close dialog
      await fetchProducts();
      setOpenDialog(false);
    } catch (err) {
      console.error('Error saving product:', err);
      const errorInfo = handleAPIError(err);
      setError(`Failed to save product: ${errorInfo.message}`);
    } finally {
      setSavingProduct(false);
    }
  }, [formData, editingProduct, validateForm, fetchProducts]);

  // Delete product
  const handleDeleteProduct = useCallback(async (product) => {
    if (!window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      await productsAPI.deleteProduct(product.id);
      setSuccess(`Product "${product.name}" deleted successfully!`);
      await fetchProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
      const errorInfo = handleAPIError(err);
      setError(`Failed to delete product: ${errorInfo.message}`);
    } finally {
      setLoading(false);
    }
  }, [fetchProducts]);

  // Handle logout
  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  return (
    <Container sx={{ mt: 4, mb: 4, px: { xs: 2, sm: 3 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Vendor Dashboard
        </Typography>
      </Box>
      
      {/* Messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}
      
      {/* Action Buttons */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddProduct}
        >
          Add New Product
        </Button>
        <Tooltip title="Refresh products">
          <IconButton onClick={fetchProducts} color="primary" disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>
      
      {/* Products Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Your Products
            {products.length > 0 && (
              <Chip label={`${products.length} product${products.length !== 1 ? 's' : ''}`} sx={{ ml: 2 }} size="small" />
            )}
          </Typography>
          
          {loading && products.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3 }}>
              <CircularProgress size={40} />
              <Typography sx={{ ml: 2 }}>Loading products...</Typography>
            </Box>
          ) : products.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary" gutterBottom>
                You haven't added any products yet.
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddProduct}
                sx={{ mt: 2 }}
              >
                Add Your First Product
              </Button>
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Name</strong></TableCell>
                    <TableCell><strong>Description</strong></TableCell>
                    <TableCell><strong>Retail Price</strong></TableCell>
                    <TableCell><strong>Wholesale Price</strong></TableCell>
                    <TableCell><strong>Stock</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell align="center"><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.map((product) => {
                    const retailPrice = product.retail_price || product.price || 0;
                    const wholesalePrice = product.whole_sale_price || product.wholesale_price || 0;
                    const stock = product.stock_quantity ?? product.quantity ?? 0;
                    
                    return (
                      <TableRow key={product.id} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                        <TableCell>{product.name}</TableCell>
                        <TableCell sx={{ maxWidth: 300 }}>
                          <Typography variant="body2" noWrap>
                            {product.description}
                          </Typography>
                        </TableCell>
                        <TableCell>${parseFloat(retailPrice).toFixed(2)}</TableCell>
                        <TableCell>${parseFloat(wholesalePrice).toFixed(2)}</TableCell>
                        <TableCell>{stock}</TableCell>
                        <TableCell>
                          <Chip
                            label={stock > 0 ? 'In Stock' : 'Out of Stock'}
                            color={stock > 0 ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                            <Tooltip title="Edit">
                              <IconButton
                                color="primary"
                                size="small"
                                onClick={() => handleEditProduct(product)}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                color="error"
                                size="small"
                                onClick={() => handleDeleteProduct(product)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
      
      {/* Add/Edit Product Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingProduct ? 'Edit Product' : 'Add New Product'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Product Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                error={!!formErrors.name}
                helperText={formErrors.name}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                multiline
                rows={3}
                error={!!formErrors.description}
                helperText={formErrors.description}
                required
              />
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Retail Price"
                name="retail_price"
                type="number"
                value={formData.retail_price}
                onChange={handleInputChange}
                error={!!formErrors.retail_price}
                helperText={formErrors.retail_price}
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 0.5 }}>$</Typography>,
                }}
                inputProps={{ min: 0, step: 0.01 }}
                required
              />
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Wholesale Price"
                name="whole_sale_price"
                type="number"
                value={formData.whole_sale_price}
                onChange={handleInputChange}
                error={!!formErrors.whole_sale_price}
                helperText={formErrors.whole_sale_price}
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 0.5 }}>$</Typography>,
                }}
                inputProps={{ min: 0, step: 0.01 }}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Stock Quantity"
                name="stock_quantity"
                type="number"
                value={formData.stock_quantity}
                onChange={handleInputChange}
                error={!!formErrors.stock_quantity}
                helperText={formErrors.stock_quantity}
                inputProps={{ min: 0, step: 1 }}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} disabled={savingProduct}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveProduct}
            variant="contained"
            disabled={savingProduct}
            startIcon={savingProduct && <CircularProgress size={20} />}
          >
            {editingProduct ? 'Update' : 'Add'} Product
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default VendorDashboard;
