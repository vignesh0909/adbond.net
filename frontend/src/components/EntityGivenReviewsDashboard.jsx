import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { reviewsAPI } from '../services/reviews';
import ReviewReplies from './ReviewReplies';

export default function EntityGivenReviewsDashboard({ entityId }) {
    const [reviews, setReviews] = useState([]);
    const [statistics, setStatistics] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedTab, setSelectedTab] = useState('all');

    useEffect(() => {
        if (entityId) {
            fetchGivenReviews();
        }
    }, [entityId, selectedTab]);

    const fetchGivenReviews = async () => {
        try {
            setLoading(true);
            const params = {};
            if (selectedTab !== 'all') {
                params.status = selectedTab;
            }
            const response = await reviewsAPI.getEntityGivenReviews(entityId, params);
            setReviews(response.reviews || []);
            setStatistics(response.statistics || {});
        } catch (error) {
            toast.error('Failed to load given reviews');
        } finally {
            setLoading(false);
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

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'text-green-600 dark:text-green-200';
            case 'pending': return 'text-yellow-600 dark:text-yellow-200';
            case 'rejected': return 'text-red-600 dark:text-red-200';
            case 'flagged': return 'text-orange-600 dark:text-orange-200';
            default: return 'text-gray-600 dark:text-gray-400';
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            'approved': 'bg-green-100 text-green-800 border-green-200',
            'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'rejected': 'bg-red-100 text-red-800 border-red-200',
            'flagged': 'bg-orange-100 text-orange-800 border-orange-200'
        };
        return badges[status] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    return (
        <div className="space-y-8">
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
                    <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-200">
                        {statistics.avg_rating_given ? Number(statistics.avg_rating_given).toFixed(1) : 'N/A'}
                    </div>
                    <div className="text-base text-gray-600 dark:text-gray-300">Average Rating Given</div>
                    {statistics.avg_rating_given && (
                        <div className="text-yellow-500 dark:text-yellow-300 mt-1">
                            {renderStars(Math.round(statistics.avg_rating_given))}
                        </div>
                    )}
                </div>
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
                    <div className="text-3xl font-extrabold text-green-600 dark:text-green-200">
                        {statistics.total_given || 0}
                    </div>
                    <div className="text-base text-gray-600 dark:text-gray-300">Total Reviews Given</div>
                </div>
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
                    <div className="text-3xl font-extrabold text-green-600 dark:text-green-200">
                        {statistics.approved_given || 0}
                    </div>
                    <div className="text-base text-gray-600 dark:text-gray-300">Approved</div>
                </div>
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
                    <div className="text-3xl font-extrabold text-orange-600 dark:text-orange-200">
                        {statistics.pending_given || 0}
                    </div>
                    <div className="text-base text-gray-600 dark:text-gray-300">Pending</div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
                {/* Tab Navigation */}
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="flex space-x-8 px-8 pt-6">
                        {['all', 'approved', 'pending', 'rejected'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setSelectedTab(tab)}
                                className={`py-2 px-1 border-b-2 font-medium text-sm capitalize transition-all ${selectedTab === tab
                                        ? 'border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-200'
                                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-200 hover:border-gray-300 dark:hover:border-gray-600'
                                    }`}
                            >
                                {tab === 'all' ? 'All Reviews Given' : `${tab} Reviews`}
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
                            {selectedTab === 'all' ? 'No reviews given yet.' : `No ${selectedTab} reviews found.`}
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
                                                <span>For: <span className="font-semibold text-blue-600 dark:text-blue-400">{review.entity_name}</span></span>
                                                <span>•</span>
                                                <span className="capitalize">{review.reviewed_entity_type}</span>
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
                                            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(review.review_status)}`}>
                                                {review.review_status}
                                            </span>
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

                                    {/* Actions & Info */}
                                    <div className="flex flex-wrap justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-700 gap-4 text-sm text-gray-600 dark:text-gray-400">
                                        <div className="flex items-center space-x-4">
                                            {review.reply_count > 0 && (
                                                <span>{review.reply_count} {review.reply_count === 1 ? 'reply' : 'replies'}</span>
                                            )}
                                            <span>Reviewer: {review.first_name} {review.last_name}</span>
                                        </div>
                                    </div>

                                    {/* Review Replies - Always show the component */}
                                    <ReviewReplies
                                        reviewId={review.review_id}
                                        showReplies={true}
                                        isEntityOwner={false}
                                        initiallyExpanded={false}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
