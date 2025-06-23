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
  getOffersByEntity: async (entityId) => {
    return await http.get(`/offers/entity/${entityId}`);
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
  getOfferRequestsByUser: async (userId) => {
    return await http.get(`/offers/offer-requests/user/${userId}`);
  },

  // Create offer request
  createOfferRequest: async (requestData) => {
    return await http.post('/offers/offer-request', requestData);
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
};

export default offersAPI;