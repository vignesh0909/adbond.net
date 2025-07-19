import React, { useState, useEffect, useRef, useCallback } from 'react';
import Navbar from '../components/navbar';
import EntityReviewsDashboard from '../components/EntityReviewsDashboard';
import { authAPI } from '../services/auth';
import { offersAPI } from '../services/offers';

export default function AffiliateDashboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const [availableOffers, setAvailableOffers] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [selectedTab, setSelectedTab] = useState('requests');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states for offer request modal (create/edit)
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [requestData, setRequestData] = useState({
    title: '',
    vertical: '',
    geos_targeting: [],
    traffic_type: [],
    traffic_volume: '',
    platforms_used: [],
    desired_payout_type: 'CPA',
    budget_range: '',
    notes: ''
  });

  // States for bidding on offers
  const [showBidModal, setShowBidModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);

  useEffect(() => {
    const user = authAPI.getCurrentUser();
    if (user && user.role === 'affiliate') {
      setCurrentUser(user);
      // Fetch data immediately after setting user
      fetchMyRequestsForUser(user);
    }
  }, []);

  // Helper function to fetch requests for a specific user
  const fetchMyRequestsForUser = async (user) => {
    if (!user?.user_id) {
      return;
    }

    try {
      setLoading(true);
      const response = await offersAPI.getOfferRequestsByUser(user.user_id);
      setMyRequests(response.requests || []);
      setError(''); // Clear any previous errors
    } catch (err) {
      setError('Failed to fetch your requests');
      console.error('Error fetching requests for user:', err);
    } finally {
      setLoading(false);
    }
  };

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
      console.log('No currentUser or user_id available for fetchMyRequests');
      return;
    }

    try {
      setLoading(true);
      const response = await offersAPI.getOfferRequestsByUser(currentUser.user_id);
      setMyRequests(response.requests || []);
      setError(''); // Clear any previous errors
    } catch (err) {
      setError('Failed to fetch your requests');
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetRequestForm = () => {
    setRequestData({
      title: '',
      vertical: '',
      geos_targeting: [],
      traffic_type: [],
      traffic_volume: '',
      platforms_used: [],
      desired_payout_type: 'CPA',
      budget_range: '',
      notes: ''
    });
    setEditingRequest(null);
    setIsEditMode(false);
  };

  const openCreateRequest = () => {
    resetRequestForm();
    setShowRequestModal(true);
  };

  const openEditRequest = (request) => {
    setEditingRequest(request);
    setIsEditMode(true);
    setRequestData({
      title: request.title || '',
      vertical: request.vertical || '',
      geos_targeting: Array.isArray(request.geos_targeting) ?
        request.geos_targeting.join(', ') :
        (request.geos_targeting || ''),
      traffic_type: Array.isArray(request.traffic_type) ?
        request.traffic_type.join(', ') :
        (request.traffic_type || ''),
      traffic_volume: request.traffic_volume || '',
      platforms_used: Array.isArray(request.platforms_used) ?
        request.platforms_used.join(', ') :
        (request.platforms_used || ''),
      desired_payout_type: request.desired_payout_type || 'CPA',
      budget_range: request.budget_range ?
        (typeof request.budget_range === 'object' ?
          JSON.stringify(request.budget_range) :
          request.budget_range) : '',
      notes: request.notes || ''
    });
    setShowRequestModal(true);
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formattedData = {
        ...requestData,
        entity_id: currentUser.entity_id,
        geos_targeting: typeof requestData.geos_targeting === 'string' ?
          requestData.geos_targeting.split(',').map(geo => geo.trim()) :
          requestData.geos_targeting,
        traffic_type: typeof requestData.traffic_type === 'string' ?
          requestData.traffic_type.split(',').map(type => type.trim()) :
          requestData.traffic_type,
        platforms_used: typeof requestData.platforms_used === 'string' ?
          requestData.platforms_used.split(',').map(platform => platform.trim()) :
          requestData.platforms_used,
        traffic_volume: parseInt(requestData.traffic_volume),
        budget_range: requestData.budget_range ?
          (typeof requestData.budget_range === 'string' ?
            JSON.parse(requestData.budget_range) :
            requestData.budget_range) : null
      };

      if (isEditMode) {
        await offersAPI.updateOfferRequest(editingRequest.offer_request_id, formattedData);
      } else {
        await offersAPI.createOfferRequest(formattedData);
      }

      setShowRequestModal(false);
      resetRequestForm();
      fetchMyRequests();
    } catch (err) {
      setError(`Failed to ${isEditMode ? 'update' : 'create'} offer request`);
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
            onClick={() => openCreateRequest()}
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
              <div className="grid gap-8 md:grid-cols-3 xl:grid-cols-3">
                {myRequests.map((request, index) => (
                  <div
                    key={request.offer_request_id}
                    className="group relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden animate-fade-in-scale"
                    style={{ animationDelay: `${index * 0.15}s` }}
                  >
                    {/* Status indicator line at top */}
                    <div className={`absolute top-0 left-0 right-0 h-1 ${request.request_status === 'active'
                      ? 'bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600'
                      : request.request_status === 'fulfilled'
                        ? 'bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600'
                        : 'bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600'
                      }`}></div>

                    {/* Floating status badge */}
                    <div className="absolute top-4 right-4 z-10">
                      <div className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg backdrop-blur-sm ${request.request_status === 'active'
                        ? 'bg-emerald-500/90 text-white ring-2 ring-emerald-200 dark:ring-emerald-800'
                        : request.request_status === 'fulfilled'
                          ? 'bg-blue-500/90 text-white ring-2 ring-blue-200 dark:ring-blue-800'
                          : 'bg-gray-500/90 text-white ring-2 ring-gray-200 dark:ring-gray-800'
                        }`}>
                        {request.request_status}
                      </div>
                    </div>

                    <div className="p-4">
                      {/* Header with icon and vertical */}
                      <div className="flex items-start space-x-3 mb-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                            {request.title ? request.title.charAt(0).toUpperCase() : '📋'}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-lg mb-1 text-gray-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors duration-300 line-clamp-2">
                            {request.title}
                          </h4>
                          <div className="inline-flex items-center px-2 py-0.5 bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30 rounded-full">
                            <span className="w-1.5 h-1.5 bg-pink-500 rounded-full mr-1.5 animate-pulse"></span>
                            <span className="text-pink-700 dark:text-pink-300 font-medium text-xs">{request.vertical}</span>
                          </div>
                        </div>
                      </div>

                      {/* Compact metrics grid */}
                      <div className="grid grid-cols-1 gap-2 mb-3">
                        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg p-2.5 border border-blue-200/30 dark:border-blue-700/30">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-blue-500 rounded-md flex items-center justify-center">
                              <span className="text-white text-xs">🌍</span>
                            </div>
                            <div>
                              <p className="text-blue-600 dark:text-blue-400 text-xs font-bold">GEOs</p>
                              <p className="text-gray-900 dark:text-white font-semibold text-xs">
                                {Array.isArray(request.geos_targeting)
                                  ? request.geos_targeting.slice(0, 4).join(', ') + (request.geos_targeting.length > 4 ? '...' : '')
                                  : request.geos_targeting}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-2 border border-purple-200/30 dark:border-purple-700/30">
                            <div className="flex items-center space-x-1.5 mb-0.5">
                              <div className="w-4 h-4 bg-purple-500 rounded flex items-center justify-center">
                                <span className="text-white text-xs">📊</span>
                              </div>
                              <p className="text-purple-600 dark:text-purple-400 text-xs font-bold">Traffic</p>
                            </div>
                            <p className="text-gray-900 dark:text-white font-bold text-xs">
                              {request.traffic_volume ? `${parseInt(request.traffic_volume).toLocaleString()}` : 'N/A'}
                            </p>
                          </div>

                          <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-lg p-2 border border-emerald-200/30 dark:border-emerald-700/30">
                            <div className="flex items-center space-x-1.5 mb-0.5">
                              <div className="w-4 h-4 bg-emerald-500 rounded flex items-center justify-center">
                                <span className="text-white text-xs">💰</span>
                              </div>
                              <p className="text-emerald-600 dark:text-emerald-400 text-xs font-bold">Payout</p>
                            </div>
                            <p className="text-gray-900 dark:text-white font-bold text-xs">{request.desired_payout_type}</p>
                          </div>
                        </div>
                      </div>

                      {/* Compact tags section */}
                      <div className="space-y-2 mb-3">
                        {request.traffic_type && (
                          <div className="flex flex-wrap gap-2">
                            {(Array.isArray(request.traffic_type) ? request.traffic_type : [request.traffic_type]).slice(0, 2).map((type, idx) => (
                              <span key={idx} className="px-1.5 py-0.5 bg-blue-500/10 text-blue-700 dark:text-blue-300 rounded text-xs font-medium border border-blue-200/50 dark:border-blue-700/50">
                                {type}
                              </span>
                            ))}

                            {(Array.isArray(request.platforms_used) ? request.platforms_used : [request.platforms_used]).slice(0, 2).map((platform, idx) => (
                              <span key={idx} className="px-1.5 py-0.5 bg-purple-500/10 text-purple-700 dark:text-purple-300 rounded text-xs font-medium border border-purple-200/50 dark:border-purple-700/50">
                                {platform}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Footer with date and action */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                          {request.created_at && new Date(request.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </div>
                        <button
                          onClick={() => openEditRequest(request)}
                          className="group/btn inline-flex items-center space-x-1.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-1.5 px-3 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-md"
                        >
                          <span className="text-xs">Edit</span>
                        </button>
                      </div>
                    </div>

                    {/* Subtle hover gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/0 via-purple-500/0 to-blue-500/0 group-hover:from-pink-500/5 group-hover:via-purple-500/5 group-hover:to-blue-500/5 transition-all duration-500 pointer-events-none rounded-2xl"></div>
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
        {/* Unified Request Modal (Create/Edit) */}
        {showRequestModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="modal-content bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/20 dark:border-gray-700/30 shadow-2xl animate-modal-in">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 p-6 rounded-t-3xl z-10 shadow-sm"
                style={{ background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.05) 0%, rgba(59, 130, 246, 0.05) 50%, rgba(236, 72, 153, 0.05) 100%)' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-blue-500 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg">
                      📝
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
                        {isEditMode ? 'Edit Offer Request' : 'Create Offer Request'}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {isEditMode ? 'Update your request details' : 'Submit a new request to find the perfect offers'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowRequestModal(false)}
                    className="w-10 h-10 bg-gray-100 dark:bg-gray-800 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 group"
                  >
                    <span className="text-gray-600 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400 text-lg">✕</span>
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                <form onSubmit={handleRequestSubmit} className="space-y-6">
                  {/* Basic Information Card */}
                  <div className="bg-gradient-to-r from-pink-50 to-blue-50 dark:from-pink-900/20 dark:to-blue-900/20 rounded-2xl p-6 border border-pink-200/50 dark:border-pink-700/30 animate-slide-up animate-delay-100">
                    <h4 className="font-bold text-pink-700 dark:text-pink-300 mb-4 flex items-center">
                      <span className="w-6 h-6 bg-pink-500 rounded-lg flex items-center justify-center text-white text-sm mr-2">🎯</span>
                      Request Information (All fields required *)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Request Title <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={requestData.title}
                          onChange={(e) => setRequestData({ ...requestData, title: e.target.value })}
                          className="w-full px-4 py-3 bg-white/80 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200 backdrop-blur-sm text-gray-900 dark:text-gray-100"
                          placeholder="Enter your request title"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Vertical <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={requestData.vertical}
                          onChange={(e) => setRequestData({ ...requestData, vertical: e.target.value })}
                          placeholder="e.g., Health, Finance, Gaming"
                          className="w-full px-4 py-3 bg-white/80 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200 backdrop-blur-sm text-gray-900 dark:text-gray-100"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Target GEOs <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={requestData.geos_targeting}
                          onChange={(e) => setRequestData({ ...requestData, geos_targeting: e.target.value })}
                          placeholder="US, UK, CA, AU"
                          className="w-full px-4 py-3 bg-white/80 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200 backdrop-blur-sm text-gray-900 dark:text-gray-100"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Comma-separated country codes</p>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Traffic Types <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={requestData.traffic_type}
                          onChange={(e) => setRequestData({ ...requestData, traffic_type: e.target.value })}
                          placeholder="Facebook Ads, Google Ads, Native"
                          className="w-full px-4 py-3 bg-white/80 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200 backdrop-blur-sm text-gray-900 dark:text-gray-100"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Comma-separated traffic sources</p>
                      </div>
                    </div>
                  </div>

                  {/* Traffic & Platform Details Card */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-700/30 animate-slide-up animate-delay-200">
                    <h4 className="font-bold text-blue-700 dark:text-blue-300 mb-4 flex items-center">
                      <span className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center text-white text-sm mr-2">📊</span>
                      Traffic & Platform Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Platforms Used <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={requestData.platforms_used}
                          onChange={(e) => setRequestData({ ...requestData, platforms_used: e.target.value })}
                          placeholder="Facebook, Google, TikTok, YouTube"
                          className="w-full px-4 py-3 bg-white/80 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 backdrop-blur-sm text-gray-900 dark:text-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Daily Traffic Volume <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          required
                          value={requestData.traffic_volume}
                          onChange={(e) => setRequestData({ ...requestData, traffic_volume: e.target.value })}
                          className="w-full px-4 py-3 bg-white/80 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 backdrop-blur-sm text-gray-900 dark:text-gray-100"
                          placeholder="10000"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Desired Payout Type</label>
                        <select
                          value={requestData.desired_payout_type}
                          onChange={(e) => setRequestData({ ...requestData, desired_payout_type: e.target.value })}
                          className="w-full px-4 py-3 bg-white/80 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 backdrop-blur-sm text-gray-900 dark:text-gray-100"
                        >
                          <option value="CPA">CPA - Cost Per Action</option>
                          <option value="CPL">CPL - Cost Per Lead</option>
                          <option value="CPI">CPI - Cost Per Install</option>
                          <option value="RevShare">Revenue Share</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Budget Range (Optional)</label>
                        <input
                          type="text"
                          value={requestData.budget_range}
                          onChange={(e) => setRequestData({ ...requestData, budget_range: e.target.value })}
                          placeholder='{"min": 1000, "max": 5000}'
                          className="w-full px-4 py-3 bg-white/80 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 backdrop-blur-sm text-gray-900 dark:text-gray-100"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Additional Details Card */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-purple-200/50 dark:border-purple-700/30 animate-slide-up animate-delay-300">
                    <h4 className="font-bold text-purple-700 dark:text-purple-300 mb-4 flex items-center">
                      <span className="w-6 h-6 bg-purple-500 rounded-lg flex items-center justify-center text-white text-sm mr-2">📋</span>
                      Additional Details
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Notes & Requirements</label>
                        <textarea
                          value={requestData.notes}
                          onChange={(e) => setRequestData({ ...requestData, notes: e.target.value })}
                          className="w-full px-4 py-3 bg-white/80 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 backdrop-blur-sm text-gray-900 dark:text-gray-100"
                          rows="3"
                          placeholder="Additional requirements, specifications, or information..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-2 animate-slide-up animate-delay-400">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-pink-500 via-blue-500 to-pink-600 hover:from-pink-600 hover:via-blue-600 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          {isEditMode ? 'Updating Request...' : 'Creating Request...'}
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          {isEditMode ? 'Update Request' : 'Create Request'}
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowRequestModal(false)}
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
        {/* Offer Details Modal */}
        {showBidModal && selectedOffer && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="modal-content bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20 dark:border-gray-700/30 shadow-2xl animate-modal-in">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 p-6 rounded-t-3xl z-10 shadow-sm"
                style={{ background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.05) 0%, rgba(59, 130, 246, 0.05) 50%, rgba(236, 72, 153, 0.05) 100%)' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-blue-500 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg">
                      🎯
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
                        Offer Details
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Review offer information and apply
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowBidModal(false)}
                    className="w-10 h-10 bg-gray-100 dark:bg-gray-800 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 group"
                  >
                    <span className="text-gray-600 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400 text-lg">✕</span>
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {/* Offer Details Card */}
                <div className="bg-gradient-to-r from-pink-50 to-blue-50 dark:from-pink-900/20 dark:to-blue-900/20 rounded-2xl p-6 border border-pink-200/50 dark:border-pink-700/30 mb-6">
                  <h4 className="font-bold text-pink-700 dark:text-pink-300 mb-4 flex items-center">
                    <span className="w-6 h-6 bg-pink-500 rounded-lg flex items-center justify-center text-white text-sm mr-2">📋</span>
                    Offer Information
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-medium text-lg text-gray-900 dark:text-gray-100">{selectedOffer.title}</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Category: {selectedOffer.category}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{selectedOffer.description}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Payout:</span> ${selectedOffer.payout_value} {selectedOffer.payout_type}
                      </div>
                      <div>
                        <span className="font-medium">GEOs:</span> {Array.isArray(selectedOffer.target_geo) ? selectedOffer.target_geo.join(', ') : selectedOffer.target_geo}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Advertiser:</span> {selectedOffer.entity_name}
                    </div>
                    {selectedOffer.requirements && (
                      <div>
                        <span className="font-medium">Requirements:</span>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{selectedOffer.requirements}</p>
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Landing Page:</span>
                      <a
                        href={selectedOffer.landing_page_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm block break-all"
                      >
                        {selectedOffer.landing_page_url}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <button
                    onClick={() => handleApplyToOffer(selectedOffer)}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-pink-500 via-blue-500 to-pink-600 hover:from-pink-600 hover:via-blue-600 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Applying...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        🚀 Apply to Offer
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setShowBidModal(false)}
                    className="flex-1 sm:flex-none sm:px-8 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold py-4 px-6 rounded-xl transition-all duration-200 hover:scale-[1.02]"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
