import React from 'react';
import { toast } from 'react-toastify';
import Navbar from '../components/navbar';

export default function AdvertisersShowcasePage() {
  const [offers, setOffers] = React.useState([]);
  const [searchTerm, setSearchTerm] = React.useState("");

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        setOffers(json);
        toast.success('Offers file uploaded successfully!', {
          position: "top-right",
          autoClose: 3000,
        });
      } catch {
        toast.error("Invalid JSON format. Please upload a valid offer file.", {
          position: "top-right",
          autoClose: 5000,
        });
      }
    };
    if (file) reader.readAsText(file);
  };

  // Filter offers by search term
  const filteredOffers = offers.filter(
    (offer) =>
      offer.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.geo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-gray-100 font-sans">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200/30 dark:bg-purple-400/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200/30 dark:bg-blue-400/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-1/2 transform -translate-x-1/2 w-80 h-80 bg-pink-200/30 dark:bg-pink-400/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <Navbar />
      <section className="relative py-16 px-4 max-w-6xl mx-auto flex flex-col items-center">
        <div className="w-full card p-8 md:p-12 mt-10 animate-fade-in-scale">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-tr from-purple-600 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-4xl font-extrabold drop-shadow-lg text-gradient-purple mb-2">Offers Showcase</h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">Discover all available offers. Filter and explore what's best for your traffic.</p>
          </div>

          {/* Upload and Search Section */}
          <div className="mb-8 grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload Offers (JSON)
              </label>
              <input 
                type="file" 
                accept="application/json" 
                onChange={handleFileUpload} 
                className="input-field"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400">Upload a JSON file containing your offers data</p>
            </div>
            <div className="space-y-2">
              <label className="font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search Offers
              </label>
              <input 
                type="text" 
                placeholder="Search by title, GEO or category..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="input-field"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400">{filteredOffers.length} offers found</p>
            </div>
          </div>
          {/* Add Offer Form */}
          <div className="card p-6 mb-8 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/30 dark:to-blue-900/30 border-purple-200 dark:border-purple-700">
            <h3 className="text-2xl font-bold mb-4 flex items-center text-purple-700 dark:text-purple-300">
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Offer Manually
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const newOffer = {
                  title: e.target.title.value,
                  geo: e.target.geo.value,
                  payout: e.target.payout.value,
                  category: e.target.category.value,
                  description: e.target.description.value,
                };
                setOffers([...offers, newOffer]);
                e.target.reset();
              }}
              className="grid gap-4 md:grid-cols-2"
            >
              <input 
                name="title" 
                required 
                className="input-field" 
                placeholder="Offer Title"
              />
              <input 
                name="geo" 
                required 
                className="input-field" 
                placeholder="Target GEOs (e.g. US, CA)"
              />
              <input 
                name="payout" 
                required 
                className="input-field" 
                placeholder="Payout (e.g. $45/lead)"
              />
              <input 
                name="category" 
                required 
                className="input-field" 
                placeholder="Category (e.g. Health, Finance)"
              />
              <textarea 
                name="description" 
                required 
                className="input-field md:col-span-2" 
                rows="3" 
                placeholder="Brief description"
              ></textarea>
              <div className="md:col-span-2">
                <button 
                  type="submit" 
                  className="btn-primary w-full md:w-auto flex items-center justify-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add Offer
                </button>
              </div>
            </form>
          </div>
          {/* Offers Table */}
          {filteredOffers.length === 0 ? (
            <div className="text-center py-20 animate-fade-in-scale">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-gray-500 dark:text-gray-400 text-2xl font-semibold mb-2">No offers yet</div>
              <p className="text-gray-400 dark:text-gray-500 mb-6">Upload a JSON file or add offers manually to get started</p>
            </div>
          ) : (
            <div className="card p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/50 dark:to-blue-900/50">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold text-purple-700 dark:text-purple-300">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                          </svg>
                          Title
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left font-semibold text-purple-700 dark:text-purple-300">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                          </svg>
                          Category
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left font-semibold text-purple-700 dark:text-purple-300">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          Target GEO
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left font-semibold text-purple-700 dark:text-purple-300">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                          </svg>
                          Payout
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left font-semibold text-purple-700 dark:text-purple-300">Description</th>
                      <th className="px-6 py-4 text-left font-semibold text-purple-700 dark:text-purple-300">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOffers.map((offer, index) => (
                      <tr 
                        key={index} 
                        className="border-b border-gray-100 dark:border-gray-700 hover:bg-purple-50/50 dark:hover:bg-purple-900/20 transition-colors group"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm mr-3 group-hover:scale-110 transition-transform">
                              {offer.title.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                {offer.title}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">Premium Offer</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                            {offer.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            {offer.geo}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-green-600 dark:text-green-400 text-lg">
                            {offer.payout}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                            {offer.description}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-md hover:shadow-lg flex items-center text-sm">
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                            </svg>
                            Contact
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
