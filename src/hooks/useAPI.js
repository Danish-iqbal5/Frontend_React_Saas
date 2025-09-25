// hooks/useAPI.js
import { useState, useCallback } from 'react';
import { handleAPIError, createSuccessMessage } from '../services/api';

/**
 * Custom hook for API calls with loading, error, and success states
 * Makes API calls easier to manage across components
 */
export function useAPI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Generic API call handler
  const callAPI = useCallback(async (apiFunction, successMessage = '') => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const response = await apiFunction();
      
      if (successMessage) {
        setSuccess(successMessage);
      }
      
      return { success: true, data: response.data };
    } catch (err) {
      const errorInfo = handleAPIError(err);
      setError(errorInfo.message);
      return { success: false, error: errorInfo.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear messages
  const clearMessages = useCallback(() => {
    setError('');
    setSuccess('');
  }, []);

  return {
    loading,
    error,
    success,
    callAPI,
    clearMessages,
    setError,
    setSuccess
  };
}