import React, { useEffect, useState } from 'react';
import Navbar from '../components/navbar';
import { entityAPI } from '../services/entity';

export default function CompanyDatabasePage() {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEntities = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await entityAPI.getPublicEntities(filterType);
        setCompanies(response.entities);
      } catch (err) {
        setError("Failed to fetch entities. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEntities();
  }, [filterType]);

  const filteredCompanies = companies.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase())
  );

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
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12a1 1 0 001-1v-3a1 1 0 10-2 0v3a1 1 0 001 1zm0 4a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-6a6 6 0 100 12 6 6 0 000-12z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h2 className="text-4xl font-extrabold drop-shadow-lg text-gradient-emerald">Company Database</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Browse the affiliate marketing industry directory</p>
          </div>
        </div>

        <p className="mb-8 text-gray-600 dark:text-gray-300 text-lg animate-fade-in-up">
          Contact details are protected and available only on request. Build connections with verified partners.
        </p>

        {/* Search and Filter Section */}
        <div className="card p-6 mb-8 animate-fade-in-scale">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="font-semibold mb-2 block text-gray-700 dark:text-gray-200 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
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
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
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
                {loading ? 'Loading...' : `${filteredCompanies.length} companies found`}
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
        ) : filteredCompanies.length === 0 ? (
          <div className="text-center py-20 animate-fade-in-scale">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-gray-500 dark:text-gray-400 text-2xl font-semibold mb-2">No companies found</div>
            <p className="text-gray-400 dark:text-gray-500 mb-6">Try adjusting your search criteria or browse different types</p>
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
                  {filteredCompanies.map((company, idx) => (
                    <tr 
                      key={idx} 
                      className="border-b border-gray-100 dark:border-gray-700 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 transition-colors group"
                      style={{ animationDelay: `${idx * 0.1}s` }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm mr-3 group-hover:scale-110 transition-transform">
                            {company.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                              {company.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Verified Partner</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          company.entity_type === 'Advertiser' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          company.entity_type === 'Affiliate' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                        }`}>
                          {company.entity_type === 'Advertiser' ? '🎯' : company.entity_type === 'Affiliate' ? '👥' : '🌐'} {company.entity_type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-emerald-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-md hover:shadow-lg flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                          </svg>
                          Request Access
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
