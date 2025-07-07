import React from 'react';
import Navbar from '../components/navbar';

export default function ReviewsDirectoryPage() {
  const [reviews, setReviews] = React.useState([
    {
      id: 1,
      entity: "AdBoost Media",
      type: "Advertiser",
      rating: 4,
      comment: "Smooth cooperation, quick payouts. Their team is professional and responsive to our needs.",
      date: "2024-04-22",
      reviewer: "MarketingPro123",
      verified: true
    },
    {
      id: 2,
      entity: "ClickNova",
      type: "Affiliate",
      rating: 2,
      comment: "Low-quality traffic, high bounce rate. Had issues with tracking and reporting accuracy.",
      date: "2024-03-18",
      reviewer: "NetworkAdmin",
      verified: false
    },
    {
      id: 3,
      entity: "LeadSpring Network",
      type: "Network",
      rating: 5,
      comment: "Excellent support and campaign variety. Outstanding revenue optimization and timely payments.",
      date: "2024-04-12",
      reviewer: "AffiliateExpert",
      verified: true
    },
    {
      id: 4,
      entity: "TrafficBoost Inc",
      type: "Advertiser",
      rating: 3,
      comment: "Decent platform but could improve their analytics dashboard and reporting features.",
      date: "2024-04-05",
      reviewer: "DigitalMarketer",
      verified: true
    },
    {
      id: 5,
      entity: "ConvertMax",
      type: "Affiliate",
      rating: 5,
      comment: "Amazing conversion rates and excellent customer support. Highly recommended for performance marketing.",
      date: "2024-03-28",
      reviewer: "PerformanceGuru",
      verified: true
    }
  ]);

  const [entityType, setEntityType] = React.useState("");
  const [minRating, setMinRating] = React.useState("");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [sortBy, setSortBy] = React.useState("date");
  const [isLoading, setIsLoading] = React.useState(false);

  const filtered = reviews
    .filter(
      (r) =>
        (entityType === "" || r.type === entityType) &&
        (minRating === "" || r.rating >= parseInt(minRating)) &&
        (r.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
         r.comment.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === "date") return new Date(b.date) - new Date(a.date);
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "entity") return a.entity.localeCompare(b.entity);
      return 0;
    });

  const getStarRating = (rating) => {
    return Array(5).fill(0).map((_, i) => (
      <span key={i} className={`text-lg ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}>
        ★
      </span>
    ));
  };

  const getRatingBadge = (rating) => {
    if (rating >= 4) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (rating >= 3) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  };

  const getTypeBadge = (type) => {
    const badges = {
      'Advertiser': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Affiliate': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'Network': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    };
    return badges[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <Navbar />
      
      <div className="relative z-10 flex-1">
        <section className="pt-24 pb-16 px-4 sm:px-6 max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
              Reviews Directory
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Discover real feedback from the community about advertisers, affiliates, and networks
            </p>
          </div>

          {/* Filters and Search */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl border border-purple-200/50 dark:border-purple-700/50 p-6 mb-8 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Entity Type
                </label>
                <select 
                  value={entityType} 
                  onChange={(e) => setEntityType(e.target.value)} 
                  className="w-full px-4 py-3 rounded-xl border border-purple-200 dark:border-purple-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">All Types</option>
                  <option value="Advertiser">Advertisers</option>
                  <option value="Affiliate">Affiliates</option>
                  <option value="Network">Networks</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Minimum Rating
                </label>
                <select 
                  value={minRating} 
                  onChange={(e) => setMinRating(e.target.value)} 
                  className="w-full px-4 py-3 rounded-xl border border-purple-200 dark:border-purple-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Any Rating</option>
                  {[1, 2, 3, 4, 5].map((r) => (
                    <option key={r} value={r}>{r} star{r > 1 ? "s" : ""}+</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Sort By
                </label>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)} 
                  className="w-full px-4 py-3 rounded-xl border border-purple-200 dark:border-purple-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="date">Latest Reviews</option>
                  <option value="rating">Highest Rated</option>
                  <option value="entity">Entity Name</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Search reviews..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-purple-200 dark:border-purple-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            {/* Active Filters */}
            {(entityType || minRating || searchTerm) && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-purple-200 dark:border-purple-700">
                <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>
                {entityType && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                    Type: {entityType}
                    <button onClick={() => setEntityType("")} className="ml-2 text-purple-600 hover:text-purple-900">×</button>
                  </span>
                )}
                {minRating && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                    {minRating}+ stars
                    <button onClick={() => setMinRating("")} className="ml-2 text-yellow-600 hover:text-yellow-900">×</button>
                  </span>
                )}
                {searchTerm && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    "{searchTerm}"
                    <button onClick={() => setSearchTerm("")} className="ml-2 text-blue-600 hover:text-blue-900">×</button>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Reviews Grid */}
          <div className="space-y-6">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Loading reviews...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-12 h-12 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Reviews Found</h3>
                <p className="text-gray-600 dark:text-gray-400">Try adjusting your filters to see more reviews.</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-6">
                  <p className="text-gray-600 dark:text-gray-400">
                    Showing {filtered.length} review{filtered.length !== 1 ? 's' : ''}
                  </p>
                </div>
                
                {filtered.map((review) => (
                  <div key={review.id} className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl border border-purple-200/50 dark:border-purple-700/50 p-6 shadow-xl hover:shadow-2xl hover:scale-[1.01] transition-all duration-300">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                            {review.entity}
                          </h3>
                          {review.verified && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Verified
                            </span>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getTypeBadge(review.type)}`}>
                            {review.type}
                          </span>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getRatingBadge(review.rating)}`}>
                            {review.rating}.0 Rating
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-1">
                          {getStarRating(review.rating)}
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500 dark:text-gray-400">by {review.reviewer}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(review.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {review.comment}
                    </p>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Call to Action */}
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">Share Your Experience</h3>
              <p className="mb-6 opacity-90">Help the community by writing a review about your partnerships</p>
              <button className="bg-white text-purple-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors duration-200">
                Write a Review
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
