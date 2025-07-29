import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';

// Protected routes that require authentication
const PROTECTED_ROUTES = [
  '/wishlist',
  '/advertiser-dashboard',
  '/affiliate-dashboard', 
  '/network-dashboard',
  '/user-dashboard',
  '/profile'
];

// Routes that require entity status
const ENTITY_REQUIRED_ROUTES = [
  '/advertiser-dashboard'
];

const NavigationGuard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, loading } = useAuthContext();

  useEffect(() => {
    // Don't run checks while auth is loading
    if (loading) return;

    const currentPath = location.pathname;
    
    // Check if current route requires protection
    const isProtectedRoute = PROTECTED_ROUTES.some(route => 
      currentPath.startsWith(route)
    );
    
    const requiresEntity = ENTITY_REQUIRED_ROUTES.some(route => 
      currentPath.startsWith(route)
    );

    if (isProtectedRoute) {
      if (!isAuthenticated) {
        // User is not authenticated, redirect to login
        navigate('/login', { 
          state: { from: location }, 
          replace: true 
        });
        return;
      }

      if (requiresEntity && !user?.entity_id) {
        // User is authenticated but not an entity, redirect to register
        navigate('/register-entity', { 
          state: { from: location }, 
          replace: true 
        });
        return;
      }
    }
  }, [location, isAuthenticated, user, loading, navigate]);

  // Additional effect to handle browser navigation events
  useEffect(() => {
    const handlePopState = () => {
      // Force a re-check when user uses browser back/forward
      const currentPath = window.location.pathname;
      const isProtectedRoute = PROTECTED_ROUTES.some(route => 
        currentPath.startsWith(route)
      );
      
      if (isProtectedRoute && !isAuthenticated && !loading) {
        // Force redirect to login
        window.location.replace('/login');
      }
    };

    // Listen for browser navigation events
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isAuthenticated, loading]);

  // This component doesn't render anything
  return null;
};

export default NavigationGuard;
