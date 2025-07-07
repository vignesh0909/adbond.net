import { jwtDecode } from 'jwt-decode';

/**
 * Token utilities for handling JWT authentication
 */
export const tokenUtils = {
  /**
   * Decode JWT token and return payload
   * @param {string} token - JWT token to decode
   * @returns {object|null} - Decoded token payload or null if invalid
   */
  decodeToken: (token) => {
    try {
      if (!token) return null;
      return jwtDecode(token);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  },

  /**
   * Check if token is expired
   * @param {string} token - JWT token to check
   * @returns {boolean} - True if token is expired, false otherwise
   */
  isTokenExpired: (token) => {
    try {
      if (!token) return true;
      
      const decoded = jwtDecode(token);
      if (!decoded.exp) return true;
      
      // JWT exp is in seconds, Date.now() is in milliseconds
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true; // Consider invalid tokens as expired
    }
  },

  /**
   * Get token expiration time in milliseconds
   * @param {string} token - JWT token
   * @returns {number|null} - Expiration time in milliseconds or null if invalid
   */
  getTokenExpiration: (token) => {
    try {
      if (!token) return null;
      
      const decoded = jwtDecode(token);
      if (!decoded.exp) return null;
      
      // Convert from seconds to milliseconds
      return decoded.exp * 1000;
    } catch (error) {
      console.error('Error getting token expiration:', error);
      return null;
    }
  },

  /**
   * Get time remaining until token expires in milliseconds
   * @param {string} token - JWT token
   * @returns {number} - Time remaining in milliseconds (0 if expired or invalid)
   */
  getTimeUntilExpiration: (token) => {
    try {
      if (!token) return 0;
      
      const decoded = jwtDecode(token);
      if (!decoded.exp) return 0;
      
      const expirationTime = decoded.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      const timeRemaining = expirationTime - currentTime;
      
      return Math.max(0, timeRemaining); // Return 0 if already expired
    } catch (error) {
      console.error('Error calculating time until expiration:', error);
      return 0;
    }
  },

  /**
   * Check if token expires within the specified time
   * @param {string} token - JWT token
   * @param {number} timeInMs - Time in milliseconds to check against
   * @returns {boolean} - True if token expires within the specified time
   */
  isTokenExpiringWithin: (token, timeInMs) => {
    const timeRemaining = tokenUtils.getTimeUntilExpiration(token);
    return timeRemaining > 0 && timeRemaining <= timeInMs;
  }
};

export default tokenUtils;