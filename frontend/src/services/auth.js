import { http } from './httpClient';
import { tokenUtils } from '../utils/tokenUtils';

// Token expiration check interval (check every 30 seconds)
const TOKEN_CHECK_INTERVAL = 30 * 1000;

// Auto-logout warning threshold (5 minutes before expiration)
const AUTO_LOGOUT_WARNING_THRESHOLD = 5 * 60 * 1000;

// Token expiration checker
let tokenExpirationInterval = null;
let logoutCallbacks = [];

// User Authentication APIs
export const authAPI = {
  // User registration
  register: async (userData) => {
    return await http.post('/users/register', userData);
  },

  // User login
  login: async (credentials) => {
    console.log('authAPI.login called with:', credentials.email);
    const response = await http.post('/users/login', credentials);
    console.log('authAPI.login response:', response);

    // Store token in localStorage
    if (response.token) {
      console.log('Storing auth token and user data in localStorage');
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('currentUser', JSON.stringify(response.user));
      
      // Start token expiration checking after successful login
      authAPI.startTokenExpirationCheck();
    } else {
      console.warn('No token received in login response');
    }

    return response;
  },

  // Get current user profile
  getProfile: async () => {
    return await http.get('/users/profile');
  },

  // Update user profile
  updateProfile: async (userId, userData) => {
    return await http.put(`/users/profile/${userId}`, userData);
  },

  // Forgot password
  forgotPassword: async (email) => {
    return await http.post('/users/forgot-password', { email });
  },

  // Reset password (for authenticated users with current password)
  resetPassword: async (passwordData) => {
    return await http.post('/users/reset-password', passwordData);
  },

  // Reset password with token (for forgot password flow)
  resetPasswordWithToken: async (token, newPassword) => {
    return await http.post('/users/reset-password-token', { 
      token, 
      new_password: newPassword 
    });
  },

  // Logout
  logout: () => {
    console.log('Logging out user and clearing all data');
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('password_reset_required');
    
    // Stop token expiration checking
    authAPI.stopTokenExpirationCheck();
    
    // Trigger logout callbacks
    logoutCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error executing logout callback:', error);
      }
    });
  },

  // Auto logout when token expires
  autoLogout: (reason = 'Token expired') => {
    console.warn(`Auto logout triggered: ${reason}`);
    authAPI.logout();
    
    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  },

  // Check if user is logged in
  isLoggedIn: () => {
    const token = localStorage.getItem('authToken');
    if (!token) return false;
    
    // Check if token is expired
    if (tokenUtils.isTokenExpired(token)) {
      console.warn('Token is expired, auto-logging out');
      authAPI.autoLogout('Token expired');
      return false;
    }
    
    return true;
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    try {
      const user = localStorage.getItem('currentUser');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
      // Clear corrupted data
      localStorage.removeItem('currentUser');
      return null;
    }
  },

  // Get auth token from localStorage
  getToken: () => {
    const token = localStorage.getItem('authToken');
    if (token && tokenUtils.isTokenExpired(token)) {
      console.warn('Stored token is expired, auto-logging out');
      authAPI.autoLogout('Token expired');
      return null;
    }
    return token;
  },

  // Check if token is valid (not expired)
  isTokenValid: () => {
    const token = localStorage.getItem('authToken');
    return token && !tokenUtils.isTokenExpired(token);
  },

  // Get token expiration info
  getTokenInfo: () => {
    const token = localStorage.getItem('authToken');
    if (!token) return null;
    
    return {
      token,
      isExpired: tokenUtils.isTokenExpired(token),
      expirationTime: tokenUtils.getTokenExpiration(token),
      timeUntilExpiration: tokenUtils.getTimeUntilExpiration(token),
      isExpiringWithin: (timeInMs) => tokenUtils.isTokenExpiringWithin(token, timeInMs)
    };
  },

  // Start token expiration checking
  startTokenExpirationCheck: () => {
    // Clear any existing interval
    authAPI.stopTokenExpirationCheck();
    
    console.log('Starting token expiration check interval');
    
    tokenExpirationInterval = setInterval(() => {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        console.log('No token found, stopping expiration check');
        authAPI.stopTokenExpirationCheck();
        return;
      }
      
      if (tokenUtils.isTokenExpired(token)) {
        console.warn('Token expired during check, auto-logging out');
        authAPI.autoLogout('Token expired');
        return;
      }
      
      // Check if token is expiring within warning threshold
      const timeUntilExpiration = tokenUtils.getTimeUntilExpiration(token);
      if (timeUntilExpiration <= AUTO_LOGOUT_WARNING_THRESHOLD && timeUntilExpiration > 0) {
        const minutesRemaining = Math.ceil(timeUntilExpiration / (60 * 1000));
        console.warn(`Token expires in ${minutesRemaining} minutes`);
        
        // Optionally show warning to user (can be enhanced with toast notifications)
        if (typeof window !== 'undefined' && window.dispatchEvent) {
          window.dispatchEvent(new CustomEvent('tokenExpiringWarning', {
            detail: { minutesRemaining, timeUntilExpiration }
          }));
        }
      }
    }, TOKEN_CHECK_INTERVAL);
  },

  // Stop token expiration checking
  stopTokenExpirationCheck: () => {
    if (tokenExpirationInterval) {
      console.log('Stopping token expiration check interval');
      clearInterval(tokenExpirationInterval);
      tokenExpirationInterval = null;
    }
  },

  // Add logout callback
  addLogoutCallback: (callback) => {
    if (typeof callback === 'function') {
      logoutCallbacks.push(callback);
      return () => {
        // Return function to remove callback
        const index = logoutCallbacks.indexOf(callback);
        if (index > -1) {
          logoutCallbacks.splice(index, 1);
        }
      };
    }
  },

  getVerificationStatus: async () => {
    return await http.get('/users/verification-status');
  },
  // Verify identity
};

export default authAPI;