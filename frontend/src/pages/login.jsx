import React from 'react';
import Navbar from '../components/navbar';
import { authAPI } from '../services/api';
import AdminPanelPage from '../pages/adminpanel'; // Import AdminPanelPage

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
      <div className="bg-gray-50 text-gray-900 mt-20 font-sans">
        <Navbar />
        <section className="py-20 px-6 max-w-md mx-auto">
          <h2 className="text-3xl font-bold mb-6">Login</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full border px-3 py-2 rounded"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full border px-3 py-2 rounded"
              required
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1"
                required
              />
              <label className="text-xs text-gray-600">
                I agree that this platform is for informational use only and the data is not guaranteed. I accept the disclaimer below.
              </label>
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              disabled={!agreed || loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <div className="mt-8 text-xs text-gray-500 border-t pt-4">
            <p>
              Statutory Notice: We are not liable for any information provided here. This platform is intended solely to help the affiliate marketing industry. We do not take responsibility for any content or claims posted.
            </p>
            <p className="mt-2">
              The company database (contact details, names, etc.) was personally gathered by us from LinkedIn and industry summits. We share it to help others — but we do not guarantee accuracy or results.
            </p>
          </div>
        </section>
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
