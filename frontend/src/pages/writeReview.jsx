import React, { useState, useEffect } from 'react';
import Navbar from '../components/navbar';
import { reviewsAPI } from '../services/reviews';
import { entityAPI } from '../services/entity';
import { authAPI } from '../services/auth';
import { Star, User, FileText, Tag, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';

export default function WriteReviewPage() {
    const [currentUser, setCurrentUser] = useState(null);
    const [entities, setEntities] = useState([]);
    const [loading, setLoading] = useState(false);
    // Removed inline message state, using toast instead

    // Form states
    const [formData, setFormData] = useState({
        entity_id: '',
        entity_name: '',
        entity_website: '',
        entity_description: '',
        entity_contact_info: {
            email: '',
            phone: ''
        },
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
        } else if (field.startsWith('entity_contact_info.')) {
            const contactField = field.split('.')[1];
            setFormData(prev => ({
                ...prev,
                entity_contact_info: {
                    ...prev.entity_contact_info,
                    [contactField]: value
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
                entity_website: '',
                entity_description: '',
                entity_contact_info: { email: '', phone: '' },
                is_new_entity: true
            }));
        } else {
            const selectedEntity = entities.find(entity => entity.entity_id === value);
            setFormData(prev => ({
                ...prev,
                entity_id: value,
                entity_name: selectedEntity ? selectedEntity.name : '',
                entity_website: '',
                entity_description: '',
                entity_contact_info: { email: '', phone: '' },
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
            toast.error(errors.join(', '));
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

            const response = await reviewsAPI.submitReview(reviewData);

            // Show success toast
            toast.success(response.message || 'Review submitted successfully!');

            // Reset form
            setFormData({
                entity_id: '',
                entity_name: '',
                entity_website: '',
                entity_description: '',
                entity_contact_info: { email: '', phone: '' },
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
            toast.error(error.message || 'Failed to submit review');
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
                        className={`text-2xl transition-all duration-200 hover:scale-110 ${value >= star
                            ? 'text-yellow-500 drop-shadow-sm'
                            : 'text-gray-300 dark:text-gray-600 hover:text-yellow-400 dark:hover:text-yellow-400'
                            }`}
                    >
                        <Star
                            className={`w-6 h-6 ${value >= star ? 'fill-current' : ''}`}
                        />
                    </button>
                ))}
                <span className="ml-3 text-sm text-gray-600 dark:text-gray-400 font-medium">
                    {value ? `${value} star${value > 1 ? 's' : ''}` : 'Select rating'}
                </span>
            </div>
        );
    };

    if (!currentUser) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                {/* Animated Background */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/10 to-pink-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                </div>

                <Navbar />
                <div className="relative pt-32 px-6 max-w-4xl mx-auto">
                    <div className="card p-8 text-center animate-fade-in-scale">
                        <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                            <User className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold mb-4 text-gradient">Authentication Required</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
                            Please sign in to share your experience and help build our trusted community.
                        </p>
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col">
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/10 to-pink-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-40 left-1/2 transform -translate-x-1/2 w-80 h-80 bg-gradient-to-br from-pink-200/20 to-blue-200/20 rounded-full blur-3xl animate-pulse delay-500"></div>
            </div>

            <Navbar />
            <div className="relative pt-32 px-4 sm:px-6 max-w-5xl mx-auto w-full pb-16">
                <div className="card p-8 animate-fade-in-scale">
                    {/* Header Section */}
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 via-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                            <FileText className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-4xl font-extrabold text-gradient mb-3 tracking-tight">Write a Review</h1>
                        <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
                            Share your experience and help build a trusted community of advertisers, affiliates, and networks
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Entity Selection Card */}
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-700/30 animate-slide-up">
                            <label className="block text-lg font-bold text-blue-700 dark:text-blue-300 mb-4 flex items-center">
                                <User className="w-5 h-5 mr-2" />
                                Which entity are you reviewing? *
                            </label>
                            <select
                                value={formData.is_new_entity ? 'new_entity' : formData.entity_id}
                                onChange={handleEntitySelection}
                                className="input-field text-lg"
                                required
                            >
                                <option value="">Select an entity...</option>
                                {entities.map(entity => (
                                    <option key={entity.entity_id} value={entity.entity_id}>
                                        {entity.entity_metadata.company_name} ({entity.entity_type})
                                    </option>
                                ))}
                                <option value="new_entity">🆕 Entity not in list (enter manually)</option>
                            </select>

                            {/* Manual Entity Name */}
                            {formData.is_new_entity && (
                                <div className="mt-4 animate-slide-in-down space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            Entity Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.entity_name}
                                            onChange={(e) => handleInputChange('entity_name', e.target.value)}
                                            placeholder="e.g., XYZ Media Group"
                                            className="input-field"
                                            required={formData.is_new_entity}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            Website (Optional)
                                        </label>
                                        <input
                                            type="url"
                                            value={formData.entity_website}
                                            onChange={(e) => handleInputChange('entity_website', e.target.value)}
                                            placeholder="https://example.com"
                                            className="input-field"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            Entity Description (Optional)
                                        </label>
                                        <textarea
                                            value={formData.entity_description}
                                            onChange={(e) => handleInputChange('entity_description', e.target.value)}
                                            placeholder="Brief description of what this entity does..."
                                            className="input-field h-20 resize-none"
                                            rows={2}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                Contact Email (Optional)
                                            </label>
                                            <input
                                                type="email"
                                                value={formData.entity_contact_info.email}
                                                onChange={(e) => handleInputChange('entity_contact_info.email', e.target.value)}
                                                placeholder="contact@example.com"
                                                className="input-field"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                Contact Phone (Optional)
                                            </label>
                                            <input
                                                type="tel"
                                                value={formData.entity_contact_info.phone}
                                                onChange={(e) => handleInputChange('entity_contact_info.phone', e.target.value)}
                                                placeholder="+1234567890"
                                                className="input-field"
                                            />
                                        </div>
                                    </div>

                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-700/30">
                                        💡 This entity will be added to our database. Your review will require admin approval before publication. Providing additional details helps our team verify the entity.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Review Content Card */}
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-purple-200/50 dark:border-purple-700/30 animate-slide-up animate-delay-100">
                            <h3 className="text-lg font-bold text-purple-700 dark:text-purple-300 mb-6 flex items-center">
                                <FileText className="w-5 h-5 mr-2" />
                                Review Details
                            </h3>

                            <div className="space-y-6">
                                {/* Review Title */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Review Title *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => handleInputChange('title', e.target.value)}
                                        placeholder="e.g., Great payouts but slow support"
                                        className="input-field"
                                        required
                                    />
                                </div>

                                {/* Overall Rating */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                        Overall Rating *
                                    </label>
                                    {renderStarRating('overall_rating', formData.overall_rating)}
                                </div>

                                {/* Review Text */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Your Review *
                                    </label>
                                    <textarea
                                        value={formData.review_text}
                                        onChange={(e) => handleInputChange('review_text', e.target.value)}
                                        placeholder="Share your detailed experience working with this entity...(Min. 10 characters required)"
                                        rows={6}
                                        className="input-field resize-none"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Minimum 10 characters • Be honest and constructive
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Category Ratings Card */}
                        <div className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-2xl p-6 border border-green-200/50 dark:border-green-700/30 animate-slide-up animate-delay-200">
                            <h3 className="text-lg font-bold text-green-700 dark:text-green-300 mb-6 flex items-center">
                                <Star className="w-5 h-5 mr-2" />
                                Category Ratings *
                            </h3>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {[
                                    { key: 'quality', label: 'Quality', icon: '🎯', desc: 'Overall quality of service' },
                                    { key: 'support', label: 'Support', icon: '🛠️', desc: 'Customer service quality' },
                                    { key: 'reliability', label: 'Reliability', icon: '⚡', desc: 'Consistency and dependability' },
                                    { key: 'payment_speed', label: 'Payment Speed', icon: '💰', desc: 'Speed of payments' }
                                ].map(category => (
                                    <div key={category.key} className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-4 border border-gray-200/50 dark:border-gray-600/50">
                                        <div className="flex items-center mb-2">
                                            <span className="text-lg mr-2">{category.icon}</span>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                    {category.label}
                                                </label>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{category.desc}</p>
                                            </div>
                                        </div>
                                        {renderStarRating(
                                            `category_ratings.${category.key}`,
                                            formData.category_ratings[category.key]
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Additional Options Card */}
                        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-2xl p-6 border border-orange-200/50 dark:border-orange-700/30 animate-slide-up animate-delay-300">
                            <h3 className="text-lg font-bold text-orange-700 dark:text-orange-300 mb-6 flex items-center">
                                <Tag className="w-5 h-5 mr-2" />
                                Additional Options
                            </h3>

                            <div className="space-y-6">
                                {/* Tags */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Tags (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.tags}
                                        onChange={(e) => handleInputChange('tags', e.target.value)}
                                        placeholder="e.g., Fast Payment, Good Support, High Quality (comma-separated)"
                                        className="input-field"
                                    />
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Add relevant tags to help others find your review
                                    </p>
                                </div>

                                {/* Anonymous Option */}
                                <div className="flex items-center space-x-3">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            id="anonymous"
                                            checked={formData.is_anonymous}
                                            onChange={(e) => handleInputChange('is_anonymous', e.target.checked)}
                                            className="sr-only"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleInputChange('is_anonymous', !formData.is_anonymous)}
                                            className={`w-12 h-6 rounded-full transition-all duration-200 relative ${formData.is_anonymous
                                                ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                                                : 'bg-gray-300 dark:bg-gray-600'
                                                }`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg transition-transform duration-200 ${formData.is_anonymous ? 'translate-x-7' : 'translate-x-1'
                                                }`} />
                                        </button>
                                    </div>
                                    <div className="flex items-center">
                                        {formData.is_anonymous ? (
                                            <EyeOff className="w-4 h-4 text-gray-500 mr-2" />
                                        ) : (
                                            <Eye className="w-4 h-4 text-gray-500 mr-2" />
                                        )}
                                        <label htmlFor="anonymous" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                                            Post this review anonymously
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4 animate-slide-up animate-delay-400">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 disabled:transform-none disabled:cursor-not-allowed disabled:hover:shadow-xl"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center gap-3">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        <span>Publishing Review...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-2">
                                        <FileText className="w-5 h-5" />
                                        <span>Publish Review</span>
                                    </div>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Guidelines Section */}
                    <div className="mt-12 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-2xl p-6 border border-indigo-200/50 dark:border-indigo-700/30 animate-slide-up animate-delay-500">
                        <h3 className="font-bold text-lg mb-4 text-indigo-700 dark:text-indigo-300 flex items-center">
                            <div className="w-6 h-6 bg-indigo-500 rounded-lg flex items-center justify-center text-white text-sm mr-2">📝</div>
                            Review Guidelines
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300">
                            <ul className="space-y-2">
                                <li className="flex items-start">
                                    <span className="text-green-500 mr-2">✓</span>
                                    Be honest and constructive in your feedback
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-500 mr-2">✓</span>
                                    Focus on your actual experience with the entity
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-500 mr-2">✓</span>
                                    Reviews for registered entities are published immediately
                                </li>
                            </ul>
                            <ul className="space-y-2">
                                <li className="flex items-start">
                                    <span className="text-blue-500 mr-2">ℹ</span>
                                    Reviews for unregistered entities require admin approval
                                </li>
                                <li className="flex items-start">
                                    <span className="text-red-500 mr-2">✗</span>
                                    Spam or fake reviews will be rejected
                                </li>
                                <li className="flex items-start">
                                    <span className="text-purple-500 mr-2">🔒</span>
                                    Anonymous reviews are allowed and protected
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
