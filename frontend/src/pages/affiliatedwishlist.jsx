import React, { useState, useEffect } from 'react';
import Navbar from '../components/navbar';
import offersService from '../services/offers';

// Affiliates Wishlist Page (Standalone Export)
export default function AffiliatesWishlistPage() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    vertical: "",
    geo: "",
    priority: ""
  });

  const [showContactForm, setShowContactForm] = useState(null);
  const [contactMessage, setContactMessage] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  // Fetch offer requests on component mount
  useEffect(() => {
    fetchOfferRequests();
  }, []);

  const fetchOfferRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await offersService.getAllOfferRequests();
      
      if (response.success) {
        // Transform the offer request data to match the display format
        const transformedData = response.requests.map(request => ({
          id: request.offer_request_id,
          affiliate: request.entity_name || request.user_name || 'Anonymous Affiliate',
          verticals: [request.vertical],
          geos: Array.isArray(request.geos_targeting) ? request.geos_targeting : [],
          trafficTypes: Array.isArray(request.traffic_type) ? request.traffic_type : [],
          dailyVolume: `${request.traffic_volume ? (request.traffic_volume / 1000).toFixed(0) : '0'}K/day`,
          avgCR: "N/A", // This info isn't in offer_requests table
          experience: "N/A", // This info isn't in offer_requests table
          requirements: request.notes || "No specific requirements mentioned",
          contact: request.user_name || "Contact via platform",
          priority: determinePriority(request),
          title: request.title,
          platforms: Array.isArray(request.platforms_used) ? request.platforms_used : [],
          payoutType: request.desired_payout_type,
          budgetRange: request.budget_range,
          expiresAt: request.expires_at,
          createdAt: request.created_at
        }));
        
        setWishlist(transformedData);
      } else {
        setError('Failed to fetch offer requests');
      }
    } catch (err) {
      console.error('Error fetching offer requests:', err);
      setError('Failed to load affiliate requests');
    } finally {
      setLoading(false);
    }
  };

  // Determine priority based on budget range and traffic volume
  const determinePriority = (request) => {
    const volume = request.traffic_volume || 0;
    const hasBudget = request.budget_range && Object.keys(request.budget_range).length > 0;
    
    if (volume > 50000 || hasBudget) return 'high';
    if (volume > 10000) return 'medium';
    return 'low';
  };

  // Handle sending contact email
  const handleSendContactEmail = async () => {
    if (!contactMessage.trim()) {
      alert('Please enter a message before sending.');
      return;
    }

    try {
      setSendingEmail(true);
      const result = await offersService.sendContactEmail(showContactForm, contactMessage);
      
      if (result.success) {
        alert('Contact email sent successfully!');
        setShowContactForm(null);
        setContactMessage('');
      } else {
        alert('Failed to send email. Please try again.');
      }
    } catch (error) {
      console.error('Error sending contact email:', error);
      alert('Failed to send email. Please try again.');
    } finally {
      setSendingEmail(false);
    }
  };

  const filteredWishlist = wishlist.filter(item => {
    if (filters.vertical && !item.verticals.some(v => v.toLowerCase().includes(filters.vertical.toLowerCase()))) return false;
    if (filters.geo && !item.geos.some(geo => geo.toLowerCase().includes(filters.geo.toLowerCase()))) return false;
    if (filters.priority && item.priority !== filters.priority) return false;
    return true;
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-gray-100 font-sans">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200/30 dark:bg-green-400/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200/30 dark:bg-blue-400/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-1/2 transform -translate-x-1/2 w-80 h-80 bg-teal-200/30 dark:bg-teal-400/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <Navbar />
      <section className="relative pt-24 pb-16 px-4 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8 animate-slide-in-down">
          <div className="w-12 h-12 bg-gradient-to-tr from-green-600 to-blue-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
            </svg>
          </div>
          <div>
            <h2 className="text-4xl font-extrabold drop-shadow-lg text-gradient-green">Affiliates Wishlist</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Connect with quality affiliates actively seeking new offers</p>
            <div className="mt-2 flex items-center text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              <span className="text-green-600 dark:text-green-400 font-medium">Live data from offer requests</span>
            </div>
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
            <div>
              <label className="font-semibold mb-2 block text-gray-700 dark:text-gray-200 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
                Priority Level
              </label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters({...filters, priority: e.target.value})}
                className="input-field"
              >
                <option value="">All Priorities</option>
                <option value="high">🔴 High Priority</option>
                <option value="medium">🟡 Medium Priority</option>
                <option value="low">🟢 Low Priority</option>
              </select>
            </div>
            <div className="flex items-end">
              <div className="text-gray-600 dark:text-gray-300 font-medium">
                {filteredWishlist.length} affiliate{filteredWishlist.length !== 1 ? 's' : ''} found
              </div>
            </div>
          </div>
        </div>

        {/* Wishlist Grid */}
        {loading ? (
          <div className="text-center py-20 animate-fade-in-scale">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-spin">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-gray-600 dark:text-gray-300 text-xl font-semibold">Loading affiliate requests...</div>
          </div>
        ) : error ? (
          <div className="text-center py-20 animate-fade-in-scale">
            <div className="w-20 h-20 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-red-600 dark:text-red-400 text-2xl font-semibold mb-2">{error}</div>
            <button
              onClick={fetchOfferRequests}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        ) : filteredWishlist.length === 0 ? (
          <div className="text-center py-20 animate-fade-in-scale">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
              </svg>
            </div>
            <div className="text-gray-500 dark:text-gray-400 text-2xl font-semibold mb-2">
              {wishlist.length === 0 ? 'No affiliate requests yet' : 'No affiliates found'}
            </div>
            <p className="text-gray-400 dark:text-gray-500 mb-6">
              {wishlist.length === 0 
                ? 'There are currently no affiliate requests in the system. Check back later!' 
                : 'Try adjusting your filters to find more partners'
              }
            </p>
            {wishlist.length > 0 && (
              <button
                onClick={() => setFilters({vertical: "", geo: "", priority: ""})}
                className="btn-primary"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-fade-in-scale">
            {filteredWishlist.map((item, index) => (
              <div 
                key={item.id} 
                className="group card card-hover"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`absolute top-4 right-4 ${getPriorityColor(item.priority)} text-white px-2 py-1 rounded-full text-xs font-bold flex items-center`}>
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  {item.priority.toUpperCase()}
                </div>

                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm mr-3 group-hover:scale-110 transition-transform">
                      {item.affiliate.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                        {item.title || item.affiliate}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {item.payoutType} • {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Verticals */}
                  <div className="mb-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Verticals:</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {item.verticals.map(vertical => (
                        <span key={vertical} className="badge bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                          {vertical}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* GEOs */}
                  <div className="mb-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Target GEOs:</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {item.geos.length > 0 ? item.geos.slice(0, 4).map((geo, index) => (
                        <span key={index} className="badge bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          {geo}
                        </span>
                      )) : (
                        <span className="badge bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                          No specific GEOs mentioned
                        </span>
                      )}
                      {item.geos.length > 4 && (
                        <span className="badge bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                          +{item.geos.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                      <div className="font-bold text-green-600 dark:text-green-400">{item.dailyVolume}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Daily Volume</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                      <div className="font-bold text-blue-600 dark:text-blue-400">{item.payoutType}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Payout Type</div>
                    </div>
                  </div>

                  {/* Traffic Types & Platforms */}
                  <div className="mb-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Traffic Types:</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {item.trafficTypes.length > 0 ? item.trafficTypes.map((type, index) => (
                        <span key={index} className="badge badge-info">
                          {type}
                        </span>
                      )) : (
                        <span className="badge bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                          Not specified
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Platforms */}
                  {item.platforms && item.platforms.length > 0 && (
                    <div className="mb-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Platforms:</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {item.platforms.map((platform, index) => (
                          <span key={index} className="badge bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                            {platform}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Requirements */}
                  <div className="mb-6">
                    <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Requirements:</span>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{item.requirements}</p>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => setShowContactForm(item.id)}
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-md hover:shadow-lg flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    Contact Affiliate
                  </button>

                  {/* Budget Range Info */}
                  {item.budgetRange && Object.keys(item.budgetRange).length > 0 && (
                    <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/30 rounded text-sm">
                      <span className="font-medium text-yellow-800 dark:text-yellow-200">Budget: </span>
                      <span className="text-yellow-700 dark:text-yellow-300">
                        {JSON.stringify(item.budgetRange)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Contact Modal */}
        {showContactForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="card max-w-lg w-full p-6 animate-slide-in-up max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Contact Affiliate</h3>
                <button 
                  onClick={() => {
                    setShowContactForm(null);
                    setContactMessage('');
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Request Info */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
                  <div className="font-medium text-blue-700 dark:text-blue-300 mb-2">
                    📋 Offer Request: {wishlist.find(item => item.id === showContactForm)?.title}
                  </div>
                  <div className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
                    <div>Contact: {wishlist.find(item => item.id === showContactForm)?.contact}</div>
                    <div>Vertical: {wishlist.find(item => item.id === showContactForm)?.verticals?.[0]}</div>
                    <div>Volume: {wishlist.find(item => item.id === showContactForm)?.dailyVolume}</div>
                  </div>
                </div>

                {/* Message Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Your Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Hi! I'm interested in your offer request and would like to discuss potential collaboration opportunities..."
                    className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 resize-none"
                    rows="4"
                    disabled={sendingEmail}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    This message will be sent via email to the affiliate along with your contact details.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button 
                    onClick={() => {
                      setShowContactForm(null);
                      setContactMessage('');
                    }}
                    className="flex-1 btn-secondary"
                    disabled={sendingEmail}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSendContactEmail}
                    disabled={sendingEmail || !contactMessage.trim()}
                    className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {sendingEmail ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                        Send Email
                      </>
                    )}
                  </button>
                </div>

                {/* Privacy Notice */}
                <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded">
                  <p className="mb-1"><strong>Privacy Notice:</strong></p>
                  <p>• Your contact information will be shared with the affiliate</p>
                  <p>• This communication is tracked for quality and security purposes</p>
                  <p>• The affiliate will receive your email address and can reply directly</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
//           </div>

//           <div>
//             <label className="block font-semibold mb-2">Star Rating</label>
//             <select value={rating} onChange={e => setRating(e.target.value)} className="w-full border rounded px-3 py-2">
//               <option value="">Select Rating</option>
//               {[1, 2, 3, 4, 5].map(n => <option key={n}>{n} Star{n > 1 ? 's' : ''}</option>)}
//             </select>
//           </div>

//           <div>
//             <label className="block font-semibold mb-2">Review Title</label>
//             <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="Short summary..." />
//           </div>

//           <div>
//             <label className="block font-semibold mb-2">Review Body</label>
//             <textarea value={body} onChange={e => setBody(e.target.value)} className="w-full border rounded px-3 py-2" rows="5" placeholder="Describe your experience in detail..."></textarea>
//           </div>

//           <div>
//             <label className="block font-semibold mb-2">Tags (optional)</label>
//             <input type="text" value={tags} onChange={e => setTags(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="e.g. Late Payment, Good Traffic, Bot Clicks" />
//           </div>

//           <div>
//             <label className="block font-semibold mb-2">Upload Proof (optional)</label>
//             <input type="file" onChange={e => setFile(e.target.files[0])} className="w-full border rounded px-3 py-2" />
//           </div>

//           <div className="flex items-center space-x-2">
//             <input type="checkbox" id="anonymous" checked={anonymous} onChange={e => setAnonymous(e.target.checked)} />
//             <label htmlFor="anonymous">Post review anonymously</label>
//           </div>

//           <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700 transition-all">Submit Review</button>
//         </form>
//       </section>
//     </>
//   );
// }
