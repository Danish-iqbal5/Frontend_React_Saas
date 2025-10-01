// contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [tokens, setTokens] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  
  
  // Initialize auth state on app start
  useEffect(() => {
    initializeAuth();
  }, []);

  /**
   * Initialize authentication from localStorage
   * Validates tokens and sets user state
   */
  const initializeAuth = useCallback(() => {
    try {
      const savedTokens = localStorage.getItem("tokens");
      const savedUser = localStorage.getItem("user");
      const savedRole = localStorage.getItem("role");
      
      if (savedTokens && savedUser) {
        const parsedTokens = JSON.parse(savedTokens);
        const parsedUser = JSON.parse(savedUser);
        
        // Validate access token
        if (parsedTokens.access && isTokenValid(parsedTokens.access)) {
          setTokens(parsedTokens);
          setUser({ ...parsedUser, role: savedRole || parsedUser.user_type });
        } else {
          // Tokens expired or invalid
          clearAuthData();
        }
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      clearAuthData();
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Check if JWT token is valid and not expired
   * @param {string} token - JWT token to validate
   * @returns {boolean} - True if valid, false otherwise
   */
  const isTokenValid = (token) => {
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      
      // Check if token is expired (with 5 minute buffer)
      return decoded.exp > currentTime + 300;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  };

  /**
   * Save authentication data to state and localStorage
   * @param {Object} tokens - Access and refresh tokens
   * @param {Object} user - User information
   */
  const saveAuthData = useCallback((tokens, user) => {
    try {
      localStorage.setItem("tokens", JSON.stringify(tokens));
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("role", user.user_type);
      
      setTokens(tokens);
      setUser({ ...user, role: user.user_type });
    } catch (error) {
      console.error('Error saving auth data:', error);
    }
  }, []);

  /**
   * Clear all authentication data
   */
  const clearAuthData = useCallback(() => {
    localStorage.removeItem("tokens");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    setTokens(null);
    setUser(null);
  }, []);

  /**
   * Login user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<boolean>} - True if login successful
   */
  const login = useCallback(async (email, password) => {
    try {
      const response = await fetch("http://localhost:8000/api/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", 
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Invalid credentials or server error");
      }

      const data = await response.json();
      
      // Construct user info
      const userInfo = {
        email: data.email,
        user_type: data.user_type,
        is_superuser: data.is_superuser || false,
        full_name: data.full_name || data.email,
        id: data.user_id || data.id,
      };
      
      // Save authentication data
      saveAuthData(
        { access: data.access, refresh: data.refresh }, 
        userInfo
      );
  
      // Navigate based on user type
      if (userInfo.user_type === "superuser" || userInfo.is_superuser) {
        navigate("/admin");
      } else if (userInfo.user_type === "vendor") {
        navigate("/vendor");
      } else {
        navigate("/products");
      }

      return true;
    } catch (error) {
      console.error("Login error:", error.message);
      return false;
    }
  }, [navigate, saveAuthData]);

  /**
   * Logout user and clear authentication
   */
  const logout = useCallback(() => {
    clearAuthData();
    navigate("/login");
  }, [navigate, clearAuthData]);

  /**
   * Check if user is authenticated
   * @returns {boolean} - True if user is authenticated
   */
  const isAuthenticated = useCallback(() => {
    if (!tokens || !tokens.access || !user) {
      return false;
    }
    
    // Validate token is not expired
    return isTokenValid(tokens.access);
  }, [tokens, user]);

  /**
   * Check if user has specific role
   * @param {string} role - Role to check
   * @returns {boolean} - True if user has the role
   */
  const hasRole = useCallback((role) => {
    if (!user) return false;
    
    // Check for superuser
    if (role === 'superuser') {
      return user.is_superuser || user.user_type === 'superuser';
    }
    
    // Check regular roles
    return user.user_type === role || user.role === role;
  }, [user]);

  /**
   * Get current user's role
   * @returns {string|null} - User role or null
   */
  const getUserRole = useCallback(() => {
    if (!user) return null;
    
    if (user.is_superuser || user.user_type === "superuser") {
      return "superuser";
    }
    
    return user.user_type || user.role || null;
  }, [user]);

  /**
   * Update user data in state and localStorage
   * @param {Object} userData - Updated user data
   */
  const updateUser = useCallback((userData) => {
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  }, [user]);

  /**
   * Get access token
   * @returns {string|null} - Access token or null
   */
  const getAccessToken = useCallback(() => {
    return tokens?.access || null;
  }, [tokens]);

  /**
   * Get refresh token
   * @returns {string|null} - Refresh token or null
   */
  const getRefreshToken = useCallback(() => {
    return tokens?.refresh || null;
  }, [tokens]);

  const contextValue = {
    user,
    tokens,
    loading,
    login,
    logout,
    isAuthenticated,
    hasRole,
    getUserRole,
    clearAuthData,
    updateUser,
    getAccessToken,
    getRefreshToken,
    saveAuthData, // Exposed for token refresh
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to use auth context
 * Must be used within AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
