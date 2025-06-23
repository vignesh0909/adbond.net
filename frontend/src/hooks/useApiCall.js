import { useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook to handle API calls with automatic cleanup and duplicate call prevention
 * @param {Function} apiCall - The API function to call
 * @param {Array} dependencies - Dependencies that trigger the API call
 * @param {number} debounceMs - Debounce delay in milliseconds (default: 300)
 * @returns {Function} - Function to manually trigger the API call
 */
export const useApiCall = (apiCall, dependencies = [], debounceMs = 300) => {
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef(null);
  const timeoutRef = useRef(null);

  const executeCall = useCallback(async (...args) => {
    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Cancel previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    // Only proceed if component is still mounted
    if (!isMountedRef.current) return;

    try {
      const result = await apiCall(...args);
      
      // Only return result if component is still mounted and request wasn't aborted
      if (isMountedRef.current && !abortControllerRef.current.signal.aborted) {
        return result;
      }
    } catch (error) {
      // Only throw error if component is still mounted and request wasn't aborted
      if (isMountedRef.current && !abortControllerRef.current.signal.aborted) {
        throw error;
      }
    }
  }, [apiCall]);

  const debouncedCall = useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      executeCall(...args);
    }, debounceMs);
  }, [executeCall, debounceMs]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { executeCall, debouncedCall };
};

/**
 * Custom hook specifically for preventing duplicate API calls with React.StrictMode
 * @param {Function} apiCall - The API function to call
 * @param {Array} dependencies - Dependencies that trigger the API call
 * @returns {Object} - Object with loading state and manual trigger function
 */
export const useApiWithCleanup = (apiCall, dependencies = []) => {
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef(null);
  const hasCalledRef = useRef(false);

  const executeCall = useCallback(async (...args) => {
    // Prevent duplicate calls in React.StrictMode
    if (hasCalledRef.current) return;
    hasCalledRef.current = true;

    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    // Only proceed if component is still mounted
    if (!isMountedRef.current) return;

    try {
      const result = await apiCall(...args);
      
      // Only return result if component is still mounted and request wasn't aborted
      if (isMountedRef.current && !abortControllerRef.current.signal.aborted) {
        return result;
      }
    } catch (error) {
      // Only throw error if component is still mounted and request wasn't aborted
      if (isMountedRef.current && !abortControllerRef.current.signal.aborted) {
        throw error;
      }
    } finally {
      // Reset the flag after a short delay to allow for subsequent calls
      setTimeout(() => {
        hasCalledRef.current = false;
      }, 100);
    }
  }, [apiCall]);

  useEffect(() => {
    executeCall();
  }, dependencies);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return { executeCall };
};
