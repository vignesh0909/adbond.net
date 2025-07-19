import { useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/auth';

/**
 * Custom hook for authentication state management with token expiration handling
 */
export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tokenInfo, setTokenInfo] = useState(null);

  // Check authentication status
  const checkAuthStatus = useCallback(() => {
    try {
      const loggedIn = authAPI.isLoggedIn();
      const currentUser = authAPI.getCurrentUser();
      const tokenData = authAPI.getTokenInfo();

      setIsAuthenticated(loggedIn);
      setUser(currentUser);
      setTokenInfo(tokenData);
      setIsLoading(false);

      return loggedIn;
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
      setTokenInfo(null);
      setIsLoading(false);
      return false;
    }
  }, []);

  // Login function
  const login = useCallback(async (credentials) => {
    try {
      setIsLoading(true);
      const response = await authAPI.login(credentials);

      // Refresh auth state after successful login
      const isLoggedIn = checkAuthStatus();

      setIsLoading(false);
      return response;
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  }, [checkAuthStatus]);

  // Logout function
  const logout = useCallback(() => {
    try {
      authAPI.logout();
      setIsAuthenticated(false);
      setUser(null);
      setTokenInfo(null);
    } catch (error) {
    }
  }, []);

  // Handle token expiration warning
  useEffect(() => {
    const handleTokenWarning = (event) => {
      // Update token info when warning is received
      const updatedTokenInfo = authAPI.getTokenInfo();
      setTokenInfo(updatedTokenInfo);
    };

    // Listen for token expiring warnings
    if (typeof window !== 'undefined') {
      window.addEventListener('tokenExpiringWarning', handleTokenWarning);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('tokenExpiringWarning', handleTokenWarning);
      }
    };
  }, []);

  // Register logout callback to update state when auto-logout occurs
  useEffect(() => {
    const removeCallback = authAPI.addLogoutCallback(() => {
      setIsAuthenticated(false);
      setUser(null);
      setTokenInfo(null);
    });

    return removeCallback;
  }, []);

  // Initialize authentication state and start token expiration checking
  useEffect(() => {
    checkAuthStatus();

    // Start token expiration checking if user is authenticated
    if (authAPI.isLoggedIn()) {
      authAPI.startTokenExpirationCheck();
    }

    // Cleanup on unmount
    return () => {
      authAPI.stopTokenExpirationCheck();
    };
  }, [checkAuthStatus]);

  // Periodic auth status check and token info update (every 30 seconds)
  useEffect(() => {
    const checkInterval = 30 * 1000; // 30 seconds

    const interval = setInterval(() => {
      if (isAuthenticated) {
        checkAuthStatus();
        // Update token info to reflect current expiration status
        const updatedTokenInfo = authAPI.getTokenInfo();
        setTokenInfo(updatedTokenInfo);
      }
    }, checkInterval);

    return () => clearInterval(interval);
  }, [isAuthenticated, checkAuthStatus]);

  return {
    // Auth state
    isAuthenticated,
    user,
    isLoading,
    tokenInfo,

    // Auth actions
    login,
    logout,
    checkAuthStatus,

    // Utility functions
    isTokenExpiring: tokenInfo?.isExpiringWithin(5 * 60 * 1000) || false, // 5 minutes
    timeUntilExpiration: tokenInfo?.timeUntilExpiration || 0,
  };
};

export default useAuth;
