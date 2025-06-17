import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/navbar';
import { offersAPI } from '../services/api';
import { entityAPI } from '../services/api';

export default function OfferDetailsPage() {
  const { offerId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [offer, setOffer] = useState(location.state?.offer || null);
  const [entity, setEntity] = useState(null);
  const [loading, setLoading] = useState(!offer);
  const [entityLoading, setEntityLoading] = useState(false);
  const [error, setError] = useState('');

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
            console.log('Public endpoint failed, trying authenticated endpoint:', publicErr);
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
    // Handle offer application logic here
    console.log('Running offer:', offer.offer_id);
  };

  const handleJoinNetwork = () => {
    // Handle join network logic here
    console.log('Joining network:', entity?.entity_id);
  };

  if (loading) {
    return (
      <div className="bg-gray-50 text-gray-900 font-sans min-h-screen">
        <Navbar />
        <div className="pt-20 flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading offer details...</span>
        </div>
      </div>
    );
  }

  if (error || !offer) {
    return (
      <div className="bg-gray-50 text-gray-900 font-sans min-h-screen">
        <Navbar />
        <div className="pt-20 px-6 max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error || 'Offer not found'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col">
      <Navbar />
      <div className="pt-24 pb-16 px-4 sm:px-6 max-w-4xl mx-auto w-full">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <span>/</span>
          <Link to={`/entity/${offer.entity_id}`} className="hover:text-blue-600">
            {offer.entity_name || 'Entity'}
          </Link>
          <span>/</span>
          <span className="text-gray-900">{offer.title}</span>
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
                <div className="border-t pt-4">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3">
                      <span className="font-bold text-blue-600 dark:text-blue-200">
                        {entity.name?.charAt(0).toUpperCase() || 'E'}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-700 dark:text-blue-200">{entity.name}</h3>
                      <div className="flex items-center text-sm text-yellow-500">
                        <span>★★★★☆</span>
                        <span className="ml-1 text-gray-500">4.5</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mb-3">
                    <span className="capitalize">{entity.entity_type}</span>
                    <span className="mx-2">•</span>
                    <span>Weekly, Monthly</span>
                    <span className="mx-2">•</span>
                    <span className="text-blue-600">23 Reviews</span>
                    <span className="mx-2">•</span>
                    <span>12 Offers</span>
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
                  <span className="text-sm text-gray-500">Created {new Date(offer.created_at).toLocaleDateString()}</span>
                  <span className="text-sm text-gray-500">Updated {offer.updated_at ? new Date(offer.updated_at).toLocaleDateString() : 'a day ago'}</span>
                </div>
                {/* Offer Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">PAYOUT</div>
                    <div className="text-xl font-bold text-blue-600">
                      {offer.payout_value ? 
                        (typeof offer.payout_value === 'string' && offer.payout_value.includes('%') ? 
                          offer.payout_value : 
                          `Up to $${offer.payout_value}`) : 
                        'Contact'
                      }
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">CATEGORY</div>
                    <div className="font-semibold">{offer.category}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">GEO</div>
                    <div className="font-semibold">
                      {Array.isArray(offer.target_geo) ? 
                        offer.target_geo.join(', ') : 
                        offer.target_geo || 'Worldwide'
                      }
                    </div>
                  </div>
                </div>
                {/* Share & Action Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-500">SHARE</span>
                    <button className="p-2 hover:bg-gray-100 rounded">
                      <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M20 10c0-5.523-4.477-10-10-10S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded">
                      <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                      </svg>
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded">
                      <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
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
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  DESCRIPTION
                </h2>
                <div className="prose prose-sm max-w-none text-gray-700">
                  {offer.description ? (
                    <p>{offer.description}</p>
                  ) : (
                    <p className="text-gray-500 italic">No description available for this offer.</p>
                  )}
                </div>
                {/* Additional Details */}
                {(offer.requirements || offer.landing_page_url) && (
                  <div className="mt-8 space-y-6">
                    {offer.requirements && (
                      <div>
                        <h3 className="text-md font-semibold text-gray-900 mb-2">Requirements</h3>
                        <p className="text-gray-700">{offer.requirements}</p>
                      </div>
                    )}
                    {offer.landing_page_url && (
                      <div>
                        <h3 className="text-md font-semibold text-gray-900 mb-2">Landing Page</h3>
                        <a 
                          href={offer.landing_page_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline break-all"
                        >
                          {offer.landing_page_url}
                        </a>
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
