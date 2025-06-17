import React, { useState, useEffect } from 'react';
import { reviewsAPI } from '../services/reviews';

export default function AdminReviewsModeration() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStatus, setSelectedStatus] = useState('pending');
    const [selectedReview, setSelectedReview] = useState(null);
    const [showModerationModal, setShowModerationModal] = useState(false);
    const [moderationData, setModerationData] = useState({
        action: 'approve',
        admin_notes: ''
    });

    useEffect(() => {
        fetchReviews();
    }, [selectedStatus]);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const response = await reviewsAPI.getReviewsForModeration({
                status: selectedStatus,
                limit: 50
            });
            setReviews(response.reviews || []);
        } catch (error) {
            console.error('Failed to fetch reviews for moderation:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleModeration = async (e) => {
        e.preventDefault();
        try {
            await reviewsAPI.moderateReview(
                selectedReview.review_id,
                moderationData.action,
                moderationData.admin_notes
            );
            
            setShowModerationModal(false);
            setSelectedReview(null);
            setModerationData({ action: 'approve', admin_notes: '' });
            fetchReviews(); // Refresh the list
            alert(`Review ${moderationData.action}d successfully`);
        } catch (error) {
            console.error('Failed to moderate review:', error);
            alert('Failed to moderate review');
        }
    };

    const openModerationModal = (review, action = 'approve') => {
        setSelectedReview(review);
        setModerationData({ action, admin_notes: '' });
        setShowModerationModal(true);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const renderStars = (rating) => {
        return '★'.repeat(rating) + '☆'.repeat(5 - rating);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'approved': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            case 'flagged': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Review Moderation</h2>
                <div className="flex space-x-2">
                    {['pending', 'approved', 'rejected', 'flagged'].map(status => (
                        <button
                            key={status}
                            onClick={() => setSelectedStatus(status)}
                            className={`px-4 py-2 rounded-md text-sm font-medium ${
                                selectedStatus === status
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : reviews.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">No {selectedStatus} reviews found.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {reviews.map((review) => (
                        <div key={review.review_id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                            {/* Review Header */}
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-semibold text-lg">{review.title}</h3>
                                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                                        <span>By {review.reviewer_name}</span>
                                        <span>•</span>
                                        <span>{review.reviewer_email}</span>
                                        <span>•</span>
                                        <span className="capitalize">{review.reviewer_type}</span>
                                        <span>•</span>
                                        <span>{formatDate(review.created_at)}</span>
                                    </div>
                                    <div className="mt-2">
                                        <span className="font-medium text-gray-700">Entity: </span>
                                        <span className="font-medium">{review.entity_name}</span>
                                        <span className="ml-2 text-sm text-gray-500 capitalize">({review.entity_type})</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl text-yellow-500 mb-1">
                                        {renderStars(review.overall_rating)}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {review.overall_rating}/5
                                    </div>
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${getStatusColor(review.review_status)}`}>
                                        {review.review_status}
                                    </span>
                                </div>
                            </div>

                            {/* Review Content */}
                            <div className="mb-4">
                                <p className="text-gray-700">{review.review_text}</p>
                            </div>

                            {/* Category Ratings */}
                            {review.category_ratings && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                                    <div className="text-center">
                                        <div className="text-sm text-gray-600 mb-1">Quality</div>
                                        <div className="text-yellow-500">{renderStars(review.category_ratings.quality)}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-sm text-gray-600 mb-1">Support</div>
                                        <div className="text-yellow-500">{renderStars(review.category_ratings.support)}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-sm text-gray-600 mb-1">Reliability</div>
                                        <div className="text-yellow-500">{renderStars(review.category_ratings.reliability)}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-sm text-gray-600 mb-1">Payment Speed</div>
                                        <div className="text-yellow-500">{renderStars(review.category_ratings.payment_speed)}</div>
                                    </div>
                                </div>
                            )}

                            {/* Admin Notes */}
                            {review.admin_notes && (
                                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                                    <div className="text-sm font-medium text-blue-800 mb-1">Admin Notes:</div>
                                    <div className="text-sm text-blue-700">{review.admin_notes}</div>
                                </div>
                            )}

                            {/* Anonymous Warning */}
                            {review.is_anonymous && (
                                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <div className="text-sm text-yellow-800">
                                        ⚠️ This review was submitted anonymously. Reviewer details are visible to admins only.
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                                {selectedStatus === 'pending' && (
                                    <>
                                        <button
                                            onClick={() => openModerationModal(review, 'approve')}
                                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => openModerationModal(review, 'reject')}
                                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium"
                                        >
                                            Reject
                                        </button>
                                        <button
                                            onClick={() => openModerationModal(review, 'flag')}
                                            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 text-sm font-medium"
                                        >
                                            Flag
                                        </button>
                                    </>
                                )}
                                {selectedStatus !== 'pending' && (
                                    <button
                                        onClick={() => openModerationModal(review, 'approve')}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                                    >
                                        Re-moderate
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Moderation Modal */}
            {showModerationModal && selectedReview && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4">
                            {moderationData.action.charAt(0).toUpperCase() + moderationData.action.slice(1)} Review
                        </h3>
                        
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                            <div className="font-medium">{selectedReview.title}</div>
                            <div className="text-sm text-gray-600">By {selectedReview.reviewer_name}</div>
                            <div className="text-sm text-gray-600">Entity: {selectedReview.entity_name}</div>
                        </div>

                        <form onSubmit={handleModeration}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Action
                                </label>
                                <select
                                    value={moderationData.action}
                                    onChange={(e) => setModerationData(prev => ({ ...prev, action: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="approve">Approve</option>
                                    <option value="reject">Reject</option>
                                    <option value="flag">Flag for Review</option>
                                </select>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Admin Notes (Optional)
                                </label>
                                <textarea
                                    value={moderationData.admin_notes}
                                    onChange={(e) => setModerationData(prev => ({ ...prev, admin_notes: e.target.value }))}
                                    rows={3}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Add notes about your moderation decision..."
                                />
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModerationModal(false);
                                        setSelectedReview(null);
                                        setModerationData({ action: 'approve', admin_notes: '' });
                                    }}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={`px-4 py-2 text-white rounded-md ${
                                        moderationData.action === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                                        moderationData.action === 'reject' ? 'bg-red-600 hover:bg-red-700' :
                                        'bg-orange-600 hover:bg-orange-700'
                                    }`}
                                >
                                    {moderationData.action.charAt(0).toUpperCase() + moderationData.action.slice(1)} Review
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
