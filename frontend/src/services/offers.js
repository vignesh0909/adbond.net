import { http } from './httpClient';

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
    return await http.get(`/offers/fetch_all${queryString}`);
  },

  // Get offer by ID
  getOfferById: async (offerId) => {
    return await http.get(`/offers/${offerId}`);
  },

  // Create new offer
  createOffer: async (offerData) => {
    return await http.post('/offers/create', offerData);
  },

  // Update offer
  updateOffer: async (offerId, offerData) => {
    return await http.put(`/offers/${offerId}`, offerData);
  },

  // Delete offer
  deleteOffer: async (offerId) => {
    return await http.delete(`/offers/${offerId}`);
  },

  // Get offers by entity
  getOffersByEntity: async (entityId, filters = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null) {
        queryParams.append(key, filters[key]);
      }
    });

    const queryString = queryParams.toString();
    const url = `/offers/entity/${entityId}${queryString ? `?${queryString}` : ''}`;
    return await http.get(url);
  },

  // Get public offers by entity (no authentication required)
  getPublicOffersByEntity: async (entityId) => {
    return await http.get(`/offers/entity/public/${entityId}`);
  },

  // Update offer status
  updateOfferStatus: async (offerId, status) => {
    return await http.put(`/offers/${offerId}/status`, { status });
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
    return await http.get(`/offers/offer-requests${queryString}`);
  },

  // Get offer requests by user
  getOfferRequestsByUser: async (userId, filters = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null) {
        queryParams.append(key, filters[key]);
      }
    });

    const queryString = queryParams.toString();
    const url = `/offers/offer-requests/user/${userId}${queryString ? `?${queryString}` : ''}`;
    return await http.get(url);
  },

  // Create offer request
  createOfferRequest: async (requestData) => {
    return await http.post('/offers/offer-request', requestData);
  },

  // Update offer request
  updateOfferRequest: async (offerRequestId, requestData) => {
    return await http.put(`/offers/offer-requests/${offerRequestId}`, requestData);
  },

  // Create bid for offer request
  createBid: async (offerRequestId, bidData) => {
    return await http.post(`/offers/offer-requests/${offerRequestId}/bid`, bidData);
  },

  // Get bids for offer request
  getBidsForRequest: async (offerRequestId) => {
    return await http.get(`/offers/offer-requests/${offerRequestId}/bids`);
  },

  // Apply to offer (track interest)
  applyToOffer: async (offerId, entityId) => {
    return await http.post(`/offers/${offerId}/click`, { entity_id: entityId });
  },

  // Track offer click
  trackOfferClick: async (offerId, entityId) => {
    return await http.post(`/offers/${offerId}/click`, { entity_id: entityId });
  },

  // Send contact email to affiliate
  sendContactEmail: async (offerRequestId, message) => {
    return await http.post(`/offers/offer-requests/${offerRequestId}/contact`, { message });
  },

  // Get email history
  getEmailHistory: async (type = 'all', limit = 20, offset = 0) => {
    const queryParams = new URLSearchParams({
      type,
      limit: limit.toString(),
      offset: offset.toString()
    });
    return await http.get(`/offers/email-history?${queryParams}`);
  },

  // Bulk upload APIs

  // Download Excel template for bulk upload
  downloadTemplate: async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4100/api';
      const response = await fetch(`${API_BASE_URL}/offers/bulk-upload/template`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to download template');
      }

      // Return the response blob directly
      return await response.blob();
    } catch (error) {
      throw error;
    }
  },

  // Preview Excel file before upload
  previewBulkUpload: async (formData) => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4100/api';
      const response = await fetch(`${API_BASE_URL}/offers/bulk-upload/preview`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Preview failed');
      }

      return result;
    } catch (error) {
      throw error;
    }
  },

  // Upload Excel file with offers
  bulkUpload: async (formData) => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4100/api';
      const response = await fetch(`${API_BASE_URL}/offers/bulk-upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      return result;
    } catch (error) {
      throw error;
    }
  },

  // Get bulk upload history
  getBulkUploadHistory: async (limit = 10, offset = 0) => {
    const queryParams = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString()
    });
    return await http.get(`/offers/bulk-upload/history?${queryParams}`);
  },

  // Bulk offer request upload APIs

  // Download Excel template for bulk offer request upload
  downloadOfferRequestTemplate: async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4100/api';
      const response = await fetch(`${API_BASE_URL}/offers/bulk-offer-request-upload/template`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to download template');
      }

      // Return the response blob directly
      return await response.blob();
    } catch (error) {
      throw error;
    }
  },

  // Preview Excel file before upload for offer requests
  previewBulkOfferRequestUpload: async (formData) => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4100/api';
      const response = await fetch(`${API_BASE_URL}/offers/bulk-offer-request-upload/preview`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Preview failed');
      }

      return result;
    } catch (error) {
      throw error;
    }
  },

  // Upload Excel file with offer requests
  bulkOfferRequestUpload: async (formData) => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4100/api';
      const response = await fetch(`${API_BASE_URL}/offers/bulk-offer-request-upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      return result;
    } catch (error) {
      throw error;
    }
  },

  // Get bulk offer request upload history
  getBulkOfferRequestUploadHistory: async (limit = 10, offset = 0) => {
    const queryParams = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString()
    });
    return await http.get(`/offers/bulk-offer-request-upload/history?${queryParams}`);
  },
};

export default offersAPI;