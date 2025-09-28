// pages/Cart.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartAPI, handleAPIError } from '../services/api';
import { validateQuantity } from '../utils/validation';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  TextField,
  Box,
  Alert,
  CircularProgress,
  Divider,
  Chip,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  ShoppingCart as ShoppingCartIcon,
  ShoppingBag as ShoppingBagIcon,
} from '@mui/icons-material';

const Cart = () => {
  // Cart state
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [updatingItems, setUpdatingItems] = useState(new Set());
  
  // Dialog state for confirmations
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    itemId: null,
    itemName: '',
  });
  
  // Hooks
  const navigate = useNavigate();

  // Check authentication and load cart
  useEffect(() => {
    const tokens = localStorage.getItem('tokens');
    
    if (!tokens) {
      setError('Please login to view your cart');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }
    
    loadCart();
  }, [navigate]);

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

  // Load cart items from API
  const loadCart = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await cartAPI.getCart();
      setCartItems(response.data || []);
      
    } catch (err) {
      console.error('Error loading cart:', err);
      const errorInfo = handleAPIError(err);
      
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(errorInfo.message);
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Validate quantity input
  const validateQuantityInput = useCallback((quantity) => {
    const error = validateQuantity(quantity);
    return !error && quantity > 0 && quantity <= 999;
  }, []);

  // Update item quantity
  const updateQuantity = useCallback(async (itemId, newQuantity, itemName = 'Item') => {
    // Validate quantity
    if (!validateQuantityInput(newQuantity)) {
      setError('Please enter a valid quantity (1-999)');
      return;
    }

    // Add to updating items set
    setUpdatingItems(prev => new Set([...prev, itemId]));
    setError('');
    
    try {
      await cartAPI.updateCartItem(itemId, newQuantity);
      
      // Update local state optimistically
      setCartItems(prevItems => 
        prevItems.map(item => 
          item.id === itemId 
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
      
      setSuccess(`Updated ${itemName} quantity`);
      
    } catch (err) {
      console.error('Error updating quantity:', err);
      const errorInfo = handleAPIError(err);
      setError(`Failed to update ${itemName}: ${errorInfo.message}`);
      
      // Reload cart to get correct state
      loadCart();
    } finally {
      // Remove from updating items set
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  }, [loadCart, validateQuantityInput]);

  // Handle quantity input change with debouncing
  const handleQuantityChange = useCallback((itemId, value, itemName) => {
    const quantity = parseInt(value);
    
    if (isNaN(quantity) || quantity < 1) {
      return; // Don't update for invalid values
    }
    
    if (quantity > 999) {
      setError('Maximum quantity is 999');
      return;
    }
    
    // Update quantity immediately for better UX
    updateQuantity(itemId, quantity, itemName);
  }, [updateQuantity]);

  // Show delete confirmation dialog
  const showDeleteConfirmation = useCallback((itemId, itemName) => {
    setDeleteDialog({
      open: true,
      itemId,
      itemName,
    });
  }, []);

  // Hide delete confirmation dialog
  const hideDeleteConfirmation = useCallback(() => {
    setDeleteDialog({
      open: false,
      itemId: null,
      itemName: '',
    });
  }, []);

  // Remove item from cart
  const removeFromCart = useCallback(async () => {
    const { itemId, itemName } = deleteDialog;
    
    if (!itemId) return;
    
    setUpdatingItems(prev => new Set([...prev, itemId]));
    setError('');
    hideDeleteConfirmation();
    
    try {
      await cartAPI.removeFromCart(itemId);
      
      // Remove from local state
      setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
      setSuccess(`Removed ${itemName} from cart`);
      
    } catch (err) {
      console.error('Error removing item:', err);
      const errorInfo = handleAPIError(err);
      setError(`Failed to remove ${itemName}: ${errorInfo.message}`);
      
      // Reload cart to get correct state
      loadCart();
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  }, [deleteDialog, loadCart, hideDeleteConfirmation]);

  // Calculate cart totals
  const calculateTotals = useCallback(() => {
    const subtotal = cartItems.reduce((total, item) => {
      const price = parseFloat(item.price || 0);
      const quantity = parseInt(item.quantity || 0);
      return total + (price * quantity);
    }, 0);
    
    const itemCount = cartItems.reduce((count, item) => {
      return count + parseInt(item.quantity || 0);
    }, 0);
    
    return {
      subtotal: subtotal.toFixed(2),
      itemCount,
      tax: (subtotal * 0.1).toFixed(2), // 10% tax example
      total: (subtotal * 1.1).toFixed(2),
    };
  }, [cartItems]);

  const totals = calculateTotals();

  // Handle checkout
  const handleCheckout = useCallback(() => {
    if (cartItems.length === 0) {
      setError('Your cart is empty');
      return;
    }
    
    // TODO: Implement checkout logic
    setSuccess('Checkout functionality coming soon!');
  }, [cartItems]);

  if (loading && cartItems.length === 0) {
    return (
      <Container sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress size={50} />
        </Box>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
      >
        <ShoppingCartIcon />
        Shopping Cart
        {totals.itemCount > 0 && (
          <Chip
            label={`${totals.itemCount} items`}
            color="primary"
            size="small"
          />
        )}
      </Typography>
      
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
      
      {/* Cart Content */}
      {cartItems.length === 0 ? (
        <Card sx={{ textAlign: 'center', p: 4 }}>
          <CardContent>
            <ShoppingBagIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Your cart is empty
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Add some products to get started
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/products')}
              startIcon={<ShoppingBagIcon />}
            >
              Browse Products
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Cart Items Table */}
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 0 }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell align="right">Price</TableCell>
                      <TableCell align="center">Quantity</TableCell>
                      <TableCell align="right">Total</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cartItems.map((item) => {
                      const isUpdating = updatingItems.has(item.id);
                      const itemTotal = (parseFloat(item.price || 0) * parseInt(item.quantity || 0)).toFixed(2);
                      
                      return (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                              {item.product_name || item.name || 'Unknown Product'}
                            </Typography>
                            {item.vendor_name && (
                              <Typography variant="body2" color="text.secondary">
                                by {item.vendor_name}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body1">
                              ${parseFloat(item.price || 0).toFixed(2)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                              <Tooltip title="Decrease quantity">
                                <span>
                                  <IconButton
                                    size="small"
                                    onClick={() => updateQuantity(item.id, item.quantity - 1, item.product_name)}
                                    disabled={isUpdating || item.quantity <= 1}
                                  >
                                    <RemoveIcon />
                                  </IconButton>
                                </span>
                              </Tooltip>
                              
                              <TextField
                                type="number"
                                value={item.quantity}
                                onChange={(e) => handleQuantityChange(item.id, e.target.value, item.product_name)}
                                disabled={isUpdating}
                                inputProps={{
                                  min: 1,
                                  max: 999,
                                  style: { textAlign: 'center' }
                                }}
                                sx={{ width: 80 }}
                                size="small"
                              />
                              
                              <Tooltip title="Increase quantity">
                                <span>
                                  <IconButton
                                    size="small"
                                    onClick={() => updateQuantity(item.id, item.quantity + 1, item.product_name)}
                                    disabled={isUpdating || item.quantity >= 999}
                                  >
                                    <AddIcon />
                                  </IconButton>
                                </span>
                              </Tooltip>
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                              ${itemTotal}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="Remove from cart">
                              <span>
                                <IconButton
                                  color="error"
                                  onClick={() => showDeleteConfirmation(item.id, item.product_name)}
                                  disabled={isUpdating}
                                >
                                  {isUpdating ? (
                                    <CircularProgress size={20} />
                                  ) : (
                                    <DeleteIcon />
                                  )}
                                </IconButton>
                              </span>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
          
          {/* Cart Summary */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Subtotal ({totals.itemCount} items):</Typography>
                  <Typography>${totals.subtotal}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Tax:</Typography>
                  <Typography>${totals.tax}</Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">Total:</Typography>
                  <Typography variant="h6" color="primary">
                    ${totals.total}
                  </Typography>
                </Box>
              </Box>
              
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handleCheckout}
                disabled={cartItems.length === 0 || updatingItems.size > 0}
              >
                Proceed to Checkout
              </Button>
            </CardContent>
          </Card>
        </>
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={hideDeleteConfirmation}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Remove Item from Cart
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to remove "{deleteDialog.itemName}" from your cart?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={hideDeleteConfirmation} color="primary">
            Cancel
          </Button>
          <Button onClick={removeFromCart} color="error" autoFocus>
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Cart;