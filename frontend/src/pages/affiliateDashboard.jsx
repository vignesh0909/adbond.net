import React, { useState, useEffect, useRef, useCallback } from 'react';
import Navbar from '../components/navbar';
import EntityReviewsDashboard from '../components/EntityReviewsDashboard';
import { authAPI } from '../services/auth';
import { offersAPI } from '../services/offers';

export default function AffiliateDashboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const [availableOffers, setAvailableOffers] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [selectedTab, setSelectedTab] = useState('offers');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states for creating new offer request
  const [showCreateRequest, setShowCreateRequest] = useState(false);
  const [newRequest, setNewRequest] = useState({
    title: '',
    vertical: '',
    geos_targeting: [],
    traffic_type: [],
    traffic_volume: '',
    platforms_used: [],
    desired_payout_type: 'CPA',
    budget_range: '',
    notes: '',
    expires_at: ''
  });

  // States for bidding on offers
  const [showBidModal, setShowBidModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);

  useEffect(() => {
    const user = authAPI.getCurrentUser();
    if (user && user.role === 'affiliate') {
      setCurrentUser(user);
    }
  }, []);

  // Separate useEffect to fetch data when currentUser is set
  useEffect(() => {
    if (currentUser && currentUser.user_id) {
      fetchAvailableOffers();
      fetchMyRequests();
    }
  }, [currentUser]);

  const fetchAvailableOffers = async () => {
    try {
      setLoading(true);
      const response = await offersAPI.getAllOffers();
      setAvailableOffers(response.offers || []);
    } catch (err) {
      setError('Failed to fetch available offers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyRequests = async () => {
    if (!currentUser?.user_id) {
      console.log('No currentUser or user_id available');
      return;
    }
    
    try {
      const response = await offersAPI.getOfferRequestsByUser(currentUser.user_id);
      setMyRequests(response.requests || []);
    } catch (err) {
      setError('Failed to fetch your requests');
      console.error(err);
    }
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const requestData = {
        ...newRequest,
        entity_id: currentUser.entity_id,
        geos_targeting: newRequest.geos_targeting.split(',').map(geo => geo.trim()),
        traffic_type: newRequest.traffic_type.split(',').map(type => type.trim()),
        platforms_used: newRequest.platforms_used.split(',').map(platform => platform.trim()),
        traffic_volume: parseInt(newRequest.traffic_volume),
        budget_range: newRequest.budget_range ? JSON.parse(newRequest.budget_range) : null
      };

      await offersAPI.createOfferRequest(requestData);
      setShowCreateRequest(false);
      setNewRequest({
        title: '',
        vertical: '',
        geos_targeting: [],
        traffic_type: [],
        traffic_volume: '',
        platforms_used: [],
        desired_payout_type: 'CPA',
        budget_range: '',
        notes: '',
        expires_at: ''
      });
      fetchMyRequests();
    } catch (err) {
      setError('Failed to create offer request');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyToOffer = async (offer) => {
    try {
      setLoading(true);
      // This would track application interest or send application
      await offersAPI.applyToOffer(offer.offer_id, currentUser.entity_id);
      setSelectedOffer(null);
      setShowBidModal(false);
    } catch (err) {
      setError('Failed to apply to offer');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openOfferModal = (offer) => {
    setSelectedOffer(offer);
    setShowBidModal(true);
  };

  if (!currentUser || currentUser.role !== 'affiliate') {
    return (
      <div className="bg-gray-50 text-gray-900 mt-20 font-sans">
        <Navbar />
        <section className="py-20 px-6 max-w-md mx-auto text-center">
          <p>Access denied. Affiliate role required.</p>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col">
      <Navbar />
      <section className="pt-24 pb-16 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
          <h2 className="text-3xl font-extrabold text-pink-700 dark:text-pink-300 tracking-tight">Affiliate Dashboard</h2>
          <button
            onClick={() => setShowCreateRequest(true)}
            className="bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 text-white px-6 py-2 rounded-lg shadow-lg font-bold transition"
          >
            + Create Offer Request
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
              onClick={() => setSelectedTab('requests')}
              className={`py-2 px-1 border-b-2 font-semibold text-lg transition-all ${selectedTab === 'requests'
                ? 'border-pink-500 text-pink-700 dark:text-pink-300'
                : 'border-transparent text-gray-500 hover:text-pink-700 dark:hover:text-pink-200'
              }`}
            >
              My Requests <span className="ml-1 text-xs bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full">{myRequests.length}</span>
            </button>
            <button
              onClick={() => setSelectedTab('reviews')}
              className={`py-2 px-1 border-b-2 font-semibold text-lg transition-all ${selectedTab === 'reviews'
                ? 'border-pink-500 text-pink-700 dark:text-pink-300'
                : 'border-transparent text-gray-500 hover:text-pink-700 dark:hover:text-pink-200'
              }`}
            >
              Reviews
            </button>
          </nav>
        </div>
        {/* My Requests Tab */}
        {selectedTab === 'requests' && (
          <div>
            <h3 className="text-xl font-semibold mb-4 text-pink-700 dark:text-pink-200">My Offer Requests</h3>
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
              </div>
            ) : myRequests.length === 0 ? (
              <div className="text-gray-500 text-center py-12">
                <span className="block text-5xl mb-4">📋</span>
                No requests created yet.
              </div>
            ) : (
              <div className="grid gap-8 md:grid-cols-2">
                {myRequests.map((request) => (
                  <div key={request.offer_request_id} className="bg-white/80 dark:bg-gray-900/80 rounded-2xl shadow-xl p-6 border border-pink-100 dark:border-gray-800 hover:scale-[1.02] transition-transform">
                    <h4 className="font-bold text-lg mb-2 text-pink-700 dark:text-pink-200">{request.title}</h4>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">Vertical: {request.vertical}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">GEOs: {Array.isArray(request.geos_targeting) ? request.geos_targeting.join(', ') : request.geos_targeting}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Traffic Volume: {request.traffic_volume}/day</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Desired Payout: {request.desired_payout_type}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${request.request_status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : request.request_status === 'fulfilled' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'}`}>{request.request_status}</span>
                      <button className="text-pink-600 hover:underline text-sm">View Bids</button>
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
            <h3 className="text-xl font-semibold mb-6 text-pink-700 dark:text-pink-200">Entity Reviews</h3>
            <EntityReviewsDashboard entityId={currentUser.entity_id} />
          </div>
        )}
        {/* Create Request Modal */}
        {showCreateRequest && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
            <div className="bg-white/90 dark:bg-gray-900/90 rounded-2xl max-w-2xl w-full max-h-screen overflow-y-auto p-8 border border-pink-100 dark:border-gray-800 shadow-2xl">
              <h3 className="text-2xl font-bold mb-4 text-pink-700 dark:text-pink-200">Create Offer Request</h3>
              <form onSubmit={handleCreateRequest} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={newRequest.title}
                    onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
                    className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vertical</label>
                  <input
                    type="text"
                    required
                    value={newRequest.vertical}
                    onChange={(e) => setNewRequest({ ...newRequest, vertical: e.target.value })}
                    placeholder="e.g., Health, Finance, Gaming"
                    className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target GEOs (comma-separated)</label>
                  <input
                    type="text"
                    required
                    value={newRequest.geos_targeting}
                    onChange={(e) => setNewRequest({ ...newRequest, geos_targeting: e.target.value })}
                    placeholder="US, UK, CA"
                    className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Traffic Types (comma-separated)</label>
                  <input
                    type="text"
                    required
                    value={newRequest.traffic_type}
                    onChange={(e) => setNewRequest({ ...newRequest, traffic_type: e.target.value })}
                    placeholder="Facebook Ads, Google Ads, Native"
                    className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Platforms Used (comma-separated)</label>
                  <input
                    type="text"
                    required
                    value={newRequest.platforms_used}
                    onChange={(e) => setNewRequest({ ...newRequest, platforms_used: e.target.value })}
                    placeholder="Facebook, Google, TikTok"
                    className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none transition"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Daily Traffic Volume</label>
                    <input
                      type="number"
                      required
                      value={newRequest.traffic_volume}
                      onChange={(e) => setNewRequest({ ...newRequest, traffic_volume: e.target.value })}
                      className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Desired Payout Type</label>
                    <select
                      value={newRequest.desired_payout_type}
                      onChange={(e) => setNewRequest({ ...newRequest, desired_payout_type: e.target.value })}
                      className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none transition"
                    >
                      <option value="CPA">CPA</option>
                      <option value="CPL">CPL</option>
                      <option value="CPI">CPI</option>
                      <option value="RevShare">RevShare</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Budget Range (Optional)</label>
                  <input
                    type="text"
                    value={newRequest.budget_range}
                    onChange={(e) => setNewRequest({ ...newRequest, budget_range: e.target.value })}
                    placeholder='{"min": 1000, "max": 5000}'
                    className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={newRequest.notes}
                    onChange={(e) => setNewRequest({ ...newRequest, notes: e.target.value })}
                    className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none transition"
                    rows="3"
                    placeholder="Additional requirements or information..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expires At (Optional)</label>
                  <input
                    type="datetime-local"
                    value={newRequest.expires_at}
                    onChange={(e) => setNewRequest({ ...newRequest, expires_at: e.target.value })}
                    className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none transition"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 text-white py-2 rounded-lg shadow-md transition"
                  >
                    {loading ? 'Creating...' : 'Create Request'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateRequest(false)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Offer Details Modal */}
        {showBidModal && selectedOffer && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
            <div className="bg-white/90 dark:bg-gray-900/90 rounded-2xl max-w-lg w-full max-h-screen overflow-y-auto p-8 border border-pink-100 dark:border-gray-800 shadow-2xl">
              <h3 className="text-2xl font-bold mb-4 text-pink-700 dark:text-pink-200">Offer Details</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-lg">{selectedOffer.title}</h4>
                  <p className="text-gray-600">{selectedOffer.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{selectedOffer.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Payout:</strong> ${selectedOffer.payout_value} {selectedOffer.payout_type}
                  </div>
                  <div>
                    <strong>GEOs:</strong> {Array.isArray(selectedOffer.target_geo) ? selectedOffer.target_geo.join(', ') : selectedOffer.target_geo}
                  </div>
                </div>
                <div>
                  <strong>Advertiser:</strong> {selectedOffer.entity_name}
                </div>
                {selectedOffer.requirements && (
                  <div>
                    <strong>Requirements:</strong>
                    <p className="text-sm text-gray-600 mt-1">{selectedOffer.requirements}</p>
                  </div>
                )}
                <div>
                  <strong>Landing Page:</strong>
                  <a
                    href={selectedOffer.landing_page_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm block"
                  >
                    {selectedOffer.landing_page_url}
                  </a>
                </div>
              </div>
              <div className="flex gap-3 pt-6">
                <button
                  onClick={() => handleApplyToOffer(selectedOffer)}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 text-white py-2 rounded-lg shadow-md transition"
                >
                  {loading ? 'Applying...' : 'Apply to Offer'}
                </button>
                <button
                  onClick={() => setShowBidModal(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded-lg transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
