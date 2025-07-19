import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../contexts/AuthContext';

/**
 * Component to show token expiration warnings to users
 */
const TokenExpirationWarning = () => {
  const { isAuthenticated, tokenInfo, logout } = useAuthContext();
  const [showWarning, setShowWarning] = useState(false);
  const [minutesRemaining, setMinutesRemaining] = useState(0);

  // Warning threshold (5 minutes before expiration)
  const warningThreshold = 5 * 60 * 1000; // 5 minutes

  useEffect(() => {
    if (isAuthenticated && tokenInfo && tokenInfo.timeUntilExpiration > 0) {
      const timeUntilExpiration = tokenInfo.timeUntilExpiration;
      
      // Show warning if token is expiring within threshold
      if (timeUntilExpiration <= warningThreshold) {
        setShowWarning(true);
        setMinutesRemaining(Math.ceil(timeUntilExpiration / (60 * 1000)));
      } else {
        setShowWarning(false);
        setMinutesRemaining(0);
      }
    } else {
      setShowWarning(false);
      setMinutesRemaining(0);
    }
  }, [isAuthenticated, tokenInfo, warningThreshold]);

  // Auto-hide warning after 10 seconds
  useEffect(() => {
    if (showWarning) {
      const timer = setTimeout(() => {
        setShowWarning(false);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [showWarning]);

  if (!showWarning) return null;

  return (
    <div className="fixed top-24 right-4 z-[60] max-w-sm">
      <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md shadow-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium">Session Expiring Soon</h3>
            <p className="mt-1 text-sm">
              Your session will expire in {minutesRemaining} minute{minutesRemaining !== 1 ? 's' : ''}. 
              Please save your work.
            </p>
            <div className="mt-2 flex space-x-2">
              <button
                onClick={() => setShowWarning(false)}
                className="text-yellow-700 hover:text-yellow-800 text-sm font-medium underline"
              >
                Dismiss
              </button>
              <button
                onClick={logout}
                className="text-yellow-700 hover:text-yellow-800 text-sm font-medium underline"
              >
                Logout Now
              </button>
            </div>
          </div>
          <div className="flex-shrink-0 ml-4">
            <button
              onClick={() => setShowWarning(false)}
              className="inline-flex text-yellow-400 hover:text-yellow-600"
            >
              <span className="sr-only">Close</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenExpirationWarning;
