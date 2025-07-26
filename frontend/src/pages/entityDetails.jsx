import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from '../components/navbar';
import EntityReviews from '../components/EntityReviews';
import { entityAPI } from '../services/entity';
import { offersAPI } from '../services/offers';
import { useAuthContext } from '../contexts/AuthContext';

export default function EntityDetailsPage() {
  const { entityId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, isLoading: authLoading } = useAuthContext();
  const [entity, setEntity] = useState(null);
  const [entityOffers, setEntityOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offersLoading, setOffersLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // Check if user is authenticated and has entity role
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        toast.error('Please login to access entity details', {
          position: "top-right",
          autoClose: 3000,
        });
        navigate('/login');
        return;
      }

      // Check if user has entity role (advertiser, affiliate, network)
      const entityRoles = ['advertiser', 'affiliate', 'network'];
      if (!user || !user.role || !entityRoles.includes(user.role)) {
        toast.error('Access denied. Only entities can view entity details.', {
          position: "top-right",
          autoClose: 4000,
        });
        navigate('/');
        return;
      }
    }
  }, [isAuthenticated, user?.role, authLoading, navigate]); // Only trigger when role specifically changes

  useEffect(() => {
    const fetchEntityDetails = async () => {
      try {
        setLoading(true);
        // Try public endpoint first, then fall back to authenticated endpoint
        let response;
        try {
          response = await entityAPI.getPublicEntityById(entityId);
        } catch (publicErr) {
          response = await entityAPI.getEntityById(entityId);
        }
        setEntity(response.entity);
      } catch (err) {
        setError('Failed to fetch entity details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEntityDetails();
  }, [entityId]);

  useEffect(() => {
    const fetchEntityOffers = async () => {
      if (entity) {
        try {
          setOffersLoading(true);
          // Try public endpoint first, then fall back to authenticated endpoint
          let response;
          try {
            response = await offersAPI.getPublicOffersByEntity(entityId);
          } catch (publicErr) {
            response = await offersAPI.getOffersByEntity(entityId);
          }
          setEntityOffers(response.offers || []);
        } catch (err) {
          console.error('Failed to fetch entity offers:', err);
        } finally {
          setOffersLoading(false);
        }
      }
    };

    fetchEntityOffers();
  }, [entity, entityId]);

  const handleJoinNetwork = () => {
    // Handle join network logic here
    if (entity?.website) {
      window.open(entity.website, '_blank');
    } else {
      toast.info('Website URL not available.', {
        position: "top-right",
        autoClose: 4000,
      });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans min-h-screen">
        <Navbar />
        <div className="pt-20 flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-300">
            {authLoading ? 'Checking authentication...' : 'Loading entity details...'}
          </span>
        </div>
      </div>
    );
  }

  if (error || !entity) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans min-h-screen">
        <Navbar />
        <div className="pt-20 px-6 max-w-4xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-700 rounded-lg p-4 text-red-700 dark:text-red-300">
            {error || 'Entity not found'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col">
      <Navbar />
      <div className="pt-24 pb-16 px-4 sm:px-6 max-w-6xl mx-auto w-full">
        <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
          <Link to="/offers" className="hover:text-blue-600 dark:hover:text-blue-400">Dashboard</Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-gray-100">{entity.entity_metadata.company_name}</span>
        </nav>
        <div className="bg-white/80 dark:bg-gray-900/80 rounded-2xl shadow-xl p-8 mb-8 border border-blue-100 dark:border-gray-800">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-3xl shadow-lg">
                {entity.name?.charAt(0).toUpperCase() || 'E'}
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-blue-700 dark:text-blue-300 mb-2 tracking-tight">{entity.entity_metadata.company_name}</h1>
                <div className="flex items-center space-x-4 mb-3">
                  <div className="flex items-center text-yellow-500">
                    <span className="text-lg">
                      {'★'.repeat(Math.floor(entity.reputation_score || 0))}
                      {(entity.reputation_score % 1) >= 0.5 ? '★' : ''}
                      {'☆'.repeat(5 - Math.ceil(entity.reputation_score || 0))}
                    </span>
                    <span className="ml-2 text-gray-600 dark:text-gray-300">{entity.reputation_score || 0}</span>
                  </div>
                  <span className="text-gray-500 dark:text-gray-400 capitalize">{entity.entity_type}</span>
                </div>
                <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-300">
                  <span>{entity.entity_metadata.payment_terms || 0}</span>
                  <span className="text-blue-600 dark:text-blue-400">{entity.total_reviews || 0} Reviews</span>
                  <span>{entityOffers.length} Offers</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleJoinNetwork}
              className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition"
            >
              Join Network
            </button>
          </div>
        </div>
        {/* Entity Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 dark:bg-gray-900/80 rounded-2xl shadow-lg p-6 text-center border border-blue-100 dark:border-gray-800">
            <div className="text-3xl font-bold text-blue-600 mb-2">{entityOffers.length}</div>
            <div className="text-gray-600">Active Offers</div>
          </div>
          <div className="bg-white/80 dark:bg-gray-900/80 rounded-2xl shadow-lg p-6 text-center border border-blue-100 dark:border-gray-800">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {entity.reputation_score && typeof entity.reputation_score === 'number' && entity.reputation_score > 0 ?
                entity.reputation_score.toFixed(1) : 'N/A'}
            </div>
            <div className="text-gray-600">Rating</div>
          </div>
          <div className="bg-white/80 dark:bg-gray-900/80 rounded-2xl shadow-lg p-6 text-center border border-blue-100 dark:border-gray-800">
            <div className="text-3xl font-bold text-purple-600 mb-2">{entity.total_reviews || 0}</div>
            <div className="text-gray-600">Reviews</div>
          </div>
          <div className="bg-white/80 dark:bg-gray-900/80 rounded-2xl shadow-lg p-6 text-center border border-blue-100 dark:border-gray-800">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {entity.verification_status === 'approved' ? 'Verified' : 'Pending'}
            </div>
            <div className="text-gray-600">Status</div>
          </div>
        </div>
        {/* Tabs */}
        <div className="bg-white/80 dark:bg-gray-900/80 rounded-2xl shadow-lg border border-blue-100 dark:border-gray-800">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-semibold text-lg transition-all ${activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-300'
                  : 'border-transparent text-gray-500 hover:text-blue-700 dark:hover:text-blue-200'
                  }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('offers')}
                className={`py-4 px-1 border-b-2 font-semibold text-lg transition-all ${activeTab === 'offers'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-300'
                  : 'border-transparent text-gray-500 hover:text-blue-700 dark:hover:text-blue-200'
                  }`}
              >
                Offers <span className="ml-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{entityOffers.length}</span>
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`py-4 px-1 border-b-2 font-semibold text-lg transition-all ${activeTab === 'reviews'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-300'
                  : 'border-transparent text-gray-500 hover:text-blue-700 dark:hover:text-blue-200'
                  }`}
              >
                Reviews <span className="ml-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{entity.total_reviews || 0}</span>
              </button>
            </nav>
          </div>
          <div className="p-6">
            {activeTab === 'overview' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8 flex items-center">
                  <svg className="w-6 h-6 mr-3 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  About {entity.entity_metadata.company_name}
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Entity Details Section */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Entity Details
                    </h3>
                    <dl className="space-y-5">
                      <div className="flex items-start justify-between py-3 border-b border-gray-200 dark:border-gray-600">
                        <dt className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Type</dt>
                        <dd className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                          {entity.entity_type}
                        </dd>
                      </div>
                      <div className="flex items-start justify-between py-3 border-b border-gray-200 dark:border-gray-600">
                        <dt className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Website</dt>
                        <dd className="text-sm font-medium text-gray-900 dark:text-gray-100 text-right max-w-xs">
                          {entity.website ? (
                            <a
                              href={entity.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline break-all"
                            >
                              {entity.website}
                            </a>
                          ) : (
                            <span className="text-gray-500 dark:text-gray-400 italic">Not provided</span>
                          )}
                        </dd>
                      </div>
                      <div className="flex items-start justify-between py-3 border-b border-gray-200 dark:border-gray-600">
                        <dt className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Rating</dt>
                        <dd className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {entity.reputation_score && typeof entity.reputation_score === 'number' && entity.reputation_score > 0 ? (
                            <div className="flex items-center gap-2">
                              <span className="text-yellow-500 text-base">
                                {'★'.repeat(Math.floor(entity.reputation_score))}
                                {(entity.reputation_score % 1) >= 0.5 ? '★' : ''}
                                {'☆'.repeat(5 - Math.ceil(entity.reputation_score))}
                              </span>
                              <span className="text-gray-600 dark:text-gray-300 font-semibold">
                                ({entity.reputation_score.toFixed(1)}/5)
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-500 dark:text-gray-400 italic">No ratings yet</span>
                          )}
                        </dd>
                      </div>
                      <div className="flex items-start justify-between py-3">
                        <dt className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Status</dt>
                        <dd className="text-sm">
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${entity.verification_status === 'approved'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-700'
                            : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-700'
                            }`}>
                            <svg className={`w-3 h-3 mr-1.5 ${entity.verification_status === 'approved' ? 'text-green-500' : 'text-yellow-500'}`} fill="currentColor" viewBox="0 0 20 20">
                              {entity.verification_status === 'approved' ? (
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              ) : (
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                              )}
                            </svg>
                            {entity.verification_status === 'approved' ? 'Verified' : 'Pending'}
                          </span>
                        </dd>
                      </div>
                    </dl>
                  </div>

                  {/* Description Section */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                      </svg>
                      Description
                    </h3>
                    <div className="prose prose-sm max-w-none">
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">
                        {entity.description || (
                          <span className="text-gray-500 dark:text-gray-400 italic">
                            No description available for this entity.
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'offers' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Available Offers</h2>

                {offersLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">Loading offers...</span>
                  </div>
                ) : entityOffers.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">No offers available from this entity.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {entityOffers.map((offer, index) => (
                      <Link
                        key={index}
                        to={`/offer/${offer.offer_id}`}
                        state={{ offer }}
                        className="block bg-gray-50 hover:bg-gray-100 rounded-lg p-6 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{offer.title}</h3>
                            <p className="text-gray-600 text-sm mb-3">{offer.description}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                {offer.category}
                              </span>
                              <span>Geo: {Array.isArray(offer.target_geo) ? offer.target_geo.join(', ') : offer.target_geo}</span>
                            </div>
                          </div>
                          <div className="text-right ml-6">
                            <div className="text-2xl font-bold text-green-600 mb-1">
                              {offer.payout_value ?
                                (typeof offer.payout_value === 'string' && offer.payout_value.includes('%') ?
                                  offer.payout_value :
                                  `$${offer.payout_value}`) :
                                'Contact'
                              }
                            </div>
                            <div className="text-sm text-gray-500">{offer.payout_type}</div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <EntityReviews entityId={entityId} entityName={entity.name} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
