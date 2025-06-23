import React, { useEffect, useState } from 'react';
import { Database, Search, Filter, Building, Star, Users, Globe, Eye, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import Navbar from '../components/navbar';
import { authAPI } from '../services/auth';
import { http } from '../services/httpClient';
import { affiliateCompaniesAPI } from '../services/affliateCompanies';

export default function CompanyDatabasePage() {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [userVerificationStatus, setUserVerificationStatus] = useState(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [contactsModalOpen, setContactsModalOpen] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false
  });
  const [searchDebounce, setSearchDebounce] = useState("");

  // Check if user is logged in
  useEffect(() => {
    const loggedIn = authAPI.isLoggedIn();
    setIsLoggedIn(loggedIn);

    if (loggedIn) {
      fetchUserVerificationStatus();
    }
  }, []);

  const fetchUserVerificationStatus = async () => {
    try {
      const response = await http.get('/users/verification-status');
      console.log('Verification status response:', response);
      setUserVerificationStatus(response.data || response.status);
    } catch (err) {
      console.error('Error fetching verification status:', err);
    }
  };

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounce(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // Reset pagination when search or filter changes
  useEffect(() => {
    if (isLoggedIn) {
      setCompanies([]);
      setPagination(prev => ({ ...prev, page: 1 }));
      fetchCompanies(1, true);
    }
  }, [filterType, searchDebounce, isLoggedIn]);

  const fetchCompanies = async (page = 1, reset = false) => {
    if (!isLoggedIn) {
      setError("Please log in to access the company database.");
      return;
    }

    if (reset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError("");

    try {
      const params = {
        page,
        limit: pagination.limit,
        ...(filterType && { type: filterType }),
        ...(searchDebounce && { search: searchDebounce })
      };

      const response = await affiliateCompaniesAPI.getCompanies(params);

      if (reset) {
        setCompanies(response.data || []);
      } else {
        setCompanies(prev => [...prev, ...(response.data || [])]);
      }

      setPagination(response.pagination || pagination);
    } catch (err) {
      setError("Failed to fetch companies. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreCompanies = () => {
    if (pagination.hasNextPage && !loadingMore) {
      fetchCompanies(pagination.page + 1, false);
    }
  };

  const handleRequestAccess = async (company) => {
    setSelectedCompany(company);

    if (!userVerificationStatus?.identity_verified && !userVerificationStatus?.entity_id) {
      setShowVerificationModal(true);
      return;
    }

    // User is verified, fetch contacts directly
    await fetchCompanyContacts(company.affliate_id);
  };

  const fetchCompanyContacts = async (companyId) => {
    try {
      setLoading(true);
      const response = await http.get(`/affiliate-companies/${companyId}/contacts`);
      console.log('Contacts response:', response);
      setContacts(response.data || []);
      setContactsModalOpen(true);
    } catch (err) {
      setError("Failed to fetch company contacts.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };  const handleIdentityVerification = async (method, data) => {
    try {
      setLoading(true);
      const response = await http.post('/users/verify-identity', {
        verification_method: method,
        ...data
      });

      console.log('Verification response:', response);

      // Refresh verification status
      await fetchUserVerificationStatus();
      setShowVerificationModal(false);

      // Now fetch contacts for the selected company
      if (selectedCompany) {
        await fetchCompanyContacts(selectedCompany.affliate_id);
      }
    } catch (err) {
      setError("Identity verification failed. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-gray-100 font-sans">
        <Navbar />
        <section className="relative pt-24 pb-16 px-4 sm:px-6 max-w-7xl mx-auto w-full">
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Access Restricted</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Please log in to access the affiliate company database.
            </p>
            <a href="/login" className="btn-primary">
              Log In
            </a>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-gray-100 font-sans">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200/30 dark:bg-emerald-400/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200/30 dark:bg-blue-400/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-1/2 transform -translate-x-1/2 w-80 h-80 bg-cyan-200/30 dark:bg-cyan-400/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <Navbar />
      <section className="relative pt-24 pb-16 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center mb-8 animate-slide-in-down">
          <div className="w-12 h-12 bg-gradient-to-tr from-emerald-600 to-blue-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
            <Database className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-4xl font-extrabold drop-shadow-lg text-gradient-emerald">Affiliate Company Database</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Browse verified affiliate marketing companies</p>
          </div>

          {/* Verification Status Badge */}
          {userVerificationStatus && (
            <div className="flex items-center space-x-2">
              {userVerificationStatus.identity_verified || userVerificationStatus.entity_id ? (
                <div className="flex items-center px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-700">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                  <span className="text-green-700 dark:text-green-300 font-medium">Verified Access</span>
                </div>
              ) : (
                <div className="flex items-center px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg border border-yellow-200 dark:border-yellow-700">
                  <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
                  <span className="text-yellow-700 dark:text-yellow-300 font-medium">Limited Access</span>
                </div>
              )}
            </div>
          )}
        </div>

        <p className="mb-8 text-gray-600 dark:text-gray-300 text-lg animate-fade-in-up">
          {userVerificationStatus?.identity_verified || userVerificationStatus?.entity_id
            ? "You have verified access to view contact details and connect with partners."
            : "Verify your identity via LinkedIn or business email to access full contact details."
          }
        </p>

        {/* Search and Filter Section */}
        <div className="card p-6 mb-8 animate-fade-in-scale">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="font-semibold mb-2 block text-gray-700 dark:text-gray-200 flex items-center">
                <Search className="w-4 h-4 mr-2" />
                Search by Company Name
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="e.g. AdBoost Media"
                className="input-field"
              />
            </div>
            <div>
              <label className="font-semibold mb-2 block text-gray-700 dark:text-gray-200 flex items-center">
                <Filter className="w-4 h-4 mr-2" />
                Filter by Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="input-field"
              >
                <option value="">All Types</option>
                <option value="Advertiser">🎯 Advertiser</option>
                <option value="Affiliate">👥 Affiliate</option>
                <option value="Network">🌐 Network</option>
              </select>
            </div>
          </div>

          {/* Results Counter */}
          <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg border border-emerald-100 dark:border-emerald-700">
            <div className="flex items-center text-emerald-700 dark:text-emerald-300">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">
                {loading ? 'Loading...' : `${companies.length} of ${pagination.total} companies found`}
                {searchDebounce && ` for "${searchDebounce}"`}
              </span>
            </div>
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center items-center py-20 animate-fade-in-scale">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mr-4"></div>
            <span className="text-gray-600 dark:text-gray-400 text-lg">Loading companies...</span>
          </div>
        ) : error ? (
          <div className="card p-6 bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700 animate-shake">
            <div className="flex items-center text-red-700 dark:text-red-300">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        ) : companies.length === 0 ? (
          <div className="text-center py-20 animate-fade-in-scale">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-gray-500 dark:text-gray-400 text-2xl font-semibold mb-2">No companies found</div>
            <p className="text-gray-400 dark:text-gray-500 mb-6">
              {searchDebounce ? `No results for "${searchDebounce}"` : 'Try adjusting your search criteria or browse different types'}
            </p>
            <button
              onClick={() => {
                setSearch("");
                setFilterType("");
              }}
              className="btn-primary"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="card p-0 overflow-hidden animate-fade-in-scale">
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/50 dark:to-blue-900/50">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-emerald-700 dark:text-emerald-300">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 12a1 1 0 001-1v-3a1 1 0 10-2 0v3a1 1 0 001 1zm0 4a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                        </svg>
                        Company Name
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-emerald-700 dark:text-emerald-300">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                        Type
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left font-semibold text-emerald-700 dark:text-emerald-300">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Action
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map((company, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-gray-100 dark:border-gray-700 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 transition-colors group"
                      style={{ animationDelay: `${idx * 0.1}s` }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm mr-3 group-hover:scale-110 transition-transform">
                            {company.company_name?.charAt(0).toUpperCase() || 'C'}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                              {company.company_name || 'Unknown Company'}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {company.website || 'No website'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${company.entity_type === 'Advertiser' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          company.entity_type === 'Affiliate' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                          }`}>
                          {company.entity_type === 'Advertiser' ? '🎯' : company.entity_type === 'Affiliate' ? '👥' : '🌐'} {company.entity_type || 'Affiliate'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleRequestAccess(company)}
                          className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-emerald-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-md hover:shadow-lg flex items-center"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          {userVerificationStatus?.identity_verified || userVerificationStatus?.entity_id
                            ? 'View Contacts'
                            : 'Request Access'
                          }
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Load More Button */}
            {pagination.hasNextPage && (
              <div className="p-6 text-center border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={loadMoreCompanies}
                  disabled={loadingMore}
                  className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-emerald-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center mx-auto"
                >
                  {loadingMore ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Loading More...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      Load More Companies ({pagination.total - companies.length} remaining)
                    </>
                  )}
                </button>

                <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                  Showing {companies.length} of {pagination.total} companies
                  {pagination.totalPages > 1 && (
                    <span> • Page {pagination.page} of {pagination.totalPages}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Identity Verification Modal */}
      {showVerificationModal && (
        <VerificationModal
          onClose={() => setShowVerificationModal(false)}
          onVerify={handleIdentityVerification}
          loading={loading}
        />
      )}

      {/* Contacts Modal */}
      {contactsModalOpen && (
        <ContactsModal
          company={selectedCompany}
          contacts={contacts}
          onClose={() => setContactsModalOpen(false)}
          hasFullAccess={userVerificationStatus?.identity_verified || userVerificationStatus?.entity_id}
        />
      )}
    </div>
  );
}

// Verification Modal Component
function VerificationModal({ onClose, onVerify, loading }) {
  const [verificationType, setVerificationType] = useState('');
  const [linkedinProfile, setLinkedinProfile] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (verificationType === 'linkedin') {
      onVerify('linkedin', { linkedin_profile: linkedinProfile });
    } else if (verificationType === 'business_email') {
      onVerify('business_email', { business_email: businessEmail });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6">
        <h3 className="text-xl font-bold mb-4">Verify Your Identity</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          To access contact details, please verify your identity through one of these methods:
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              <input
                type="radio"
                name="verification"
                value="linkedin"
                checked={verificationType === 'linkedin'}
                onChange={(e) => setVerificationType(e.target.value)}
                className="mr-2"
              />
              LinkedIn Profile Verification
            </label>
            {verificationType === 'linkedin' && (
              <input
                type="url"
                placeholder="https://linkedin.com/in/yourprofile"
                value={linkedinProfile}
                onChange={(e) => setLinkedinProfile(e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              <input
                type="radio"
                name="verification"
                value="business_email"
                checked={verificationType === 'business_email'}
                onChange={(e) => setVerificationType(e.target.value)}
                className="mr-2"
              />
              Business Domain Email
            </label>
            {verificationType === 'business_email' && (
              <input
                type="email"
                placeholder="your.email@company.com"
                value={businessEmail}
                onChange={(e) => setBusinessEmail(e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required
              />
            )}
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!verificationType || loading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Contacts Modal Component
function ContactsModal({ company, contacts, onClose, hasFullAccess }) {
  console.log('ContactsModal props:', { company, contacts, hasFullAccess });
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold">{company?.company_name} - Contacts</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              ✕
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Access Level: {hasFullAccess ? 'Full Access' : 'Limited Access'}
          </p>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {contacts.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No contacts available</p>
          ) : (
            <div className="space-y-4">
              {contacts.map((contact, idx) => (
                <div key={idx} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{contact.full_name || `${contact.first_name || ''} ${contact.last_name || ''}`.trim()}</h4>
                      {contact.designation && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">{contact.designation}</p>
                      )}
                      {hasFullAccess ? (
                        <div className="mt-2 space-y-1">
                          {contact.email && (
                            <p className="text-sm">📧 {contact.email}</p>
                          )}
                          {contact.phone && (
                            <p className="text-sm">📞 {contact.phone}</p>
                          )}
                          {!contact.email && !contact.phone && (
                            <p className="text-sm text-gray-500">No contact details available</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2">
                          🔒 Contact details hidden - verify identity to access
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
