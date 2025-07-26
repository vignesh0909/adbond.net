import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from '../components/navbar';
import { offersAPI } from '../services/offers';
import { entityAPI } from '../services/entity';
import { useAuthContext } from '../contexts/AuthContext';

export default function OfferDetailsPage() {
  const { offerId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, isLoading: authLoading } = useAuthContext();
  const [offer, setOffer] = useState(location.state?.offer || null);
  const [entity, setEntity] = useState(null);
  const [loading, setLoading] = useState(!offer);
  const [entityLoading, setEntityLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if user is authenticated
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        toast.error('Please login to access offer details', {
          position: "top-right",
          autoClose: 3000,
        });
        navigate('/login');
        return;
      }
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    const fetchOfferDetails = async () => {
      if (!offer) {
        try {
          setLoading(true);
          const response = await offersAPI.getOfferById(offerId);
          setOffer(response.offer);
        } catch (err) {
          setError('Failed to fetch offer details');
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchOfferDetails();
  }, [offerId, offer]);

  useEffect(() => {
    const fetchEntityDetails = async () => {
      if (offer?.entity_id) {
        try {
          setEntityLoading(true);
          // Try public endpoint first, then fall back to authenticated endpoint
          let response;
          try {
            response = await entityAPI.getPublicEntityById(offer.entity_id);
          } catch (publicErr) {
            response = await entityAPI.getEntityById(offer.entity_id);
          }
          setEntity(response.entity);
        } catch (err) {
          console.error('Failed to fetch entity details:', err);
        } finally {
          setEntityLoading(false);
        }
      }
    };

    fetchEntityDetails();
  }, [offer?.entity_id]);

  const handleRunOffer = () => {
    if (offer?.entity_metadata?.signup_url) {
      window.open(offer.landing_page_url, '_blank');
    } else {
      toast.info('Signup URL not available.', {
        position: "top-right",
        autoClose: 4000,
      });
    }
  };

  const handleJoinNetwork = () => {
    if (offer?.website) {
      window.open(offer.website, '_blank');
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
            {authLoading ? 'Authenticating...' : 'Loading offer details...'}
          </span>
        </div>
      </div>
    );
  }

  if (error || !offer) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans min-h-screen">
        <Navbar />
        <div className="pt-20 px-6 max-w-4xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-700 rounded-lg p-4 text-red-700 dark:text-red-300">
            {error || 'Offer not found'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col">
      <Navbar />
      <div className="pt-24 pb-16 px-4 sm:px-6 w-full">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
          <Link to="/offers" className="hover:text-blue-600 dark:hover:text-blue-400">
            Offers
          </Link>
          <span>/</span>
          {user && user.role && ['advertiser', 'affiliate', 'network'].includes(user.role) ? (
            <Link to={`/entity/${offer.entity_id}`} className="hover:text-blue-600 dark:hover:text-blue-400">
              {offer.entity_metadata.company_name || 'Entity'}
            </Link>
          ) : (
            <span className="text-gray-900 dark:text-gray-100">
              {offer.entity_metadata.company_name || 'Entity'}
            </span>
          )}
          <span>/</span>
          <span className="text-gray-900 dark:text-gray-100">{offer.title}</span>
        </nav>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Offer Image/Icon */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 dark:bg-gray-900/80 rounded-2xl shadow-xl p-6 sticky top-24 border border-blue-100 dark:border-gray-800">
              <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white mb-4 shadow-lg">
                <div className="text-6xl font-bold">
                  {offer.title.charAt(0).toUpperCase()}
                </div>
              </div>
              {/* Entity Info Card */}
              {entity && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3">
                      <span className="font-bold text-blue-600 dark:text-blue-200">
                        {entity.name?.charAt(0).toUpperCase() || 'E'}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-700 dark:text-blue-200">{entity.entity_metadata.company_name}</h3>
                      <div className="flex items-center text-sm text-yellow-500">
                        <span className="text-lg">
                          {'★'.repeat(Math.floor(entity.reputation_score || 0))}
                          {(entity.reputation_score % 1) >= 0.5 ? '★' : ''}
                          {'☆'.repeat(5 - Math.ceil(entity.reputation_score || 0))}
                        </span>
                        <span className="ml-2 text-gray-600 dark:text-gray-300">{entity.reputation_score || 0}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    <span className="capitalize">{entity.entity_type}</span>
                    {/* <span className="mx-2">•</span> */}
                    {/* <span>Weekly, Monthly</span>
                    <span className="mx-2">•</span>
                    <span className="text-blue-600 dark:text-blue-400">23 Reviews</span>
                    <span className="mx-2">•</span>
                    <span>12 Offers</span> */}
                  </div>
                  <button
                    onClick={handleJoinNetwork}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-bold py-2 px-4 rounded-lg shadow transition"
                  >
                    Join Network
                  </button>
                </div>
              )}
            </div>
          </div>
          {/* Right Column - Offer Details */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 dark:bg-gray-900/80 rounded-2xl shadow-xl border border-blue-100 dark:border-gray-800">
              {/* Offer Header */}
              <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                <h1 className="text-2xl font-extrabold text-blue-700 dark:text-blue-300 mb-4 tracking-tight">{offer.title}</h1>
                <div className="flex items-center space-x-4 mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    Active
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Created {new Date(offer.created_at).toLocaleDateString()}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Updated {offer.updated_at ? new Date(offer.updated_at).toLocaleDateString() : 'a day ago'}</span>
                </div>
                {/* Offer Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">PAYOUT</div>
                    <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                      {offer.payout_value ?
                        (typeof offer.payout_value === 'string' && offer.payout_value.includes('%') ?
                          offer.payout_value :
                          `Up to $${offer.payout_value}`) :
                        'Contact'
                      }
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">CATEGORY</div>
                    <div className="font-semibold text-gray-900 dark:text-gray-100">{offer.category}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">GEO</div>
                    <div className="font-semibold text-gray-900 dark:text-gray-100">
                      {Array.isArray(offer.target_geo) ?
                        offer.target_geo.join(', ') :
                        offer.target_geo || 'Worldwide'
                      }
                    </div>
                  </div>
                </div>
                {/* Share & Action Buttons */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={handleRunOffer}
                    className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-bold py-2 px-6 rounded-lg shadow flex items-center space-x-2 transition"
                  >
                    <span>Run This Offer</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
              {/* Offer Description */}
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  DESCRIPTION
                </h2>
                <div className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300">
                  {offer.description ? (
                    <p>{offer.description}</p>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 italic">No description available for this offer.</p>
                  )}
                </div>
                {/* Additional Details */}
                {(offer.requirements || offer.landing_page_url) && (
                  <div className="mt-8 space-y-6">
                    {offer.requirements && (
                      <div>
                        <h3 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-2">Requirements</h3>
                        <p className="text-gray-700 dark:text-gray-300">{offer.requirements}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
