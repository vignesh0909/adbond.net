import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { reviewsAPI } from '../services/reviews';
import { ExternalLink, User, Calendar, Star, MessageCircle, CheckCircle, XCircle, AlertTriangle, ArrowRight } from 'lucide-react';

// Utility function to safely parse JSON
const safeParseJSON = (data, fallback = {}) => {
    if (!data) return fallback;
    if (typeof data === 'object') return data;
    try {
        return JSON.parse(data);
    } catch (error) {
        console.warn('Failed to parse JSON:', error);
        return fallback;
    }
};

export default function UnregisteredEntityReviews() {
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedStatus, setSelectedStatus] = useState('pending');
    const [selectedReview, setSelectedReview] = useState(null);
    const [showModerationModal, setShowModerationModal] = useState(false);
    const [showConvertModal, setShowConvertModal] = useState(false);
    const [moderationData, setModerationData] = useState({
        action: 'approve',
        admin_notes: ''
    });
    const [convertData, setConvertData] = useState({
        entity_type: 'network'
    });

    useEffect(() => {
        fetchReviews();
        fetchStats();
    }, [selectedStatus]);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const response = await reviewsAPI.getUnregisteredEntityReviews({
                status: selectedStatus,
                limit: 50
            });
            setReviews(response.reviews || []);
        } catch (error) {
            console.error('Failed to fetch unregistered entity reviews:', error);
            toast.error('Failed to load unregistered entity reviews');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await reviewsAPI.getUnregisteredEntityReviewsStats();
            setStats(response.stats || {});
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const handleModeration = async (e) => {
        e.preventDefault();
        try {
            await reviewsAPI.moderateUnregisteredEntityReview(
                selectedReview.review_id,
                moderationData.action,
                moderationData.admin_notes
            );
            
            setShowModerationModal(false);
            setSelectedReview(null);
            setModerationData({ action: 'approve', admin_notes: '' });
            fetchReviews();
            fetchStats();
            
            toast.success(`Review ${moderationData.action}d successfully!`, {
                position: "top-right",
                autoClose: 3000,
            });
        } catch (error) {
            console.error('Failed to moderate review:', error);
            toast.error('Failed to moderate review. Please try again.', {
                position: "top-right",
                autoClose: 5000,
            });
        }
    };

    const handleConvert = async (e) => {
        e.preventDefault();
        try {
            await reviewsAPI.convertUnregisteredEntityReview(
                selectedReview.review_id,
                convertData.entity_type
            );
            
            setShowConvertModal(false);
            setSelectedReview(null);
            setConvertData({ entity_type: 'network' });
            fetchReviews();
            fetchStats();
            
            toast.success('Review converted to registered entity successfully!', {
                position: "top-right",
                autoClose: 5000,
            });
        } catch (error) {
            console.error('Failed to convert review:', error);
            toast.error('Failed to convert review. Please try again.', {
                position: "top-right",
                autoClose: 5000,
            });
        }
    };

    const openModerationModal = (review, action = 'approve') => {
        setSelectedReview(review);
        setModerationData({ action, admin_notes: '' });
        setShowModerationModal(true);
    };

    const openConvertModal = (review) => {
        setSelectedReview(review);
        setConvertData({ entity_type: 'network' });
        setShowConvertModal(true);
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
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'approved': return 'bg-green-100 text-green-800 border-green-200';
            case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
            case 'flagged': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'converted': return 'bg-blue-100 text-blue-800 border-blue-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <div className="ml-4 text-gray-600">Loading unregistered entity reviews...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header and Stats */}
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Unregistered Entity Reviews
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Manage reviews for entities not yet in the platform
                    </p>
                </div>
                
                {/* Statistics Cards */}
                {Object.keys(stats).length > 0 && (
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                        {Object.entries(stats).map(([status, count]) => (
                            <div key={status} className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center border border-gray-200 dark:border-gray-700">
                                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{count}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">{status}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Status Filter Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8">
                    {['pending', 'approved', 'rejected', 'flagged', 'converted'].map(status => (
                        <button
                            key={status}
                            onClick={() => setSelectedStatus(status)}
                            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                                selectedStatus === status
                                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                            {stats[status] && (
                                <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 py-0.5 px-2 rounded-full text-xs">
                                    {stats[status]}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Reviews List */}
            <div className="space-y-6">
                {reviews.length === 0 ? (
                    <div className="text-center py-12">
                        <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            No {selectedStatus} unregistered entity reviews
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            {selectedStatus === 'pending' 
                                ? 'All caught up! No reviews waiting for moderation.'
                                : `No ${selectedStatus} reviews to display.`
                            }
                        </p>
                    </div>
                ) : (
                    reviews.map(review => (
                        <div key={review.review_id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-200">
                            <div className="p-6">
                                {/* Header */}
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                                {review.entity_name}
                                            </h3>
                                            {review.entity_website && (
                                                <a
                                                    href={review.entity_website}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-800 transition-colors"
                                                    title="Visit website"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                            <span className="flex items-center gap-1">
                                                <User className="w-4 h-4" />
                                                {review.reviewer_name}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                {formatDate(review.created_at)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Star className="w-4 h-4 text-yellow-500" />
                                                {renderStars(review.overall_rating)} ({review.overall_rating}/5)
                                            </span>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(review.review_status)}`}>
                                        {review.review_status}
                                    </span>
                                </div>

                                {/* Review Content */}
                                <div className="mb-4">
                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                                        {review.title}
                                    </h4>
                                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                        {review.review_text}
                                    </p>
                                </div>

                                {/* Entity Details */}
                                {(review.entity_description || (review.entity_contact_info && Object.keys(safeParseJSON(review.entity_contact_info, {})).length > 0)) && (
                                    <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                                            Entity Information
                                        </h5>
                                        {review.entity_description && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                <strong>Description:</strong> {review.entity_description}
                                            </p>
                                        )}
                                        {review.entity_contact_info && (() => {
                                            const contactInfo = safeParseJSON(review.entity_contact_info, {});
                                            return Object.keys(contactInfo).length > 0 && (
                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                    <strong>Contact:</strong>
                                                    {contactInfo.email && (
                                                        <span className="ml-2">
                                                            Email: {contactInfo.email}
                                                        </span>
                                                    )}
                                                    {contactInfo.phone && (
                                                        <span className="ml-2">
                                                            Phone: {contactInfo.phone}
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })()}
                                    </div>
                                )}

                                {/* Category Ratings */}
                                <div className="mb-4">
                                    <h5 className="font-medium text-gray-900 dark:text-white mb-3">Category Ratings</h5>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {Object.entries(safeParseJSON(review.category_ratings, {})).map(([category, rating]) => (
                                            <div key={category} className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                                <div className="text-sm font-medium text-gray-600 dark:text-gray-400 capitalize mb-1">
                                                    {category.replace('_', ' ')}
                                                </div>
                                                <div className="text-yellow-500 text-sm">
                                                    {renderStars(rating)}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {rating}/5
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Tags */}
                                {review.tags && safeParseJSON(review.tags, []).length > 0 && (
                                    <div className="mb-4">
                                        <h5 className="font-medium text-gray-900 dark:text-white mb-2">Tags</h5>
                                        <div className="flex flex-wrap gap-2">
                                            {safeParseJSON(review.tags, []).map((tag, index) => (
                                                <span key={index} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Admin Notes */}
                                {review.admin_notes && (
                                    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700/30">
                                        <h5 className="font-medium text-blue-900 dark:text-blue-300 mb-1">Admin Notes</h5>
                                        <p className="text-sm text-blue-700 dark:text-blue-400">{review.admin_notes}</p>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                {selectedStatus === 'pending' && (
                                    <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                                        <button
                                            onClick={() => openModerationModal(review, 'approve')}
                                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm font-medium"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => openModerationModal(review, 'reject')}
                                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm font-medium"
                                        >
                                            <XCircle className="w-4 h-4" />
                                            Reject
                                        </button>
                                        <button
                                            onClick={() => openModerationModal(review, 'flag')}
                                            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors duration-200 text-sm font-medium"
                                        >
                                            <AlertTriangle className="w-4 h-4" />
                                            Flag
                                        </button>
                                        <button
                                            onClick={() => openConvertModal(review)}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
                                        >
                                            <ArrowRight className="w-4 h-4" />
                                            Convert to Entity
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Moderation Modal */}
            {showModerationModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
                        <div className="p-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                                {moderationData.action.charAt(0).toUpperCase() + moderationData.action.slice(1)} Review
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                Entity: <strong>{selectedReview?.entity_name}</strong>
                            </p>
                            <form onSubmit={handleModeration}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Admin Notes (optional)
                                    </label>
                                    <textarea
                                        value={moderationData.admin_notes}
                                        onChange={(e) => setModerationData(prev => ({ ...prev, admin_notes: e.target.value }))}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        placeholder="Optional notes about this decision..."
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                                    >
                                        {moderationData.action.charAt(0).toUpperCase() + moderationData.action.slice(1)}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowModerationModal(false)}
                                        className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors duration-200 font-medium"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Convert Modal */}
            {showConvertModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
                        <div className="p-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                                Convert to Registered Entity
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                Convert "<strong>{selectedReview?.entity_name}</strong>" to a registered entity. This will create a new entity in the platform and move this review to the regular reviews section.
                            </p>
                            <form onSubmit={handleConvert}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Entity Type
                                    </label>
                                    <select
                                        value={convertData.entity_type}
                                        onChange={(e) => setConvertData(prev => ({ ...prev, entity_type: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="network">Network</option>
                                        <option value="advertiser">Advertiser</option>
                                        <option value="affiliate">Affiliate</option>
                                    </select>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        The entity will be created with "pending" verification status and require admin approval.
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                                    >
                                        Convert
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowConvertModal(false)}
                                        className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors duration-200 font-medium"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
