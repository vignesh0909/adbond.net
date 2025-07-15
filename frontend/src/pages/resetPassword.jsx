import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/navbar';
import { authAPI } from '../services/auth';
import { customToast } from '../components/ToastProvider';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');
  const [tokenValid, setTokenValid] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      // For now, we'll assume the token is valid and let the backend validate it
      // In a more robust implementation, you might want to validate the token format
      setTokenValid(true);
    } else {
      setTokenValid(false);
      customToast.error('Invalid reset link. Please request a new password reset.');
    }
    setCheckingToken(false);
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!token) {
      customToast.error('Invalid reset token. Please request a new password reset.');
      return;
    }

    // Validate password
    if (newPassword.length < 6) {
      customToast.error('Password must be at least 6 characters long');
      return;
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      customToast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      // Store the token in localStorage temporarily for the authenticated reset password request
      localStorage.setItem('authToken', token);
      
      await authAPI.resetPassword({
        new_password: newPassword
      });

      // Clear the temporary token
      localStorage.removeItem('authToken');
      
      customToast.success('Password reset successful! You can now log in with your new password.');
      
      // Redirect to login page after successful reset
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (error) {
      console.error('Password reset error:', error);
      // Clear the temporary token on error
      localStorage.removeItem('authToken');
      
      const errorMessage = error.message || error.response?.data?.error || error.response?.data?.message || 'Failed to reset password. Please try again.';
      
      // Specific error messages for better UX
      if (errorMessage.includes('same as your current password')) {
        customToast.error('Please choose a different password. Your new password cannot be the same as your current password.');
      } else if (errorMessage.includes('expired') || errorMessage.includes('invalid') || errorMessage.includes('token')) {
        customToast.error('Your reset link has expired. Please request a new password reset.');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        customToast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  if (checkingToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-16 px-4">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Validating reset link...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-16 px-4">
          <div className="w-full max-w-md">
            <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-8 text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Invalid Reset Link</h1>
                <p className="text-gray-600 dark:text-gray-400">
                  This password reset link is invalid or has expired. Please request a new password reset.
                </p>
              </div>
              <button
                onClick={() => navigate('/login')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
              >
                Go to Login
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

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
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-8 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600"></div>

            {/* Logo Section */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 mb-4">
                <img
                  src="/assets/Favicon-dark-mode.png"
                  alt="AdBond Logo"
                  className="h-12 w-auto sm:h-16 drop-shadow-lg transition-transform group-hover:scale-105"
                />
                <div>
                  <span className="font-black text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">AdBond</span>
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Connect • Trust • Grow</div>
                </div>
              </div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100 mb-2">Reset Password</h2>
              <p className="text-gray-600 dark:text-gray-400">Enter your new password below</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* New Password Field */}
              <div>
                <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-900 dark:text-gray-100"
                    placeholder="Enter new password"
                    minLength="6"
                  />
                </div>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-900 dark:text-gray-100"
                    placeholder="Confirm new password"
                    minLength="6"
                  />
                </div>
              </div>

              {/* Password Requirements */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Password Requirements:</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li className="flex items-center gap-2">
                    <span className={newPassword.length >= 6 ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}>✓</span>
                    At least 6 characters long
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={newPassword === confirmPassword && newPassword ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}>✓</span>
                    Passwords match
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={newPassword ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}>✓</span>
                    Different from your current password
                  </li>
                </ul>
              </div>

              {/* Reset Password Button */}
              <button
                type="submit"
                disabled={loading || !newPassword || !confirmPassword || newPassword !== confirmPassword || newPassword.length < 6}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 px-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 disabled:transform-none disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Resetting Password...
                  </div>
                ) : 'Reset Password'}
              </button>
            </form>

            {/* Back to Login Link */}
            <div className="mt-8 text-center">
              <button
                onClick={() => navigate('/login')}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 font-semibold transition-colors"
              >
                ← Back to Login
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
