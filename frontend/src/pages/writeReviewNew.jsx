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
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="pt-20 px-6 max-w-4xl mx-auto">
                    <div className="bg-white p-8 rounded-lg shadow-md text-center">
                        <h2 className="text-2xl font-bold mb-4">Please Log In</h2>
                        <p className="text-gray-600">You need to be logged in to write a review.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="pt-20 px-6 max-w-4xl mx-auto">
                <div className="bg-white p-8 rounded-lg shadow-md">
                    <h1 className="text-3xl font-bold mb-2">Write a Review</h1>
                    <p className="text-gray-600 mb-8">
                        Share your experience with advertisers, networks, or affiliates to help the community.
                    </p>

                    {message && (
                        <div className={`mb-6 p-4 rounded-lg ${
                            messageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Entity Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Which entity are you reviewing? *
                            </label>
                            <select
                                value={formData.is_new_entity ? 'new_entity' : formData.entity_id}
                                onChange={handleEntitySelection}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="">Select an entity...</option>
                                {entities.map(entity => (
                                    <option key={entity.entity_id} value={entity.entity_id}>
                                        {entity.name} ({entity.entity_type})
                                    </option>
                                ))}
                                <option value="new_entity">Entity not in list (enter manually)</option>
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

                    <div className="mt-8 p-4 bg-gray-100 rounded-lg">
                        <h3 className="font-semibold mb-2">Review Guidelines</h3>
                        <ul className="text-sm text-gray-600 space-y-1">
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
