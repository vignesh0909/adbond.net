import React, { useState, useEffect } from 'react';
import { reviewsAPI } from '../services/reviews';
import { MessageCircle, User, Calendar, Shield, AlertTriangle, Info } from 'lucide-react';

export default function ReviewReplies({ reviewId, showReplies = true, isEntityOwner = false, onReplyAdded, initiallyExpanded = false }) {
    const [replies, setReplies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [replyCount, setReplyCount] = useState(0);
    const [isExpanded, setIsExpanded] = useState(initiallyExpanded);

    useEffect(() => {
        if (reviewId && showReplies) {
            if (isExpanded) {
                fetchReplies();
            } else {
                // Just fetch the count without the full content
                fetchReplyCount();
            }
        }
    }, [reviewId, showReplies, isExpanded]);

    const fetchReplyCount = async () => {
        try {
            const response = await reviewsAPI.getReviewReplies(reviewId);
            const count = response.replies?.length || 0;
            setReplyCount(count);
            
            // Only notify parent if count is different to avoid infinite loops
            // This is mainly for initial load, not for updates
        } catch (error) {
            console.error('Failed to fetch reply count:', error);
        }
    };

    const fetchReplies = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await reviewsAPI.getReviewReplies(reviewId);
            setReplies(response.replies || []);
            const newCount = response.replies?.length || 0;
            setReplyCount(newCount);

            // Only notify parent when there's an actual change, not on every fetch
            // This prevents infinite loops while still updating when replies are added/removed
        } catch (error) {
            console.error('Failed to fetch replies:', error);
            setError('Failed to load replies');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getReplyTypeIcon = (replyType) => {
        switch (replyType) {
            case 'dispute':
                return <AlertTriangle className="w-4 h-4 text-orange-500" />;
            case 'clarification':
                return <Info className="w-4 h-4 text-blue-500" />;
            default:
                return <MessageCircle className="w-4 h-4 text-green-500" />;
        }
    };

    const getReplyTypeBadge = (replyType) => {
        switch (replyType) {
            case 'dispute':
                return 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400 border-orange-200 dark:border-orange-700/30';
            case 'clarification':
                return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 border-blue-200 dark:border-blue-700/30';
            default:
                return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 border-green-200 dark:border-green-700/30';
        }
    };

    const getReplyTypeLabel = (replyType) => {
        switch (replyType) {
            case 'dispute':
                return 'Dispute';
            case 'clarification':
                return 'Clarification';
            default:
                return 'Response';
        }
    };

    // Function to refresh replies when called externally (e.g., after adding a new reply)
    const refreshReplies = async () => {
        const previousCount = replyCount;
        await fetchReplies();
        
        // Only notify parent if count actually changed
        if (onReplyAdded && replyCount !== previousCount) {
            onReplyAdded(replyCount);
        }
    };

    // Update expanded state when we get reply count and initiallyExpanded is true
    useEffect(() => {
        if (initiallyExpanded && replyCount > 0 && !isExpanded) {
            setIsExpanded(true);
        }
    }, [replyCount, initiallyExpanded, isExpanded]);

    // Refresh replies when a new reply is added from parent component
    useEffect(() => {
        if (onReplyAdded && isExpanded) {
            fetchReplies();
        }
    }, [onReplyAdded, isExpanded]);

    if (!showReplies) {
        return null;
    }

    if (loading) {
        return (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Loading replies...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700/30">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
        );
    }

    if (replyCount === 0 && !isExpanded) {
        return null;
    }

    return (
        <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                    <MessageCircle className="w-4 h-4 text-blue-500" />
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {replyCount} {replyCount === 1 ? 'Reply' : 'Replies'}
                    </h4>
                </div>
                {replyCount > 0 && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center space-x-1"
                    >
                        <span>{isExpanded ? 'Hide' : 'Show'} Replies</span>
                        <svg
                            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                )}
            </div>

            {isExpanded && (
                <>
                    {loading && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                            <div className="flex items-center space-x-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                                <span className="text-sm text-gray-600 dark:text-gray-400">Loading replies...</span>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700/30">
                            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    )}

                    {replies.length === 0 && !loading && !error && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                            <p className="text-sm text-gray-600 dark:text-gray-400 italic">No replies yet</p>
                        </div>
                    )}

                    {replies.length > 0 && (
                        <div className="space-y-3">
                            {replies.map((reply) => (
                                <div
                                    key={reply.reply_id}
                                    className={`p-4 rounded-lg border ${reply.is_official
                                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700/30'
                                            : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
                                        }`}
                                >
                                    {/* Reply Header */}
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center space-x-3">
                                            <div className="flex items-center space-x-2">
                                                <User className="w-4 h-4 text-gray-500" />
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    {reply.replier_name}
                                                </span>
                                                {reply.is_official && (
                                                    <div className="flex items-center space-x-1">
                                                        <Shield className="w-3 h-3 text-blue-500" />
                                                        <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                                            Official
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                                                <Calendar className="w-3 h-3" />
                                                <span>{formatDate(reply.created_at)}</span>
                                            </div>
                                        </div>

                                        {/* Reply Type Badge */}
                                        <div className="flex items-center space-x-2">
                                            {getReplyTypeIcon(reply.reply_type)}
                                            <span className={`px-2 py-1 rounded text-xs font-medium border ${getReplyTypeBadge(reply.reply_type)}`}>
                                                {getReplyTypeLabel(reply.reply_type)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Reply Content */}
                                    <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                        {reply.reply_text}
                                    </div>

                                    {/* Special styling for disputes */}
                                    {reply.reply_type === 'dispute' && (
                                        <div className="mt-2 p-2 bg-orange-50 dark:bg-orange-900/20 rounded border border-orange-200 dark:border-orange-700/30">
                                            <div className="flex items-center space-x-1">
                                                <AlertTriangle className="w-3 h-3 text-orange-500" />
                                                <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                                                    This is a dispute regarding the review content
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
