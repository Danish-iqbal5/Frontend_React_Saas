import axios from 'axios';

export const API_ROUTES = {
  baseURL: 'http://localhost:8000/',
  auth: {
    register: '/api/register/',
    verifyOtp: '/api/verify-otp/',
    resendOtp: '/api/resend-otp/',
    login: '/api/login/',
    refresh: '/api/refresh/',
    logout: '/api/logout/',
    forgotPassword: '/api/forgot-password/',
    resetPassword: '/api/reset-password/',
    setPassword: (userId) => `/api/set-password/${userId}/`,
  },
  products: {
    list: '/Products/products/',
    vendorList: '/Products/vendor/products/',
    vendorItem: (id) => `/Products/vendor/products/${id}/`,
    vendorDetails: (id) => `/Products/vendor/${id}/`,
  },
  cart: {
    root: '/Products/cart/',
    manage: '/Products/manage-cart-products/',
    clear: '/Products/cart/clear/',
  },
  admin: {
    dashboard: '/api/admin-dashboard/',
    decision: '/admin-dashboard/',
  },
};

// Base API configuration
const api = axios.create({
  baseURL: API_ROUTES.baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Track if we're currently refreshing token
let isRefreshing = false;
let failedQueue = [];

/**
 * Process queued requests after token refresh
 */
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

/**
 * Helper function to get tokens from localStorage
 */
const getTokens = () => {
  try {
    const tokensString = localStorage.getItem('tokens');
    return tokensString ? JSON.parse(tokensString) : null;
  } catch (error) {
    console.error('Error parsing tokens:', error);
    return null;
  }
};

/**
 * Helper function to save tokens
 */
const saveTokens = (tokens) => {
  try {
    localStorage.setItem('tokens', JSON.stringify(tokens));
  } catch (error) {
    console.error('Error saving tokens:', error);
  }
};

/**
 * Helper function to clear auth data
 */
const clearAuthData = () => {
  localStorage.removeItem('tokens');
  localStorage.removeItem('user');
  localStorage.removeItem('role');
};

/**
 * Request interceptor to add auth token to requests
 */
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

/**
 * Response interceptor for automatic token refresh
 */
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If error is not 401 or request already retried, reject
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // If already refreshing, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const tokens = getTokens();

    // If no refresh token available, logout
    if (!tokens || !tokens.refresh) {
      clearAuthData();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    try {
      // Try to refresh the token
      const refreshResponse = await axios.post(
        `${API_ROUTES.baseURL}${API_ROUTES.auth.refresh}`,
        { refresh: tokens.refresh }
      );

      const newAccessToken = refreshResponse.data.access;

      // Save new token
      const newTokens = {
        ...tokens,
        access: newAccessToken,
      };
      saveTokens(newTokens);

      // Update authorization header
      api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      // Process queued requests
      processQueue(null, newAccessToken);

      // Retry original request
      return api(originalRequest);
    } catch (refreshError) {
      console.error('Token refresh failed:', refreshError);

      // Process queue with error
      processQueue(refreshError, null);

      // Clear auth data and redirect to login
      clearAuthData();
      window.location.href = '/login';

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

/**
 * Authentication API endpoints
 */
export const authAPI = {
  // User registration
  register: (userData) => api.post(API_ROUTES.auth.register, userData),

  // OTP verification
  verifyOTP: (otpData) => api.post(API_ROUTES.auth.verifyOtp, otpData),

  // Resend OTP
  resendOTP: (email) => api.post(API_ROUTES.auth.resendOtp, { email }),

  // User login
  login: (credentials) => api.post(API_ROUTES.auth.login, credentials),

  // Token refresh
  refreshToken: (refreshToken) => api.post(API_ROUTES.auth.refresh, { refresh: refreshToken }),

  // User logout
  logout: () => api.post(API_ROUTES.auth.logout),

  // Password reset request
  forgotPassword: (email) => api.post(API_ROUTES.auth.forgotPassword, { email }),

  // Password reset
  resetPassword: (resetData) => api.post(API_ROUTES.auth.resetPassword, resetData),

  // Set password
  setPassword: (userId, passwordData) => api.post(API_ROUTES.auth.setPassword(userId), passwordData),
};

/**
 * Products API endpoints
 */
export const productsAPI = {
  // Get all products
  getProducts: () => api.get(API_ROUTES.products.list),

  // Get vendor products
  getVendorProducts: () => api.get(API_ROUTES.products.vendorList),

  // Create product (vendor)
  createProduct: (productData) => api.post(API_ROUTES.products.vendorList, productData),

  // Update product (vendor)
  updateProduct: (productId, productData) =>
    api.put(API_ROUTES.products.vendorItem(productId), productData),

  // Delete product (vendor)
  deleteProduct: (productId) => api.delete(API_ROUTES.products.vendorItem(productId)),

  // Get product details
  getProductDetails: (productId) => api.get(API_ROUTES.products.vendorDetails(productId)),
};

/**
 * Cart API endpoints
 */
export const cartAPI = {
  // Get cart items
  getCart: () => api.get(API_ROUTES.cart.root),

  // Add to cart
  addToCart: (cartData) => api.post(API_ROUTES.cart.root, cartData),

  // Update cart item quantity
  updateCartItem: (productId, quantity, cartItemId) =>
    api.put(API_ROUTES.cart.manage, {
      // Include only identifiers that are present
      ...(productId ? { product_id: productId } : {}),
      ...(cartItemId ? { cart_item_id: cartItemId } : {}),
      quantity: quantity,
    }),

  // Remove from cart (restores stock)
  removeFromCart: (productId, cartItemId) =>
    api.delete(API_ROUTES.cart.manage, {
      // Send both query param and body to satisfy servers that ignore DELETE bodies
      params: { product_id: productId, ...(cartItemId ? { cart_item_id: cartItemId } : {}) },
      data: { product_id: productId, ...(cartItemId ? { cart_item_id: cartItemId } : {}) },
    }),
    


  // Clear cart
  clearCart: () => api.delete(API_ROUTES.cart.clear),
};

/**
 * Admin API endpoints
 */
export const adminAPI = {
  // Get admin dashboard data
  getDashboardData: () => api.get(API_ROUTES.admin.dashboard),

  // Approve/reject user
  updateUserStatus: (userId, action, rejectionReason = '') =>
    api.post(API_ROUTES.admin.decision, { id: userId, action, rejection_reason: rejectionReason }),
};

/**
 * Error handling helper - Extracts user-friendly error messages
 */
export const handleAPIError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;

    switch (status) {
      case 400:
        return {
          message: data.error || data.message || 'Invalid request. Please check your input.',
          type: 'error',
          details: data,
        };
      case 401:
        return {
          message: 'Unauthorized access. Please login again.',
          type: 'error',
        };
      case 403:
        return {
          message: "Access denied. You don't have permission to perform this action.",
          type: 'error',
        };
      case 404:
        return {
          message: 'Resource not found.',
          type: 'error',
        };
      case 500:
        return {
          message: 'Server error. Please try again later.',
          type: 'error',
        };
      default:
        return {
          message: data.error || data.message || 'An error occurred',
          type: 'error',
          details: data,
        };
    }
  } else if (error.request) {
    // Network error - request was made but no response
    return {
      message: 'Network error. Please check your internet connection.',
      type: 'error',
    };
  } else {
    // Other error
    return {
      message: error.message || 'An unexpected error occurred',
      type: 'error',
    };
  }
};

/**
 * Success message helper
 */
export const createSuccessMessage = (message) => ({
  message,
  type: 'success',
});

/**
 * Validation helper - Checks if API response is successful
 */
export const isSuccessResponse = (response) => {
  return response && response.status >= 200 && response.status < 300;
};

export default api;
