import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/navbar';
import { offersAPI } from '../services/api';

export default function OffersPage() {
  const [offers, setOffers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [geoSearch, setGeoSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Category filter options
  const categories = [
    "All", "Nutra", "Crypto", "Dating", "Gambling", "Game", "COD", "Sweepstakes", "Finance", "Health"
  ];

  useEffect(() => {
    const fetchOffers = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await offersAPI.getAllOffers({
          title: searchTerm,
          geo: geoSearch,
          category: selectedCategory === "All" ? "" : selectedCategory,
        });
        setOffers(response.offers || []);
      } catch (err) {
        setError("Failed to fetch offers. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, [searchTerm, geoSearch, selectedCategory]);

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
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h2 className="text-4xl font-extrabold drop-shadow-lg text-gradient-purple">Top Offers</h2>
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
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 shadow-sm border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transform hover:scale-105 ${
                  selectedCategory === category
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
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search Offers
            </label>
            <input
              type="text"
              placeholder="Search by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
            />
          </div>
          <div className="flex flex-col w-full md:w-1/3">
            <label className="font-semibold mb-2 text-gray-700 dark:text-gray-300 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
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
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              Results
            </label>
            <div className="bg-white/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 font-medium">
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  Loading...
                </div>
              ) : (
                `${offers.length} offer${offers.length !== 1 ? 's' : ''} found`
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            <span className="ml-4 text-gray-600 text-lg">Loading offers...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-red-700 shadow">
            {error}
          </div>
        ) : offers.length === 0 ? (
          <div className="text-center py-20 animate-fade-in-scale">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
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
                        
                        {/* Entity Name as Hyperlink */}
                        <div className="mb-3">
                          <button
                            onClick={(e) => handleEntityClick(e, offer.entity_id, offer.entity_name)}
                            className="text-sm text-blue-600 dark:text-blue-400 hover:text-purple-700 dark:hover:text-purple-300 hover:underline font-semibold transition-colors flex items-center"
                          >
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                            </svg>
                            {offer.entity_name || 'Unknown Entity'}
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
                    
                    {/* Action Indicator */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Click to view details</span>
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
