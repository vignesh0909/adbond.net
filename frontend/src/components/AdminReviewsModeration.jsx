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
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <h2 className="text-3xl font-extrabold drop-shadow-lg">Review Moderation</h2>
                <div className="flex space-x-2">
                    {['pending', 'approved', 'rejected', 'flagged'].map(status => (
                        <button
                            key={status}
                            onClick={() => setSelectedStatus(status)}
                            className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors duration-200 shadow-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                                selectedStatus === status
                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                                    : 'bg-white/80 text-gray-700 hover:bg-blue-50'
                            }`}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                </div>
            </div>
            {loading ? (
                <div className="flex justify-center items-center py-16">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                </div>
            ) : reviews.length === 0 ? (
                <div className="text-center py-16 bg-white/80 rounded-2xl shadow">
                    <p className="text-gray-600 text-lg">No {selectedStatus} reviews found.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {reviews.map((review) => (
                        <div key={review.review_id} className="bg-white/80 backdrop-blur-lg border border-gray-200 rounded-2xl p-8 shadow-xl">
                            {/* Review Header */}
                            <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4 gap-4">
                                <div>
                                    <h3 className="font-bold text-xl mb-1">{review.title}</h3>
                                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
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
                                <div className="text-right min-w-[120px]">
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
                                <p className="text-gray-700 text-base leading-relaxed">{review.review_text}</p>
                            </div>
                            {/* Category Ratings */}
                            {review.category_ratings && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 bg-blue-50/60 rounded-xl">
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
                            <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-gray-100">
                                {selectedStatus === 'pending' && (
                                    <>
                                        <button
                                            onClick={() => openModerationModal(review, 'approve')}
                                            className="px-5 py-2 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-xl font-semibold shadow hover:from-green-600 hover:to-green-800 text-sm"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => openModerationModal(review, 'reject')}
                                            className="px-5 py-2 bg-gradient-to-r from-red-500 to-red-700 text-white rounded-xl font-semibold shadow hover:from-red-600 hover:to-red-800 text-sm"
                                        >
                                            Reject
                                        </button>
                                        <button
                                            onClick={() => openModerationModal(review, 'flag')}
                                            className="px-5 py-2 bg-gradient-to-r from-orange-500 to-orange-700 text-white rounded-xl font-semibold shadow hover:from-orange-600 hover:to-orange-800 text-sm"
                                        >
                                            Flag
                                        </button>
                                    </>
                                )}
                                {selectedStatus !== 'pending' && (
                                    <button
                                        onClick={() => openModerationModal(review, 'approve')}
                                        className="px-5 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow hover:from-blue-700 hover:to-purple-700 text-sm"
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
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
                        <h3 className="text-2xl font-bold mb-4">
                            {moderationData.action.charAt(0).toUpperCase() + moderationData.action.slice(1)} Review
                        </h3>
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                            <div className="font-medium">{selectedReview.title}</div>
                            <div className="text-sm text-gray-600">By {selectedReview.reviewer_name}</div>
                            <div className="text-sm text-gray-600">Entity: {selectedReview.entity_name}</div>
                        </div>
                        <form onSubmit={handleModeration} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Action
                                </label>
                                <select
                                    value={moderationData.action}
                                    onChange={(e) => setModerationData(prev => ({ ...prev, action: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                >
                                    <option value="approve">Approve</option>
                                    <option value="reject">Reject</option>
                                    <option value="flag">Flag for Review</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Admin Notes (Optional)
                                </label>
                                <textarea
                                    value={moderationData.admin_notes}
                                    onChange={(e) => setModerationData(prev => ({ ...prev, admin_notes: e.target.value }))}
                                    rows={3}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
                                    className="px-5 py-2 text-gray-600 hover:text-gray-800 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={`px-5 py-2 text-white rounded-xl font-semibold shadow ${
                                        moderationData.action === 'approve' ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800' :
                                        moderationData.action === 'reject' ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800' :
                                        'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800'
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
