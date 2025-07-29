import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requireAuth = true, requireEntity = false }) => {
  const { isAuthenticated, user, loading } = useAuthContext();
  const location = useLocation();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  // Force re-check authentication on every location change
  useEffect(() => {
    // This will trigger a re-render and re-evaluation of auth state
    // when the user navigates using browser buttons
    const checkAuth = () => {
      if (requireAuth && !isAuthenticated && !loading) {
        setShouldRedirect(true);
      } else {
        setShouldRedirect(false);
      }
    };

    // Check immediately and also set a small delay to ensure auth context is properly initialized
    checkAuth();
    const timeoutId = setTimeout(checkAuth, 50);
    
    return () => clearTimeout(timeoutId);
  }, [location.pathname, isAuthenticated, loading, requireAuth]);

  // Additional effect to handle immediate redirects
  useEffect(() => {
    if (shouldRedirect) {
      // Force immediate redirect
      window.location.replace('/login');
    }
  }, [shouldRedirect]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  // Check authentication requirement
  if (requireAuth && !isAuthenticated) {
    // Redirect to login with return URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check entity requirement (user must have entity_id)
  if (requireEntity && (!isAuthenticated || !user?.entity_id)) {
    // Redirect to register entity page if user is authenticated but not an entity
    if (isAuthenticated) {
      return <Navigate to="/register-entity" state={{ from: location }} replace />;
    }
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
