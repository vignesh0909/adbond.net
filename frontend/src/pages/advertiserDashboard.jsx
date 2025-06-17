import React, { useState, useEffect } from 'react';
import Navbar from '../components/navbar';
import EntityReviewsDashboard from '../components/EntityReviewsDashboard';
import { authAPI, offersAPI } from '../services/api';

export default function AdvertiserDashboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const [myOffers, setMyOffers] = useState([]);
  const [offerRequests, setOfferRequests] = useState([]);
  const [selectedTab, setSelectedTab] = useState('offers');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states for creating new offer
  const [showCreateOffer, setShowCreateOffer] = useState(false);
  const [newOffer, setNewOffer] = useState({
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

  const handleCreateOffer = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const offerData = {
        ...newOffer,
        entity_id: currentUser.entity_id,
        target_geo: newOffer.target_geo.split(',').map(geo => geo.trim()),
        payout_value: parseFloat(newOffer.payout_value)
      };

      await offersAPI.createOffer(offerData);
      setShowCreateOffer(false);
      setNewOffer({
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
      fetchMyOffers();
    } catch (err) {
      setError('Failed to create offer');
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
            onClick={() => setShowCreateOffer(true)}
            className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white px-6 py-2 rounded-lg shadow-lg font-bold transition"
          >
            + Create New Offer
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
                    <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                      Clicks: {offer.click_count} | Conversions: {offer.conversion_count}
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
        {/* Create Offer Modal */}
        {showCreateOffer && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
            <div className="bg-white/90 dark:bg-gray-900/90 rounded-2xl max-w-2xl w-full max-h-screen overflow-y-auto p-8 border border-blue-100 dark:border-gray-800 shadow-2xl">
              <h3 className="text-2xl font-bold mb-4 text-blue-700 dark:text-blue-200">Create New Offer</h3>
              <form onSubmit={handleCreateOffer} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={newOffer.title}
                    onChange={(e) => setNewOffer({ ...newOffer, title: e.target.value })}
                    className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <input
                    type="text"
                    required
                    value={newOffer.category}
                    onChange={(e) => setNewOffer({ ...newOffer, category: e.target.value })}
                    className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    required
                    value={newOffer.description}
                    onChange={(e) => setNewOffer({ ...newOffer, description: e.target.value })}
                    className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                    rows="3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target GEOs (comma-separated)</label>
                  <input
                    type="text"
                    required
                    value={newOffer.target_geo}
                    onChange={(e) => setNewOffer({ ...newOffer, target_geo: e.target.value })}
                    placeholder="US, UK, CA"
                    className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payout Type</label>
                    <select
                      value={newOffer.payout_type}
                      onChange={(e) => setNewOffer({ ...newOffer, payout_type: e.target.value })}
                      className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                    >
                      <option value="CPA">CPA</option>
                      <option value="CPL">CPL</option>
                      <option value="CPI">CPI</option>
                      <option value="RevShare">RevShare</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payout Value</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={newOffer.payout_value}
                      onChange={(e) => setNewOffer({ ...newOffer, payout_value: e.target.value })}
                      className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Landing Page URL</label>
                  <input
                    type="url"
                    required
                    value={newOffer.landing_page_url}
                    onChange={(e) => setNewOffer({ ...newOffer, landing_page_url: e.target.value })}
                    className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Requirements</label>
                  <textarea
                    value={newOffer.requirements}
                    onChange={(e) => setNewOffer({ ...newOffer, requirements: e.target.value })}
                    className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                    rows="2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expires At (Optional)</label>
                  <input
                    type="datetime-local"
                    value={newOffer.expires_at}
                    onChange={(e) => setNewOffer({ ...newOffer, expires_at: e.target.value })}
                    className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg shadow-md transition"
                  >
                    {loading ? 'Creating...' : 'Create Offer'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateOffer(false)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Bid Modal */}
        {showBidModal && selectedRequest && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
            <div className="bg-white/90 dark:bg-gray-900/90 rounded-2xl max-w-lg w-full p-8 border border-blue-100 dark:border-gray-800 shadow-2xl">
              <h3 className="text-2xl font-bold mb-4 text-blue-700 dark:text-blue-200">Submit Counter Offer</h3>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h4 className="font-medium">{selectedRequest.title}</h4>
                <p className="text-sm text-gray-600">Vertical: {selectedRequest.vertical}</p>
                <p className="text-sm text-gray-600">
                  Desired Payout: {selectedRequest.desired_payout_type}
                </p>
              </div>
              <form onSubmit={handleSubmitBid} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Offer Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={bidData.bid_amount}
                    onChange={(e) => setBidData({ ...bidData, bid_amount: e.target.value })}
                    className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={bidData.bid_notes}
                    onChange={(e) => setBidData({ ...bidData, bid_notes: e.target.value })}
                    className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                    rows="3"
                    placeholder="Additional details about your offer..."
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg shadow-md transition"
                  >
                    {loading ? 'Submitting...' : 'Submit Offer'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowBidModal(false)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
