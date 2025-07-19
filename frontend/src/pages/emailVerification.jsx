import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Mail, ArrowRight } from 'lucide-react';
import Navbar from '../components/navbar';
import { http } from '../services/httpClient';
import { customToast } from '../components/ToastProvider';

export default function EmailVerificationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');
  const [canResend, setCanResend] = useState(false);
  const [resendEmail, setResendEmail] = useState('');
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      verifyEmail(token);
    } else {
      // No token provided, allow manual email entry for resending verification
      setStatus('error');
      setMessage('No verification token provided. Enter your email below to resend verification.');
      setCanResend(true);
    }
  }, [searchParams]);

  const verifyEmail = async (token) => {
    try {
      const response = await http.get(`/users/verify-email/${token}`);
      setStatus('success');
      setMessage(response.message || 'Email verified successfully!');
      customToast.success('Email verified successfully!');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login?verified=true');
      }, 3000);
    } catch (error) {
      console.error('Email verification failed:', error);
      setStatus('error');
      setMessage(error.message || 'Email verification failed');
      setCanResend(true);
      customToast.error(error.message || 'Email verification failed');
    }
  };

  const handleResendVerification = async () => {
    if (!resendEmail) {
      setMessage('Please enter your email address');
      customToast.error('Please enter your email address');
      return;
    }

    setResending(true);
    try {
      await http.post('/users/resend-verification', { email: resendEmail });
      setMessage('Verification email sent successfully! Please check your inbox.');
      customToast.success('Verification email sent successfully! Please check your inbox.');
      setCanResend(false);
    } catch (error) {
      const errorMessage = error.message || 'Failed to send verification email';
      setMessage(errorMessage);
      customToast.error(errorMessage);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col">
      <Navbar />
      
      <main className="flex flex-1 items-center justify-center py-16 px-4">
        <div className="w-full max-w-md bg-white/80 dark:bg-gray-900/80 rounded-2xl shadow-2xl p-8 backdrop-blur-md border border-blue-100 dark:border-gray-800 text-center">
          
          {status === 'verifying' && (
            <>
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Verifying Your Email
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Please wait while we verify your email address...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-green-700 dark:text-green-300 mb-4">
                Email Verified Successfully!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {message}
              </p>
              <div className="flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
                <span className="mr-2">Redirecting to login</span>
                <ArrowRight className="w-4 h-4" />
              </div>
              <a 
                href="/login" 
                className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Continue to Login
              </a>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-red-700 dark:text-red-300 mb-4">
                Verification Failed
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {message}
              </p>
              
              {canResend && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Didn't receive the email? We can send you a new verification link.
                  </p>
                  <div className="space-y-3">
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleResendVerification}
                      disabled={resending}
                      className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    >
                      {resending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Mail className="w-4 h-4 mr-2" />
                          Resend Verification Email
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
              
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <a 
                  href="/signup" 
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Create a new account
                </a>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
