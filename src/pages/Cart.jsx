// pages/Cart.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartAPI, handleAPIError } from '../services/api';
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
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  ShoppingCart as ShoppingCartIcon,
  ShoppingBag as ShoppingBagIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [updatingItems, setUpdatingItems] = useState(new Set());
  const [cartId, setCartId] = useState(null);

  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    item: null,
  });

  const navigate = useNavigate();

  // Try to extract a product identifier from various backend shapes
  const extractProductId = useCallback((item) => {
    return (
      item?.product_id ||
      item?.productId ||
      item?.product?.id ||
      item?.product?.product_id ||
      item?.product_uuid ||
      item?.product?.uuid ||
      null
    );
  }, []);

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
      
      // Handle different response formats
      if (data.cart_id) {
        setCartId(data.cart_id);
      } else if (data.id) {
        setCartId(data.id);
      }
      
      const items = Array.isArray(data) ? data : 
                   data.items ? data.items : 
                   data.cart_items ? data.cart_items : [];
      
      setCartItems(items);
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

  const updateQuantity = useCallback(async (item, newQuantity) => {
    if (newQuantity < 1 || newQuantity > 999) {
      setError('Quantity must be between 1 and 999');
      return;
    }

    // Check if we have enough stock
    const maxStock = item.product?.stock_quantity || item.stock_quantity || 0;
    if (newQuantity > maxStock) {
      setError(`Only ${maxStock} items available in stock`);
      return;
    }

    const itemId = item.id || item.cart_item_id;
    const productId = extractProductId(item);
    const currentCartId = cartId || item.cart_id;

    if (!productId) {
      setError('Missing product identifier for this cart item. Please refresh the cart.');
      return;
    }

    setUpdatingItems(prev => new Set([...prev, itemId]));
    setError('');

    try {
      await cartAPI.updateCartItem(productId, newQuantity, itemId);
      
      // Update local state
      setCartItems(prevItems =>
        prevItems.map(cartItem =>
          (cartItem.id || cartItem.cart_item_id) === itemId
            ? { ...cartItem, quantity: newQuantity }
            : cartItem
        )
      );
      
      setSuccess(`Updated quantity to ${newQuantity}`);
    } catch (err) {
      const errorInfo = handleAPIError(err);
      setError(`Failed to update quantity: ${errorInfo.message}`);
      loadCart(); // Reload to get correct state
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  }, [cartId, loadCart]);

  const handleQuantityChange = useCallback((item, delta) => {
    const currentQty = item.quantity || 1;
    const newQty = currentQty + delta;
    updateQuantity(item, newQty);
  }, [updateQuantity]);

  const handleQuantityInput = useCallback((item, value) => {
    const quantity = parseInt(value);
    if (!isNaN(quantity) && quantity > 0) {
      updateQuantity(item, quantity);
    }
  }, [updateQuantity]);

  const showDeleteConfirmation = useCallback((item) => {
    setDeleteDialog({ open: true, item });
  }, []);

  const hideDeleteConfirmation = useCallback(() => {
    setDeleteDialog({ open: false, item: null });
  }, []);

  const removeFromCart = useCallback(async () => {
    const item = deleteDialog.item;
    if (!item) return;

    const itemId = item.id || item.cart_item_id;
    const productId = extractProductId(item);
    const currentCartId = cartId || item.cart_id;
    const quantity = item.quantity || 1;
    const itemName = item.product_name || item.product?.name || 'Item';

    setUpdatingItems(prev => new Set([...prev, itemId]));
    setError('');
    hideDeleteConfirmation();

    try {
      // Call delete API to restore stock
      await cartAPI.removeFromCart(productId, itemId);
      
      // Remove from local state
      setCartItems(prevItems => 
        prevItems.filter(cartItem => 
          (cartItem.id || cartItem.cart_item_id) !== itemId
        )
      );
      
      setSuccess(`Removed ${itemName} from cart`);
    } catch (err) {
      const errorInfo = handleAPIError(err);
      setError(`Failed to remove ${itemName}: ${errorInfo.message}`);
      loadCart(); // Reload to get correct state
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  }, [deleteDialog, cartId, loadCart, hideDeleteConfirmation]);

  const calculateTotals = useCallback(() => {
    const validItems = Array.isArray(cartItems) ? cartItems : [];

    const subtotal = validItems.reduce((total, item) => {
      const price = parseFloat(item.price || item.product?.retail_price || item.product?.price || 0);
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
      <Container sx={{ mt: 4, mb: 4, px: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress size={50} />
          <Typography sx={{ ml: 2 }}>Loading cart...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4, mb: 4, px: { xs: 2, sm: 3 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ShoppingCartIcon />
          Shopping Cart
          {totals.itemCount > 0 && (
            <Chip label={`${totals.itemCount} items`} color="primary" size="small" />
          )}
        </Typography>
        <Tooltip title="Refresh cart">
          <IconButton onClick={loadCart} disabled={loading} color="primary">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Messages */}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Empty Cart */}
      {Array.isArray(cartItems) && cartItems.length === 0 ? (
        <Card sx={{ textAlign: 'center', p: 4 }}>
          <CardContent>
            <ShoppingBagIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>Your cart is empty</Typography>
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
        <Grid container spacing={3}>
          {/* Cart Items */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Product</strong></TableCell>
                        <TableCell align="right"><strong>Price</strong></TableCell>
                        <TableCell align="center"><strong>Quantity</strong></TableCell>
                        <TableCell align="right"><strong>Subtotal</strong></TableCell>
                        <TableCell align="center"><strong>Actions</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {cartItems.map((item) => {
                        const itemId = item.id || item.cart_item_id;
                        const productName = item.product_name || item.product?.name || 'Unknown Product';
                        const price = parseFloat(item.price || item.product?.retail_price || item.product?.price || 0);
                        const quantity = parseInt(item.quantity || 0);
                        const subtotal = price * quantity;
                        const isUpdating = updatingItems.has(itemId);
                        const maxStock = item.product?.stock_quantity || item.stock_quantity || 999;

                        return (
                          <TableRow 
                            key={itemId}
                            sx={{ 
                              opacity: isUpdating ? 0.6 : 1,
                              '&:hover': { bgcolor: 'action.hover' }
                            }}
                          >
                            <TableCell>
                              <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                {productName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Stock: {maxStock}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              ${price.toFixed(2)}
                            </TableCell>
                            <TableCell align="center">
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                <Tooltip title="Decrease quantity">
                                  <span>
                                    <IconButton
                                      size="small"
                                      onClick={() => handleQuantityChange(item, -1)}
                                      disabled={isUpdating || quantity <= 1}
                                      color="primary"
                                    >
                                      <RemoveIcon fontSize="small" />
                                    </IconButton>
                                  </span>
                                </Tooltip>
                                <TextField
                                  size="small"
                                  type="number"
                                  value={quantity}
                                  onChange={(e) => handleQuantityInput(item, e.target.value)}
                                  disabled={isUpdating}
                                  inputProps={{
                                    min: 1,
                                    max: maxStock,
                                    style: { textAlign: 'center', width: '60px' }
                                  }}
                                />
                                <Tooltip title="Increase quantity">
                                  <span>
                                    <IconButton
                                      size="small"
                                      onClick={() => handleQuantityChange(item, 1)}
                                      disabled={isUpdating || quantity >= maxStock}
                                      color="primary"
                                    >
                                      <AddIcon fontSize="small" />
                                    </IconButton>
                                  </span>
                                </Tooltip>
                              </Box>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                ${subtotal.toFixed(2)}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Tooltip title="Remove from cart">
                                <IconButton
                                  color="error"
                                  size="small"
                                  onClick={() => showDeleteConfirmation(item)}
                                  disabled={isUpdating}
                                >
                                  <DeleteIcon />
                                </IconButton>
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
          </Grid>

          {/* Order Summary */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Order Summary
                </Typography>
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1">Items ({totals.itemCount})</Typography>
                  <Typography variant="body1">${totals.subtotal}</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1">Tax (10%)</Typography>
                  <Typography variant="body1">${totals.tax}</Typography>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Total
                  </Typography>
                  <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                    ${totals.total}
                  </Typography>
                </Box>
                
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleCheckout}
                  disabled={loading || cartItems.length === 0}
                  sx={{ mb: 2 }}
                >
                  Proceed to Checkout
                </Button>
                
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => navigate('/products')}
                >
                  Continue Shopping
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={hideDeleteConfirmation}>
        <DialogTitle>Remove Item from Cart</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove "{deleteDialog.item?.product_name || deleteDialog.item?.product?.name || 'this item'}" from your cart?
            <br />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              This will restore {deleteDialog.item?.quantity || 0} items to stock.
            </Typography>
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
