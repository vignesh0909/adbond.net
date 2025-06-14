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
    <div className="bg-gray-50 text-gray-900 font-sans min-h-screen">
      <Navbar />
      <section className="pt-20 pb-16 px-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center mr-3">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold">Top Offers</h2>
        </div>

        {/* Category Filter Chips */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Search Filters */}
        <div className="mb-6 flex flex-col md:flex-row gap-4 items-start md:items-end">
          <div className="flex flex-col w-full md:w-1/3">
            <label className="font-semibold mb-1 text-gray-700">Search Offers</label>
            <input
              type="text"
              placeholder="Search by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="flex flex-col w-full md:w-1/3">
            <label className="font-semibold mb-1 text-gray-700">Search with GEO</label>
            <input
              type="text"
              placeholder="e.g. US, CA"
              value={geoSearch}
              onChange={(e) => setGeoSearch(e.target.value)}
              className="border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="flex flex-col w-full md:w-1/3">
            <label className="font-semibold mb-1 text-gray-700">Results</label>
            <div className="text-gray-600 px-3 py-2">
              {loading ? "Loading..." : `${offers.length} offers found`}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading offers...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        ) : offers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">No offers found</div>
            <p className="text-gray-400 mt-2">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="space-y-4">
            {offers.map((offer, index) => (
              <div 
                key={index} 
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200 cursor-pointer"
                onClick={() => handleOfferClick(offer)}
              >
                <div className="flex items-center p-4">
                  {/* Offer Icon/Avatar */}
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl mr-4 flex-shrink-0">
                    {offer.title.charAt(0).toUpperCase()}
                  </div>

                  {/* Offer Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 pr-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
                          {offer.title}
                        </h3>
                        
                        {/* Entity Name as Hyperlink */}
                        <div className="mb-2">
                          <button
                            onClick={(e) => handleEntityClick(e, offer.entity_id, offer.entity_name)}
                            className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium"
                          >
                            {offer.entity_name || 'Unknown Entity'}
                          </button>
                        </div>

                        {/* Tags/Badges */}
                        <div className="flex flex-wrap gap-2 mb-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            #{offer.payout_type}
                          </span>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            #{offer.category}
                          </span>
                          {offer.entity_type && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              #{offer.entity_type}
                            </span>
                          )}
                          {Array.isArray(offer.target_geo) && offer.target_geo.length > 0 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
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
                        <div className="text-xl font-bold text-blue-600 mb-1">
                          {offer.payout_value ? (
                            typeof offer.payout_value === 'string' && offer.payout_value.includes('%') ? 
                            offer.payout_value : 
                            `$${offer.payout_value}`
                          ) : 'Contact'}
                        </div>
                        {offer.payout_type && (
                          <div className="text-sm text-gray-500">
                            {offer.payout_type}
                          </div>
                        )}
                      </div>

                      {/* Info Icon */}
                      <div className="ml-4 flex-shrink-0">
                        <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
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
