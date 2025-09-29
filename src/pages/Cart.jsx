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
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [updatingItems, setUpdatingItems] = useState(new Set());

  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    itemId: null,
    itemName: '',
  });

  const navigate = useNavigate();

  useEffect(() => {
    const tokens = localStorage.getItem('tokens');
    if (!tokens) {
      setError('Please login to view your cart');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }
    loadCart();
  }, [navigate]);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const loadCart = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await cartAPI.getCart();
      const data = response.data;
      setCartItems(Array.isArray(data) ? data : []);
    } catch (err) {
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

  const validateQuantityInput = useCallback((quantity) => {
    const error = validateQuantity(quantity);
    return !error && quantity > 0 && quantity <= 999;
  }, []);

  const updateQuantity = useCallback(async (itemId, newQuantity, itemName = 'Item') => {
    if (!validateQuantityInput(newQuantity)) {
      setError('Please enter a valid quantity (1-999)');
      return;
    }

    setUpdatingItems(prev => new Set([...prev, itemId]));
    setError('');

    try {
      await cartAPI.updateCartItem(itemId, newQuantity);
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
      setSuccess(`Updated ${itemName} quantity`);
    } catch (err) {
      const errorInfo = handleAPIError(err);
      setError(`Failed to update ${itemName}: ${errorInfo.message}`);
      loadCart();
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  }, [loadCart, validateQuantityInput]);

  const handleQuantityChange = useCallback((itemId, value, itemName) => {
    const quantity = parseInt(value);
    if (isNaN(quantity) || quantity < 1) return;
    if (quantity > 999) {
      setError('Maximum quantity is 999');
      return;
    }
    updateQuantity(itemId, quantity, itemName);
  }, [updateQuantity]);

  const showDeleteConfirmation = useCallback((itemId, itemName) => {
    setDeleteDialog({ open: true, itemId, itemName });
  }, []);

  const hideDeleteConfirmation = useCallback(() => {
    setDeleteDialog({ open: false, itemId: null, itemName: '' });
  }, []);

  const removeFromCart = useCallback(async () => {
    const { itemId, itemName } = deleteDialog;
    if (!itemId) return;

    setUpdatingItems(prev => new Set([...prev, itemId]));
    setError('');
    hideDeleteConfirmation();

    try {
      await cartAPI.removeFromCart(itemId);
      setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
      setSuccess(`Removed ${itemName} from cart`);
    } catch (err) {
      const errorInfo = handleAPIError(err);
      setError(`Failed to remove ${itemName}: ${errorInfo.message}`);
      loadCart();
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  }, [deleteDialog, loadCart, hideDeleteConfirmation]);

  const calculateTotals = useCallback(() => {
    const validItems = Array.isArray(cartItems) ? cartItems : [];

    const subtotal = validItems.reduce((total, item) => {
      const price = parseFloat(item.price || 0);
      const quantity = parseInt(item.quantity || 0);
      return total + (price * quantity);
    }, 0);

    const itemCount = validItems.reduce((count, item) => {
      return count + parseInt(item.quantity || 0);
    }, 0);

    return {
      subtotal: subtotal.toFixed(2),
      itemCount,
      tax: (subtotal * 0.1).toFixed(2),
      total: (subtotal * 1.1).toFixed(2),
    };
  }, [cartItems]);

  const totals = calculateTotals();

  const handleCheckout = useCallback(() => {
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      setError('Your cart is empty');
      return;
    }
    setSuccess('Checkout functionality coming soon!');
  }, [cartItems]);

  if (loading && (!Array.isArray(cartItems) || cartItems.length === 0)) {
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
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ShoppingCartIcon />
        Shopping Cart
        {totals.itemCount > 0 && (
          <Chip label={`${totals.itemCount} items`} color="primary" size="small" />
        )}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {Array.isArray(cartItems) && cartItems.length === 0 ? (
        <Card sx={{ textAlign: 'center', p: 4 }}>
          <CardContent>
            <ShoppingBagIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>Your cart is empty</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Add some products to get started
            </Typography>
            <Button variant="contained" size="large" onClick={() => navigate('/products')} startIcon={<ShoppingBagIcon />}>
              Browse Products
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Cart Table and Summary (no changes here, keep original from your code) */}
          {/* ... */}
          {/* Dialog for delete confirmation (same) */}
          <Dialog open={deleteDialog.open} onClose={hideDeleteConfirmation}>
            <DialogTitle>Remove Item from Cart</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Are you sure you want to remove "{deleteDialog.itemName}" from your cart?
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={hideDeleteConfirmation} color="primary">Cancel</Button>
              <Button onClick={removeFromCart} color="error" autoFocus>Remove</Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Container>
  );
};

export default Cart;
