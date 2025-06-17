import React from 'react';
import Navbar from '../components/navbar';
import { authAPI } from '../services/api';
import AdminPanelPage from '../pages/adminpanel';
import { Link } from 'react-router-dom';

export default function LoginDashboardPage() {
  const [loggedIn, setLoggedIn] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [agreed, setAgreed] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [currentUser, setCurrentUser] = React.useState(null);
  const [passwordResetRequired, setPasswordResetRequired] = React.useState(false);
  const [initializing, setInitializing] = React.useState(true); // Add initializing state
  const [passwordResetSuccess, setPasswordResetSuccess] = React.useState(false);

  // Check if user is already logged in on component mount and listen for storage changes
  React.useEffect(() => {
    const checkAuthStatus = () => {
      const isLoggedIn = authAPI.isLoggedIn();
      const user = authAPI.getCurrentUser();
      const passwordResetNeeded = localStorage.getItem('password_reset_required') === 'true';

      if (isLoggedIn && user) {
        setLoggedIn(true);
        setCurrentUser(user);
        setPasswordResetRequired(passwordResetNeeded);
      } else {
        // Clear state if not properly logged in
        setLoggedIn(false);
        setCurrentUser(null);
        setPasswordResetRequired(false);
        if (isLoggedIn && !user) {
          // Token exists but no user data, clear everything
          authAPI.logout();
        }
      }
      setInitializing(false); // Done checking initial auth state
    };

    // Check on mount
    checkAuthStatus();

    // Listen for storage changes (e.g., logout in another tab)
    const handleStorageChange = (e) => {
      if (e.key === 'authToken' || e.key === 'currentUser' || e.key === 'password_reset_required') {
        checkAuthStatus();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await authAPI.login({ email, password });
      setLoggedIn(true);
      setCurrentUser(response.user); // Assuming response.user contains role

      // Check if password reset is required
      if (response.password_reset_required) {
        setPasswordResetRequired(true);
        localStorage.setItem('password_reset_required', 'true');
      }

      console.log('Login successful:', response);
    } catch (error) {
      setError(error.message || "Login failed. Please check your credentials.");
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate new password
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    // Validate password confirmation
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      setLoading(false);
      return;
    }

    try {
      await authAPI.resetPassword({
        new_password: newPassword
      });

      // Clear password reset state
      setPasswordResetRequired(false);
      localStorage.removeItem('password_reset_required');

      // Show success message
      setPasswordResetSuccess(true);

      // Reset form fields
      setNewPassword("");
      setConfirmPassword("");

      // Hide success message after 3 seconds
      setTimeout(() => {
        setPasswordResetSuccess(false);
      }, 3000);

    } catch (error) {
      setError(error.message || "Password reset failed. Please try again.");
      console.error('Password reset error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Clear API storage
    authAPI.logout();

    // Reset component state
    setLoggedIn(false);
    setCurrentUser(null);
    setEmail("");
    setPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordResetRequired(false);
    setAgreed(false);
    setError("");

    // Force a page refresh to ensure clean state
    window.location.reload();
  };

  // Show loading screen while checking initial auth state
  if (initializing) {
    return (
      <div className="bg-gray-50 text-gray-900 mt-20 font-sans">
        <Navbar />
        <section className="py-20 px-6 max-w-md mx-auto text-center">
          <p>Loading...</p>
        </section>
      </div>
    );
  }

  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 flex flex-col">
        <Navbar />

        {/* Animated Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/10 to-pink-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <main className="flex-1 flex items-center justify-center py-16 px-4 relative">
          <div className="w-full max-w-md">
            {/* Login Form Card */}
            <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-8 relative overflow-hidden">
              {/* Background Decoration */}
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600"></div>

              {/* Logo Section */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-black text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Linkin</span>
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Connect • Trust • Grow</div>
                  </div>
                </div>
                <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100 mb-2">Welcome Back</h2>
                <p className="text-gray-600 dark:text-gray-400">Sign in to continue your journey</p>
              </div>

              {/* Error/Success Messages */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="text-red-700 dark:text-red-400 font-medium">{error}</span>
                  </div>
                </div>
              )}

              {passwordResetSuccess && (
                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-green-700 dark:text-green-400 font-medium">Password reset successful! You can now log in with your new password.</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-6">
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-900 dark:text-gray-100"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-900 dark:text-gray-100"
                      placeholder="Enter your password"
                    />
                  </div>
                </div>

                {/* Password Reset Fields */}
                {passwordResetRequired && (
                  <div className="space-y-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl">
                    <p className="text-sm text-yellow-800 dark:text-yellow-400 font-medium mb-3">
                      Your password must be reset before you can log in. Please enter a new password below.
                    </p>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="New Password"
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm New Password"
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300 font-medium">
                      Remember me
                    </label>
                  </div>
                  <button type="button" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-semibold transition-colors">
                    Forgot password?
                  </button>
                </div>

                {/* Sign In Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 px-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 disabled:transform-none"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </div>
                  ) : 'Sign In'}
                </button>
              </form>

              {/* Sign Up Link */}
              <div className="mt-8 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  Don't have an account?{' '}
                  <Link to="/signup" className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-semibold transition-colors">
                    Sign up for free
                  </Link>
                </p>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="mt-8 text-center">
              <div className="flex items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>SSL Secured</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Privacy Protected</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (passwordResetRequired) {
    return (
      <div className="bg-gray-50 text-gray-900 mt-20 font-sans">
        <Navbar />
        <section className="py-20 px-6 max-w-md mx-auto">
          <h2 className="text-3xl font-bold mb-6">Reset Password</h2>
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New Password"
              className="w-full border px-3 py-2 rounded"
              required
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm New Password"
              className="w-full border px-3 py-2 rounded"
              required
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {passwordResetSuccess && <p className="text-green-500 text-sm">Password reset successful! You can now log in with your new password.</p>}
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              disabled={loading}
            >
              {loading ? 'Resetting password...' : 'Reset Password'}
            </button>
          </form>
        </section>
      </div>
    );
  }

  // If logged in, redirect to appropriate dashboard based on role
  if (currentUser) {
    if (currentUser.role === 'admin') {
      return (
        <>
          <Navbar />
          <AdminPanelPage />
        </>
      );
    }

    // Redirect to role-specific dashboard
    if (currentUser.role === 'advertiser') {
      window.location.href = '/advertiser-dashboard';
      return null;
    }

    if (currentUser.role === 'affiliate') {
      window.location.href = '/affiliate-dashboard';
      return null;
    }

    if (currentUser.role === 'network') {
      window.location.href = '/network-dashboard';
      return null;
    }
  }

  // Default dashboard for users without specific roles
  return (
    <>
      <Navbar />
      <section className="pt-24 pb-16 px-6 max-w-5xl mx-auto">
        <button onClick={handleLogout} className="mb-4 text-sm text-blue-600 underline">Logout</button>
        <h2 className="text-3xl font-bold mb-6">Dashboard</h2>
        {currentUser && <p className="mb-4">Welcome, {currentUser.firstName || currentUser.email}!</p>}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border rounded p-4 shadow bg-white">
            <h3 className="font-semibold mb-2">My Reviews</h3>
            <p className="text-sm text-gray-600">You have written 2 reviews.</p>
          </div>
          <div className="border rounded p-4 shadow bg-white">
            <h3 className="font-semibold mb-2">Wishlist Offers</h3>
            <p className="text-sm text-gray-600">You’ve requested 4 offers this month.</p>
          </div>
          <div className="border rounded p-4 shadow bg-white">
            <h3 className="font-semibold mb-2">Submitted Offers</h3>
            <p className="text-sm text-gray-600">You have 3 active offers listed.</p>
          </div>
        </div>
      </section>
    </>
  );
}
