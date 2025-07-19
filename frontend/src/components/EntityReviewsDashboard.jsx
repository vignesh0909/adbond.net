import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { reviewsAPI } from '../services/reviews';
import ReviewReplies from './ReviewReplies';

export default function EntityReviewsDashboard({ entityId }) {
    const [reviews, setReviews] = useState([]);
    const [statistics, setStatistics] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedTab, setSelectedTab] = useState('approved');
    const [selectedReview, setSelectedReview] = useState(null);
    const [showReplyModal, setShowReplyModal] = useState(false);
    const [replyData, setReplyData] = useState({
        reply_text: '',
        reply_type: 'response'
    });

    useEffect(() => {
        if (entityId) {
            fetchReviews();
        }
    }, [entityId, selectedTab]);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const response = await reviewsAPI.getEntityDashboardReviews(entityId, {
                status: selectedTab,
                limit: 20
            });
            setReviews(response.reviews || []);
            setStatistics(response.statistics || {});
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async (e) => {
        e.preventDefault();
        try {
            await reviewsAPI.replyToReview(selectedReview.review_id, replyData);
            setShowReplyModal(false);
            setSelectedReview(null);
            setReplyData({ reply_text: '', reply_type: 'response' });
            fetchReviews(); // Refresh reviews
            toast.success('Reply submitted successfully!', {
                position: "top-right",
                autoClose: 3000,
            });
        } catch (error) {
            console.error('Failed to submit reply:', error);
            toast.error('Failed to submit reply. Please try again.', {
                position: "top-right",
                autoClose: 3000,
            });
        }
    };

    const handleDispute = (review) => {
        setSelectedReview(review);
        setReplyData({ reply_text: '', reply_type: 'dispute' });
        setShowReplyModal(true);
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

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'text-green-600 dark:text-green-200';
            case 'pending': return 'text-yellow-600 dark:text-yellow-200';
            case 'rejected': return 'text-red-600 dark:text-red-200';
            case 'flagged': return 'text-orange-600 dark:text-orange-200';
            default: return 'text-gray-600 dark:text-gray-400';
        }
    };

    return (
        <div className="space-y-8">
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
                    <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-200">
                        {statistics.avg_rating ? Number(statistics.avg_rating).toFixed(1) : 'N/A'}
                    </div>
                    <div className="text-base text-gray-600 dark:text-gray-300">Average Rating</div>
                    {statistics.avg_rating && (
                        <div className="text-yellow-500 dark:text-yellow-300 mt-1">
                            {renderStars(Math.round(statistics.avg_rating))}
                        </div>
                    )}
                </div>
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
                    <div className="text-3xl font-extrabold text-green-600 dark:text-green-200">
                        {statistics.total_reviews || 0}
                    </div>
                    <div className="text-base text-gray-600 dark:text-gray-300">Total Reviews</div>
                </div>
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
                    <div className="text-3xl font-extrabold text-orange-600 dark:text-orange-200">
                        {statistics.pending_reviews || 0}
                    </div>
                    <div className="text-base text-gray-600 dark:text-gray-300">Pending Reviews</div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
                {/* Tab Navigation */}
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="flex space-x-8 px-8 pt-6">
                        {['approved', 'pending', 'rejected', 'flagged'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setSelectedTab(tab)}
                                className={`py-2 px-1 border-b-2 font-medium text-sm capitalize transition-all ${selectedTab === tab
                                        ? 'border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-200'
                                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-200 hover:border-gray-300 dark:hover:border-gray-600'
                                    }`}
                            >
                                {tab} Reviews
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="p-8">
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 dark:border-blue-400"></div>
                        </div>
                    ) : reviews.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 dark:text-gray-400 text-lg bg-white/60 dark:bg-gray-700/60 rounded-xl">
                            No {selectedTab} reviews found.
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {reviews.map((review) => (
                                <div key={review.review_id} className="bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 shadow-xl">
                                    {/* Review Header */}
                                    <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4 gap-4">
                                        <div>
                                            <h3 className="font-bold text-xl mb-1 text-gray-900 dark:text-gray-100">{review.title}</h3>
                                            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                <span>By {review.reviewer_name}</span>
                                                <span>•</span>
                                                <span className="capitalize">{review.reviewer_type}</span>
                                                <span>•</span>
                                                <span>{formatDate(review.created_at)}</span>
                                                <span>•</span>
                                                <span className={`capitalize font-medium ${getStatusColor(review.review_status)}`}>
                                                    {review.review_status}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right min-w-[120px]">
                                            <div className="text-2xl text-yellow-500 dark:text-yellow-300 mb-1">
                                                {renderStars(review.overall_rating)}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {review.overall_rating}/5
                                            </div>
                                        </div>
                                    </div>

                                    {/* Review Content */}
                                    <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed mb-4">{review.review_text}</p>

                                    {/* Category Ratings */}
                                    {review.category_ratings && (
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 bg-blue-50/60 dark:bg-gray-700/60 rounded-xl">
                                            <div className="text-center">
                                                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Quality</div>
                                                <div className="text-yellow-500 dark:text-yellow-300">{renderStars(review.category_ratings.quality)}</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Support</div>
                                                <div className="text-yellow-500 dark:text-yellow-300">{renderStars(review.category_ratings.support)}</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Reliability</div>
                                                <div className="text-yellow-500 dark:text-yellow-300">{renderStars(review.category_ratings.reliability)}</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Payment Speed</div>
                                                <div className="text-yellow-500 dark:text-yellow-300">{renderStars(review.category_ratings.payment_speed)}</div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex flex-wrap justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-700 gap-4 text-sm text-gray-600 dark:text-gray-400">
                                        <div className="flex items-center space-x-4">
                                            <span>👍 {review.helpful_votes} helpful</span>
                                            <span>👎 {review.unhelpful_votes} not helpful</span>
                                            {review.reply_count > 0 && (
                                                <span>{review.reply_count} {review.reply_count === 1 ? 'reply' : 'replies'}</span>
                                            )}
                                        </div>
                                        <div className="flex space-x-3">
                                            {review.review_status === 'approved' && !review.has_owner_reply && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedReview(review);
                                                        setReplyData({ reply_text: '', reply_type: 'response' });
                                                        setShowReplyModal(true);
                                                    }}
                                                    className="text-blue-600 dark:text-blue-200 hover:text-purple-700 dark:hover:text-purple-200 font-semibold"
                                                >
                                                    Reply
                                                </button>
                                            )}
                                            {review.review_status === 'approved' && (
                                                <button
                                                    onClick={() => handleDispute(review)}
                                                    className="text-orange-600 dark:text-orange-200 hover:text-orange-800 dark:hover:text-orange-100 font-semibold"
                                                >
                                                    Dispute
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Review Replies - Always show the component */}
                                    <ReviewReplies
                                        reviewId={review.review_id}
                                        showReplies={true}
                                        isEntityOwner={true}
                                        initiallyExpanded={true}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Reply Modal */}
            {showReplyModal && selectedReview && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
                        <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                            {replyData.reply_type === 'dispute' ? 'Dispute Review' : 'Reply to Review'}
                        </h3>
                        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="font-medium text-gray-900 dark:text-gray-100">{selectedReview.title}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 truncate">{selectedReview.review_text}</div>
                        </div>
                        <form onSubmit={handleReply} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Reply Type
                                </label>
                                <select
                                    value={replyData.reply_type}
                                    onChange={(e) => setReplyData(prev => ({ ...prev, reply_type: e.target.value }))}
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                >
                                    <option value="response">Response</option>
                                    <option value="clarification">Clarification</option>
                                    <option value="dispute">Dispute</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Your {replyData.reply_type === 'dispute' ? 'Dispute' : 'Reply'}
                                </label>
                                <textarea
                                    value={replyData.reply_text}
                                    onChange={(e) => setReplyData(prev => ({ ...prev, reply_text: e.target.value }))}
                                    rows={4}
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    placeholder={replyData.reply_type === 'dispute' ?
                                        "Explain why you believe this review is unfair or inaccurate..." :
                                        "Write your response to this review..."
                                    }
                                    required
                                />
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowReplyModal(false);
                                        setSelectedReview(null);
                                        setReplyData({ reply_text: '', reply_type: 'response' });
                                    }}
                                    className="px-5 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={`px-5 py-2 text-white rounded-xl font-semibold shadow ${replyData.reply_type === 'dispute'
                                        ? 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800'
                                        : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                                        }`}
                                >
                                    Submit {replyData.reply_type === 'dispute' ? 'Dispute' : 'Reply'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
