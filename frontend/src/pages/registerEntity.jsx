import React, { useState } from 'react';
import Navbar from '../components/navbar';
import { entityAPI } from '../services/entity';

export default function RegisterEntityPage() {
    const [entityType, setEntityType] = useState('advegrtiser');
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
            setError('Please provide at least one contact method (Phone, Teams, LinkedIn, Telegram, Address, or Skype).');
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
            setSuccess('Entity registration submitted successfully! We will reach out to you shortly.');
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
            setError(err.message || 'Entity registration failed. Please check your input and try again.');
            console.error('Entity registration error:', err);
        } finally {
            setLoading(false);
        }
    };

    const renderAdvertiserFields = () => (
        <>
            <h3 className="text-xl font-semibold mt-6 mb-2">Advertiser Details</h3>
            <input type="text" name="company_name" value={entityMetadata.company_name || ''} onChange={handleMetadataChange} placeholder="Company Name" className="w-full border px-3 py-2 rounded mb-2" />
            <input type="text" name="program_name" value={entityMetadata.program_name || ''} onChange={handleMetadataChange} placeholder="Program Name" className="w-full border px-3 py-2 rounded mb-2" />
            <input type="text" name="program_category" value={entityMetadata.program_category || ''} onChange={handleMetadataChange} placeholder="Program Category" className="w-full border px-3 py-2 rounded mb-2" />
            <input type="text" name="signup_url" value={entityMetadata.signup_url || ''} onChange={handleMetadataChange} placeholder="Signup URL" className="w-full border px-3 py-2 rounded mb-2" />
            {/* <input type="text" name="company_size" value={entityMetadata.company_size || ''} onChange={handleMetadataChange} placeholder="Company Size (e.g., 50-100)" className="w-full border px-3 py-2 rounded mb-2" /> */}
            <input type="text" name="industries" value={entityMetadata.industries || ''} onChange={handleMetadataChange} placeholder="Industries (comma-separated)" className="w-full border px-3 py-2 rounded mb-2" />
            <input type="number" name="founded_year" value={entityMetadata.founded_year || ''} onChange={handleMetadataChange} placeholder="Founded Year" className="w-full border px-3 py-2 rounded mb-2" />
            <h4 className="text-md font-semibold mt-4 mb-1">Social Media</h4>
            <input type="url" name="facebook" value={entityMetadata.social_media?.facebook || ''} onChange={handleSocialMediaChange} placeholder="Facebook URL" className="w-full border px-3 py-2 rounded mb-2" />
            <input type="url" name="twitter" value={entityMetadata.social_media?.twitter || ''} onChange={handleSocialMediaChange} placeholder="Twitter URL" className="w-full border px-3 py-2 rounded mb-2" />
            <input type="url" name="linkedin" value={entityMetadata.social_media?.linkedin || ''} onChange={handleSocialMediaChange} placeholder="Company LinkedIn URL" className="w-full border px-3 py-2 rounded mb-2" />
            <input type="text" name="payout_types" value={entityMetadata.payout_types || ''} onChange={handleMetadataChange} placeholder="Payout Types (e.g., CPA, CPC)" className="w-full border px-3 py-2 rounded mb-2" />
            <input type="text" name="payment_terms" value={entityMetadata.payment_terms || ''} onChange={handleMetadataChange} placeholder="Payment Terms (e.g., Net 30)" className="w-full border px-3 py-2 rounded mb-2" />
            <input type="number" step="0.01" name="referral_commission" value={entityMetadata.referral_commission || ''} onChange={handleMetadataChange} placeholder="Referral Commission (e.g., 0.1 for 10%)" className="w-full border px-3 py-2 rounded mb-2" />
        </>
    );

    const renderAffiliateFields = () => (
        <>
            <h3 className="text-xl font-semibold mt-6 mb-2">Affiliate Details</h3>
            <input type="text" name="verticals" value={entityMetadata.verticals || ''} onChange={handleMetadataChange} placeholder="Preferred Verticals (comma-separated)" className="w-full border px-3 py-2 rounded mb-2" />
            <input type="number" name="monthly_revenue" value={entityMetadata.monthly_revenue || ''} onChange={handleMetadataChange} placeholder="Monthly Revenue (USD)" className="w-full border px-3 py-2 rounded mb-2" />
            <input type="text" name="traffic_provided_geos" value={entityMetadata.traffic_provided_geos || ''} onChange={handleMetadataChange} placeholder="Traffic GEOs (comma-separated)" className="w-full border px-3 py-2 rounded mb-2" />
            <h4 className="text-md font-semibold mt-4 mb-1">Reference Details</h4>
            <input type="text" name="name" value={entityMetadata.reference_details?.name || ''} onChange={handleReferenceDetailsChange} placeholder="Reference Name" className="w-full border px-3 py-2 rounded mb-2" />
            <input type="text" name="contact" value={entityMetadata.reference_details?.contact || ''} onChange={handleReferenceDetailsChange} placeholder="Reference Contact (Email/Phone)" className="w-full border px-3 py-2 rounded mb-2" />
            <input type="text" name="company" value={entityMetadata.reference_details?.company || ''} onChange={handleReferenceDetailsChange} placeholder="Reference Company" className="w-full border px-3 py-2 rounded mb-2" />
        </>
    );

    const renderNetworkFields = () => (
        <>
            <h3 className="text-xl font-semibold mt-6 mb-2">Network Details</h3>
            <input type="text" name="network_name" value={entityMetadata.network_name || ''} onChange={handleMetadataChange} placeholder="Network Name" className="w-full border px-3 py-2 rounded mb-2" />
            <input type="text" name="signup_url" value={entityMetadata.signup_url || ''} onChange={handleMetadataChange} placeholder="Signup URL" className="w-full border px-3 py-2 rounded mb-2" />
            <input type="text" name="tracking_platform" value={entityMetadata.tracking_platform || ''} onChange={handleMetadataChange} placeholder="Tracking Platform" className="w-full border px-3 py-2 rounded mb-2" />
            <input type="text" name="supported_models" value={entityMetadata.supported_models || ''} onChange={handleMetadataChange} placeholder="Supported Models (e.g., CPA, CPL)" className="w-full border px-3 py-2 rounded mb-2" />
            <input type="text" name="verticals" value={entityMetadata.verticals || ''} onChange={handleMetadataChange} placeholder="Network Verticals (comma-separated)" className="w-full border px-3 py-2 rounded mb-2" />
            <input type="text" name="payment_terms" value={entityMetadata.payment_terms || ''} onChange={handleMetadataChange} placeholder="Payment Terms (e.g., Net 15, Weekly)" className="w-full border px-3 py-2 rounded mb-2" />
            <input type="number" name="offers_available" value={entityMetadata.offers_available || ''} onChange={handleMetadataChange} placeholder="Number of Offers Available" className="w-full border px-3 py-2 rounded mb-2" />
            <input type="number" name="minimum_payout" value={entityMetadata.minimum_payout || ''} onChange={handleMetadataChange} placeholder="Minimum Payout (USD)" className="w-full border px-3 py-2 rounded mb-2" />
            <input type="number" step="0.01" name="referral_commission" value={entityMetadata.referral_commission || ''} onChange={handleMetadataChange} placeholder="Referral Commission (e.g., 0.05 for 5%)" className="w-full border px-3 py-2 rounded mb-2" />
        </>
    );

    return (
        <div className="bg-gray-50 text-gray-900 mt-12 font-sans">
            <Navbar />
            <section className="py-10 px-6 max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold mb-6 text-center">Register Your Entity</h2>
                <form onSubmit={handleSubmit} className="space-y-4 bg-white p-8 shadow-lg rounded-lg">

                    <div>
                        <label htmlFor="entityType" className="block text-sm font-medium text-gray-700 mb-1">Entity Type *</label>
                        <select id="entityType" value={entityType} onChange={(e) => { setEntityType(e.target.value); setEntityMetadata({}); }} className="w-full border px-3 py-2 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500" required>
                            <option value="advertiser">Advertiser</option>
                            <option value="affiliate">Affiliate</option>
                            <option value="network">Network</option>
                        </select>
                    </div>

                    <h3 className="text-xl font-semibold pt-4 pb-2 border-b">Common Details</h3>

                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
                        <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Full Name" className="w-full border px-3 py-2 rounded" required />
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Primary Email *</label>
                        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contact@example.com" className="w-full border px-3 py-2 rounded" required />
                    </div>

                    <div>
                        <label htmlFor="websiteUrl" className="block text-sm font-medium text-gray-700 mb-1">Website URL *</label>
                        <input id="websiteUrl" type="url" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://example.com" className="w-full border px-3 py-2 rounded" required />
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                        <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Briefly describe your entity and services" className="w-full border px-3 py-2 rounded" rows="4" required />
                    </div>

                    <h4 className="text-md font-semibold mt-4 mb-1">Contact Information (at least one required)</h4>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone (e.g., +1234567890)" className="w-full border px-3 py-2 rounded mb-2" />
                    <input type="text" value={teams} onChange={(e) => setTeams(e.target.value)} placeholder="Microsoft Teams ID" className="w-full border px-3 py-2 rounded mb-2" />
                    <input type="url" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="LinkedIn Profile URL" className="w-full border px-3 py-2 rounded mb-2" />
                    <input type="text" value={telegram} onChange={(e) => setTelegram(e.target.value)} placeholder="Telegram Username (e.g., @username)" className="w-full border px-3 py-2 rounded mb-2" />
                    <input type="text" value={skype} onChange={(e) => setSkype(e.target.value)} placeholder="Skype ID" className="w-full border px-3 py-2 rounded mb-2" />
                    <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Full Address" className="w-full border px-3 py-2 rounded mb-2" />

                    <div>
                        <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">Logo/Image URL (Optional)</label>
                        <input id="imageUrl" type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://example.com/logo.png" className="w-full border px-3 py-2 rounded" />
                    </div>

                    <div>
                        <label htmlFor="additionalRequest" className="block text-sm font-medium text-gray-700 mb-1">Additional Notes/Requests (Optional)</label>
                        <textarea id="additionalRequest" value={additionalRequest} onChange={(e) => setAdditionalRequest(e.target.value)} placeholder="Any other information or specific requests" className="w-full border px-3 py-2 rounded" rows="3" />
                    </div>

                    {/* Entity Specific Fields */}
                    {entityType === 'advertiser' && renderAdvertiserFields()}
                    {entityType === 'affiliate' && renderAffiliateFields()}
                    {entityType === 'network' && renderNetworkFields()}

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white px-4 py-3 rounded hover:bg-blue-700 transition font-semibold text-lg"
                        disabled={loading}
                    >
                        {loading ? 'Submitting Registration...' : 'Register Entity'}
                    </button>
                </form>
                {error && <p className="text-red-600 mt-4 text-center p-3 bg-red-100 rounded">{error}</p>}
                {success && <p className="text-green-600 mt-4 text-center p-3 bg-green-100 rounded">{success}</p>}
            </section>
        </div>
    );
}
