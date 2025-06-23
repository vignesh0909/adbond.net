import React, { useState, useEffect } from 'react';
import { reviewsAPI } from '../services/reviews';
import { authAPI } from '../services/auth';
import { customToast } from './ToastProvider';

export default function UserDashboard({ currentUser, onLogout }) {
    const [activeTab, setActiveTab] = useState('overview');
    const [myReviews, setMyReviews] = useState([]);
    const [reviewStats, setReviewStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [reviewsLoading, setReviewsLoading] = useState(false);

    useEffect(() => {
        if (currentUser) {
            fetchDashboardData();
        }
    }, [currentUser]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            await Promise.all([
                fetchMyReviews(),
                // Add more data fetching here as needed
            ]);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            customToast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const fetchMyReviews = async () => {
        try {
            setReviewsLoading(true);
            console.log('Fetching reviews for user:', currentUser?.user_id);
            const response = await reviewsAPI.getMyReviews({ limit: 50 });
            console.log('Reviews API response:', response);
            
            setMyReviews(response.reviews || []);
            
            // Calculate stats
            const reviews = response.reviews || [];
            console.log('Number of reviews found:', reviews.length);
            const stats = {
                total: reviews.length,
                approved: reviews.filter(r => r.review_status === 'approved').length,
                pending: reviews.filter(r => r.review_status === 'pending').length,
                rejected: reviews.filter(r => r.review_status === 'rejected').length,
                avgRating: reviews.length > 0 ? 
                    (reviews.reduce((sum, r) => sum + r.overall_rating, 0) / reviews.length).toFixed(1) : 0
            };
            console.log('Calculated stats:', stats);
            setReviewStats(stats);
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
            customToast.error('Failed to load your reviews: ' + (error.message || 'Unknown error'));
        } finally {
            setReviewsLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
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

    const renderStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            <span key={i} className={`text-lg ${i < rating ? 'text-yellow-500' : 'text-gray-300'}`}>
                ★
            </span>
        ));
    };

    const parseCategoryRatings = (categoryRatings) => {
        try {
            if (typeof categoryRatings === 'string') {
                return JSON.parse(categoryRatings) || {};
            }
            return categoryRatings || {};
        } catch (error) {
            console.error('Error parsing category ratings:', error);
            return {};
        }
    };

    const renderOverviewTab = () => (
        <div className="space-y-8 animate-fade-in-scale">
            {/* Welcome Section */}
            <div className="glass-card bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl transform hover:scale-105 transition-all duration-300">
                <h2 className="text-3xl font-bold mb-3 drop-shadow-lg">
                    Welcome back, {currentUser.first_name || currentUser.email}! ✨
                </h2>
                <p className="opacity-90 text-lg">Here's an overview of your activity on AdBond</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass-card bg-white/80 dark:bg-gray-800/80 rounded-xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Reviews</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">{reviewStats.total || 0}</p>
                        </div>
                        <div className="w-14 h-14 bg-gradient-to-tr from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.915a1 1 0 00.95-.69l1.519-4.674z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="glass-card bg-white/80 dark:bg-gray-800/80 rounded-xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Published</p>
                            <p className="text-3xl font-bold text-green-600">{reviewStats.approved || 0}</p>
                        </div>
                        <div className="w-14 h-14 bg-gradient-to-tr from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="glass-card bg-white/80 dark:bg-gray-800/80 rounded-xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                            <p className="text-3xl font-bold text-yellow-600">{reviewStats.pending || 0}</p>
                        </div>
                        <div className="w-14 h-14 bg-gradient-to-tr from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="glass-card bg-white/80 dark:bg-gray-800/80 rounded-xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Rating</p>
                            <p className="text-3xl font-bold text-purple-600">{reviewStats.avgRating || '0.0'}</p>
                        </div>
                        <div className="w-14 h-14 bg-gradient-to-tr from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Reviews */}
            <div className="glass-card bg-white/80 dark:bg-gray-800/80 rounded-xl p-8 shadow-lg border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <span className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                    </span>
                    Recent Reviews
                </h3>
                {reviewsLoading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-3 text-gray-600 dark:text-gray-400">Loading reviews...</p>
                    </div>
                ) : myReviews.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-20 h-20 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.915a1 1 0 00.95-.69l1.519-4.674z" />
                            </svg>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No reviews yet</h4>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">You haven't written any reviews yet</p>
                        <a href="/write-review" className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg transform hover:scale-105">
                            Write Your First Review ✨
                        </a>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {myReviews.slice(0, 3).map((review) => (
                            <div key={review.review_id} className="glass-card bg-white/60 dark:bg-gray-800/60 border border-gray-200/50 dark:border-gray-700/50 rounded-xl p-6 backdrop-blur-sm transform hover:scale-102 transition-all duration-300 hover:shadow-lg">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900 dark:text-white text-lg">{review.title}</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Entity: {review.entity_name}</p>
                                        <div className="flex items-center mt-3">
                                            {renderStars(review.overall_rating)}
                                            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">({review.overall_rating}/5)</span>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm ${getStatusBadge(review.review_status)}`}>
                                        {review.review_status}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {myReviews.length > 3 && (
                            <button 
                                onClick={() => setActiveTab('reviews')}
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-semibold transform hover:scale-105 transition-all duration-300 flex items-center group"
                            >
                                View all {myReviews.length} reviews 
                                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );

    const renderReviewsTab = () => (
        <div className="space-y-8 animate-fade-in-scale">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                    <span className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                    </span>
                    My Reviews
                </h2>
                <a href="/write-review" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg transform hover:scale-105">
                    Write New Review ✨
                </a>
            </div>

            {reviewsLoading ? (
                <div className="text-center py-16 glass-card bg-white/80 dark:bg-gray-800/80 rounded-xl backdrop-blur-sm">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your reviews...</p>
                </div>
            ) : myReviews.length === 0 ? (
                <div className="text-center py-16 glass-card bg-white/80 dark:bg-gray-800/80 rounded-xl border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
                    <div className="w-20 h-20 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.915a1 1 0 00.95-.69l1.519-4.674z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">No Reviews Yet</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">Start building your review history by sharing your experiences</p>
                    <a href="/write-review" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg transform hover:scale-105">
                        Write Your First Review ✨
                    </a>
                </div>
            ) : (
                <div className="space-y-6">
                    {myReviews.map((review) => (
                        <div key={review.review_id} className="glass-card bg-white/80 dark:bg-gray-800/80 rounded-xl p-8 shadow-lg border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm transform hover:scale-102 transition-all duration-300 hover:shadow-xl">
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{review.title}</h3>
                                    <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">Entity: {review.entity_name}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Created: {formatDate(review.created_at)}</p>
                                </div>
                                <span className={`px-4 py-2 rounded-full text-sm font-semibold border backdrop-blur-sm ${getStatusBadge(review.review_status)}`}>
                                    {review.review_status}
                                </span>
                            </div>
                            
                            <div className="mb-6">
                                <div className="flex items-center mb-3">
                                    {renderStars(review.overall_rating)}
                                    <span className="ml-3 text-sm text-gray-600 dark:text-gray-400 font-medium">({review.overall_rating}/5)</span>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{review.review_text}</p>
                            </div>

                            {review.category_ratings && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
                                    {Object.entries(parseCategoryRatings(review.category_ratings)).map(([category, rating]) => (
                                        <div key={category} className="text-center">
                                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2 capitalize font-medium">
                                                {category.replace('_', ' ')}
                                            </div>
                                            <div className="text-yellow-500">
                                                {renderStars(rating)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderActivityTab = () => (
        <div className="space-y-8 animate-fade-in-scale">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <span className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                </span>
                Activity Timeline
            </h2>
            
            <div className="glass-card bg-white/80 dark:bg-gray-800/80 rounded-xl p-8 shadow-lg border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
                <div className="space-y-6">
                    {myReviews.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 font-medium">No activity to show yet</p>
                        </div>
                    ) : (
                        myReviews.map((review, index) => (
                            <div key={review.review_id} className="flex items-start space-x-6 pb-6 border-b border-gray-200/50 dark:border-gray-700/50 last:border-b-0">
                                <div className="flex-shrink-0">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
                                        review.review_status === 'approved' ? 'bg-gradient-to-tr from-green-400 to-green-600' :
                                        review.review_status === 'pending' ? 'bg-gradient-to-tr from-yellow-400 to-yellow-600' :
                                        'bg-gradient-to-tr from-red-400 to-red-600'
                                    }`}>
                                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <p className="text-gray-900 dark:text-white font-medium">
                                        <span className="font-semibold">You reviewed {review.entity_name}</span>
                                        <span className={`ml-3 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${getStatusBadge(review.review_status)}`}>
                                            {review.review_status}
                                        </span>
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">{formatDate(review.created_at)}</p>
                                    <div className="flex items-center mt-2">
                                        {renderStars(review.overall_rating)}
                                        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">({review.overall_rating}/5)</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-gray-100 pt-24 pb-16 px-6 max-w-6xl mx-auto">
                {/* Animated Background */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/30 dark:bg-blue-400/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200/30 dark:bg-purple-400/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                    <div className="absolute top-40 left-1/2 transform -translate-x-1/2 w-80 h-80 bg-pink-200/30 dark:bg-pink-400/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
                </div>
                
                <div className="text-center py-16 relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-6 text-gray-600 dark:text-gray-400 text-lg">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-gray-100 font-sans">
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/30 dark:bg-blue-400/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200/30 dark:bg-purple-400/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute top-40 left-1/2 transform -translate-x-1/2 w-80 h-80 bg-pink-200/30 dark:bg-pink-400/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
            </div>
            
            <div className="relative pt-24 pb-16 px-6 max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-10 animate-slide-in-down">
                    <div>
                        <h1 className="text-4xl font-extrabold drop-shadow-lg text-gradient-purple">Dashboard</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">Manage your reviews and activity</p>
                    </div>
                    <button 
                        onClick={onLogout}
                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 px-6 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 font-semibold transform hover:scale-105"
                    >
                        Logout
                    </button>
                </div>

                {/* Tabs */}
                <div className="mb-10 animate-fade-in-scale">
                    <div className="glass-card bg-white/80 dark:bg-gray-800/80 rounded-xl backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 p-2">
                        <nav className="flex space-x-2">
                            {[
                                { id: 'overview', name: 'Overview', icon: '📊' },
                                { id: 'reviews', name: 'My Reviews', icon: '⭐' },
                                { id: 'activity', name: 'Activity', icon: '📈' }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 py-4 px-6 font-semibold text-sm whitespace-nowrap rounded-lg transition-all duration-300 transform hover:scale-105 ${
                                        activeTab === tab.id
                                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100/50 dark:hover:bg-gray-700/50'
                                    }`}
                                >
                                    <span className="mr-2">{tab.icon}</span>
                                    {tab.name}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && renderOverviewTab()}
                {activeTab === 'reviews' && renderReviewsTab()}
                {activeTab === 'activity' && renderActivityTab()}
            </div>
        </div>
    );
}
