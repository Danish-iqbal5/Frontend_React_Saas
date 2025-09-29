// pages/Login.jsx
import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { validateEmail, validatePassword, debounce } from '../utils/validation';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Paper,
  CircularProgress,
  Link,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
} from '@mui/icons-material';

const Login = () => {
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  // UI state
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({});
  
  // Hooks
  const { login } = useAuth();
  

  // Clear message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Debounced validation function
  const debouncedValidation = useCallback(
    debounce((field, value) => {
      const fieldErrors = { ...errors };
      
      switch (field) {
        case 'email':
          const emailError = validateEmail(value);
          if (emailError) {
            fieldErrors.email = emailError;
          } else {
            delete fieldErrors.email;
          }
          break;
        case 'password':
          if (!value || !value.trim()) {
            fieldErrors.password = 'Password is required';
          } else {
            delete fieldErrors.password;
          }
          break;
        default:
          break;
      }
      
      setErrors(fieldErrors);
    }, 300),
    [errors]
  );

  // Handle input changes
  const handleChange = useCallback((field) => (event) => {
    const value = event.target.value;
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear message when user starts typing
    if (message) {
      setMessage('');
    }

    // Validate field if it's been touched
    if (touched[field]) {
      debouncedValidation(field, value);
    }
  }, [touched, message, debouncedValidation]);

  // Handle field blur (when user leaves field)
  const handleBlur = useCallback((field) => () => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));

    // Validate immediately on blur
    const value = formData[field];
    const fieldErrors = { ...errors };
    
    switch (field) {
      case 'email':
        const emailError = validateEmail(value);
        if (emailError) {
          fieldErrors.email = emailError;
        } else {
          delete fieldErrors.email;
        }
        break;
      case 'password':
        if (!value || !value.trim()) {
          fieldErrors.password = 'Password is required';
        } else {
          delete fieldErrors.password;
        }
        break;
      default:
        break;
    }
    
    setErrors(fieldErrors);
  }, [formData, errors]);

  // Validate entire form
  const validateForm = useCallback(() => {
    const formErrors = {};
    
    // Email validation
    const emailError = validateEmail(formData.email);
    if (emailError) {
      formErrors.email = emailError;
    }
    
    // Password validation (just check if it exists for login)
    if (!formData.password || !formData.password.trim()) {
      formErrors.password = 'Password is required';
    }
    
    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  }, [formData]);

  // Handle form submission
  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();
    
    // Mark all fields as touched
    setTouched({
      email: true,
      password: true,
    });
    
    // Validate form
    if (!validateForm()) {
      setMessage('Please fix the errors above');
      return;
    }
    
    setLoading(true);
    setMessage('');
    
    try {
      const success = await login(formData.email.trim(), formData.password);
      
      if (!success) {
        setMessage('Invalid email or password. Please try again.');
      }
      // Success case is handled by AuthContext (navigation)
    } catch (error) {
      console.error('Login error:', error);
      setMessage('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [formData, login, validateForm]);

  // Handle password visibility toggle
  const handleTogglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  // Check if form is valid
  const isFormValid = Object.keys(errors).length === 0 && 
                     formData.email.trim() && 
                     formData.password.trim();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: 'background.default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography
            variant="h4"
            gutterBottom
            align="center"
            color="primary"
            sx={{ fontWeight: 'bold' }}
          >
            Welcome Back
          </Typography>
          
          <Typography
            variant="body2"
            align="center"
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            Sign in to your account
          </Typography>

          <Box component="form" onSubmit={handleSubmit} noValidate>
            {/* Email Field */}
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              onBlur={handleBlur('email')}
              error={touched.email && !!errors.email}
              helperText={touched.email && errors.email}
              margin="normal"
              required
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
              }}
            />

            {/* Password Field */}
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange('password')}
              onBlur={handleBlur('password')}
              error={touched.password && !!errors.password}
              helperText={touched.password && errors.password}
              margin="normal"
              required
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading || !isFormValid}
              sx={{
                mt: 3,
                mb: 2,
                height: 48,
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Sign In'
              )}
            </Button>

            {/* Links */}
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Link
                component={RouterLink}
                to="/forgot-password"
                variant="body2"
                color="primary"
              >
                Forgot your password?
              </Link>
            </Box>

            <Box sx={{ textAlign: 'center', mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{' '}
                <Link
                  component={RouterLink}
                  to="/signup"
                  color="primary"
                  sx={{ fontWeight: 'medium' }}
                >
                  Sign up here
                </Link>
              </Typography>
            </Box>

            {/* Error/Success Message */}
            {message && (
              <Alert
                severity="error"
                sx={{ mt: 2 }}
                onClose={() => setMessage('')}
              >
                {message}
              </Alert>
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
