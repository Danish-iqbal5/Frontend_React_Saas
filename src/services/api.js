// services/api.js
import axios from 'axios';

// Base API configuration
const api = axios.create({
  baseURL: 'http://localhost:8000/', // Removed /api/ since it's in Django URLs
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000, // 10 second timeout
});

// Helper function to get tokens from localStorage
const getTokens = () => {
  try {
    const tokensString = localStorage.getItem('tokens');
    return tokensString ? JSON.parse(tokensString) : null;
  } catch (error) {
    console.error('Error parsing tokens:', error);
    return null;
  }
};

// Helper function to save tokens
const saveTokens = (tokens) => {
  localStorage.setItem('tokens', JSON.stringify(tokens));
};

// Helper function to clear auth data
const clearAuthData = () => {
  localStorage.removeItem('tokens');
  localStorage.removeItem('user');
  localStorage.removeItem('role');
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const tokens = getTokens();
    if (tokens && tokens.access) {
      config.headers.Authorization = `Bearer ${tokens.access}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const tokens = getTokens();
        if (tokens && tokens.refresh) {
          // Try to refresh the token
          const refreshResponse = await axios.post(
            'http://localhost:8000/api/refresh/',
            { refresh: tokens.refresh }
          );

          const newTokens = {
            ...tokens,
            access: refreshResponse.data.access
          };

          saveTokens(newTokens);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${newTokens.access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // Refresh failed, clear auth data and redirect to login
        clearAuthData();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API methods for better organization
export const authAPI = {
  // User registration
  register: (userData) => api.post('/api/register/', userData),
  
  // OTP verification
  verifyOTP: (otpData) => api.post('/api/verify-otp/', otpData),
  
  // Resend OTP
  resendOTP: (email) => api.post('/api/resend-otp/', { email }),
  
  // User login
  login: (credentials) => api.post('/api/login/', credentials),
  
  // Token refresh
  refreshToken: (refreshToken) => api.post('/api/refresh/', { refresh: refreshToken }),
  
  // User logout
  logout: () => api.post('/api/logout/'),
  
  // Password reset request
  forgotPassword: (email) => api.post('/api/forgot-password/', { email }),
  
  // Password reset
  resetPassword: (resetData) => api.post('/api/reset-password/', resetData),
  
  // Set password
  setPassword: (userId, passwordData) => api.post(`/api/set-password/${userId}/`, passwordData),
};

export const productsAPI = {
  // Get all products
  getProducts: () => api.get('/Products/products/'),
  
  // Get vendor products
  getVendorProducts: () => api.get('/Products/vendor/products/'),
  
  // Create product (vendor)
  createProduct: (productData) => api.post('/Products/vendor/products/', productData),
  
  // Update product (vendor)
  updateProduct: (productId, productData) => api.put(`/Products/vendor/products/${productId}/`, productData),
  
  // Delete product (vendor)
  deleteProduct: (productId) => api.delete(`/Products/vendor/products/${productId}/`),
  
  // Get product details
  getProductDetails: (productId) => api.get(`/Products/vendor/${productId}/`),
};

export const cartAPI = {
  // Get cart items
  getCart: () => api.get('/Products/cart/'),
  
  // Add to cart
  addToCart: (cartData) => api.post('/Products/cart/', cartData),
  
  // Update cart item
  updateCartItem: (itemId, quantity) => api.put(`/Products/cart/${itemId}/`, { quantity }),
  
  // Remove from cart
  removeFromCart: (itemId) => api.delete(`/Products/cart/${itemId}/`),
};

export const adminAPI = {
  // Get admin dashboard data
  getDashboardData: () => api.get('/api/admin-dashboard/'),
};

// Error handling helper
export const handleAPIError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return { message: data.error || data.message || 'Bad request', type: 'error' };
      case 401:
        return { message: 'Unauthorized access. Please login again.', type: 'error' };
      case 403:
        return { message: 'Access denied.', type: 'error' };
      case 404:
        return { message: 'Resource not found.', type: 'error' };
      case 500:
        return { message: 'Server error. Please try again later.', type: 'error' };
      default:
        return { message: data.error || data.message || 'An error occurred', type: 'error' };
    }
  } else if (error.request) {
    // Network error
    return { message: 'Network error. Please check your connection.', type: 'error' };
  } else {
    // Other error
    return { message: error.message || 'An unexpected error occurred', type: 'error' };
  }
};

// Success message helper
export const createSuccessMessage = (message) => ({
  message,
  type: 'success'
});

export default api;