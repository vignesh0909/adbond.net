import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, Menu, X, LayoutDashboard, User, Settings, LogOut, Moon, Sun } from 'lucide-react';
import { useAuthContext } from '../contexts/AuthContext';
import { entityAPI } from '../services/entity';

const Navbar = () => {
  const { isAuthenticated, user: currentUser, logout } = useAuthContext();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState('light');
  const [entityData, setEntityData] = useState(null);
  const [entityLoading, setEntityLoading] = useState(false);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();

  // Debug logging to track auth state changes
  useEffect(() => {
    console.log('Navbar auth state changed:', { isAuthenticated, currentUser: currentUser?.email });
  }, [isAuthenticated, currentUser]);

  // Fetch entity data when user changes and has entity_id
  useEffect(() => {
    const fetchEntityData = async () => {
      if (currentUser?.entity_id && isAuthenticated) {
        try {
          setEntityLoading(true);
          const response = await entityAPI.getEntityById(currentUser.entity_id);
          setEntityData(response.entity);
        } catch (error) {
          console.error('Error fetching entity data:', error);
          setEntityData(null);
        } finally {
          setEntityLoading(false);
        }
      } else {
        setEntityData(null);
      }
    };

    fetchEntityData();
  }, [currentUser?.entity_id, isAuthenticated]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Theme toggle
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    // Redirect to home page after logout
    navigate('/');
  };

  const getDashboardRoute = () => {
    if (!currentUser?.role) return '/user-dashboard';

    switch (currentUser.role) {
      case 'advertiser':
        return '/advertiser-dashboard';
      case 'affiliate':
        return '/affiliate-dashboard';
      case 'network':
        return '/network-dashboard';
      case 'admin':
        return '/admin';
      default:
        return '/user-dashboard';
    }
  };

  const getUserInitials = () => {
    // Prioritize entity company name for initials if available
    if (entityData?.entity_metadata?.company_name) {
      const companyName = entityData.entity_metadata.company_name;
      const words = companyName.split(' ').filter(word => word.length > 0);
      if (words.length >= 2) {
        return `${words[0][0]}${words[1][0]}`.toUpperCase();
      } else if (words.length === 1) {
        return words[0].substring(0, 2).toUpperCase();
      }
    }

    // Fallback to user name initials
    if (currentUser?.first_name && currentUser?.last_name) {
      return `${currentUser.first_name[0]}${currentUser.last_name[0]}`.toUpperCase();
    }
    if (currentUser?.email) {
      return currentUser.email[0].toUpperCase();
    }
    return 'U';
  };

  const getUserDisplayName = () => {
    if (entityData?.entity_metadata?.company_name) {
      return entityData.entity_metadata.company_name;
    }

    if (currentUser?.first_name && currentUser?.last_name) {
      return `${currentUser.first_name} ${currentUser.last_name}`;
    }
    return currentUser?.email || 'User';
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-lg border-b border-gray-200/50 dark:border-gray-700/50 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
            <div className="relative">
              <img
                src="/assets/Favicon-dark-mode.png"
                alt="AdBond Logo"
                className="h-12 w-auto sm:h-16 drop-shadow-lg transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div className="hidden sm:block">
              <span className="font-black text-xl xl:text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent tracking-tight whitespace-nowrap">AdBond</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 block -mt-1 font-medium whitespace-nowrap">Connect • Trust • Grow</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1 flex-shrink-0">
            {!isAuthenticated && (
              <Link
                to="/register-entity"
                className="group relative px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-all duration-300 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                <span className="relative z-10">Add Network</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-10 rounded-lg transition-opacity duration-300"></div>
              </Link>
            )}
            {isAuthenticated && (
              <Link
                to={getDashboardRoute()}
                className="group relative px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-all duration-300 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                <span className="relative z-10">Dashboard</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-10 rounded-lg transition-opacity duration-300"></div>
              </Link>
            )}
            {isAuthenticated && (
              <Link
                to="/chat"
                className="group relative px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-all duration-300 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                <span className="relative z-10">Chat</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-10 rounded-lg transition-opacity duration-300"></div>
              </Link>
            )}
            <Link
              to="/offers"
              className="group relative px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-all duration-300 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              <span className="relative z-10">Offers</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-10 rounded-lg transition-opacity duration-300"></div>
            </Link>
            <Link
              to="/wishlist"
              className="group relative px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-all duration-300 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              <span className="relative z-10">Wishlist</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-10 rounded-lg transition-opacity duration-300"></div>
            </Link>
            <Link
              to="/write-review"
              className="group relative px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-all duration-300 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              <span className="relative z-10">Reviews</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-10 rounded-lg transition-opacity duration-300"></div>
            </Link>
            <Link
              to="/affliate-industry"
              className="group relative px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-all duration-300 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              <span className="relative z-10">Database</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-10 rounded-lg transition-opacity duration-300"></div>
            </Link>
          </nav>

          {/* User Section */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            {/* Theme Toggle */}
            {/* <button
              aria-label="Toggle theme"
              onClick={toggleTheme}
              className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 group"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:rotate-12 transition-transform duration-300" />
              ) : (
                <Sun className="w-5 h-5 text-yellow-500 group-hover:rotate-12 transition-transform duration-300" />
              )}
            </button> */}

            {/* Notification Bell */}
            {/* <button
              aria-label="Notifications"
              className="relative p-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 group"
            >
              <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:scale-110 transition-transform duration-300" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-pulse">
                <span className="absolute inset-0 w-3 h-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-ping"></span>
              </span>
            </button> */}
            {!isAuthenticated ? (
              // Show login/signup buttons when not logged in
              <div className="flex items-center space-x-2 flex-shrink-0">
                <Link to="/login">
                  <button className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-semibold px-4 py-2.5 rounded-xl transition-all duration-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 whitespace-nowrap">
                    Log in
                  </button>
                </Link>
                <Link to="/signup">
                  <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-4 py-2.5 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 whitespace-nowrap">
                    Sign up
                  </button>
                </Link>
              </div>
            ) : (
              // Show user menu when logged in
              <div className="relative flex-shrink-0" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 group"
                >
                  {/* User Avatar */}
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-purple-600 text-white rounded-xl flex items-center justify-center font-bold text-sm shadow-lg group-hover:shadow-xl transition-all duration-300">
                      {getUserInitials()}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {getUserDisplayName()}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 capitalize font-medium">
                      {currentUser?.role || 'User'}
                    </div>
                  </div>
                  {/* Dropdown Arrow */}
                  <ChevronDown
                    className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-3 w-56 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 py-2 z-50">
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{currentUser.first_name + currentUser.last_name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                        {entityData?.entity_metadata?.company_name && currentUser?.role}
                      </div>
                    </div>

                    {/* Profile Link */}
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 group"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <div className="w-8 h-8 bg-gradient-to-tr from-green-500 to-teal-500 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium">Profile</span>
                    </Link>

                    {/* Admin Panel (only for admin users) */}
                    {/* {currentUser?.role === 'admin' && (
                      <Link
                        to="/admin"
                        className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 group"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <div className="w-8 h-8 bg-gradient-to-tr from-orange-500 to-red-500 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <span className="font-medium">Admin Panel</span>
                      </Link>
                    )} */}

                    <hr className="my-2 border-gray-200 dark:border-gray-700" />

                    {/* Logout */}
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 group"
                    >
                      <div className="w-8 h-8 bg-gradient-to-tr from-red-500 to-pink-500 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200">
                        <LogOut className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl">
            <div className="px-4 pt-4 pb-6 space-y-2">
              {!isAuthenticated && (
                <Link
                  to="/register-entity"
                  className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl font-medium transition-all duration-300"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Add Network
                </Link>
              )}
              {isAuthenticated && (
                <Link
                  to={getDashboardRoute()}
                  className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl font-medium transition-all duration-300"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
              )}
              {isAuthenticated && (
                <Link
                  to="/chat"
                  className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl font-medium transition-all duration-300"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Chat
                </Link>
              )}
              <Link
                to="/offers"
                className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl font-medium transition-all duration-300"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Offers
              </Link>
              <Link
                to="/affiliatedwishlist"
                className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl font-medium transition-all duration-300"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Wishlist
              </Link>
              <Link
                to="/write-review"
                className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl font-medium transition-all duration-300"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Reviews
              </Link>
              <Link
                to="/affliate-industry"
                className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl font-medium transition-all duration-300"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Database
              </Link>

              {/* Mobile User Menu (when logged in) */}
              {isAuthenticated && (
                <>
                  <hr className="my-4 border-gray-200 dark:border-gray-700" />
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 mb-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-purple-600 text-white rounded-xl flex items-center justify-center font-bold text-sm">
                        {getUserInitials()}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{getUserDisplayName()}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                          {entityData?.entity_metadata?.company_name && currentUser?.role
                            ? `${currentUser.role} • ${entityData.entity_metadata.company_name}`
                            : currentUser?.role || 'User'
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                  <Link
                    to="/profile"
                    className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl font-medium transition-all duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl font-medium transition-all duration-300"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
