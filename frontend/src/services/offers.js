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
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
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
    return await fetchAPI(`/offers/fetch_all/${queryString}`);
  },

  // Get offer by ID
  getOfferById: async (offerId) => {
    return await fetchAPI(`/offer/${offerId}`);
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
    return await fetchAPI(`/offer/${offerId}`, {
      method: 'PUT',
      body: JSON.stringify(offerData),
    });
  },

  // Delete offer
  deleteOffer: async (offerId) => {
    return await fetchAPI(`/offer/${offerId}`, {
      method: 'DELETE',
    });
  },

  // Get offers by entity
  getOffersByEntity: async (entityId) => {
    return await fetchAPI(`/offer/entity/${entityId}`);
  },

  // Update offer status
  updateOfferStatus: async (offerId, status) => {
    return await fetchAPI(`/offer/${offerId}/status`, {
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
    return await fetchAPI(`/offer/offer-requests${queryString}`);
  },

  // Get offer requests by user
  getOfferRequestsByUser: async (userId) => {
    return await fetchAPI(`/offer/offer-requests/user/${userId}`);
  },

  // Create offer request
  createOfferRequest: async (requestData) => {
    return await fetchAPI('/offer/offer-request', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  },

  // Create bid for offer request
  createBid: async (offerRequestId, bidData) => {
    return await fetchAPI(`/offer/offer-requests/${offerRequestId}/bid`, {
      method: 'POST',
      body: JSON.stringify(bidData),
    });
  },

  // Get bids for offer request
  getBidsForRequest: async (offerRequestId) => {
    return await fetchAPI(`/offer/offer-requests/${offerRequestId}/bids`);
  },

  // Apply to offer (track interest)
  applyToOffer: async (offerId, entityId) => {
    return await fetchAPI(`/offer/offers/${offerId}/click`, {
      method: 'POST',
      body: JSON.stringify({ entity_id: entityId }),
    });
  },

  // Track offer click
  trackOfferClick: async (offerId, entityId) => {
    return await fetchAPI(`/offer/${offerId}/click`, {
      method: 'POST',
      body: JSON.stringify({ entity_id: entityId }),
    });
  },
};

export default { offersAPI };