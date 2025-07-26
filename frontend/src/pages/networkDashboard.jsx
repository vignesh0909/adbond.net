import React, { useState, useEffect } from 'react';
import Navbar from '../components/navbar';
import EntityReviewsDashboard from '../components/EntityReviewsDashboard';
import BulkOfferUpload from '../components/BulkOfferUpload';
import BulkUploadHistory from '../components/BulkUploadHistory';
import BulkOfferRequestUpload from '../components/BulkOfferRequestUpload';
import BulkOfferRequestUploadHistory from '../components/BulkOfferRequestUploadHistory';
import { authAPI } from '../services/auth';
import { offersAPI } from '../services/offers';
import { toast } from 'react-toastify';
import ToolTip from '../components/toolTip';

export default function NetworkDashboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const [myOffers, setMyOffers] = useState([]);
  const [offerRequests, setOfferRequests] = useState([]);
  const [availableOffers, setAvailableOffers] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [selectedTab, setSelectedTab] = useState('my-offers');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Pagination and filtering states
  const [offersFilter, setOffersFilter] = useState('all'); // 'all', 'active', 'inactive'
  const [offersPage, setOffersPage] = useState(1);
  const [offersPerPage] = useState(12); // 12 offers per page
  const [totalOffers, setTotalOffers] = useState(0);
  const [hasMoreOffers, setHasMoreOffers] = useState(false);

  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchQueryRequests, setSearchQueryRequests] = useState('');
  const [searchQueryAvailable, setSearchQueryAvailable] = useState('');
  const [searchQueryMyRequests, setSearchQueryMyRequests] = useState('');

  // Form states for offer modal (create/edit)
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [isOfferEditMode, setIsOfferEditMode] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [offerData, setOfferData] = useState({
    title: '',
    category: '',
    description: '',
    target_geo: '',
    payout_type: 'CPA',
    payout_value: '',
    landing_page_url: '',
    requirements: '',
    offer_status: 'active'
  });

  // Form states for request modal (create/edit)
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [isRequestEditMode, setIsRequestEditMode] = useState(false);
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
    notes: '',
    request_status: 'active'
  });

  // Form states for bidding
  const [showBidModal, setShowBidModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [bidData, setBidData] = useState({
    bid_amount: '',
    bid_notes: '',
    offer_details: {}
  });

  useEffect(() => {
    const user = authAPI.getCurrentUser();
    const token = localStorage.getItem('authToken');
    if (user && user.role === 'network') {
      setCurrentUser(user);
    }
  }, []);

  // Separate useEffect to fetch data when currentUser is set
  useEffect(() => {
    if (currentUser && currentUser.entity_id) {
      fetchMyOffers();
      fetchOfferRequests();
      fetchAvailableOffers();
      fetchMyRequests();
    }
  }, [currentUser]);

  // Fetch offers when filter, page, or search changes
  useEffect(() => {
    if (currentUser && currentUser.entity_id) {
      fetchMyOffers();
    }
  }, [offersFilter, offersPage, searchQuery]);

  // Reset to first page when filter or search changes
  useEffect(() => {
    setOffersPage(1);
  }, [offersFilter, searchQuery]);

  // Fetch other data when search changes
  useEffect(() => {
    if (currentUser && currentUser.entity_id) {
      fetchOfferRequests();
    }
  }, [searchQueryRequests]);

  useEffect(() => {
    if (currentUser && currentUser.entity_id) {
      fetchAvailableOffers();
    }
  }, [searchQueryAvailable]);

  useEffect(() => {
    if (currentUser && currentUser.user_id) {
      fetchMyRequests();
    }
  }, [searchQueryMyRequests]);

  const fetchMyOffers = async () => {
    if (!currentUser?.entity_id) {
      return;
    }
    try {
      setLoading(true);
      const filters = {
        limit: offersPerPage,
        offset: (offersPage - 1) * offersPerPage
      };
      if (offersFilter !== 'all') {
        filters.offer_status = offersFilter;
      }
      if (searchQuery.trim()) {
        filters.search = searchQuery.trim();
      }
      const response = await offersAPI.getOffersByEntity(currentUser.entity_id, filters);
      setMyOffers(response.offers || []);
      setTotalOffers(response.total || response.offers?.length || 0);
      setHasMoreOffers((offersPage * offersPerPage) < (response.total || 0));
    } catch (err) {
      setError('Failed to fetch your offers');
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
      if (searchQueryRequests.trim()) {
        filters.search = searchQueryRequests.trim();
      }
      const response = await offersAPI.getAllOfferRequests(filters);
      setOfferRequests(response.requests || []);
    } catch (err) {
      setError('Failed to fetch offer requests');
    }
  };

  const fetchAvailableOffers = async () => {
    try {
      const filters = {};
      if (searchQueryAvailable.trim()) {
        filters.search = searchQueryAvailable.trim();
      }
      const response = await offersAPI.getAllOffers(filters);
      setAvailableOffers(response.offers || []);
    } catch (err) {
      setError('Failed to fetch available offers');
    }
  };

  const fetchMyRequests = async () => {
    if (!currentUser?.user_id) {
      return;
    }

    try {
      const filters = {};
      if (searchQueryMyRequests.trim()) {
        filters.search = searchQueryMyRequests.trim();
      }
      const response = await offersAPI.getOfferRequestsByUser(currentUser.user_id, filters);
      setMyRequests(response.requests || []);
    } catch (err) {
      setError('Failed to fetch your requests');
    }
  };

  // Validation functions (unified)
  const validateOfferForm = () => {
    const errors = {};

    if (!offerData.title.trim()) {
      errors.title = 'Campaign name is required';
    }

    if (offerData.description && offerData.description.trim().length > 0 && offerData.description.trim().length < 10) {
      errors.description = 'Description must be at least 10 characters if provided';
    }

    if (!offerData.target_geo.trim()) {
      errors.target_geo = 'Target GEOs are required';
    }

    if (!offerData.landing_page_url.trim()) {
      errors.landing_page_url = 'Landing page URL is required';
    } else {
      try {
        new URL(offerData.landing_page_url);
      } catch {
        errors.landing_page_url = 'Please enter a valid URL';
      }
    }

    if (!offerData.payout_value || parseFloat(offerData.payout_value) <= 0) {
      errors.payout_value = 'Payout value must be greater than 0';
    }

    return Object.keys(errors).length === 0;
  };

  const validateRequestForm = () => {
    const errors = {};

    if (!requestData.title.trim()) {
      errors.title = 'Request title is required';
    }

    if (!requestData.vertical.trim()) {
      errors.vertical = 'Vertical is required';
    }

    if (!requestData.geos_targeting.trim()) {
      errors.geos_targeting = 'Target GEOs are required';
    }

    if (!requestData.traffic_type.trim()) {
      errors.traffic_type = 'Traffic types are required';
    }

    if (!requestData.platforms_used.trim()) {
      errors.platforms_used = 'Platforms used are required';
    }

    if (!requestData.traffic_volume || parseInt(requestData.traffic_volume) <= 0) {
      errors.traffic_volume = 'Traffic volume must be greater than 0';
    }

    return Object.keys(errors).length === 0;
  };

  // Reset form functions
  const resetOfferForm = () => {
    setOfferData({
      title: '',
      category: '',
      description: '',
      target_geo: '',
      payout_type: 'CPA',
      payout_value: '',
      landing_page_url: '',
      requirements: '',
      offer_status: 'active'
    });
    setEditingOffer(null);
    setIsOfferEditMode(false);
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
      notes: '',
      request_status: 'active'
    });
    setEditingRequest(null);
    setIsRequestEditMode(false);
  };

  // Open modal functions
  const openCreateOffer = () => {
    resetOfferForm();
    setShowOfferModal(true);
  };

  const openEditOffer = (offer) => {
    setEditingOffer(offer);
    setIsOfferEditMode(true);
    setOfferData({
      title: offer.title || '',
      category: offer.category || '',
      description: offer.description || '',
      target_geo: Array.isArray(offer.target_geo) ? offer.target_geo.join(', ') : offer.target_geo || '',
      payout_type: offer.payout_type || 'CPA',
      payout_value: offer.payout_value || '',
      landing_page_url: offer.landing_page_url || '',
      requirements: offer.requirements || '',
      offer_status: offer.offer_status || 'active'
    });
    setShowOfferModal(true);
  };

  const openCreateRequest = () => {
    resetRequestForm();
    setShowRequestModal(true);
  };

  const openEditRequest = (request) => {
    setEditingRequest(request);
    setIsRequestEditMode(true);
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
      notes: request.notes || '',
      request_status: request.request_status || 'active'
    });
    setShowRequestModal(true);
  };

  // Unified submit handlers
  const handleOfferSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formattedData = {
        ...offerData,
        entity_id: currentUser.entity_id,
        category: offerData.category.trim() || 'NA',
        target_geo: typeof offerData.target_geo === 'string' ?
          offerData.target_geo.split(',').map(geo => geo.trim()) :
          offerData.target_geo,
        payout_value: parseFloat(offerData.payout_value)
      };

      if (isOfferEditMode) {
        await offersAPI.updateOffer(editingOffer.offer_id, formattedData);
        toast.success('Campaign updated successfully!');
      } else {
        await offersAPI.createOffer(formattedData);
        toast.success('Campaign created successfully!');
      }

      setShowOfferModal(false);
      resetOfferForm();
      fetchMyOffers();
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || `Failed to ${isOfferEditMode ? 'update' : 'create'} campaign`;
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateRequestForm()) {
      toast.error('Please fill in all required fields correctly');
      return;
    }

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
            (requestData.budget_range.trim() && requestData.budget_range.startsWith('{') ?
              JSON.parse(requestData.budget_range) :
              requestData.budget_range) :
            requestData.budget_range) : null
      };

      if (isRequestEditMode) {
        await offersAPI.updateOfferRequest(editingRequest.offer_request_id, formattedData);
        toast.success('Campaign request updated successfully!');
      } else {
        await offersAPI.createOfferRequest(formattedData);
        toast.success('Campaign request created successfully!');
      }

      setShowRequestModal(false);
      resetRequestForm();
      fetchMyRequests();
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || `Failed to ${isRequestEditMode ? 'update' : 'create'} campaign request`;
      toast.error(errorMessage);
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
    } finally {
      setLoading(false);
    }
  };

  const handleApplyToOffer = async (offer) => {
    try {
      setLoading(true);
      await offersAPI.applyToOffer(offer.offer_id, currentUser.entity_id);
      setSelectedOffer(null);
      setShowBidModal(false);
    } catch (err) {
      setError('Failed to apply to offer');
    } finally {
      setLoading(false);
    }
  };

  const openBidModal = (request) => {
    setSelectedRequest(request);
    setShowBidModal(true);
  };

  const openOfferModal = (offer) => {
    setSelectedOffer(offer);
    setShowBidModal(true);
  };

  // Pagination and filtering functions
  const handleFilterChange = (newFilter) => {
    setOffersFilter(newFilter);
    setOffersPage(1); // Reset to first page when filter changes
  };

  // Removed loadMoreOffers for true pagination

  const resetOffersPagination = () => {
    setOffersPage(1);
    setMyOffers([]);
  };

  if (!currentUser || currentUser.role !== 'network') {
    return (
      <div className="bg-gray-50 text-gray-900 mt-20 font-sans">
        <Navbar />
        <section className="py-20 px-6 max-w-md mx-auto text-center">
          <p>Access denied. Network role required.</p>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col">
      <Navbar />
      <section className="pt-24 pb-16 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
          <h2 className="text-3xl font-extrabold text-green-700 dark:text-green-300 tracking-tight">Network Dashboard</h2>
          <div className="flex gap-2">
            <button
              onClick={openCreateOffer}
              className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white px-6 py-2 rounded-lg shadow-lg font-bold transition"
            >
              + Create Campaign
            </button>
            <BulkOfferUpload onUploadComplete={fetchMyOffers} />
            <button
              onClick={openCreateRequest}
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-6 py-2 rounded-lg shadow-lg font-bold transition"
            >
              + Create Request
            </button>
            <BulkOfferRequestUpload onUploadComplete={fetchMyRequests} />
          </div>
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
              onClick={() => setSelectedTab('my-offers')}
              className={`py-2 px-1 border-b-2 font-semibold text-lg transition-all ${selectedTab === 'my-offers'
                ? 'border-green-500 text-green-700 dark:text-green-300'
                : 'border-transparent text-gray-500 hover:text-green-700 dark:hover:text-green-200'
                }`}
            >
              My Campaigns <span className="ml-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{totalOffers || myOffers.length}</span>
            </button>
            <button
              onClick={() => setSelectedTab('upload-history')}
              className={`py-2 px-1 border-b-2 font-semibold text-lg transition-all ${selectedTab === 'upload-history'
                ? 'border-green-500 text-green-700 dark:text-green-300'
                : 'border-transparent text-gray-500 hover:text-green-700 dark:hover:text-green-200'
                }`}
            >
              Upload History
            </button>
            <button
              onClick={() => setSelectedTab('my-requests')}
              className={`py-2 px-1 border-b-2 font-semibold text-lg transition-all ${selectedTab === 'my-requests'
                ? 'border-green-500 text-green-700 dark:text-green-300'
                : 'border-transparent text-gray-500 hover:text-green-700 dark:hover:text-green-200'
                }`}
            >
              My Requests <span className="ml-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{myRequests.length}</span>
            </button>
            <button
              onClick={() => setSelectedTab('reviews')}
              className={`py-2 px-1 border-b-2 font-semibold text-lg transition-all ${selectedTab === 'reviews'
                ? 'border-green-500 text-green-700 dark:text-green-300'
                : 'border-transparent text-gray-500 hover:text-green-700 dark:hover:text-green-200'
                }`}
            >
              Reviews
            </button>
          </nav>
        </div>
        {/* My Offers Tab */}
        {selectedTab === 'my-offers' && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h3 className="text-xl font-semibold text-green-700 dark:text-green-200">My Campaigns</h3>

              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                {/* Search Input */}
                <div className="flex-1 sm:flex-initial">
                  <input
                    type="text"
                    placeholder="Search campaigns..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-64 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>

                {/* Filter Buttons */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleFilterChange('all')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${offersFilter === 'all'
                      ? 'bg-green-500 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-green-100 dark:hover:bg-green-900/20'
                      }`}
                  >
                    All ({totalOffers})
                  </button>
                  <button
                    onClick={() => handleFilterChange('active')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${offersFilter === 'active'
                      ? 'bg-green-500 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-green-100 dark:hover:bg-green-900/20'
                      }`}
                  >
                    🟢 Active
                  </button>
                  <button
                    onClick={() => handleFilterChange('inactive')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${offersFilter === 'inactive'
                      ? 'bg-green-500 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-green-100 dark:hover:bg-green-900/20'
                      }`}
                  >
                    🔴 Inactive
                  </button>
                </div>
              </div>
            </div>
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              </div>
            ) : myOffers.length === 0 ? (
              <div className="text-gray-500 text-center py-12">
                <span className="block text-5xl mb-4">🗂️</span>
                No offers created yet.
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {myOffers.map((offer) => (
                  <div key={offer.offer_id} className="bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-xl border border-green-100 dark:border-gray-800 hover:scale-[1.02] transition-transform flex flex-col h-full">
                    {/* Header Section */}
                    <div className="p-6 flex-1">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-bold text-lg text-green-700 dark:text-green-200 line-clamp-2 flex-1 mr-2">
                          {offer.title}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${offer.offer_status === 'active'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                          }`}>
                          {offer.offer_status === 'active' ? '🟢 Active' : '🔴 Inactive'}
                        </span>
                      </div>

                      <div className="space-y-2 mb-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Category:</span> {offer.category || 'N/A'}
                        </p>
                        {offer.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3">
                            {offer.description.length > 120 ? offer.description.substring(0, 120) + '...' : offer.description}
                          </p>
                        )}
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-1 gap-2 mb-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Payout:</span>
                          <span className="font-bold text-green-600 dark:text-green-400">
                            ${offer.payout_value}
                          </span>
                        </div>
                        {offer.target_geo && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">GEOs:</span>
                            <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-32">
                              {Array.isArray(offer.target_geo) ? offer.target_geo.slice(0, 2).join(', ') + (offer.target_geo.length > 2 ? '...' : '') : offer.target_geo}
                            </span>
                          </div>
                        )}
                        {offer.allowed_traffic_sources && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Traffic:</span>
                            <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-32">
                              {Array.isArray(offer.allowed_traffic_sources) ? offer.allowed_traffic_sources.slice(0, 2).join(', ') + (offer.allowed_traffic_sources.length > 2 ? '...' : '') : offer.allowed_traffic_sources}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer Section */}
                    <div className="p-6 pt-0 mt-auto">
                      <button
                        onClick={() => openEditOffer(offer)}
                        className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white px-4 py-2 rounded-lg shadow-md font-semibold transition"
                      >
                        Edit Campaign
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {myOffers.length > 0 && (
              <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {myOffers.length} of {totalOffers > 0 ? totalOffers : myOffers.length} offers
                  {offersFilter !== 'all' && ` (${offersFilter})`}
                </div>

                <div className="flex gap-2 items-center">
                  <button
                    onClick={() => setOffersPage((p) => Math.max(1, p - 1))}
                    disabled={offersPage === 1 || loading}
                    className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg shadow-md font-semibold transition-all"
                  >
                    Prev
                  </button>
                  <span className="text-sm text-gray-700 dark:text-gray-200 px-2">Page {offersPage} of {Math.max(1, Math.ceil(totalOffers / offersPerPage))}</span>
                  <button
                    onClick={() => setOffersPage((p) => p + 1)}
                    disabled={!hasMoreOffers || loading}
                    className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg shadow-md font-semibold transition-all"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        {/* Upload History Tab */}
        {selectedTab === 'upload-history' && (
          <div>
            <h3 className="text-xl font-semibold mb-6 text-green-700 dark:text-green-200">Bulk Upload History</h3>
            <div className="space-y-8">
              <BulkUploadHistory />
              <BulkOfferRequestUploadHistory />
            </div>
          </div>
        )}
        {/* My Requests Tab */}
        {selectedTab === 'my-requests' && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h3 className="text-xl font-semibold text-green-700 dark:text-green-200">My Campaign Requests</h3>

              {/* Search Input for My Requests */}
              <div className="w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Search my requests..."
                  value={searchQueryMyRequests}
                  onChange={(e) => setSearchQueryMyRequests(e.target.value)}
                  className="w-full sm:w-64 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
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
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 via-blue-500 to-green-500 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                            {request.title ? request.title.charAt(0).toUpperCase() : '📋'}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <ToolTip text={request.title}>
                            <h4 className="w-40 truncate font-bold text-lg mb-1 text-gray-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors duration-300">
                              {request.title}
                            </h4>
                          </ToolTip>
                          <div className="inline-flex items-center px-2 py-0.5 bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 rounded-full">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
                            <span className="text-green-700 dark:text-green-300 font-medium text-xs">{request.vertical}</span>
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
                          <div className="bg-gradient-to-br from-purple-50 to-green-50 dark:from-purple-900/20 dark:to-green-900/20 rounded-lg p-2 border border-purple-200/30 dark:border-purple-700/30">
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
                              <span key={idx} className="px-1.5 py-0.5 bg-green-500/10 text-green-700 dark:text-green-300 rounded text-xs font-medium border border-green-200/50 dark:border-green-700/50">
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
                          className="group/btn inline-flex items-center space-x-1.5 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-semibold py-1.5 px-3 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-md"
                        >
                          <span className="text-xs">Edit</span>
                        </button>
                      </div>
                    </div>

                    {/* Subtle hover gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 via-blue-500/0 to-green-500/0 group-hover:from-green-500/5 group-hover:via-blue-500/5 group-hover:to-green-500/5 transition-all duration-500 pointer-events-none rounded-2xl"></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {/* Reviews Tab */}
        {selectedTab === 'reviews' && currentUser?.entity_id && (
          <div className="bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-xl border border-green-100 dark:border-gray-800 p-6">
            <h3 className="text-xl font-semibold mb-6 text-green-700 dark:text-green-200">Entity Reviews</h3>
            <div>
              <EntityReviewsDashboard entityId={currentUser.entity_id} />
            </div>
          </div>
        )}
        {/* Create/Edit Campaign Modal */}
        {showOfferModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="modal-content bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/20 dark:border-gray-700/30 shadow-2xl animate-modal-in">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 p-6 rounded-t-3xl z-10 shadow-sm"
                style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(34, 197, 94, 0.05) 50%, rgba(59, 130, 246, 0.05) 100%)' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg">
                      📢
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                        {isOfferEditMode ? 'Edit Campaign' : 'Create New Campaign'}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {isOfferEditMode ? 'Update campaign details' : 'Publish a new offer for affiliates to promote'}
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
                  <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-700/30 animate-slide-up animate-delay-100">
                    <h4 className="font-bold text-blue-700 dark:text-blue-300 mb-4 flex items-center">
                      <span className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center text-white text-sm mr-2">📝</span>
                      Campaign Information (All fields required *)
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
                          className={`w-full px-4 py-3 bg-white/80 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 backdrop-blur-sm text-gray-900 dark:text-gray-100`}
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
                        Campaign Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        required
                        value={offerData.description}
                        onChange={(e) => setOfferData({ ...offerData, description: e.target.value })}
                        className="w-full px-4 py-3 bg-white/80 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 backdrop-blur-sm text-gray-900 dark:text-gray-100"
                        rows="3"
                        placeholder="Cookie details, Pixel fires at, etc..."
                      />
                    </div>
                  </div>

                  {/* Targeting & Payout Card */}
                  <div className="bg-gradient-to-r from-green-50 to-purple-50 dark:from-green-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-green-200/50 dark:border-green-700/30 animate-slide-up animate-delay-200">
                    <h4 className="font-bold text-green-700 dark:text-green-300 mb-4 flex items-center">
                      <span className="w-6 h-6 bg-green-500 rounded-lg flex items-center justify-center text-white text-sm mr-2">🎯</span>
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
                          className="w-full px-4 py-3 bg-white/80 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 backdrop-blur-sm text-gray-900 dark:text-gray-100"
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
                          className="w-full px-4 py-3 bg-white/80 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 backdrop-blur-sm text-gray-900 dark:text-gray-100"
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
                          className="w-full px-4 py-3 bg-white/80 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 backdrop-blur-sm text-gray-900 dark:text-gray-100"
                        >
                          <option value="CPA">CPA - Cost Per Action</option>
                          <option value="CPL">CPL - Cost Per Lead</option>
                          <option value="CPI">CPI - Cost Per Install</option>
                          <option value="CPC">CPC - Cost Per Click</option>
                          <option value="CPS">CPS - Cost Per Subscription</option>
                          <option value="CPM">CPM - Cost Per Mile</option>
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
                          className="w-full px-4 py-3 bg-white/80 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 backdrop-blur-sm text-gray-900 dark:text-gray-100"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Additional Settings Card */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-purple-200/50 dark:border-purple-700/30 animate-slide-up animate-delay-300">
                    <h4 className="font-bold text-purple-700 dark:text-purple-300 mb-4 flex items-center">
                      <span className="w-6 h-6 bg-purple-500 rounded-lg flex items-center justify-center text-white text-sm mr-2">⚙️</span>
                      Additional Settings
                    </h4>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Campaign Status</label>
                          <div className="flex items-center space-x-3">
                            <button
                              type="button"
                              onClick={() => setOfferData({ ...offerData, offer_status: offerData.offer_status === 'active' ? 'inactive' : 'active' })}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${offerData.offer_status === 'active'
                                ? 'bg-green-600'
                                : 'bg-gray-300 dark:bg-gray-600'
                                }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${offerData.offer_status === 'active' ? 'translate-x-6' : 'translate-x-1'
                                  }`}
                              />
                            </button>
                            <span className={`text-sm font-medium ${offerData.offer_status === 'active'
                              ? 'text-green-700 dark:text-green-300'
                              : 'text-gray-500 dark:text-gray-400'
                              }`}>
                              {offerData.offer_status === 'active' ? '🟢 Active' : '🔴 Inactive'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Toggle campaign availability for affiliates</p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Allowed Media Types</label>
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
                      className="flex-1 bg-gradient-to-r from-blue-500 via-green-500 to-blue-600 hover:from-blue-600 hover:via-green-600 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          {isOfferEditMode ? 'Updating...' : 'Creating Campaign...'}
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          {isOfferEditMode ? 'Update Campaign' : 'Create Campaign'}
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
        {/* Create/Edit Request Modal */}
        {showRequestModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="modal-content bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/20 dark:border-gray-700/30 shadow-2xl animate-modal-in">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 p-6 rounded-t-3xl z-10 shadow-sm"
                style={{ background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, rgba(59, 130, 246, 0.05) 50%, rgba(34, 197, 94, 0.05) 100%)' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg">
                      📋
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                        {isRequestEditMode ? 'Edit Campaign Request' : 'Create Campaign Request'}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {isRequestEditMode ? 'Update request details' : 'Request specific offers from advertisers'}
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

                  {/* Status & Additional Details Card */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-purple-200/50 dark:border-purple-700/30 animate-slide-up animate-delay-300">
                    <h4 className="font-bold text-purple-700 dark:text-purple-300 mb-4 flex items-center">
                      <span className="w-6 h-6 bg-purple-500 rounded-lg flex items-center justify-center text-white text-sm mr-2">�</span>
                      Status & Additional Details
                    </h4>
                    <div className="space-y-4">
                      {/* Status Toggle */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                          Request Status
                        </label>
                        <div className="flex items-center space-x-3">
                          <button
                            type="button"
                            onClick={() => setRequestData({ ...requestData, request_status: requestData.request_status === 'active' ? 'inactive' : 'active' })}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${requestData.request_status === 'active'
                              ? 'bg-green-600'
                              : 'bg-gray-300 dark:bg-gray-600'
                              }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${requestData.request_status === 'active' ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                          </button>
                          <span className={`text-sm font-medium ${requestData.request_status === 'active'
                            ? 'text-green-700 dark:text-green-300'
                            : 'text-gray-500 dark:text-gray-400'
                            }`}>
                            {requestData.request_status === 'active' ? '🟢 Active' : '🔴 Inactive'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Active requests are visible to advertisers and can receive bids
                        </p>
                      </div>

                      {/* Notes */}
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
                          {isRequestEditMode ? 'Updating Request...' : 'Creating Request...'}
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          {isRequestEditMode ? 'Update Request' : 'Create Request'}
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
        {/* Bid Modal for Requests */}
        {showBidModal && selectedRequest && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-3xl max-w-2xl w-full border border-white/20 dark:border-gray-700/30 shadow-2xl animate-modal-in">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 p-6 rounded-t-3xl z-10 shadow-sm"
                style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(34, 197, 94, 0.05) 50%, rgba(59, 130, 246, 0.05) 100%)' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg">
                      💰
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                        Submit Counter Campaign
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Respond to this offer request
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
                {/* Request Details Card */}
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800/50 dark:to-blue-900/20 rounded-2xl p-4 mb-6 border border-gray-200/50 dark:border-gray-700/30">
                  <h4 className="font-bold text-gray-700 dark:text-gray-300 mb-2">{selectedRequest.title}</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <p><span className="font-semibold">Vertical:</span> {selectedRequest.vertical}</p>
                    <p><span className="font-semibold">Payout:</span> {selectedRequest.desired_payout_type}</p>
                  </div>
                </div>

                <form onSubmit={handleSubmitBid} className="space-y-6">
                  {/* Bid Details Card */}
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-2xl p-6 border border-green-200/50 dark:border-green-700/30">
                    <h4 className="font-bold text-green-700 dark:text-green-300 mb-4 flex items-center">
                      <span className="w-6 h-6 bg-green-500 rounded-lg flex items-center justify-center text-white text-sm mr-2">💸</span>
                      Your Campaign Details
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Your Campaign Amount ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={bidData.bid_amount}
                          onChange={(e) => setBidData({ ...bidData, bid_amount: e.target.value })}
                          className="w-full px-4 py-3 bg-white/80 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 backdrop-blur-sm text-gray-900 dark:text-gray-100"
                          placeholder="Enter your payout offer"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Additional Notes</label>
                        <textarea
                          value={bidData.bid_notes}
                          onChange={(e) => setBidData({ ...bidData, bid_notes: e.target.value })}
                          className="w-full px-4 py-3 bg-white/80 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 backdrop-blur-sm text-gray-900 dark:text-gray-100"
                          rows="3"
                          placeholder="Additional details about your offer, terms, or requirements...(Min. 10 characters required)"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-blue-500 via-green-500 to-blue-600 hover:from-blue-600 hover:via-green-600 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Submitting...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          <span className="mr-2">💰</span>
                          Submit Campaign
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowBidModal(false)}
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
        {/* Campaign Details Modal */}
        {showBidModal && selectedOffer && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="modal-content bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20 dark:border-gray-700/30 shadow-2xl animate-modal-in">
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
                        Campaign Details
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Review and apply to this offer
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
              <div className="p-6 space-y-6">
                {/* Campaign Header Card */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-700/30 animate-slide-up animate-delay-100">
                  <h4 className="font-bold text-2xl text-blue-700 dark:text-blue-300 mb-2">{selectedOffer.title}</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">{selectedOffer.category}</p>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{selectedOffer.description}</p>
                </div>

                {/* Payout & Details Card */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-green-200/50 dark:border-green-700/30 animate-slide-up animate-delay-200">
                  <h5 className="font-bold text-green-700 dark:text-green-300 mb-4 flex items-center">
                    <span className="w-6 h-6 bg-green-500 rounded-lg flex items-center justify-center text-white text-sm mr-2">💰</span>
                    Payout & Targeting
                  </h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/50 dark:bg-gray-800/30 rounded-xl p-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Payout</p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        ${selectedOffer.payout_value}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{selectedOffer.payout_type}</p>
                    </div>
                    <div className="bg-white/50 dark:bg-gray-800/30 rounded-xl p-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Target GEOs</p>
                      <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
                        {Array.isArray(selectedOffer.target_geo) ? selectedOffer.target_geo.join(', ') : selectedOffer.target_geo}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Advertiser & Landing Page Card */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-purple-200/50 dark:border-purple-700/30 animate-slide-up animate-delay-300">
                  <h5 className="font-bold text-purple-700 dark:text-purple-300 mb-4 flex items-center">
                    <span className="w-6 h-6 bg-purple-500 rounded-lg flex items-center justify-center text-white text-sm mr-2">🏢</span>
                    Advertiser & Links
                  </h5>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Advertiser</p>
                      <p className="font-bold text-purple-600 dark:text-purple-400">{selectedOffer.entity_name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Landing Page</p>
                      <a
                        href={selectedOffer.landing_page_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
                      >
                        <span className="mr-2">🔗</span>
                        View Landing Page
                      </a>
                    </div>
                  </div>
                </div>

                {/* Requirements Card */}
                {selectedOffer.requirements && (
                  <div className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-2xl p-6 border border-orange-200/50 dark:border-orange-700/30 animate-slide-up animate-delay-400">
                    <h5 className="font-bold text-orange-700 dark:text-orange-300 mb-3 flex items-center">
                      <span className="w-6 h-6 bg-orange-500 rounded-lg flex items-center justify-center text-white text-sm mr-2">📋</span>
                      Requirements
                    </h5>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed bg-white/50 dark:bg-gray-800/30 rounded-xl p-4">
                      {selectedOffer.requirements}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-2 animate-slide-up animate-delay-500">
                  <button
                    onClick={() => handleApplyToOffer(selectedOffer)}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 hover:from-blue-600 hover:via-purple-600 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Applying...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <span className="mr-2">🚀</span>
                        Apply to Campaign
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setShowBidModal(false)}
                    className="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-[1.02]"
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
