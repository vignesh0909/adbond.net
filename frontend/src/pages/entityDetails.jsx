import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import Navbar from '../components/navbar';
import { entityAPI, offersAPI } from '../services/api';

export default function EntityDetailsPage() {
  const { entityId } = useParams();
  const location = useLocation();
  const [entity, setEntity] = useState(null);
  const [entityOffers, setEntityOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offersLoading, setOffersLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEntityDetails = async () => {
      try {
        setLoading(true);
        // Try public endpoint first, then fall back to authenticated endpoint
        let response;
        try {
          response = await entityAPI.getPublicEntityById(entityId);
        } catch (publicErr) {
          console.log('Public endpoint failed, trying authenticated endpoint:', publicErr);
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
            console.log('Public offers endpoint failed, trying authenticated endpoint:', publicErr);
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
    console.log('Joining network:', entity?.entity_id);
  };

  if (loading) {
    return (
      <div className="bg-gray-50 text-gray-900 font-sans min-h-screen">
        <Navbar />
        <div className="pt-20 flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading entity details...</span>
        </div>
      </div>
    );
  }

  if (error || !entity) {
    return (
      <div className="bg-gray-50 text-gray-900 font-sans min-h-screen">
        <Navbar />
        <div className="pt-20 px-6 max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error || 'Entity not found'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 text-gray-900 font-sans min-h-screen">
      <Navbar />
      <div className="pt-20 pb-16 px-6 max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <span>/</span>
          <span className="text-gray-900">{entity.name}</span>
        </nav>

        {/* Entity Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-2xl mr-6">
                {entity.name?.charAt(0).toUpperCase() || 'E'}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{entity.name}</h1>
                <div className="flex items-center space-x-4 mb-3">
                  <div className="flex items-center text-yellow-500">
                    <span className="text-lg">★★★★☆</span>
                    <span className="ml-2 text-gray-600">4.5</span>
                  </div>
                  <span className="text-gray-500 capitalize">{entity.entity_type}</span>
                </div>
                <div className="flex items-center space-x-6 text-sm text-gray-600">
                  <span>Weekly, Monthly</span>
                  <span className="text-blue-600">23 Reviews</span>
                  <span>{entityOffers.length} Offers</span>
                </div>
              </div>
            </div>
            <button 
              onClick={handleJoinNetwork}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Join Network
            </button>
          </div>
        </div>

        {/* Entity Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{entityOffers.length}</div>
            <div className="text-gray-600">Active Offers</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">4.5</div>
            <div className="text-gray-600">Rating</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">23</div>
            <div className="text-gray-600">Reviews</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {entity.verification_status === 'approved' ? 'Verified' : 'Pending'}
            </div>
            <div className="text-gray-600">Status</div>
          </div>
        </div>

        {/* Entity Offers */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Offers from {entity.name}</h2>
          
          {offersLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading offers...</span>
            </div>
          ) : entityOffers.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500">No offers available from this entity</div>
            </div>
          ) : (
            <div className="space-y-4">
              {entityOffers.map((offer, index) => (
                <Link 
                  key={index}
                  to={`/offer/${offer.offer_id}`}
                  state={{ offer }}
                  className="block bg-gray-50 hover:bg-gray-100 rounded-lg p-4 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold mr-4">
                        {offer.title.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">{offer.title}</h3>
                        <div className="flex items-center space-x-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {offer.category}
                          </span>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            {offer.payout_type}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">
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

        {/* Entity Information */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">About {entity.name}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Entity Details</h3>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Type</dt>
                  <dd className="text-sm text-gray-900 capitalize">{entity.entity_type}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Country</dt>
                  <dd className="text-sm text-gray-900">{entity.country || 'Not specified'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Website</dt>
                  <dd className="text-sm text-gray-900">
                    {entity.website ? (
                      <a 
                        href={entity.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {entity.website}
                      </a>
                    ) : (
                      'Not provided'
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Verification Status</dt>
                  <dd className="text-sm">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      entity.verification_status === 'approved' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {entity.verification_status === 'approved' ? 'Verified' : 'Pending Verification'}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Description</h3>
              <p className="text-sm text-gray-700">
                {entity.description || 'No description available for this entity.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
