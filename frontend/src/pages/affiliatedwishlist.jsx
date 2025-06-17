import React, { useState } from 'react';
import Navbar from '../components/navbar';

// Affiliates Wishlist Page (Standalone Export)
export default function AffiliatesWishlistPage() {
  const [wishlist, setWishlist] = useState([
    {
      id: 1,
      affiliate: "Digital Traffic Pro",
      verticals: ["Health", "Finance", "Gaming"],
      geos: ["US", "CA", "UK", "AU"],
      trafficTypes: ["Native", "Social", "Email"],
      dailyVolume: "15K/day",
      avgCR: "2.5%",
      experience: "5+ years",
      requirements: "High-converting health & finance offers, fast payouts",
      contact: "partnerships@digitaltraffic.com",
      priority: "high"
    },
    {
      id: 2,
      affiliate: "Mobile Masters",
      verticals: ["Gaming", "Apps", "Sweepstakes"],
      geos: ["Worldwide"],
      trafficTypes: ["Mobile", "Video", "Push"],
      dailyVolume: "25K/day",
      avgCR: "3.2%",
      experience: "3+ years",
      requirements: "Mobile-first campaigns, tier 1 & 2 geos preferred",
      contact: "deals@mobilemasters.net",
      priority: "medium"
    },
    {
      id: 3,
      affiliate: "Performance Partners",
      verticals: ["Finance", "Insurance", "Lead Gen"],
      geos: ["US", "UK", "DE", "FR"],
      trafficTypes: ["Search", "Display", "Native"],
      dailyVolume: "8K/day",
      avgCR: "4.1%",
      experience: "7+ years",
      requirements: "Premium finance offers, compliance-heavy verticals OK",
      contact: "biz@performancepartners.io",
      priority: "high"
    }
  ]);

  const [filters, setFilters] = useState({
    vertical: "",
    geo: "",
    priority: ""
  });

  const [showContactForm, setShowContactForm] = useState(null);

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
        {filteredWishlist.length === 0 ? (
          <div className="text-center py-20 animate-fade-in-scale">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
              </svg>
            </div>
            <div className="text-gray-500 dark:text-gray-400 text-2xl font-semibold mb-2">No affiliates found</div>
            <p className="text-gray-400 dark:text-gray-500 mb-6">Try adjusting your filters to find more partners</p>
            <button
              onClick={() => setFilters({vertical: "", geo: "", priority: ""})}
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
                        {item.affiliate}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{item.experience} experience</p>
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
                      {item.geos.slice(0, 4).map(geo => (
                        <span key={geo} className="badge bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          {geo}
                        </span>
                      ))}
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
                      <div className="font-bold text-blue-600 dark:text-blue-400">{item.avgCR}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Avg. CR</div>
                    </div>
                  </div>

                  {/* Traffic Types */}
                  <div className="mb-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Traffic Types:</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {item.trafficTypes.map(type => (
                        <span key={type} className="badge badge-info">
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>

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
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Contact Affiliate</h3>
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
                  Contact this affiliate directly:
                </p>
                <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-700">
                  <div className="font-medium text-green-700 dark:text-green-300">
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
