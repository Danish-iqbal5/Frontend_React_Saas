import React, { useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { authAPI, handleAPIError } from '../services/api';
import { Container, Card, CardContent, Typography, TextField, Button, Alert, Box } from '@mui/material';

const SetPassword = () => {
  const navigate = useNavigate();
  const { userId } = useParams();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!password || !confirmPassword) {
      setError('Please fill in both fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      await authAPI.setPassword(userId, { password });
      setSuccess('Password set successfully. You can now log in.');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      const info = handleAPIError(err);
      setError(info.message);
    } finally {
      setLoading(false);
    }
  }, [userId, password, confirmPassword, navigate]);

  return (
    <Container sx={{ mt: 6, mb: 6, maxWidth: 600 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Set Your Password
          </Typography>

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

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              type="password"
              label="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
            <TextField
              type="password"
              label="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              required
            />
            <Button type="submit" variant="contained" disabled={loading}>
              Set Password
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default SetPassword;


