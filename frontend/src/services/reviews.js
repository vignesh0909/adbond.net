import { authAPI } from './api';

const API_BASE_URL = 'http://localhost:4100/api';

export const reviewsAPI = {
    // Get reviews for an entity (public)
    async getEntityReviews(entityId, params = {}) {
        const queryParams = new URLSearchParams(params).toString();
        const url = `${API_BASE_URL}/reviews/entity/${entityId}${queryParams ? `?${queryParams}` : ''}`;
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch entity reviews');
        }
        return response.json();
    },

    // Get review replies
    async getReviewReplies(reviewId) {
        const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}/replies`);
        if (!response.ok) {
            throw new Error('Failed to fetch review replies');
        }
        return response.json();
    },

    // Submit a new review
    async submitReview(reviewData) {
        const token = authAPI.getToken();
        const response = await fetch(`${API_BASE_URL}/reviews`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(reviewData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to submit review');
        }
        return response.json();
    },

    // Reply to a review
    async replyToReview(reviewId, replyData) {
        const token = authAPI.getToken();
        const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}/reply`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(replyData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to submit reply');
        }
        return response.json();
    },

    // Vote on review helpfulness
    async voteOnReview(reviewId, voteType) {
        const token = authAPI.getToken();
        const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}/vote`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ vote_type: voteType })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to vote on review');
        }
        return response.json();
    },

    // Get user's own reviews
    async getMyReviews(params = {}) {
        const token = authAPI.getToken();
        const queryParams = new URLSearchParams(params).toString();
        const url = `${API_BASE_URL}/reviews/my-reviews${queryParams ? `?${queryParams}` : ''}`;
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user reviews');
        }
        return response.json();
    },

    // Get reviews for entity dashboard
    async getEntityDashboardReviews(entityId, params = {}) {
        const token = authAPI.getToken();
        const queryParams = new URLSearchParams(params).toString();
        const url = `${API_BASE_URL}/reviews/entity/${entityId}/dashboard${queryParams ? `?${queryParams}` : ''}`;
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch entity dashboard reviews');
        }
        return response.json();
    },

    // Admin: Get reviews for moderation
    async getReviewsForModeration(params = {}) {
        const token = authAPI.getToken();
        const queryParams = new URLSearchParams(params).toString();
        const url = `${API_BASE_URL}/reviews/admin/moderation${queryParams ? `?${queryParams}` : ''}`;
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch reviews for moderation');
        }
        return response.json();
    },

    // Admin: Moderate a review
    async moderateReview(reviewId, action, adminNotes = '') {
        const token = authAPI.getToken();
        const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}/moderate`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ action, admin_notes: adminNotes })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to moderate review');
        }
        return response.json();
    }
};
