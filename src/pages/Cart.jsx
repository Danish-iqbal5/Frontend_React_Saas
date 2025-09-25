import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../services/api';

function Cart() {
  const navigate = useNavigate();
  
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      alert('Please login to view your cart');
      navigate('/login');
      return;
    }
    
    loadCart();
  }, [navigate]);
  
  // Load cart items
  const loadCart = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      const response = await api.get('/cart/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setCartItems(response.data || []);
    } catch (err) {
      console.error('Error loading cart:', err);
      setError('Failed to load cart items');
    } finally {
      setLoading(false);
    }
  };
  
  // Update quantity
  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      
      await api.put(`/cart/${itemId}/`, 
        { quantity: newQuantity },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Update local state
      setCartItems(prev => prev.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ));
      
      setSuccess('Quantity updated');
      setTimeout(() => setSuccess(''), 2000);
      
    } catch (err) {
      console.error('Error updating quantity:', err);
      setError('Failed to update quantity');
    }
  };
  
  // Remove item from cart
  const removeFromCart = async (itemId) => {
    try {
      const token = localStorage.getItem('token');
      
      await api.delete(`/cart/${itemId}/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Remove from local state
      setCartItems(prev => prev.filter(item => item.id !== itemId));
      setSuccess('Item removed from cart');
      
    } catch (err) {
      console.error('Error removing item:', err);
      setError('Failed to remove item');
    }
  };
  
  // Calculate total price
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0).toFixed(2);
  };
  
  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Shopping Cart
      </Typography>
      
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
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : cartItems.length === 0 ? (
        <Card>
          <CardContent>
            <Typography>Your cart is empty</Typography>
            <Button 
              variant="contained" 
              sx={{ mt: 2 }}
              onClick={() => navigate('/products')}
            >
              Browse Products
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cartItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.product_name}</TableCell>
                    <TableCell>${item.price}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton 
                          size="small"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <RemoveIcon />
                        </IconButton>
                        <TextField
                          type="number"
                          value={item.quantity}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            if (val > 0) {
                              updateQuantity(item.id, val);
                            }
                          }}
                          sx={{ width: 60, mx: 1 }}
                          size="small"
                        />
                        <IconButton 
                          size="small"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <AddIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell>${(item.price * item.quantity).toFixed(2)}</TableCell>
                    <TableCell>
                      <IconButton 
                        color="error"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          {/* Total and Checkout */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Total: ${calculateTotal()}
              </Typography>
              <Button 
                variant="contained" 
                size="large"
                fullWidth
              >
                Proceed to Checkout
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </Container>
  );
}

export default Cart;
