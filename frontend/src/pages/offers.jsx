import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/navbar';
import { offersAPI } from '../services/offers';
import { User, IdCard, Heart, Search, Globe, List, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

export default function OffersPage() {
  const [offers, setOffers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [geoSearch, setGeoSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  // Ref to track if component is mounted
  const isMountedRef = useRef(true);
  // Ref to track the current API call
  const abortControllerRef = useRef(null);

  // Category filter options
  const categories = [
    "All", "Nutra", "Crypto", "Dating", "Gambling", "Game", "COD", "Sweepstakes", "Finance", "Health"
  ];

  // Debounced fetch function to prevent multiple rapid calls
  const fetchOffers = useCallback(async (filters) => {
    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    // Only proceed if component is still mounted
    if (!isMountedRef.current) return;

    setLoading(true);
    setError("");

    try {
      const response = await offersAPI.getAllOffers(filters);
      if (isMountedRef.current && !abortControllerRef.current.signal.aborted) {
        const offersData = response.offers || [];
        const totalCount = response.total || response.totalCount || 0;

        setOffers(offersData);
        setTotal(totalCount);

        // If we're on a page that doesn't exist, go back to page 1
        if (totalCount > 0 && offersData.length === 0 && filters.offset > 0) {
          setPage(1);
        }
      }
    } catch (err) {
      if (isMountedRef.current && !abortControllerRef.current.signal.aborted) {
        setError("Failed to fetch offers. Please try again later.");
        console.error(err);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  // Reset page to 1 when filters change (search, geo, category) but not limit
  useEffect(() => {
    setPage(1);
  }, [searchTerm, geoSearch, selectedCategory]);

  // Fetch offers when page, filters, or limit changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchOffers({
        search: searchTerm,
        geo: geoSearch,
        category: selectedCategory === "All" ? "" : selectedCategory,
        limit,
        offset: (page - 1) * limit,
      });
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [fetchOffers, searchTerm, geoSearch, selectedCategory, page, limit]);

  // Cleanup function to prevent memory leaks and cancel ongoing requests
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleOfferClick = (offer) => {
    navigate(`/offer/${offer.offer_id}`, { state: { offer } });
  };

  const handleEntityClick = (e, entityId, entityName) => {
    e.stopPropagation(); // Prevent offer card click
    navigate(`/entity/${entityId}`, { state: { entityName } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-gray-100 font-sans">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/30 dark:bg-blue-400/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200/30 dark:bg-purple-400/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-1/2 transform -translate-x-1/2 w-80 h-80 bg-pink-200/30 dark:bg-pink-400/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <Navbar />
      <section className="relative pt-24 pb-16 px-4 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8 animate-slide-in-down">
          <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
            <Heart className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-4xl font-extrabold drop-shadow-lg text-gradient-purple">Explore Offers</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Discover the best offers from verified partners</p>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="mb-8 animate-fade-in-scale">
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 shadow-sm border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transform hover:scale-105 ${selectedCategory === category
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg border-transparent scale-105'
                  : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700/80 hover:shadow-md'
                  }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Search Filters */}
        <div className="mb-8 flex flex-col md:flex-row gap-6 items-start md:items-end animate-slide-in-up">
          <div className="flex flex-col w-full md:w-1/3">
            <label className="font-semibold mb-2 text-gray-700 dark:text-gray-300 flex items-center">
              <Search className="w-4 h-4 mr-2" />
              Search Offers
            </label>
            <input
              type="text"
              placeholder="Search by title, description, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
            />
          </div>
          <div className="flex flex-col w-full md:w-1/3">
            <label className="font-semibold mb-2 text-gray-700 dark:text-gray-300 flex items-center">
              <Globe className="w-4 h-4 mr-2" />
              Filter by GEO
            </label>
            <input
              type="text"
              placeholder="e.g. US, CA, UK"
              value={geoSearch}
              onChange={(e) => setGeoSearch(e.target.value)}
              className="input-field"
            />
          </div>
          <div className="flex flex-col w-full md:w-1/3">
            <label className="font-semibold mb-2 text-gray-700 dark:text-gray-300 flex items-center">
              <List className="w-4 h-4 mr-2" />
              Results
            </label>
            <div className="bg-white/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 font-medium">
              {loading ? (
                <div className="flex items-center">
                  <Loader2 className="animate-spin w-4 h-4 mr-2 text-blue-600" />
                  Loading...
                </div>
              ) : (
                `${total > 0 ? total : offers.length} offer${(total > 0 ? total : offers.length) !== 1 ? 's' : ''} found`
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="animate-spin w-10 h-10 text-blue-600" />
            <span className="ml-4 text-gray-600 text-lg">Loading offers...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-red-700 shadow flex items-center gap-2">
            <AlertCircle className="w-6 h-6 mr-2 text-red-500" />
            {error}
          </div>
        ) : offers.length === 0 ? (
          <div className="text-center py-20 animate-fade-in-scale">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-white" />
            </div>
            <div className="text-gray-500 dark:text-gray-400 text-2xl font-semibold mb-2">No offers found</div>
            <p className="text-gray-400 dark:text-gray-500 mb-6">Try adjusting your search criteria or browse different categories</p>
            <button
              onClick={() => {
                setSearchTerm("");
                setGeoSearch("");
                setSelectedCategory("All");
              }}
              className="btn-primary"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-fade-in-scale">
              {offers.map((offer, index) => (
                <div
                  key={index}
                  className="group relative card card-hover cursor-pointer transition-all duration-300"
                  onClick={() => handleOfferClick(offer)}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Hover Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  <div className="relative flex items-start p-6">
                    {/* Offer Icon/Avatar */}
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-2xl mr-5 flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      {offer.title.charAt(0).toUpperCase()}
                    </div>

                    {/* Offer Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 pr-4">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {offer.title}
                          </h3>


                        </div>

                        {/* Payout Display */}
                        <div className="text-right flex-shrink-0">
                          <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mb-1 group-hover:scale-110 transition-transform">
                            {offer.payout_value ? (
                              typeof offer.payout_value === 'string' && offer.payout_value.includes('%') ?
                                offer.payout_value :
                                `$${offer.payout_value}`
                            ) : 'Contact'}
                          </div>
                          {offer.payout_type && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                              {offer.payout_type}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Entity Name as Hyperlink */}
                      <div className="mb-3">
                        <button
                          onClick={(e) => handleEntityClick(e, offer.entity_id, offer.entity_name)}
                          className="text-sm text-blue-600 dark:text-blue-400 hover:text-purple-700 dark:hover:text-purple-300 hover:underline font-semibold transition-colors flex items-center"
                        >
                          <IdCard className="mr-2" />
                          {offer.entity_metadata.company_name || 'Unknown Entity'}
                        </button>
                      </div>

                      {/* Tags/Badges */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="badge badge-info">
                          #{offer.payout_type}
                        </span>
                        <span className="badge bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                          #{offer.category}
                        </span>
                        {offer.entity_type && (
                          <span className="badge badge-success">
                            #{offer.entity_type}
                          </span>
                        )}
                        {Array.isArray(offer.target_geo) && offer.target_geo.length > 0 && (
                          <span className="badge bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            {offer.target_geo.slice(0, 2).join(', ')}{offer.target_geo.length > 2 ? '...' : ''}
                          </span>
                        )}
                      </div>

                      {/* Action Indicator */}
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Click to view details</span>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Pagination Controls */}
            {offers.length > 0 && (
              <div className="flex flex-col md:flex-row items-center justify-between mt-10 gap-4 p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    disabled={page === 1 || loading}
                    className={`px-4 py-2 rounded-lg font-semibold border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700 transition-all duration-200 ${(page === 1 || loading) ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'
                      }`}
                  >
                    Previous
                  </button>
                  <span className="mx-4 text-gray-600 dark:text-gray-300 font-medium">
                    {total > 0 ? (
                      `Page ${page} of ${Math.ceil(total / limit)}`
                    ) : (
                      `Page ${page}`
                    )}
                  </span>
                  <button
                    onClick={() => setPage((prev) => prev + 1)}
                    disabled={offers.length < limit || loading}
                    className={`px-4 py-2 rounded-lg font-semibold border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700 transition-all duration-200 ${(offers.length < limit || loading) ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'
                      }`}
                  >
                    Next
                  </button>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {total > 0 ? (
                      `Showing ${((page - 1) * limit) + 1}-${Math.min(page * limit, total)} of ${total} results`
                    ) : (
                      `Showing ${offers.length} result${offers.length !== 1 ? 's' : ''}`
                    )}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-600 dark:text-gray-300 font-medium">Results per page:</span>
                    <select
                      value={limit}
                      onChange={e => {
                        const newLimit = Number(e.target.value);
                        setLimit(newLimit);
                        setPage(1);
                        setTotal(0); // Reset total to avoid stale data
                      }}
                      disabled={loading}
                      className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                    >
                      {[6, 12, 24, 48].map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
