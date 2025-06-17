import React, { useState } from 'react';
import Navbar from '../components/navbar';

// Advertisers Wishlist Page (Standalone Export)
export default function AdvertisersWishlistPage() {
  const [wishlist, setWishlist] = useState([
    {
      id: 1,
      advertiser: "Premium Health Co.",
      vertical: "Health & Wellness",
      geos: ["US", "CA", "UK"],
      trafficTypes: ["Native", "Social", "Display"],
      minVolume: "5K/day",
      payout: "$45 CPA",
      requirements: "Clean traffic only, no incentivized",
      contact: "partnerships@premiumhealth.com",
      urgent: true
    },
    {
      id: 2,
      advertiser: "FinTech Solutions",
      vertical: "Finance",
      geos: ["US", "AU", "NZ"],
      trafficTypes: ["Search", "Email", "Social"],
      minVolume: "3K/day",
      payout: "$85 CPA",
      requirements: "KYC compliant traffic, 18+ only",
      contact: "affiliates@fintech.com",
      urgent: false
    },
    {
      id: 3,
      advertiser: "Gaming Empire",
      vertical: "Gaming",
      geos: ["Worldwide"],
      trafficTypes: ["Social", "Video", "Native"],
      minVolume: "10K/day",
      payout: "25% RevShare",
      requirements: "Mobile-first traffic preferred",
      contact: "gaming@empire.com",
      urgent: true
    }
  ]);

  const [filters, setFilters] = useState({
    vertical: "",
    geo: "",
    urgent: false
  });

  const [showContactForm, setShowContactForm] = useState(null);

  const filteredWishlist = wishlist.filter(item => {
    if (filters.vertical && !item.vertical.toLowerCase().includes(filters.vertical.toLowerCase())) return false;
    if (filters.geo && !item.geos.some(geo => geo.toLowerCase().includes(filters.geo.toLowerCase()))) return false;
    if (filters.urgent && !item.urgent) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-gray-100 font-sans">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-200/30 dark:bg-orange-400/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-200/30 dark:bg-red-400/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-1/2 transform -translate-x-1/2 w-80 h-80 bg-pink-200/30 dark:bg-pink-400/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <Navbar />
      <section className="relative pt-24 pb-16 px-4 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8 animate-slide-in-down">
          <div className="w-12 h-12 bg-gradient-to-tr from-orange-600 to-red-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h2 className="text-4xl font-extrabold drop-shadow-lg text-gradient-orange">Advertisers Wishlist</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Discover what advertisers are actively seeking from affiliates</p>
          </div>
        </div>

        {/* Filters */}
        <div className="card p-6 mb-8 animate-fade-in-scale">
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="font-semibold mb-2 block text-gray-700 dark:text-gray-200 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                Filter by Vertical
              </label>
              <input
                type="text"
                placeholder="e.g. Health, Finance"
                value={filters.vertical}
                onChange={(e) => setFilters({...filters, vertical: e.target.value})}
                className="input-field"
              />
            </div>
            <div>
              <label className="font-semibold mb-2 block text-gray-700 dark:text-gray-200 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                Filter by GEO
              </label>
              <input
                type="text"
                placeholder="e.g. US, UK, CA"
                value={filters.geo}
                onChange={(e) => setFilters({...filters, geo: e.target.value})}
                className="input-field"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center text-gray-700 dark:text-gray-200">
                <input
                  type="checkbox"
                  checked={filters.urgent}
                  onChange={(e) => setFilters({...filters, urgent: e.target.checked})}
                  className="mr-2 rounded"
                />
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Urgent Only
                </span>
              </label>
            </div>
            <div className="flex items-end">
              <div className="text-gray-600 dark:text-gray-300 font-medium">
                {filteredWishlist.length} request{filteredWishlist.length !== 1 ? 's' : ''} found
              </div>
            </div>
          </div>
        </div>

        {/* Wishlist Grid */}
        {filteredWishlist.length === 0 ? (
          <div className="text-center py-20 animate-fade-in-scale">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-gray-500 dark:text-gray-400 text-2xl font-semibold mb-2">No requests found</div>
            <p className="text-gray-400 dark:text-gray-500 mb-6">Try adjusting your filters to find more opportunities</p>
            <button
              onClick={() => setFilters({vertical: "", geo: "", urgent: false})}
              className="btn-primary"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-fade-in-scale">
            {filteredWishlist.map((item, index) => (
              <div 
                key={item.id} 
                className="group card card-hover"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {item.urgent && (
                  <div className="absolute top-4 right-4 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center animate-pulse">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    URGENT
                  </div>
                )}

                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center text-white font-bold text-sm mr-3 group-hover:scale-110 transition-transform">
                      {item.advertiser.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                        {item.advertiser}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{item.vertical}</p>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {item.geos.map(geo => (
                      <span key={geo} className="badge bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        {geo}
                      </span>
                    ))}
                    <span className="badge bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      {item.minVolume}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Payout:</span>
                      <span className="font-bold text-green-600 dark:text-green-400">{item.payout}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Traffic Types:</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {item.trafficTypes.map(type => (
                          <span key={type} className="badge badge-info">
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Requirements:</span>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{item.requirements}</p>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => setShowContactForm(item.id)}
                    className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 py-3 rounded-lg font-semibold hover:from-orange-700 hover:to-red-700 transition-all transform hover:scale-105 shadow-md hover:shadow-lg flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    Contact Advertiser
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Contact Modal */}
        {showContactForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="card max-w-md w-full p-6 animate-slide-in-up">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Contact Advertiser</h3>
                <button 
                  onClick={() => setShowContactForm(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-400">
                  Contact this advertiser directly:
                </p>
                <div className="p-4 bg-orange-50 dark:bg-orange-900/30 rounded-lg border border-orange-200 dark:border-orange-700">
                  <div className="font-medium text-orange-700 dark:text-orange-300">
                    {wishlist.find(item => item.id === showContactForm)?.contact}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowContactForm(null)}
                    className="flex-1 btn-secondary"
                  >
                    Close
                  </button>
                  <button 
                    onClick={() => {
                      const email = wishlist.find(item => item.id === showContactForm)?.contact;
                      window.open(`mailto:${email}`, '_blank');
                      setShowContactForm(null);
                    }}
                    className="flex-1 btn-primary"
                  >
                    Send Email
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
