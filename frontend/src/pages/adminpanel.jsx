import React, { useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { entityAPI } from '../services/entity';
import AdminReviewsModeration from '../components/AdminReviewsModeration';
import Navbar from '../components/navbar';

export default function AdminPanelPage() {
  // State for active tab
  const [activeTab, setActiveTab] = useState('entities');

  const [users, setUsers] = React.useState([
    { id: 1, name: "John Doe", role: "Affiliate", status: "active" },
    { id: 2, name: "Jane Smith", role: "Advertiser", status: "banned" },
    { id: 3, name: "Admin Bot", role: "Admin", status: "active" }
  ]);

  // State for entities
  const [entities, setEntities] = useState([]);
  const [loadingEntities, setLoadingEntities] = useState(true);
  const [errorEntities, setErrorEntities] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'pending', 'approved', 'rejected'

  // State for entity details modal
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState(null);

  // Fetch entities
  useEffect(() => {
    const fetchEntities = async () => {
      try {
        setLoadingEntities(true);
        setErrorEntities(null);
        let filters = {};
        if (filterStatus !== 'all') {
          filters.verification_status = filterStatus;
        }
        const data = await entityAPI.getAllEntities(filters);
        setEntities(data.entities || []); // Assuming the API returns { entities: [...] }
      } catch (err) {
        setErrorEntities(err.message || 'Failed to fetch entities');
        setEntities([]); // Clear entities on error
      } finally {
        setLoadingEntities(false);
      }
    };

    fetchEntities();
  }, [filterStatus]);

  const handleUserToggle = (id) => {
    setUsers(users.map((u) =>
      u.id === id ? { ...u, status: u.status === "active" ? "banned" : "active" } : u
    ));
  };

  const handleApproveEntity = async (entityId) => {
    try {
      await entityAPI.updateVerificationStatus(entityId, 'approved');
      setEntities(prevEntities =>
        prevEntities.map(e => e._id === entityId ? { ...e, verification_status: 'approved' } : e)
      );
      // Optionally refetch or filter locally
      if (filterStatus !== 'all' && filterStatus !== 'approved') {
        setEntities(prevEntities => prevEntities.filter(e => e._id !== entityId));
      }
    } catch (error) {
      console.error("Failed to approve entity:", error);
      // Display error to user
    }
  };

  const handleRejectEntity = async (entityId) => {
    try {
      await entityAPI.updateVerificationStatus(entityId, 'rejected');
      setEntities(prevEntities =>
        prevEntities.map(e => e._id === entityId ? { ...e, verification_status: 'rejected' } : e)
      );
      if (filterStatus !== 'all' && filterStatus !== 'rejected') {
        setEntities(prevEntities => prevEntities.filter(e => e._id !== entityId));
      }
    } catch (error) {
      console.error("Failed to reject entity:", error);
      // Display error to user
    }
  };

  const handleDeleteEntity = async (entityId) => {
    if (window.confirm('Are you sure you want to delete this entity?')) {
      try {
        await entityAPI.deleteEntity(entityId);
        setEntities(prevEntities => prevEntities.filter(e => e._id !== entityId));
      } catch (error) {
        console.error("Failed to delete entity:", error);
        // Display error to user
      }
    }
  };

  const handleLogout = () => {
    // Clear API storage
    authAPI.logout();

    // Force a page refresh to ensure clean state
    window.location.reload();
  };

  const handleViewDetails = (entity) => {
    setSelectedEntity(entity);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedEntity(null);
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col">
      <Navbar />
      
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-1/2 transform -translate-x-1/2 w-80 h-80 bg-pink-200/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <section className="relative pt-24 pb-16 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-tr from-purple-600 to-blue-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h2 className="text-4xl font-extrabold text-purple-700 dark:text-purple-300 tracking-tight drop-shadow-lg">Admin Panel</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Manage entities, reviews, and users</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="group bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl shadow-lg font-bold transition-all transform hover:scale-105 hover:shadow-xl"
          >
            <svg className="w-5 h-5 inline mr-2 group-hover:rotate-12 transition-transform" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
            </svg>
            Logout
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/80 dark:bg-gray-900/80 rounded-2xl shadow-xl p-2 mb-8 backdrop-blur-md border border-purple-100 dark:border-gray-800">
          <nav className="flex space-x-1">
            <button
              onClick={() => setActiveTab('entities')}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold text-lg transition-all duration-200 ${activeTab === 'entities'
                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg transform scale-105'
                : 'text-gray-600 dark:text-gray-400 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-gray-800'
                }`}
            >
              <svg className="w-5 h-5 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
              </svg>
              Entity Management
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold text-lg transition-all duration-200 ${activeTab === 'reviews'
                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg transform scale-105'
                : 'text-gray-600 dark:text-gray-400 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-gray-800'
                }`}
            >
              <svg className="w-5 h-5 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Review Moderation
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold text-lg transition-all duration-200 ${activeTab === 'users'
                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg transform scale-105'
                : 'text-gray-600 dark:text-gray-400 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-gray-800'
                }`}
            >
              <svg className="w-5 h-5 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12a1 1 0 001-1v-3a1 1 0 10-2 0v3a1 1 0 001 1zm0 4a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
              </svg>
              User Management
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'entities' && (
          <div className="bg-white/80 dark:bg-gray-900/80 rounded-2xl shadow-xl p-8 backdrop-blur-md border border-purple-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-purple-700 dark:text-purple-300">Entity Management</h3>
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by status:</span>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:outline-none transition"
                >
                  <option value="all">All Entities</option>
                  <option value="pending">Pending Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            {loadingEntities && (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                <span className="ml-4 text-gray-600 dark:text-gray-400 text-lg">Loading entities...</span>
              </div>
            )}

            {errorEntities && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700 shadow">
                <svg className="w-6 h-6 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Error: {errorEntities}
              </div>
            )}

            {!loadingEntities && !errorEntities && (
              <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                      <tr>
                        <th className="px-6 py-4 text-left font-semibold">Entity Name</th>
                        <th className="px-6 py-4 text-left font-semibold">Type</th>
                        <th className="px-6 py-4 text-left font-semibold">Email</th>
                        <th className="px-6 py-4 text-left font-semibold">Status</th>
                        <th className="px-6 py-4 text-left font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {entities.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                            <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                            <p className="text-lg">No entities found for "{filterStatus}" status.</p>
                            <p className="text-sm mt-1">Try adjusting your filter criteria</p>
                          </td>
                        </tr>
                      ) : (
                        entities.map((entity, index) => (
                          <tr key={entity._id} className={`${index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'} hover:bg-purple-50 dark:hover:bg-gray-700 transition-colors`}>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-lg mr-3">
                                  {entity.name?.charAt(0)?.toUpperCase() || 'E'}
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-900 dark:text-gray-100">{entity.name}</div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">ID: {entity._id}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                {entity.entity_type}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-gray-900 dark:text-gray-100">{entity.email}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${entity.verification_status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                  entity.verification_status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                }`}>
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  {entity.verification_status === 'approved' ? (
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  ) : entity.verification_status === 'rejected' ? (
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                  ) : (
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                  )}
                                </svg>
                                {entity.verification_status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleViewDetails(entity)}
                                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors transform hover:scale-105"
                                >
                                  <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                  </svg>
                                  View
                                </button>
                                {entity.verification_status === 'pending' && (
                                  <>
                                    <button
                                      onClick={() => handleApproveEntity(entity.entity_id)}
                                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors transform hover:scale-105"
                                    >
                                      <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                      Approve
                                    </button>
                                    <button
                                      onClick={() => handleRejectEntity(entity._id)}
                                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors transform hover:scale-105"
                                    >
                                      <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                      </svg>
                                      Reject
                                    </button>
                                  </>
                                )}
                                {entity.verification_status === 'approved' && (
                                  <button
                                    onClick={() => handleRejectEntity(entity._id)}
                                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors transform hover:scale-105"
                                  >
                                    <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                    Reject
                                  </button>
                                )}
                                {entity.verification_status === 'rejected' && (
                                  <button
                                    onClick={() => handleApproveEntity(entity.entity_id)}
                                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors transform hover:scale-105"
                                  >
                                    <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    Approve
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteEntity(entity._id)}
                                  className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors transform hover:scale-105"
                                >
                                  <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="bg-white/80 dark:bg-gray-900/80 rounded-2xl shadow-xl p-8 backdrop-blur-md border border-purple-100 dark:border-gray-800">
            <h3 className="text-2xl font-bold text-purple-700 dark:text-purple-300 mb-6">Review Moderation</h3>
            <AdminReviewsModeration />
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white/80 dark:bg-gray-900/80 rounded-2xl shadow-xl p-8 backdrop-blur-md border border-purple-100 dark:border-gray-800">
            <h3 className="text-2xl font-bold text-purple-700 dark:text-purple-300 mb-6">User Management</h3>
            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold">User Name</th>
                      <th className="px-6 py-4 text-left font-semibold">Role</th>
                      <th className="px-6 py-4 text-left font-semibold">Status</th>
                      <th className="px-6 py-4 text-left font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {users.map((user, index) => (
                      <tr key={user.id} className={`${index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'} hover:bg-purple-50 dark:hover:bg-gray-700 transition-colors`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-lg mr-3">
                              {user.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 dark:text-gray-100">{user.name}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">ID: {user.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${user.role === 'Admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                              user.role === 'Advertiser' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            }`}>
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                            </svg>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${user.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                              'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}>
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              {user.status === 'active' ? (
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              ) : (
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              )}
                            </svg>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleUserToggle(user.id)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors transform hover:scale-105 ${user.status === "active" ?
                                'bg-red-500 hover:bg-red-600 text-white' :
                                'bg-green-500 hover:bg-green-600 text-white'
                              }`}
                          >
                            <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                              {user.status === "active" ? (
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              ) : (
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              )}
                            </svg>
                            {user.status === "active" ? "Ban User" : "Unban User"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Entity Details Modal */}
        {showDetailsModal && selectedEntity && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-y-auto mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Entity Details</h3>
                <button
                  onClick={closeDetailsModal}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-lg mb-2">Basic Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Name:</strong> {selectedEntity.name}</p>
                    <p><strong>Entity Type:</strong> {selectedEntity.entity_type}</p>
                    <p><strong>Email:</strong> {selectedEntity.contact_info?.email || selectedEntity.email}</p>
                    <p><strong>Phone:</strong> {selectedEntity.contact_info?.phone || 'N/A'}</p>
                    <p><strong>Teams:</strong> {selectedEntity.contact_info?.teams || 'N/A'}</p>
                    <p><strong>LinkedIn:</strong> {selectedEntity.contact_info?.linkedin || 'N/A'}</p>
                    <p><strong>Website:</strong> {selectedEntity?.website || 'N/A'}</p>
                    <p><strong>Address:</strong> {selectedEntity.contact_info?.address || 'N/A'}</p>
                    <p><strong>Description:</strong> {selectedEntity.description || 'N/A'}</p>
                    <p><strong>Additional Notes:</strong> {selectedEntity.additional_notes || 'N/A'}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-lg mb-2">Status & Verification</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Verification Status:</strong>
                      <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${selectedEntity.verification_status === 'approved' ? 'bg-green-100 text-green-800' :
                        selectedEntity.verification_status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                        {selectedEntity.verification_status}
                      </span>
                    </p>
                    {selectedEntity.verification_status === 'approved' && (
                      <p>
                        <strong>User Account:</strong>
                        <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${selectedEntity.user_account_created ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                          {selectedEntity.user_account_created ? 'Created' : 'Not Created'}
                        </span>
                        {selectedEntity.user_account_created && (
                          <span className="ml-2 text-xs text-gray-500">
                            (Login email sent to {selectedEntity.email})
                          </span>
                        )}
                      </p>
                    )}
                    <p><strong>Created At:</strong> {selectedEntity.created_at ? new Date(selectedEntity.created_at).toLocaleDateString() : 'N/A'}</p>
                    <p><strong>Updated At:</strong> {selectedEntity.updated_at ? new Date(selectedEntity.updated_at).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Entity Type Specific Fields */}
              {selectedEntity.entity_type === 'advertiser' && selectedEntity.entity_metadata && (
                <div className="mt-4">
                  <h4 className="font-semibold text-lg mb-2">Advertiser Specific</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Company Name:</strong> {selectedEntity.entity_metadata.company_name || 'N/A'}</p>
                    <p><strong>Program Name:</strong> {selectedEntity.entity_metadata.program_name || 'N/A'}</p>
                    <p><strong>Program Category:</strong> {selectedEntity.entity_metadata.program_category || 'N/A'}</p>
                    <p><strong>Advertising Verticals:</strong> {
                      Array.isArray(selectedEntity.entity_metadata.industries)
                        ? selectedEntity.entity_metadata.industries.join(', ')
                        : selectedEntity.entity_metadata.industries || 'N/A'
                    }</p>
                    <p><strong>Signup URL: </strong>
                      <a
                        href={selectedEntity.entity_metadata.signup_url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {selectedEntity.entity_metadata.signup_url || 'N/A'}
                      </a>
                    </p>
                    <p><strong>Payment Terms:</strong> {selectedEntity.entity_metadata.payment_terms || 'N/A'}</p>
                    <p><strong>Payout Types:</strong> {
                      Array.isArray(selectedEntity.entity_metadata.payout_types)
                        ? selectedEntity.entity_metadata.payout_types.join(', ')
                        : selectedEntity.entity_metadata.payout_types || 'N/A'
                    }</p>
                    <p><strong>Referral Commission:</strong> {selectedEntity.entity_metadata.referral_commission || 'N/A'}</p>

                  </div>
                </div>
              )}

              {selectedEntity.entity_type === 'affiliate' && selectedEntity.entity_metadata && (
                <div className="mt-4">
                  <h4 className="font-semibold text-lg mb-2">Affiliate Specific</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Traffic Sources:</strong> {
                      Array.isArray(selectedEntity.entity_metadata.traffic_provided_geos)
                        ? selectedEntity.entity_metadata.traffic_provided_geos.join(', ')
                        : selectedEntity.entity_metadata.traffic_provided_geos || 'N/A'
                    }</p>
                    <p><strong>Veticals:</strong> {
                      Array.isArray(selectedEntity.entity_metadata.verticals)
                        ? selectedEntity.entity_metadata.verticals.join(', ')
                        : selectedEntity.entity_metadata.verticals || 'N/A'
                    }</p>
                    <p><strong>Monthly Revenue:</strong> {selectedEntity.entity_metadata.monthly_revenue || 'N/A'}</p>
                  </div>
                </div>
              )}

              {selectedEntity.entity_type === 'network' && selectedEntity.entity_metadata && (
                <div className="mt-4">
                  <h4 className="font-semibold text-lg mb-2">Network Specific</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Verticals:</strong> {
                      Array.isArray(selectedEntity.entity_metadata.verticals)
                        ? selectedEntity.entity_metadata.verticals.join(', ')
                        : selectedEntity.entity_metadata.verticals || 'N/A'
                    }</p>
                    <p><strong>Signup URL: </strong>
                      <a
                        href={selectedEntity.entity_metadata.signup_url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {selectedEntity.entity_metadata.signup_url || 'N/A'}
                      </a>
                    </p>
                    <p><strong>Payment Models:</strong> {
                      Array.isArray(selectedEntity.entity_metadata.supported_models)
                        ? selectedEntity.entity_metadata.supported_models.join(', ')
                        : selectedEntity.entity_metadata.supported_models || 'N/A'
                    }</p>
                    <p><strong>Minimum Payout:</strong> {selectedEntity.entity_metadata.minimum_payout || 'N/A'}</p>
                    <p><strong>Referral Commission:</strong> {selectedEntity.entity_metadata.referral_commission || 'N/A'}</p>
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  onClick={closeDetailsModal}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
