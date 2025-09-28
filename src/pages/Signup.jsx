// pages/Signup.jsx
import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { authAPI, handleAPIError } from '../services/api';
import { validateEmail, validateFullName, validateUserType, debounce } from '../utils/validation';
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
  Link,
  InputAdornment,
  FormHelperText,
} from '@mui/material';
import {
  Person,
  Email,
  AccountCircle,
} from '@mui/icons-material';

const Signup = () => {
  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    user_type: 'normal_customer',
  });
  
  // UI state
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('error');
  const [touched, setTouched] = useState({});
  
  // Hooks
  const navigate = useNavigate();

  // Clear message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
        setMessageType('error');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Debounced validation function
  const debouncedValidation = useCallback(
    debounce((field, value) => {
      const fieldErrors = { ...errors };
      
      switch (field) {
        case 'full_name':
          const nameError = validateFullName(value);
          if (nameError) {
            fieldErrors.full_name = nameError;
          } else {
            delete fieldErrors.full_name;
          }
          break;
        case 'email':
          const emailError = validateEmail(value);
          if (emailError) {
            fieldErrors.email = emailError;
          } else {
            delete fieldErrors.email;
          }
          break;
        case 'user_type':
          const userTypeError = validateUserType(value);
          if (userTypeError) {
            fieldErrors.user_type = userTypeError;
          } else {
            delete fieldErrors.user_type;
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
      setMessageType('error');
    }

    // Validate field if it's been touched
    if (touched[field]) {
      debouncedValidation(field, value);
    }
  }, [touched, message, debouncedValidation]);

  // Handle field blur
  const handleBlur = useCallback((field) => () => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));

    // Validate immediately on blur
    const value = formData[field];
    const fieldErrors = { ...errors };
    
    switch (field) {
      case 'full_name':
        const nameError = validateFullName(value);
        if (nameError) {
          fieldErrors.full_name = nameError;
        } else {
          delete fieldErrors.full_name;
        }
        break;
      case 'email':
        const emailError = validateEmail(value);
        if (emailError) {
          fieldErrors.email = emailError;
        } else {
          delete fieldErrors.email;
        }
        break;
      case 'user_type':
        const userTypeError = validateUserType(value);
        if (userTypeError) {
          fieldErrors.user_type = userTypeError;
        } else {
          delete fieldErrors.user_type;
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
    
    // Full name validation
    const nameError = validateFullName(formData.full_name);
    if (nameError) {
      formErrors.full_name = nameError;
    }
    
    // Email validation
    const emailError = validateEmail(formData.email);
    if (emailError) {
      formErrors.email = emailError;
    }
    
    // User type validation
    const userTypeError = validateUserType(formData.user_type);
    if (userTypeError) {
      formErrors.user_type = userTypeError;
    }
    
    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  }, [formData]);

  // Handle form submission
  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();
    
    // Mark all fields as touched
    setTouched({
      full_name: true,
      email: true,
      user_type: true,
    });
    
    // Validate form
    if (!validateForm()) {
      setMessage('Please fix the errors above');
      setMessageType('error');
      return;
    }
    
    setLoading(true);
    setMessage('');
    setMessageType('error');
    
    try {
      // Prepare data for API
      const registrationData = {
        full_name: formData.full_name.trim(),
        email: formData.email.trim().toLowerCase(),
        user_type: formData.user_type,
      };
      
      await authAPI.register(registrationData);
      
      // Success
      setMessage('Registration successful! OTP has been sent to your email.');
      setMessageType('success');
      
      // Navigate to OTP verification with state
      setTimeout(() => {
        navigate('/verify-otp', {
          state: {
            email: registrationData.email,
            userType: registrationData.user_type,
          }
        });
      }, 1500);
      
    } catch (error) {
      console.error('Registration error:', error);
      const errorInfo = handleAPIError(error);
      setMessage(errorInfo.message);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  }, [formData, navigate, validateForm]);

  // Check if form is valid
  const isFormValid = Object.keys(errors).length === 0 && 
                     formData.full_name.trim() && 
                     formData.email.trim() &&
                     formData.user_type;

  // User type options
  const userTypeOptions = [
    { value: 'normal_customer', label: 'Normal Customer', description: 'Regular shopping account' },
    { value: 'vendor', label: 'Vendor', description: 'Sell products on our platform' },
    { value: 'vip_customer', label: 'VIP Customer', description: 'Premium shopping benefits' },
  ];

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
            Create Account
          </Typography>
          
          <Typography
            variant="body2"
            align="center"
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            Join our community today
          </Typography>

          <Box component="form" onSubmit={handleSubmit} noValidate>
            {/* Full Name Field */}
            <TextField
              fullWidth
              label="Full Name"
              value={formData.full_name}
              onChange={handleChange('full_name')}
              onBlur={handleBlur('full_name')}
              error={touched.full_name && !!errors.full_name}
              helperText={touched.full_name && errors.full_name}
              margin="normal"
              required
              disabled={loading}
              inputProps={{
                maxLength: 50,
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="action" />
                  </InputAdornment>
                ),
              }}
            />

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
              inputProps={{
                maxLength: 254,
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
              }}
            />

            {/* User Type Selection */}
            <FormControl
              fullWidth
              margin="normal"
              error={touched.user_type && !!errors.user_type}
              disabled={loading}
            >
              <InputLabel id="user-type-label">Account Type *</InputLabel>
              <Select
                labelId="user-type-label"
                value={formData.user_type}
                onChange={handleChange('user_type')}
                onBlur={handleBlur('user_type')}
                label="Account Type *"
              >
                {userTypeOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    <Box>
                      <Typography variant="body1">{option.label}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {option.description}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
              {touched.user_type && errors.user_type && (
                <FormHelperText>{errors.user_type}</FormHelperText>
              )}
            </FormControl>

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
                'Create Account'
              )}
            </Button>

            {/* Links */}
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link
                  component={RouterLink}
                  to="/login"
                  color="primary"
                  sx={{ fontWeight: 'medium' }}
                >
                  Sign in here
                </Link>
              </Typography>
            </Box>

            {/* Message */}
            {message && (
              <Alert
                severity={messageType}
                sx={{ mt: 2 }}
                onClose={() => {
                  setMessage('');
                  setMessageType('error');
                }}
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

export default Signup;
