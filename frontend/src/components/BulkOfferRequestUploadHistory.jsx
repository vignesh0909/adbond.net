import React, { useState, useEffect } from 'react';
import { offersAPI } from '../services/offers';

export default function BulkOfferRequestUploadHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await offersAPI.getBulkOfferRequestUploadHistory(20, 0);
      if (response.success) {
        setHistory(response.requests || []);
      }
    } catch (err) {
      setError('Failed to fetch upload history');
      console.error('History fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'paused':
        return 'text-yellow-600 bg-yellow-100';
      case 'draft':
        return 'text-gray-600 bg-gray-100';
      case 'expired':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchHistory}
          className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400">No offer request upload history found.</p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
          Your bulk uploaded offer requests will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Bulk Upload History - Offer Requests
      </h3>
      
      <div className="grid gap-4">
        {history.map((request) => (
          <div
            key={request.request_id}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                  {request.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {request.vertical}
                </p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.request_status)}`}>
                {request.request_status}
              </span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Traffic Volume:</span>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {request.traffic_volume?.toLocaleString() || 'N/A'}
                </p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Budget Range:</span>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {request.budget_range || 'N/A'}
                </p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Payout Type:</span>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {request.desired_payout_type || 'N/A'}
                </p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Created:</span>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {formatDate(request.created_at)}
                </p>
              </div>
            </div>

            {request.geos_targeting && request.geos_targeting.length > 0 && (
              <div className="mt-3">
                <span className="text-gray-500 dark:text-gray-400 text-sm">Target Geos:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {request.geos_targeting.map((geo, index) => (
                    <span
                      key={index}
                      className="inline-block bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 text-xs px-2 py-1 rounded"
                    >
                      {geo}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {request.traffic_type && request.traffic_type.length > 0 && (
              <div className="mt-2">
                <span className="text-gray-500 dark:text-gray-400 text-sm">Traffic Types:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {request.traffic_type.map((type, index) => (
                    <span
                      key={index}
                      className="inline-block bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {request.platforms_used && request.platforms_used.length > 0 && (
              <div className="mt-2">
                <span className="text-gray-500 dark:text-gray-400 text-sm">Platforms:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {request.platforms_used.map((platform, index) => (
                    <span
                      key={index}
                      className="inline-block bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs px-2 py-1 rounded"
                    >
                      {platform}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {request.notes && (
              <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-gray-500 dark:text-gray-400 text-sm">Notes:</span>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                  {request.notes}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
