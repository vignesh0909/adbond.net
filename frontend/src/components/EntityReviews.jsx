import React, { useState, useEffect } from 'react';
import { reviewsAPI } from '../services/reviews';
import { authAPI } from '../services/api';

export default function EntityReviews({ entityId, entityName }) {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [pagination, setPagination] = useState({});
    const [selectedReview, setSelectedReview] = useState(null);
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [replyType, setReplyType] = useState('response');

    useEffect(() => {
        const user = authAPI.getCurrentUser();
        setCurrentUser(user);
        fetchReviews();
    }, [entityId]);

    const fetchReviews = async (page = 1) => {
        try {
            setLoading(true);
            const response = await reviewsAPI.getEntityReviews(entityId, { page, limit: 10 });
            setReviews(response.reviews || []);
            setPagination(response.pagination || {});
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVote = async (reviewId, voteType) => {
        if (!currentUser) {
            alert('Please log in to vote on reviews');
            return;
        }

        try {
            await reviewsAPI.voteOnReview(reviewId, voteType);
            // Refresh reviews to show updated vote counts
            fetchReviews(pagination.current_page);
        } catch (error) {
            console.error('Failed to vote:', error);
            alert('Failed to record vote');
        }
    };

    const handleReply = async (e) => {
        e.preventDefault();
        if (!currentUser) {
            alert('Please log in to reply');
            return;
        }

        if (!replyText.trim()) {
            alert('Please enter a reply');
            return;
        }

        try {
            await reviewsAPI.replyToReview(selectedReview.review_id, {
                reply_text: replyText,
                reply_type: replyType
            });

            setReplyText('');
            setShowReplyForm(false);
            setSelectedReview(null);
            fetchReviews(pagination.current_page);
            alert('Reply submitted successfully');
        } catch (error) {
            console.error('Failed to submit reply:', error);
            alert('Failed to submit reply');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const renderStars = (rating) => {
        return '★'.repeat(rating) + '☆'.repeat(5 - rating);
    };

    const renderCategoryRating = (label, rating) => (
        <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">{label}:</span>
            <span className="text-yellow-500">{renderStars(rating)}</span>
        </div>
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
        );
    }
    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <h2 className="text-3xl font-extrabold drop-shadow-lg">Reviews for {entityName}</h2>
                <div className="text-base text-gray-600">
                    {pagination.total_reviews || 0} reviews
                </div>
            </div>
            {reviews.length === 0 ? (
                <div className="text-center py-16 bg-white/80 rounded-2xl shadow">
                    <p className="text-gray-600 text-lg">No reviews yet. Be the first to review!</p>
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
                                        <span className="capitalize">{review.reviewer_type}</span>
                                        <span>•</span>
                                        <span>{formatDate(review.created_at)}</span>
                                    </div>
                                </div>
                                <div className="text-right min-w-[120px]">
                                    <div className="text-2xl text-yellow-500 mb-1">
                                        {renderStars(review.overall_rating)}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {review.overall_rating}/5
                                    </div>
                                </div>
                            </div>
                            {/* Review Text */}
                            <p className="text-gray-700 text-base leading-relaxed mb-4">{review.review_text}</p>
                            {/* Category Ratings */}
                            {review.category_ratings && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 bg-blue-50/60 rounded-xl">
                                    {renderCategoryRating('Quality', review.category_ratings.quality)}
                                    {renderCategoryRating('Support', review.category_ratings.support)}
                                    {renderCategoryRating('Reliability', review.category_ratings.reliability)}
                                    {renderCategoryRating('Payment Speed', review.category_ratings.payment_speed)}
                                </div>
                            )}
                            {/* Tags */}
                            {review.tags && review.tags.length > 0 && (
                                <div className="mb-4">
                                    <div className="flex flex-wrap gap-2">
                                        {review.tags.map((tag, index) => (
                                            <span
                                                key={index}
                                                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-semibold"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {/* Review Actions */}
                            <div className="flex flex-wrap justify-between items-center pt-4 border-t border-gray-100 gap-4">
                                <div className="flex items-center space-x-4">
                                    <button
                                        onClick={() => handleVote(review.review_id, 'helpful')}
                                        className="flex items-center space-x-1 text-sm text-gray-600 hover:text-green-600 font-semibold"
                                    >
                                        <span>👍</span>
                                        <span>Helpful ({review.helpful_votes})</span>
                                    </button>
                                    <button
                                        onClick={() => handleVote(review.review_id, 'unhelpful')}
                                        className="flex items-center space-x-1 text-sm text-gray-600 hover:text-red-600 font-semibold"
                                    >
                                        <span>👎</span>
                                        <span>Not Helpful ({review.unhelpful_votes})</span>
                                    </button>
                                </div>
                                <div className="flex items-center space-x-4">
                                    {review.reply_count > 0 && (
                                        <span className="text-sm text-gray-600">
                                            {review.reply_count} {review.reply_count === 1 ? 'reply' : 'replies'}
                                        </span>
                                    )}
                                    <button
                                        onClick={() => {
                                            setSelectedReview(review);
                                            setShowReplyForm(true);
                                        }}
                                        className="text-sm text-blue-600 hover:text-purple-700 font-semibold"
                                    >
                                        Reply
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {/* Pagination */}
            {pagination.total_pages > 1 && (
                <div className="flex justify-center space-x-2 mt-6">
                    {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map(page => (
                        <button
                            key={page}
                            onClick={() => fetchReviews(page)}
                            className={`px-4 py-2 rounded-lg font-semibold shadow-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                                page === pagination.current_page
                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                                    : 'bg-white/80 text-gray-700 hover:bg-blue-50'
                            }`}
                        >
                            {page}
                        </button>
                    ))}
                </div>
            )}
            {/* Reply Modal */}
            {showReplyForm && selectedReview && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
                        <h3 className="text-2xl font-bold mb-4">
                            Reply to "{selectedReview.title}"
                        </h3>
                        <form onSubmit={handleReply} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Reply Type
                                </label>
                                <select
                                    value={replyType}
                                    onChange={(e) => setReplyType(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                >
                                    <option value="response">Response</option>
                                    <option value="clarification">Clarification</option>
                                    <option value="dispute">Dispute</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Your Reply
                                </label>
                                <textarea
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    rows={4}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    placeholder="Write your reply..."
                                    required
                                />
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowReplyForm(false);
                                        setSelectedReview(null);
                                        setReplyText('');
                                    }}
                                    className="px-5 py-2 text-gray-600 hover:text-gray-800 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow hover:from-blue-700 hover:to-purple-700"
                                >
                                    Submit Reply
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
