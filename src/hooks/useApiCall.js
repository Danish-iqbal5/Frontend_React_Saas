// hooks/useApiCall.js
import { useState, useCallback } from 'react';
import { handleAPIError } from '../services/api';

/**
 * Custom hook for handling API calls with loading and error states
 * @param {Function} apiFunction - The API function to call
 * @param {Object} options - Configuration options
 * @returns {Object} - { data, loading, error, execute, reset }
 * 
 * @example
 * const { data, loading, error, execute } = useApiCall(productsAPI.getProducts);
 * 
 * useEffect(() => {
 *   execute();
 * }, []);
 */
export const useApiCall = (apiFunction, options = {}) => {
  const {
    onSuccess = null,
    onError = null,
    initialData = null,
  } = options;

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Execute the API call
   */
  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiFunction(...args);
      setData(response.data);

      if (onSuccess) {
        onSuccess(response.data);
      }

      return { success: true, data: response.data };
    } catch (err) {
      const errorInfo = handleAPIError(err);
      setError(errorInfo.message);

      if (onError) {
        onError(errorInfo);
      }

      return { success: false, error: errorInfo };
    } finally {
      setLoading(false);
    }
  }, [apiFunction, onSuccess, onError]);

  /**
   * Reset the state
   */
  const reset = useCallback(() => {
    setData(initialData);
    setError(null);
    setLoading(false);
  }, [initialData]);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
};

/**
 * Custom hook for handling form submissions with API calls
 * @param {Function} apiFunction - The API function to call
 * @param {Object} options - Configuration options
 * @returns {Object} - { loading, error, success, submit, reset }
 * 
 * @example
 * const { loading, error, success, submit } = useFormSubmit(authAPI.login, {
 *   onSuccess: (data) => navigate('/dashboard')
 * });
 * 
 * const handleSubmit = async (e) => {
 *   e.preventDefault();
 *   await submit(formData);
 * };
 */
export const useFormSubmit = (apiFunction, options = {}) => {
  const {
    onSuccess = null,
    onError = null,
    successMessage = 'Operation successful!',
  } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  /**
   * Submit the form
   */
  const submit = useCallback(async (formData) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await apiFunction(formData);
      setSuccess(successMessage);

      if (onSuccess) {
        onSuccess(response.data);
      }

      return { success: true, data: response.data };
    } catch (err) {
      const errorInfo = handleAPIError(err);
      setError(errorInfo.message);

      if (onError) {
        onError(errorInfo);
      }

      return { success: false, error: errorInfo };
    } finally {
      setLoading(false);
    }
  }, [apiFunction, onSuccess, onError, successMessage]);

  /**
   * Reset the state
   */
  const reset = useCallback(() => {
    setError(null);
    setSuccess(null);
    setLoading(false);
  }, []);

  /**
   * Clear messages
   */
  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  return {
    loading,
    error,
    success,
    submit,
    reset,
    clearMessages,
  };
};

export default useApiCall;
