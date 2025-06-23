import React, { useState } from 'react';
import { toast } from 'react-toastify';
import Navbar from '../components/navbar';
import { entityAPI } from '../services/entity';
import { ContactRound, Contact, BookUser, Building, Building2 } from 'lucide-react';

export default function RegisterEntityPage() {
    const [entityType, setEntityType] = useState('advertiser');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [websiteUrl, setWebsiteUrl] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [additionalRequest, setAdditionalRequest] = useState('');

    // Contact Info
    const [phone, setPhone] = useState('');
    const [teams, setTeams] = useState('');
    const [linkedin, setLinkedin] = useState('');
    const [telegram, setTelegram] = useState('');
    const [address, setAddress] = useState('');
    const [skype, setSkype] = useState('');

    // Entity Specific Metadata
    const [entityMetadata, setEntityMetadata] = useState({});

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showToast, setShowToast] = useState(false);

    // Show toast for errors and success messages
    const showToastMessage = (message, type) => {
        console.log(`Toast Message: ${message} | Type: ${type}`);
        if (type === 'error') {
            setError(message);
        } else {
            setSuccess(message);
        }
        setShowToast(true);
        setTimeout(() => {
            setShowToast(false);
            setError('');
            setSuccess('');
        }, 5000);
    };

    const handleMetadataChange = (e) => {
        const { name, value } = e.target;
        setEntityMetadata(prev => ({ ...prev, [name]: value }));
    };

    const handleSocialMediaChange = (e) => {
        const { name, value } = e.target;
        setEntityMetadata(prev => ({
            ...prev,
            social_media: { ...prev.social_media, [name]: value }
        }));
    };

    const handleReferenceDetailsChange = (e) => {
        const { name, value } = e.target;
        setEntityMetadata(prev => ({
            ...prev,
            reference_details: { ...prev.reference_details, [name]: value }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        const contactInfo = {
            phone,
            teams,
            linkedin,
            telegram,
            address,
            skype
        };

        // Basic validation for at least one contact method
        if (!Object.values(contactInfo).some(val => val && val.trim() !== '')) {
            showToastMessage('Please provide at least one contact method (Phone, Teams, LinkedIn, Telegram, Address, or Skype).', 'error');
            setLoading(false);
            return;
        }

        const payload = {
            entity_type: entityType,
            name,
            email,
            website_url: websiteUrl,
            contact_info: contactInfo,
            description,
            entity_metadata: entityMetadata,
            image_url: imageUrl || undefined,
            additional_notes: additionalRequest || undefined,
        };

        try {
            const response = await entityAPI.register(payload);
            console.log('Entity registration response:', response);

            toast.success('Entity registration submitted successfully! We will reach out to you shortly.', {
                position: "top-right",
                autoClose: 5000,
            });

            console.log('Entity registration successful:', response);
            // Clear form
            setName('');
            setEmail('');
            setWebsiteUrl('');
            setDescription('');
            setImageUrl('');
            setAdditionalRequest('');
            setPhone('');
            setTeams('');
            setLinkedin('');
            setTelegram('');
            setAddress('');
            setSkype('');
            setEntityMetadata({});
            setEntityType('advertiser');

        } catch (err) {
            console.log('Entity registration error:', err);
            toast.error(err.message || 'Entity registration failed. Please check your input and try again.', {
                position: "top-right",
                autoClose: 5000,
            });
            console.error('Entity registration error:', err);
        } finally {
            setLoading(false);
        }
    };

    const renderAdvertiserFields = () => (
        <>
            <h3 className="text-xl font-semibold mt-8 mb-4 pt-6 border-t border-gray-200 dark:border-gray-700 flex items-center text-gray-800 dark:text-gray-200">
                <ContactRound className="w-5 h-5 mr-2" />
                Advertiser Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" name="company_name" value={entityMetadata.company_name || ''} onChange={handleMetadataChange} placeholder="Company Name" className="input-field" />
                <input type="text" name="program_name" value={entityMetadata.program_name || ''} onChange={handleMetadataChange} placeholder="Program Name" className="input-field" />
                <input type="text" name="program_category" value={entityMetadata.program_category || ''} onChange={handleMetadataChange} placeholder="Program Category" className="input-field" />
                <input type="text" name="signup_url" value={entityMetadata.signup_url || ''} onChange={handleMetadataChange} placeholder="Signup URL" className="input-field" />
                <input type="text" name="industries" value={entityMetadata.industries || ''} onChange={handleMetadataChange} placeholder="Industries (comma-separated)" className="input-field" />
                <input type="number" name="founded_year" value={entityMetadata.founded_year || ''} onChange={handleMetadataChange} placeholder="Founded Year" className="input-field" />
            </div>
            <h4 className="text-md font-semibold mt-6 mb-3 text-gray-700 dark:text-gray-300">Social Media</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="url" name="facebook" value={entityMetadata.social_media?.facebook || ''} onChange={handleSocialMediaChange} placeholder="Facebook URL" className="input-field" />
                <input type="url" name="twitter" value={entityMetadata.social_media?.twitter || ''} onChange={handleSocialMediaChange} placeholder="Twitter URL" className="input-field" />
                <input type="url" name="linkedin" value={entityMetadata.social_media?.linkedin || ''} onChange={handleSocialMediaChange} placeholder="Company LinkedIn URL" className="input-field" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <input type="text" name="payout_types" value={entityMetadata.payout_types || ''} onChange={handleMetadataChange} placeholder="Payout Types (e.g., CPA, CPC)" className="input-field" />
                <input type="text" name="payment_terms" value={entityMetadata.payment_terms || ''} onChange={handleMetadataChange} placeholder="Payment Terms (e.g., Net 30)" className="input-field" />
                <input type="number" step="0.01" name="referral_commission" value={entityMetadata.referral_commission || ''} onChange={handleMetadataChange} placeholder="Referral Commission (e.g., 0.1 for 10%)" className="input-field" />
            </div>
        </>
    );

    const renderAffiliateFields = () => (
        <>
            <h3 className="text-xl font-semibold mt-8 mb-4 pt-6 border-t border-gray-200 dark:border-gray-700 flex items-center text-gray-800 dark:text-gray-200">
                <Contact className="w-5 h-5 mr-2" />
                Affiliate Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" name="verticals" value={entityMetadata.verticals || ''} onChange={handleMetadataChange} placeholder="Preferred Verticals (comma-separated)" className="input-field" />
                <input type="number" name="monthly_revenue" value={entityMetadata.monthly_revenue || ''} onChange={handleMetadataChange} placeholder="Monthly Revenue (USD)" className="input-field" />
                <input type="text" name="traffic_provided_geos" value={entityMetadata.traffic_provided_geos || ''} onChange={handleMetadataChange} placeholder="Traffic GEOs (comma-separated)" className="input-field" />
            </div>
            <h4 className="text-md font-semibold mt-6 mb-3 text-gray-700 dark:text-gray-300">Reference Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" name="name" value={entityMetadata.reference_details?.name || ''} onChange={handleReferenceDetailsChange} placeholder="Reference Name" className="input-field" />
                <input type="text" name="contact" value={entityMetadata.reference_details?.contact || ''} onChange={handleReferenceDetailsChange} placeholder="Reference Contact (Email/Phone)" className="input-field" />
                <input type="text" name="company" value={entityMetadata.reference_details?.company || ''} onChange={handleReferenceDetailsChange} placeholder="Reference Company" className="input-field" />
            </div>
        </>
    );

    const renderNetworkFields = () => (
        <>
            <h3 className="text-xl font-semibold mt-8 mb-4 pt-6 border-t border-gray-200 dark:border-gray-700 flex items-center text-gray-800 dark:text-gray-200">
                <BookUser className="w-5 h-5 mr-2" />
                Network Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" name="network_name" value={entityMetadata.network_name || ''} onChange={handleMetadataChange} placeholder="Network Name" className="input-field" />
                <input type="text" name="signup_url" value={entityMetadata.signup_url || ''} onChange={handleMetadataChange} placeholder="Signup URL" className="input-field" />
                <input type="text" name="tracking_platform" value={entityMetadata.tracking_platform || ''} onChange={handleMetadataChange} placeholder="Tracking Platform" className="input-field" />
                <input type="text" name="supported_models" value={entityMetadata.supported_models || ''} onChange={handleMetadataChange} placeholder="Supported Models (e.g., CPA, CPL)" className="input-field" />
                <input type="text" name="verticals" value={entityMetadata.verticals || ''} onChange={handleMetadataChange} placeholder="Network Verticals (comma-separated)" className="input-field" />
                <input type="text" name="payment_terms" value={entityMetadata.payment_terms || ''} onChange={handleMetadataChange} placeholder="Payment Terms (e.g., Net 15, Weekly)" className="input-field" />
                <input type="number" name="offers_available" value={entityMetadata.offers_available || ''} onChange={handleMetadataChange} placeholder="Number of Offers Available" className="input-field" />
                <input type="number" name="minimum_payout" value={entityMetadata.minimum_payout || ''} onChange={handleMetadataChange} placeholder="Minimum Payout (USD)" className="input-field" />
                <input type="number" step="0.01" name="referral_commission" value={entityMetadata.referral_commission || ''} onChange={handleMetadataChange} placeholder="Referral Commission (e.g., 0.05 for 5%)" className="input-field" />
            </div>
        </>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-gray-100 font-sans">
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/30 dark:bg-blue-400/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200/30 dark:bg-purple-400/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute top-40 left-1/2 transform -translate-x-1/2 w-80 h-80 bg-pink-200/30 dark:bg-pink-400/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
            </div>

            <Navbar />

            {/* Toast Messages */}
            {showToast && (error || success) && (
                <div className={`fixed top-20 right-4 z-50 max-w-sm w-full transform transition-all duration-300 ease-in-out ${showToast ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
                    }`}>
                    <div className={`p-4 rounded-lg shadow-lg border-l-4 ${error
                        ? 'bg-red-50 dark:bg-red-900/50 border-red-500 text-red-700 dark:text-red-300'
                        : 'bg-green-50 dark:bg-green-900/50 border-green-500 text-green-700 dark:text-green-300'
                        }`}>
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                {error ? (
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </div>
                            <div className="ml-3 flex-1">
                                <p className="text-sm font-medium">{error || success}</p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowToast(false);
                                    setError('');
                                    setSuccess('');
                                }}
                                className="ml-4 inline-flex text-gray-400 hover:text-gray-600 focus:outline-none"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <section className="relative py-12 px-4 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
                    {/* Info Section - Left Side */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="card p-6 animate-fade-in-scale">
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                    <Building2 className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="text-3xl font-extrabold mb-2 text-gradient-purple">Register Your Entity</h2>
                                <p className="text-gray-600 dark:text-gray-400">Join our network of verified advertisers, affiliates, and networks</p>
                            </div>
                        </div>

                        {/* Benefits Section */}
                        <div className="card p-6 animate-fade-in-scale animation-delay-200">
                            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Why Join Our Network?</h3>
                            <div className="space-y-3">
                                <div className="flex items-start">
                                    <svg className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    <div>
                                        <h4 className="font-medium text-gray-800 dark:text-gray-200">Verified Partners</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Connect with trusted and verified business partners</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <svg className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    <div>
                                        <h4 className="font-medium text-gray-800 dark:text-gray-200">Quick Approval</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Fast review and approval process for qualified entities</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <svg className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    <div>
                                        <h4 className="font-medium text-gray-800 dark:text-gray-200">24/7 Support</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Dedicated support team to help you succeed</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Entity Types Info */}
                        <div className="card p-6 animate-fade-in-scale animation-delay-400">
                            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Entity Types</h3>
                            <div className="space-y-3">
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                                    <h4 className="font-medium text-blue-800 dark:text-blue-300">Advertiser</h4>
                                    <p className="text-sm text-blue-600 dark:text-blue-400">Companies looking to promote their products or services</p>
                                </div>
                                <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                                    <h4 className="font-medium text-green-800 dark:text-green-300">Affiliate</h4>
                                    <p className="text-sm text-green-600 dark:text-green-400">Publishers and marketers who drive traffic and conversions</p>
                                </div>
                                <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                                    <h4 className="font-medium text-purple-800 dark:text-purple-300">Network</h4>
                                    <p className="text-sm text-purple-600 dark:text-purple-400">Platforms connecting advertisers with affiliates</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form Section - Right Side */}
                    <div className="lg:col-span-2">
                        <div className="card p-8 animate-fade-in-scale">
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label htmlFor="entityType" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                                        </svg>
                                        Entity Type *
                                    </label>
                                    <select
                                        id="entityType"
                                        value={entityType}
                                        onChange={(e) => {
                                            setEntityType(e.target.value);
                                            setEntityMetadata({});
                                        }}
                                        className="input-field"
                                        required
                                    >
                                        <option value="advertiser">Advertiser</option>
                                        <option value="affiliate">Affiliate</option>
                                        <option value="network">Network</option>
                                    </select>
                                </div>
                                <h3 className="text-xl font-bold pt-6 pb-4 border-b border-gray-200 dark:border-gray-700 flex items-center text-gray-800 dark:text-gray-200">
                                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                    </svg>
                                    Common Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                            </svg>
                                            Your Name *
                                        </label>
                                        <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Full Name" className="input-field" required />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                            </svg>
                                            Primary Email *
                                        </label>
                                        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contact@example.com" className="input-field" required />
                                    </div>
                                    <div>
                                        <label htmlFor="websiteUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.559-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.559.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.148.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd" />
                                            </svg>
                                            Website URL *
                                        </label>
                                        <input id="websiteUrl" type="url" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://example.com" className="input-field" required />
                                    </div>
                                    <div>
                                        <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            Logo/Image URL (Optional)
                                        </label>
                                        <input id="imageUrl" type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://example.com/logo.png" className="input-field" />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Description *
                                    </label>
                                    <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Briefly describe your entity and services" className="input-field" rows="4" required />
                                </div>
                                <h4 className="text-lg font-semibold mt-6 mb-4 flex items-center text-gray-800 dark:text-gray-200">
                                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                    </svg>
                                    Contact Information
                                    <span className="text-sm text-gray-500 dark:text-gray-400 font-normal ml-2">(at least one required)</span>
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone (e.g., +1234567890)" className="input-field" />
                                    <input type="text" value={teams} onChange={(e) => setTeams(e.target.value)} placeholder="Microsoft Teams ID" className="input-field" />
                                    <input type="url" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="LinkedIn Profile URL" className="input-field" />
                                    <input type="text" value={telegram} onChange={(e) => setTelegram(e.target.value)} placeholder="Telegram Username (e.g., @username)" className="input-field" />
                                    <input type="text" value={skype} onChange={(e) => setSkype(e.target.value)} placeholder="Skype ID" className="input-field" />
                                    <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Full Address" className="input-field" />
                                </div>
                                <div>
                                    <label htmlFor="additionalRequest" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        Additional Notes/Requests (Optional)
                                    </label>
                                    <textarea id="additionalRequest" value={additionalRequest} onChange={(e) => setAdditionalRequest(e.target.value)} placeholder="Any other information or specific requests" className="input-field" rows="3" />
                                </div>
                                {/* Entity Specific Fields */}
                                {entityType === 'advertiser' && renderAdvertiserFields()}
                                {entityType === 'affiliate' && renderAffiliateFields()}
                                {entityType === 'network' && renderNetworkFields()}
                                <button
                                    type="submit"
                                    className="btn-primary w-full py-4 text-lg mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                                            Submitting Registration...
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center">
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            Register Entity
                                        </div>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
