import React, { useState, useEffect } from 'react';
import Navbar from '../components/navbar';
import { reviewsAPI } from '../services/reviews';
import { entityAPI } from '../services/entity';
import { authAPI } from '../services/api';

export default function WriteReviewPage() {
    const [currentUser, setCurrentUser] = useState(null);
    const [entities, setEntities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // 'success' or 'error'

    // Form states
    const [formData, setFormData] = useState({
        entity_id: '',
        entity_name: '',
        is_new_entity: false,
        title: '',
        overall_rating: '',
        review_text: '',
        category_ratings: {
            quality: '',
            support: '',
            reliability: '',
            payment_speed: ''
        },
        tags: '',
        is_anonymous: false,
        proof_attachments: []
    });

    useEffect(() => {
        const user = authAPI.getCurrentUser();
        setCurrentUser(user);
        fetchEntities();
    }, []);

    const fetchEntities = async () => {
        try {
            const response = await entityAPI.getPublicEntities();
            setEntities(response.entities || []);
        } catch (error) {
            console.error('Failed to fetch entities:', error);
        }
    };

    const handleInputChange = (field, value) => {
        if (field.startsWith('category_ratings.')) {
            const category = field.split('.')[1];
            setFormData(prev => ({
                ...prev,
                category_ratings: {
                    ...prev.category_ratings,
                    [category]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };

    const handleEntitySelection = (e) => {
        const value = e.target.value;
        if (value === 'new_entity') {
            setFormData(prev => ({
                ...prev,
                entity_id: '',
                entity_name: '',
                is_new_entity: true
            }));
        } else {
            const selectedEntity = entities.find(entity => entity.entity_id === value);
            setFormData(prev => ({
                ...prev,
                entity_id: value,
                entity_name: selectedEntity ? selectedEntity.name : '',
                is_new_entity: false
            }));
        }
    };

    const validateForm = () => {
        const errors = [];

        if (!formData.is_new_entity && !formData.entity_id) {
            errors.push('Please select an entity');
        }

        if (formData.is_new_entity && !formData.entity_name.trim()) {
            errors.push('Please enter the entity name');
        }

        if (!formData.title.trim()) {
            errors.push('Please enter a review title');
        }

        if (!formData.overall_rating) {
            errors.push('Please provide an overall rating');
        }

        if (!formData.review_text.trim()) {
            errors.push('Please write a review');
        }

        // Check category ratings
        const categories = ['quality', 'support', 'reliability', 'payment_speed'];
        for (const category of categories) {
            if (!formData.category_ratings[category]) {
                errors.push(`Please rate ${category.replace('_', ' ')}`);
            }
        }

        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const errors = validateForm();
        if (errors.length > 0) {
            setMessage(errors.join(', '));
            setMessageType('error');
            return;
        }

        setLoading(true);
        try {
            const reviewData = {
                ...formData,
                tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
                category_ratings: {
                    quality: parseInt(formData.category_ratings.quality),
                    support: parseInt(formData.category_ratings.support),
                    reliability: parseInt(formData.category_ratings.reliability),
                    payment_speed: parseInt(formData.category_ratings.payment_speed)
                },
                overall_rating: parseInt(formData.overall_rating)
            };

            // Remove entity_id if this is a new entity
            if (formData.is_new_entity) {
                delete reviewData.entity_id;
            } else {
                delete reviewData.entity_name;
            }

            await reviewsAPI.submitReview(reviewData);
            
            setMessage('Review submitted successfully! It will be reviewed by our admin team before being published.');
            setMessageType('success');
            
            // Reset form
            setFormData({
                entity_id: '',
                entity_name: '',
                is_new_entity: false,
                title: '',
                overall_rating: '',
                review_text: '',
                category_ratings: {
                    quality: '',
                    support: '',
                    reliability: '',
                    payment_speed: ''
                },
                tags: '',
                is_anonymous: false,
                proof_attachments: []
            });

        } catch (error) {
            setMessage(error.message || 'Failed to submit review');
            setMessageType('error');
        } finally {
            setLoading(false);
        }
    };

    const renderStarRating = (field, value) => {
        return (
            <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map(star => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => handleInputChange(field, star.toString())}
                        className={`text-2xl ${value >= star ? 'text-yellow-500' : 'text-gray-300'} hover:text-yellow-400`}
                    >
                        ★
                    </button>
                ))}
                <span className="ml-2 text-sm text-gray-600">
                    {value ? `${value} star${value > 1 ? 's' : ''}` : 'Select rating'}
                </span>
            </div>
        );
    };

    if (!currentUser) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                <Navbar />
                <div className="pt-24 px-6 max-w-4xl mx-auto">
                    <div className="card p-8 text-center animate-fade-in-scale">
                        <div className="w-16 h-16 bg-gradient-to-tr from-purple-600 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold mb-4 text-purple-700 dark:text-purple-300">Please Log In</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">You need to be logged in to write a review and help the community.</p>
                        <div className="flex gap-4 justify-center">
                            <a href="/login" className="btn-primary">Log In</a>
                            <a href="/signup" className="btn-secondary">Sign Up</a>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col">
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200/30 dark:bg-purple-400/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200/30 dark:bg-blue-400/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute top-40 left-1/2 transform -translate-x-1/2 w-80 h-80 bg-pink-200/30 dark:bg-pink-400/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
            </div>

            <Navbar />
            <div className="relative pt-24 px-4 sm:px-6 max-w-4xl mx-auto w-full pb-16">
                <div className="card p-8 animate-fade-in-scale">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-tr from-purple-600 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                        </div>
                        <h1 className="text-4xl font-extrabold text-gradient-purple mb-2 tracking-tight">Write a Review</h1>
                        <p className="text-gray-600 dark:text-gray-300 text-lg">
                            Share your experience and help build a trusted community
                        </p>
                    </div>
                    {message && (
                        <div className={`mb-6 p-4 rounded-xl shadow-md flex items-center animate-slide-in-up ${
                            messageType === 'success' ? 'bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300'
                        }`}>
                            <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                {messageType === 'success' ? (
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                ) : (
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                )}
                            </svg>
                            {message}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Entity Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                                </svg>
                                Which entity are you reviewing? *
                            </label>
                            <select
                                value={formData.is_new_entity ? 'new_entity' : formData.entity_id}
                                onChange={handleEntitySelection}
                                className="input-field"
                                required
                            >
                                <option value="">Select an entity...</option>
                                {entities.map(entity => (
                                    <option key={entity.entity_id} value={entity.entity_id}>
                                        {entity.name} ({entity.entity_type})
                                    </option>
                                ))}
                                <option value="new_entity">🆕 Entity not in list (enter manually)</option>
                            </select>
                        </div>

                        {/* Manual Entity Name */}
                        {formData.is_new_entity && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Entity Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.entity_name}
                                    onChange={(e) => handleInputChange('entity_name', e.target.value)}
                                    placeholder="e.g., XYZ Media Group"
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required={formData.is_new_entity}
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    This entity will be added to our database and reviewed by admins.
                                </p>
                            </div>
                        )}

                        {/* Review Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Review Title *
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => handleInputChange('title', e.target.value)}
                                placeholder="e.g., Great payouts but slow support"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        {/* Overall Rating */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Overall Rating *
                            </label>
                            {renderStarRating('overall_rating', formData.overall_rating)}
                        </div>

                        {/* Category Ratings */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-4">
                                Category Ratings *
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { key: 'quality', label: 'Quality' },
                                    { key: 'support', label: 'Support' },
                                    { key: 'reliability', label: 'Reliability' },
                                    { key: 'payment_speed', label: 'Payment Speed' }
                                ].map(category => (
                                    <div key={category.key}>
                                        <label className="block text-sm text-gray-600 mb-1">
                                            {category.label}
                                        </label>
                                        {renderStarRating(
                                            `category_ratings.${category.key}`,
                                            formData.category_ratings[category.key]
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Review Text */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Your Review *
                            </label>
                            <textarea
                                value={formData.review_text}
                                onChange={(e) => handleInputChange('review_text', e.target.value)}
                                placeholder="Share your detailed experience..."
                                rows={6}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        {/* Tags */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tags (Optional)
                            </label>
                            <input
                                type="text"
                                value={formData.tags}
                                onChange={(e) => handleInputChange('tags', e.target.value)}
                                placeholder="e.g., Fast Payment, Good Support, High Quality (comma-separated)"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Anonymous Option */}
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="anonymous"
                                checked={formData.is_anonymous}
                                onChange={(e) => handleInputChange('is_anonymous', e.target.checked)}
                                className="mr-2"
                            />
                            <label htmlFor="anonymous" className="text-sm text-gray-700">
                                Post this review anonymously
                            </label>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? 'Submitting...' : 'Submit Review'}
                            </button>
                        </div>
                    </form>
                    <div className="mt-8 p-4 bg-purple-50 dark:bg-purple-900/40 rounded-lg border border-purple-100 dark:border-purple-700">
                        <h3 className="font-semibold mb-2 text-purple-700 dark:text-purple-200">Review Guidelines</h3>
                        <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                            <li>• Be honest and constructive in your feedback</li>
                            <li>• Focus on your actual experience with the entity</li>
                            <li>• All reviews are moderated before publication</li>
                            <li>• Spam or fake reviews will be rejected</li>
                            <li>• You can review entities even if they're not in our database yet</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
