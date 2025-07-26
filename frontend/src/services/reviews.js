import { http } from './httpClient';

export const reviewsAPI = {
    // Get reviews for an entity (public)
    async getEntityReviews(entityId, params = {}) {
        const queryParams = new URLSearchParams(params).toString();
        const endpoint = `/reviews/entity/${entityId}${queryParams ? `?${queryParams}` : ''}`;
        return await http.get(endpoint);
    },

    // Get review replies
    async getReviewReplies(reviewId) {
        return await http.get(`/reviews/${reviewId}/replies`);
    },

    // Submit a new review
    async submitReview(reviewData) {
        return await http.post('/reviews', reviewData);
    },

    // Reply to a review
    async replyToReview(reviewId, replyData) {
        return await http.post(`/reviews/${reviewId}/reply`, replyData);
    },

    // Vote on review helpfulness
    async voteOnReview(reviewId, voteType) {
        return await http.post(`/reviews/${reviewId}/vote`, { vote_type: voteType });
    },

    // Get user's own reviews
    async getMyReviews(params = {}) {
        const queryParams = new URLSearchParams(params).toString();
        const endpoint = `/reviews/my-reviews${queryParams ? `?${queryParams}` : ''}`;
        return await http.get(endpoint);
    },

    // Get reviews for entity dashboard
    async getEntityDashboardReviews(entityId, params = {}) {
        const queryParams = new URLSearchParams(params).toString();
        const endpoint = `/reviews/entity/${entityId}/dashboard${queryParams ? `?${queryParams}` : ''}`;
        return await http.get(endpoint);
    },

    // Get reviews given by an entity
    async getEntityGivenReviews(entityId, params = {}) {
        const queryParams = new URLSearchParams(params).toString();
        const endpoint = `/reviews/entity/${entityId}/given${queryParams ? `?${queryParams}` : ''}`;
        return await http.get(endpoint);
    },

    // Admin: Get reviews for moderation
    async getReviewsForModeration(params = {}) {
        const queryParams = new URLSearchParams(params).toString();
        const endpoint = `/reviews/admin/moderation${queryParams ? `?${queryParams}` : ''}`;
        return await http.get(endpoint);
    },

    // Admin: Moderate a review
    async moderateReview(reviewId, action, adminNotes = '') {
        return await http.put(`/reviews/${reviewId}/moderate`, { 
            action, 
            admin_notes: adminNotes 
        });
    },

    // === UNREGISTERED ENTITY REVIEWS ===
    
    // Admin: Get unregistered entity reviews
    async getUnregisteredEntityReviews(params = {}) {
        const queryParams = new URLSearchParams(params).toString();
        const endpoint = `/reviews/unregistered${queryParams ? `?${queryParams}` : ''}`;
        return await http.get(endpoint);
    },

    // Admin: Get unregistered entity reviews statistics
    async getUnregisteredEntityReviewsStats() {
        return await http.get('/reviews/unregistered/stats');
    },

    // Admin: Moderate unregistered entity review
    async moderateUnregisteredEntityReview(reviewId, action, adminNotes = '') {
        return await http.put(`/reviews/unregistered/${reviewId}/moderate`, { 
            action, 
            admin_notes: adminNotes 
        });
    },

    // Admin: Convert unregistered entity review to registered entity
    async convertUnregisteredEntityReview(reviewId, entityType = 'network') {
        return await http.post(`/reviews/unregistered/${reviewId}/convert`, { 
            entity_type: entityType 
        });
    }
};

export default reviewsAPI;