import { http } from './httpClient';

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

  // Reset password
  resetPassword: async (passwordData) => {
    return await http.post('/users/reset-password', passwordData);
  },

  // Logout
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('password_reset_required');
  },

  // Check if user is logged in
  isLoggedIn: () => {
    return !!localStorage.getItem('authToken');
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
    return localStorage.getItem('authToken');
  },

  getVerificationStatus: async () => {
    return await http.get('/users/verification-status');
  },
  // Verify identity
};

export default authAPI;