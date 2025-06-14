// API service for backend integration
const API_BASE_URL = 'http://localhost:4100/api';

// Generic fetch wrapper with error handling
const fetchAPI = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add auth token if available
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('🔑 Adding auth token to request:', endpoint);
  } else {
    console.log('⚠️ No auth token found for request:', endpoint);
  }

  try {
    console.log('📡 Making API call to:', url);
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      console.error('❌ API Error Response:', {
        url,
        status: response.status,
        error: data.error || data.message
      });
      throw new Error(data.error || data.message || `HTTP error! status: ${response.status}`);
    }

    console.log('✅ API Success:', endpoint, 'Status:', response.status);
    return data;
  } catch (error) {
    console.error('💥 API Error:', endpoint, error);
    throw error;
  }
};

// User Authentication APIs
export const authAPI = {
  // User registration
  register: async (userData) => {
    return await fetchAPI('/users/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // User login
  login: async (credentials) => {
    const response = await fetchAPI('/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    // Store token in localStorage
    if (response.token) {
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('currentUser', JSON.stringify(response.user));
    }

    return response;
  },

  // Get current user profile
  getProfile: async () => {
    return await fetchAPI('/users/profile');
  },

  // Update user profile
  updateProfile: async (userId, userData) => {
    return await fetchAPI(`/users/profile/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  // Reset password
  resetPassword: async (passwordData) => {
    return await fetchAPI('/users/reset-password', {
      method: 'POST',
      body: JSON.stringify(passwordData),
    });
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
};

// Entity Management APIs
export const entityAPI = {
  // Register new entity (public endpoint)
  register: async (entityData) => {
    return await fetchAPI('/entities/register', {
      method: 'POST',
      body: JSON.stringify(entityData),
    });
  },

  // Get all public entities
  getPublicEntities: async (entityType = '') => {
    const queryParam = entityType ? `?entity_type=${entityType}` : '';
    return await fetchAPI(`/entities/public${queryParam}`);
  },

  // Get entities by type with pagination
  getEntitiesByType: async (type, page = 1, limit = 10) => {
    return await fetchAPI(`/entities/type/${type}?page=${page}&limit=${limit}`);
  },

  // Get all entities (authenticated)
  getAllEntities: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const queryString = queryParams ? `?${queryParams}` : '';
    return await fetchAPI(`/entities${queryString}`);
  },

  // Get entity by ID
  getEntityById: async (entityId) => {
    return await fetchAPI(`/entities/${entityId}`);
  },

  // Get public entity by ID (no authentication required)
  getPublicEntityById: async (entityId) => {
    return await fetchAPI(`/entities/public/${entityId}`);
  },

  // Update entity
  updateEntity: async (entityId, entityData) => {
    return await fetchAPI(`/entities/${entityId}`, {
      method: 'PUT',
      body: JSON.stringify(entityData),
    });
  },

  // Update verification status (admin only)
  updateVerificationStatus: async (entityId, status) => {
    return await fetchAPI(`/entities/${entityId}/verification`, {
      method: 'PUT',
      body: JSON.stringify({ verification_status: status }),
    });
  },

  // Delete entity (admin only)
  deleteEntity: async (entityId) => {
    return await fetchAPI(`/entities/${entityId}`, {
      method: 'DELETE',
    });
  },
};

// Offers Management APIs
export const offersAPI = {
  // Get all offers with filtering
  getAllOffers: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => queryParams.append(key, v));
        } else {
          queryParams.append(key, value);
        }
      }
    });

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return await fetchAPI(`/offers/fetch_all${queryString}`);
  },

  // Get offer by ID
  getOfferById: async (offerId) => {
    return await fetchAPI(`/offers/${offerId}`);
  },

  // Create new offer
  createOffer: async (offerData) => {
    return await fetchAPI('/offers/create', {
      method: 'POST',
      body: JSON.stringify(offerData),
    });
  },

  // Update offer
  updateOffer: async (offerId, offerData) => {
    return await fetchAPI(`/offers/${offerId}`, {
      method: 'PUT',
      body: JSON.stringify(offerData),
    });
  },

  // Delete offer
  deleteOffer: async (offerId) => {
    return await fetchAPI(`/offers/${offerId}`, {
      method: 'DELETE',
    });
  },

  // Get offers by entity
  getOffersByEntity: async (entityId) => {
    return await fetchAPI(`/offers/entity/${entityId}`);
  },

  // Get public offers by entity (no authentication required)
  getPublicOffersByEntity: async (entityId) => {
    return await fetchAPI(`/offers/entity/public/${entityId}`);
  },

  // Update offer status
  updateOfferStatus: async (offerId, status) => {
    return await fetchAPI(`/offers/${offerId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  // Get all offer requests
  getAllOfferRequests: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '') {
        queryParams.append(key, value);
      }
    });

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return await fetchAPI(`/offers/offer-requests${queryString}`);
  },

  // Get offer requests by user
  getOfferRequestsByUser: async (userId) => {
    return await fetchAPI(`/offers/offer-requests/user/${userId}`);
  },

  // Create offer request
  createOfferRequest: async (requestData) => {
    return await fetchAPI('/offers/offer-request', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  },

  // Create bid for offer request
  createBid: async (offerRequestId, bidData) => {
    return await fetchAPI(`/offers/offer-requests/${offerRequestId}/bid`, {
      method: 'POST',
      body: JSON.stringify(bidData),
    });
  },

  // Get bids for offer request
  getBidsForRequest: async (offerRequestId) => {
    return await fetchAPI(`/offers/offer-requests/${offerRequestId}/bids`);
  },

  // Apply to offer (track interest)
  applyToOffer: async (offerId, entityId) => {
    return await fetchAPI(`/offers/${offerId}/click`, {
      method: 'POST',
      body: JSON.stringify({ entity_id: entityId }),
    });
  },

  // Track offer click
  trackOfferClick: async (offerId, entityId) => {
    return await fetchAPI(`/offers/${offerId}/click`, {
      method: 'POST',
      body: JSON.stringify({ entity_id: entityId }),
    });
  },
};

// Utility functions
export const utils = {
  // Format currency
  formatCurrency: (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  },

  // Format date
  formatDate: (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  },

  // Validate email
  isValidEmail: (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  // Validate URL
  isValidUrl: (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },
};

export default {
  authAPI,
  entityAPI,
  offersAPI,
  utils, };
