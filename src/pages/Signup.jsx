import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

import {
  Container,
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Button,
  Alert,
  Paper,
  CircularProgress,
} from '@mui/material';

export default function Signup() {
  const [full_name, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [userType, setUserType] = useState('normal_customer');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const nav = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await api.post(
        '/register/',
        { full_name, email, user_type: userType },
        { headers: { 'Content-Type': 'application/json' } }
      );
      setMessage('OTP sent to your email. Go verify.');
      nav('/verify-otp', { state: { email, userType } });
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom align="center">
            Sign up
          </Typography>

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              label="Full name"
              value={full_name}
              onChange={(e) => setFullName(e.target.value)}
              required
              fullWidth
              margin="normal"
            />

            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              margin="normal"
            />

            <FormControl fullWidth margin="normal">
              <InputLabel id="account-type-label">Account type</InputLabel>
              <Select
                labelId="account-type-label"
                value={userType}
                label="Account type"
                onChange={(e) => setUserType(e.target.value)}
              >
                <MenuItem value="normal_customer">Normal user</MenuItem>
                <MenuItem value="vendor">Vendor</MenuItem>
                <MenuItem value="vip_customer">VIP user</MenuItem>
              </Select>
            </FormControl>

            <Box mt={2}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Register'}
              </Button>
            </Box>

            {message && (
              <Box mt={2}>
                <Alert severity={message.includes('OTP') ? 'success' : 'error'}>
                  {message}
                </Alert>
              </Box>
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
