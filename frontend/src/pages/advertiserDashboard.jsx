import React, { useState, useEffect } from 'react';
import Navbar from '../components/navbar';
import EntityReviewsDashboard from '../components/EntityReviewsDashboard';
import { authAPI } from '../services/auth';
import { offersAPI } from '../services/offers';

export default function AdvertiserDashboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const [myOffers, setMyOffers] = useState([]);
  const [offerRequests, setOfferRequests] = useState([]);
  const [selectedTab, setSelectedTab] = useState('offers');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states for offer modal (create/edit)
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [offerData, setOfferData] = useState({
    title: '',
    category: '',
    description: '',
    target_geo: [],
    payout_type: 'CPA',
    payout_value: '',
    landing_page_url: '',
    requirements: '',
    expires_at: ''
  });

  // Form states for bidding on requests
  const [showBidModal, setShowBidModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [bidData, setBidData] = useState({
    bid_amount: '',
    bid_notes: '',
    offer_details: {}
  });

  useEffect(() => {
    const user = authAPI.getCurrentUser();
    if (user && user.role === 'advertiser') {
      setCurrentUser(user);
    }
  }, []);

  // Separate useEffect to fetch data when currentUser is set
  useEffect(() => {
    if (currentUser && currentUser.entity_id) {
      fetchMyOffers();
      fetchOfferRequests();
    }
  }, [currentUser]);

  const fetchMyOffers = async () => {
    if (!currentUser?.entity_id) {
      console.log('No currentUser or entity_id available');
      return;
    }

    try {
      setLoading(true);
      const response = await offersAPI.getOffersByEntity(currentUser.entity_id);
      setMyOffers(response.offers || []);
    } catch (err) {
      setError('Failed to fetch your offers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOfferRequests = async () => {
    try {
      // Exclude requests from the current user's entity
      const filters = {};
      if (currentUser?.entity_id) {
        filters.exclude_entity_id = currentUser.entity_id;
      }
      const response = await offersAPI.getAllOfferRequests(filters);
      setOfferRequests(response.requests || []);
    } catch (err) {
      setError('Failed to fetch offer requests');
      console.error(err);
    }
  };

  const resetOfferForm = () => {
    setOfferData({
      title: '',
      category: '',
      description: '',
      target_geo: [],
      payout_type: 'CPA',
      payout_value: '',
      landing_page_url: '',
      requirements: '',
      expires_at: ''
    });
    setEditingOffer(null);
    setIsEditMode(false);
  };

  const openCreateOffer = () => {
    resetOfferForm();
    setShowOfferModal(true);
  };

  const openEditOffer = (offer) => {
    setEditingOffer(offer);
    setIsEditMode(true);
    setOfferData({
      title: offer.title || '',
      category: offer.category || '',
      description: offer.description || '',
      target_geo: Array.isArray(offer.target_geo) ? offer.target_geo.join(', ') : offer.target_geo || '',
      payout_type: offer.payout_type || 'CPA',
      payout_value: offer.payout_value || '',
      landing_page_url: offer.landing_page_url || '',
      requirements: offer.requirements || '',
      expires_at: offer.expires_at ? offer.expires_at.substring(0, 16) : ''
    });
    setShowOfferModal(true);
  };

  const handleOfferSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formattedData = {
        ...offerData,
        entity_id: currentUser.entity_id,
        target_geo: typeof offerData.target_geo === 'string' ?
          offerData.target_geo.split(',').map(geo => geo.trim()) :
          offerData.target_geo,
        payout_value: parseFloat(offerData.payout_value)
      };

      if (isEditMode) {
        await offersAPI.updateOffer(editingOffer.offer_id, formattedData);
      } else {
        await offersAPI.createOffer(formattedData);
      }

      setShowOfferModal(false);
      resetOfferForm();
      fetchMyOffers();
    } catch (err) {
      setError(`Failed to ${isEditMode ? 'update' : 'create'} campaign`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitBid = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const bidPayload = {
        entity_id: currentUser.entity_id,
        bid_amount: parseFloat(bidData.bid_amount),
        bid_notes: bidData.bid_notes,
        offer_details: bidData.offer_details
      };

      await offersAPI.createBid(selectedRequest.offer_request_id, bidPayload);
      setShowBidModal(false);
      setBidData({ bid_amount: '', bid_notes: '', offer_details: {} });
      setSelectedRequest(null);
    } catch (err) {
      setError('Failed to submit bid');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openBidModal = (request) => {
    setSelectedRequest(request);
    setShowBidModal(true);
  };

  if (!currentUser || currentUser.role !== 'advertiser') {
    return (
      <div className="bg-gray-50 text-gray-900 mt-20 font-sans">
        <Navbar />
        <section className="py-20 px-6 max-w-md mx-auto text-center">
          <p>Access denied. Advertiser role required.</p>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col">
      <Navbar />
      <section className="pt-24 pb-16 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
          <h2 className="text-3xl font-extrabold text-blue-700 dark:text-blue-300 tracking-tight">Advertiser Dashboard</h2>
          <button
            onClick={() => openCreateOffer()}
            className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white px-6 py-2 rounded-lg shadow-lg font-bold transition"
          >
            + Create Campaign
          </button>
        </div>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 animate-pulse">
            {error}
          </div>
        )}
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setSelectedTab('offers')}
              className={`py-2 px-1 border-b-2 font-semibold text-lg transition-all ${selectedTab === 'offers'
                ? 'border-blue-500 text-blue-600 dark:text-blue-300'
                : 'border-transparent text-gray-500 hover:text-blue-700 dark:hover:text-blue-200'
                }`}
            >
              My Offers <span className="ml-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{myOffers.length}</span>
            </button>
            <button
              onClick={() => setSelectedTab('reviews')}
              className={`py-2 px-1 border-b-2 font-semibold text-lg transition-all ${selectedTab === 'reviews'
                ? 'border-blue-500 text-blue-600 dark:text-blue-300'
                : 'border-transparent text-gray-500 hover:text-blue-700 dark:hover:text-blue-200'
                }`}
            >
              Reviews
            </button>
          </nav>
        </div>
        {/* My Offers Tab */}
        {selectedTab === 'offers' && (
          <div>
            <h3 className="text-xl font-semibold mb-4 text-blue-700 dark:text-blue-200">My Offers</h3>
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : myOffers.length === 0 ? (
              <div className="text-gray-500 text-center py-12">
                <span className="block text-5xl mb-4">🗂️</span>
                No offers created yet.
              </div>
            ) : (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {myOffers.map((offer) => (
                  <div key={offer.offer_id} className="bg-white/80 dark:bg-gray-900/80 rounded-2xl shadow-xl p-6 border border-blue-100 dark:border-gray-800 hover:scale-[1.02] transition-transform">
                    <h4 className="font-bold text-lg mb-2 text-blue-700 dark:text-blue-200">{offer.title}</h4>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">{offer.category}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-3">{offer.description}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="font-medium text-green-600 dark:text-green-400">
                        ${offer.payout_value} {offer.payout_type}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${offer.offer_status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'}`}>{offer.offer_status}</span>
                    </div>
                    {/* <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                      Clicks: {offer.click_count} | Conversions: {offer.conversion_count}
                    </div> */}
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => openEditOffer(offer)}
                        className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg shadow-md transition"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {/* Reviews Tab */}
        {selectedTab === 'reviews' && currentUser?.entity_id && (
          <div>
            <h3 className="text-xl font-semibold mb-6 text-blue-700 dark:text-blue-200">Entity Reviews</h3>
            <EntityReviewsDashboard entityId={currentUser.entity_id} />
          </div>
        )}
        {/* Unified Offer Modal (Create/Edit) */}
        {showOfferModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="modal-content bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/20 dark:border-gray-700/30 shadow-2xl animate-modal-in">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 p-6 rounded-t-3xl z-10 shadow-sm"
                style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(147, 51, 234, 0.05) 50%, rgba(59, 130, 246, 0.05) 100%)' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg">
                      🎯
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {isEditMode ? 'Edit Campaign' : 'Create New Campaign'}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {isEditMode ? 'Update offer details' : 'Create a new offer for affiliates to promote'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowOfferModal(false)}
                    className="w-10 h-10 bg-gray-100 dark:bg-gray-800 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 group"
                  >
                    <span className="text-gray-600 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400 text-lg">✕</span>
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                <form onSubmit={handleOfferSubmit} className="space-y-6">
                  {/* Basic Information Card */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-700/30 animate-slide-up animate-delay-100">
                    <h4 className="font-bold text-blue-700 dark:text-blue-300 mb-4 flex items-center">
                      <span className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center text-white text-sm mr-2">📝</span>
                      Campgaign Information (All fields required *)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Campaign Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={offerData.title}
                          onChange={(e) => setOfferData({ ...offerData, title: e.target.value })}
                          className="w-full px-4 py-3 bg-white/80 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 backdrop-blur-sm text-gray-900 dark:text-gray-100"
                          placeholder="Enter compelling offer title"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Category <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={offerData.category}
                          onChange={(e) => setOfferData({ ...offerData, category: e.target.value })}
                          className="w-full px-4 py-3 bg-white/80 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 backdrop-blur-sm text-gray-900 dark:text-gray-100"
                          placeholder="e.g., Health, Finance, Gaming"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Campgaign Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        required
                        value={offerData.description}
                        onChange={(e) => setOfferData({ ...offerData, description: e.target.value })}
                        className="w-full px-4 py-3 bg-white/80 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 backdrop-blur-sm text-gray-900 dark:text-gray-100"
                        rows="3"
                        placeholder="Describe your offer details..."
                      />
                    </div>
                  </div>

                  {/* Targeting & Payout Card */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-purple-200/50 dark:border-purple-700/30 animate-slide-up animate-delay-200">
                    <h4 className="font-bold text-purple-700 dark:text-purple-300 mb-4 flex items-center">
                      <span className="w-6 h-6 bg-purple-500 rounded-lg flex items-center justify-center text-white text-sm mr-2">🎯</span>
                      Targeting & Payout
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Target GEOs <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={offerData.target_geo}
                          onChange={(e) => setOfferData({ ...offerData, target_geo: e.target.value })}
                          placeholder="US, UK, CA, AU"
                          className="w-full px-4 py-3 bg-white/80 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 backdrop-blur-sm text-gray-900 dark:text-gray-100"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Comma-separated country codes</p>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Landing Page URL <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="url"
                          required
                          value={offerData.landing_page_url}
                          onChange={(e) => setOfferData({ ...offerData, landing_page_url: e.target.value })}
                          className="w-full px-4 py-3 bg-white/80 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 backdrop-blur-sm text-gray-900 dark:text-gray-100"
                          placeholder="https://example.com/landing"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Payout Type</label>
                        <select
                          value={offerData.payout_type}
                          onChange={(e) => setOfferData({ ...offerData, payout_type: e.target.value })}
                          className="w-full px-4 py-3 bg-white/80 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 backdrop-blur-sm text-gray-900 dark:text-gray-100"
                        >
                          <option value="CPA">CPA - Cost Per Action</option>
                          <option value="CPL">CPL - Cost Per Lead</option>
                          <option value="CPI">CPI - Cost Per Install</option>
                          <option value="RevShare">Revenue Share</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Payout Value ($) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={offerData.payout_value}
                          onChange={(e) => setOfferData({ ...offerData, payout_value: e.target.value })}
                          className="w-full px-4 py-3 bg-white/80 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 backdrop-blur-sm text-gray-900 dark:text-gray-100"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Additional Settings Card */}
                  <div className="bg-gradient-to-r from-pink-50 to-blue-50 dark:from-pink-900/20 dark:to-blue-900/20 rounded-2xl p-6 border border-pink-200/50 dark:border-pink-700/30 animate-slide-up animate-delay-300">
                    <h4 className="font-bold text-pink-700 dark:text-pink-300 mb-4 flex items-center">
                      <span className="w-6 h-6 bg-pink-500 rounded-lg flex items-center justify-center text-white text-sm mr-2">⚙️</span>
                      Allowed Media Types
                    </h4>
                    <div className="space-y-4">
                      <div>
                        {/* <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Allowed Media Types</label> */}
                        <textarea
                          value={offerData.requirements}
                          onChange={(e) => setOfferData({ ...offerData, requirements: e.target.value })}
                          className="w-full px-4 py-3 bg-white/80 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 backdrop-blur-sm text-gray-900 dark:text-gray-100"
                          rows="2"
                          placeholder="Eg. Blog, Display, Email, Newsletter"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-2 animate-slide-up animate-delay-400">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 hover:from-blue-600 hover:via-purple-600 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          {isEditMode ? 'Updating Campaign...' : 'Creating Campaign...'}
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          {isEditMode ? 'Update Campaign' : 'Create Campaign'}
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowOfferModal(false)}
                      className="flex-1 sm:flex-none sm:px-8 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold py-4 px-6 rounded-xl transition-all duration-200 hover:scale-[1.02]"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
