import React, { useState, useEffect } from 'react';
import offersService from '../services/offers';

const EmailHistory = ({ userId, title = "Email Communications" }) => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'sent', 'received'

  useEffect(() => {
    fetchEmailHistory();
  }, [filter]);

  const fetchEmailHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await offersService.getEmailHistory(filter, 50, 0);
      
      if (response.success) {
        setEmails(response.emails);
      } else {
        setError('Failed to fetch email history');
      }
    } catch (err) {
      console.error('Error fetching email history:', err);
      setError('Failed to load email communications');
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
      case 'sent': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'delivered': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'bounced': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4 last:border-b-0">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
          </div>
          
          {/* Filter Buttons */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            {['all', 'sent', 'received'].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                  filter === type
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {error ? (
          <div className="text-center py-8">
            <div className="text-red-600 dark:text-red-400 mb-2">{error}</div>
            <button
              onClick={fetchEmailHistory}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Try Again
            </button>
          </div>
        ) : emails.length === 0 ? (
          <div className="text-center py-8">
            <svg className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8V4a2 2 0 00-2-2H6a2 2 0 00-2 2v1m16 0V4a2 2 0 00-2-2H6a2 2 0 00-2 2v1" />
            </svg>
            <p className="text-gray-500 dark:text-gray-400">No email communications found</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              {filter === 'all' 
                ? 'Start contacting affiliates to see your communication history'
                : `No ${filter} emails found`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {emails.map((email) => (
              <div
                key={email.email_id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        email.direction === 'sent' || !email.direction
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        {email.direction === 'sent' || !email.direction ? (
                          <>📤 Sent</>
                        ) : (
                          <>📥 Received</>
                        )}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(email.email_status)}`}>
                        {email.email_status}
                      </span>
                    </div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                      {email.subject}
                    </h4>
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <div>
                        {email.direction === 'sent' || !email.direction ? (
                          <>To: {email.recipient_name} ({email.recipient_entity_name || 'Independent'})</>
                        ) : (
                          <>From: {email.sender_name} ({email.sender_entity_name || 'Independent'})</>
                        )}
                      </div>
                      {email.offer_request_title && (
                        <div>Re: {email.offer_request_title}</div>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(email.sent_at)}
                  </div>
                </div>
                
                {email.message_content && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mt-3">
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {email.message_content.length > 200
                        ? `${email.message_content.substring(0, 200)}...`
                        : email.message_content
                      }
                    </p>
                  </div>
                )}
                
                {email.delivered_at && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Delivered: {formatDate(email.delivered_at)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailHistory;
