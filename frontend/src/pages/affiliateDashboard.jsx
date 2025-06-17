import React, { useState, useEffect } from 'react';
import Navbar from '../components/navbar';
import EntityReviewsDashboard from '../components/EntityReviewsDashboard';
import { authAPI, offersAPI } from '../services/api';

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
    <div className="bg-gray-50 text-gray-900 font-sans">
      <Navbar />
      <section className="pt-24 pb-16 px-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Affiliate Dashboard</h2>
          <button
            onClick={() => setShowCreateRequest(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Create Offer Request
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {/* <button
              onClick={() => setSelectedTab('offers')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${selectedTab === 'offers'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              Available Offers ({availableOffers.length})
            </button> */}
            <button
              onClick={() => setSelectedTab('requests')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${selectedTab === 'requests'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              My Requests ({myRequests.length})
            </button>
            <button
              onClick={() => setSelectedTab('reviews')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${selectedTab === 'reviews'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              Reviews
            </button>
          </nav>
        </div>

        {/* Available Offers Tab */}
        {selectedTab === 'offers' && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Available Offers</h3>
            {loading ? (
              <p>Loading...</p>
            ) : availableOffers.length === 0 ? (
              <p className="text-gray-500">No offers available.</p>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {availableOffers.map((offer) => (
                  <div key={offer.offer_id} className="bg-white rounded-lg shadow p-6">
                    <h4 className="font-semibold text-lg mb-2">{offer.title}</h4>
                    <p className="text-gray-600 mb-2">{offer.category}</p>
                    <p className="text-sm text-gray-500 mb-3">{offer.description}</p>
                    <div className="mb-3">
                      <p className="text-sm text-gray-600">
                        <strong>GEOs:</strong> {Array.isArray(offer.target_geo) ? offer.target_geo.join(', ') : offer.target_geo}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Entity:</strong> {offer.entity_name} ({offer.entity_type})
                      </p>
                    </div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-medium text-green-600">
                        ${offer.payout_value} {offer.payout_type}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${offer.offer_status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                        {offer.offer_status}
                      </span>
                    </div>
                    <button
                      onClick={() => openOfferModal(offer)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
                    >
                      View Details & Apply
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* My Requests Tab */}
        {selectedTab === 'requests' && (
          <div>
            <h3 className="text-xl font-semibold mb-4">My Offer Requests</h3>
            {loading ? (
              <p>Loading...</p>
            ) : myRequests.length === 0 ? (
              <p className="text-gray-500">No requests created yet.</p>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {myRequests.map((request) => (
                  <div key={request.offer_request_id} className="bg-white rounded-lg shadow p-6">
                    <h4 className="font-semibold text-lg mb-2">{request.title}</h4>
                    <p className="text-gray-600 mb-2">Vertical: {request.vertical}</p>
                    <p className="text-sm text-gray-500 mb-2">
                      GEOs: {Array.isArray(request.geos_targeting) ? request.geos_targeting.join(', ') : request.geos_targeting}
                    </p>
                    <p className="text-sm text-gray-500 mb-2">
                      Traffic Volume: {request.traffic_volume}/day
                    </p>
                    <p className="text-sm text-gray-500 mb-2">
                      Desired Payout: {request.desired_payout_type}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className={`px-2 py-1 rounded text-xs ${request.request_status === 'active' ? 'bg-green-100 text-green-800' :
                          request.request_status === 'fulfilled' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                        }`}>
                        {request.request_status}
                      </span>
                      <button className="text-blue-600 hover:underline text-sm">
                        View Bids
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
            <h3 className="text-xl font-semibold mb-6">Entity Reviews</h3>
            <EntityReviewsDashboard entityId={currentUser.entity_id} />
          </div>
        )}

        {/* Create Request Modal */}
        {showCreateRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto p-6">
              <h3 className="text-xl font-semibold mb-4">Create Offer Request</h3>
              <form onSubmit={handleCreateRequest} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={newRequest.title}
                    onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
                    className="w-full border px-3 py-2 rounded"
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
                    className="w-full border px-3 py-2 rounded"
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
                    className="w-full border px-3 py-2 rounded"
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
                    className="w-full border px-3 py-2 rounded"
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
                    className="w-full border px-3 py-2 rounded"
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
                      className="w-full border px-3 py-2 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Desired Payout Type</label>
                    <select
                      value={newRequest.desired_payout_type}
                      onChange={(e) => setNewRequest({ ...newRequest, desired_payout_type: e.target.value })}
                      className="w-full border px-3 py-2 rounded"
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
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={newRequest.notes}
                    onChange={(e) => setNewRequest({ ...newRequest, notes: e.target.value })}
                    className="w-full border px-3 py-2 rounded"
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
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
                  >
                    {loading ? 'Creating...' : 'Create Request'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateRequest(false)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded"
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-lg w-full max-h-screen overflow-y-auto p-6">
              <h3 className="text-xl font-semibold mb-4">Offer Details</h3>
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
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
                >
                  {loading ? 'Applying...' : 'Apply to Offer'}
                </button>
                <button
                  onClick={() => setShowBidModal(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded"
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
