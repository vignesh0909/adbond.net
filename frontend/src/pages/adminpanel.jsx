import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { authAPI } from '../services/auth';
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

  // Loading states for individual entity actions
  const [loadingStates, setLoadingStates] = useState({});

  // Helper function to set loading state for specific entity
  const setEntityLoading = (entityId, isLoading) => {
    setLoadingStates(prev => ({
      ...prev,
      [entityId]: isLoading
    }));
  };

  // Helper function to get the correct entity ID from entity object
  const getEntityId = (entity) => {
    return entity._id || entity.entity_id || entity.id;
  };

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
        console.log('Fetched entities data:', data);
        console.log('Entities array:', data.entities);
        if (data.entities && data.entities.length > 0) {
          console.log('First entity sample:', data.entities[0]);
          console.log('Entity ID fields:', {
            _id: data.entities[0]._id,
            entity_id: data.entities[0].entity_id,
            id: data.entities[0].id
          });
        }
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
    console.log('Approving entity with ID:', entityId);
    console.log('Entity object:', entities.find(e => getEntityId(e) === entityId));

    setEntityLoading(entityId, true);

    try {
      await entityAPI.updateVerificationStatus(entityId, 'approved');
      setEntities(prevEntities =>
        prevEntities.map(e => getEntityId(e) === entityId ? { ...e, verification_status: 'approved' } : e)
      );

      // Show success toast
      toast.success('Entity approved successfully!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Optionally refetch or filter locally
      if (filterStatus !== 'all' && filterStatus !== 'approved') {
        setEntities(prevEntities => prevEntities.filter(e => getEntityId(e) !== entityId));
      }
    } catch (error) {
      console.error("Failed to approve entity:", error);

      // Show error toast
      toast.error('Failed to approve entity. Please try again.', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setEntityLoading(entityId, false);
    }
  };

  const handleRejectEntity = async (entityId) => {
    setEntityLoading(entityId, true);

    try {
      await entityAPI.updateVerificationStatus(entityId, 'rejected');
      setEntities(prevEntities =>
        prevEntities.map(e => getEntityId(e) === entityId ? { ...e, verification_status: 'rejected' } : e)
      );

      // Show success toast
      toast.success('Entity rejected successfully!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      if (filterStatus !== 'all' && filterStatus !== 'rejected') {
        setEntities(prevEntities => prevEntities.filter(e => getEntityId(e) !== entityId));
      }
    } catch (error) {
      console.error("Failed to reject entity:", error);

      // Show error toast
      toast.error('Failed to reject entity. Please try again.', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setEntityLoading(entityId, false);
    }
  };

  const handleDeleteEntity = async (entityId) => {
    if (window.confirm('Are you sure you want to delete this entity?')) {
      setEntityLoading(entityId, true);

      try {
        await entityAPI.deleteEntity(entityId);
        setEntities(prevEntities => prevEntities.filter(e => getEntityId(e) !== entityId));

        // Show success toast
        toast.success('Entity deleted successfully!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } catch (error) {
        console.error("Failed to delete entity:", error);

        // Show error toast
        toast.error('Failed to delete entity. Please try again.', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } finally {
        setEntityLoading(entityId, false);
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

      <section className="relative pt-24 pb-16 px-4 sm:px-6 max-w-8xl mx-auto w-full">
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
                          <tr key={getEntityId(entity)} className={`${index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'} hover:bg-purple-50 dark:hover:bg-gray-700 transition-colors`}>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-lg mr-3">
                                  {entity.name?.charAt(0)?.toUpperCase() || 'E'}
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-900 dark:text-gray-100">{entity.name}</div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">ID: {getEntityId(entity)}</div>
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
                                      onClick={() => handleApproveEntity(getEntityId(entity))}
                                      disabled={loadingStates[getEntityId(entity)]}
                                      className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 disabled:cursor-not-allowed text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors transform hover:scale-105 disabled:hover:scale-100 flex items-center"
                                    >
                                      {loadingStates[getEntityId(entity)] ? (
                                        <>
                                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                                          <span>Approving...</span>
                                        </>
                                      ) : (
                                        <>
                                          <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                          </svg>
                                          Approve
                                        </>
                                      )}
                                    </button>
                                    <button
                                      onClick={() => handleRejectEntity(getEntityId(entity))}
                                      disabled={loadingStates[getEntityId(entity)]}
                                      className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors transform hover:scale-105 disabled:hover:scale-100 flex items-center"
                                    >
                                      {loadingStates[getEntityId(entity)] ? (
                                        <>
                                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                                          <span>Rejecting...</span>
                                        </>
                                      ) : (
                                        <>
                                          <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                          </svg>
                                          Reject
                                        </>
                                      )}
                                    </button>
                                  </>
                                )}
                                {entity.verification_status === 'approved' && (
                                  <button
                                    onClick={() => handleRejectEntity(getEntityId(entity))}
                                    disabled={loadingStates[getEntityId(entity)]}
                                    className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors transform hover:scale-105 disabled:hover:scale-100 flex items-center"
                                  >
                                    {loadingStates[getEntityId(entity)] ? (
                                      <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                                        <span>Rejecting...</span>
                                      </>
                                    ) : (
                                      <>
                                        <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                        Reject
                                      </>
                                    )}
                                  </button>
                                )}
                                {entity.verification_status === 'rejected' && (
                                  <button
                                    onClick={() => handleApproveEntity(getEntityId(entity))}
                                    disabled={loadingStates[getEntityId(entity)]}
                                    className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 disabled:cursor-not-allowed text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors transform hover:scale-105 disabled:hover:scale-100 flex items-center"
                                  >
                                    {loadingStates[getEntityId(entity)] ? (
                                      <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                                        <span>Approving...</span>
                                      </>
                                    ) : (
                                      <>
                                        <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        Approve
                                      </>
                                    )}
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteEntity(getEntityId(entity))}
                                  disabled={loadingStates[getEntityId(entity)]}
                                  className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors transform hover:scale-105 disabled:hover:scale-100 flex items-center"
                                >
                                  {loadingStates[getEntityId(entity)] ? (
                                    <>
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                                      <span>Deleting...</span>
                                    </>
                                  ) : (
                                    <>
                                      <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                      </svg>
                                      Delete
                                    </>
                                  )}
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
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-gradient-to-br from-white via-purple-50/50 to-blue-50/50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 backdrop-blur-lg rounded-3xl shadow-2xl border border-purple-200/30 dark:border-purple-700/30 max-w-6xl max-h-[95vh] overflow-hidden mx-4 transform transition-all animate-slideUp">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-blue-500/30"></div>
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-blue-300/20 rounded-full blur-2xl"></div>
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-white/20 to-white/10 rounded-3xl flex items-center justify-center text-white font-bold text-3xl backdrop-blur-md border border-white/20 shadow-lg">
                      {selectedEntity.name?.charAt(0)?.toUpperCase() || 'E'}
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-white mb-2 tracking-tight">Entity Details</h3>
                      <p className="text-purple-100 text-xl font-medium">{selectedEntity.name}</p>
                      <div className="flex items-center space-x-4 mt-3">
                        <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold backdrop-blur-md border border-white/30 ${
                          selectedEntity.verification_status === 'approved' 
                            ? 'bg-green-500/80 text-white' 
                            : selectedEntity.verification_status === 'rejected' 
                            ? 'bg-red-500/80 text-white' 
                            : 'bg-yellow-500/80 text-white'
                        }`}>
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            {selectedEntity.verification_status === 'approved' ? (
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            ) : selectedEntity.verification_status === 'rejected' ? (
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            ) : (
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            )}
                          </svg>
                          {selectedEntity.verification_status?.toUpperCase()}
                        </span>
                        <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold bg-white/20 text-white backdrop-blur-md border border-white/30">
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                          </svg>
                          {selectedEntity.entity_type?.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={closeDetailsModal}
                    className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-2xl flex items-center justify-center text-white hover:text-gray-100 transition-all duration-200 backdrop-blur-md border border-white/30 hover:scale-110 hover:rotate-90"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-8 overflow-y-auto max-h-[calc(95vh-200px)] space-y-8">
                
                {/* Main Information Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  {/* Basic Information Card */}
                  <div className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-3xl p-8 shadow-lg border border-purple-200/50 dark:border-purple-700/30 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <h4 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Basic Information</h4>
                    </div>
                    
                    <div className="space-y-5">
                      {[
                        { label: 'Entity Name', value: selectedEntity.name || 'N/A', icon: '👤' },
                        { label: 'Email', value: selectedEntity.contact_info?.email || selectedEntity.email || 'N/A', icon: '📧' },
                        { label: 'Phone', value: selectedEntity.contact_info?.phone || 'N/A', icon: '📱' },
                        { label: 'Teams', value: selectedEntity.contact_info?.teams || 'N/A', icon: '👥' },
                        { label: 'LinkedIn', value: selectedEntity.contact_info?.linkedin || 'N/A', icon: '💼' },
                        { label: 'Address', value: selectedEntity.contact_info?.address || 'N/A', icon: '📍' }
                      ].map((item, index) => (
                        <div key={index} className="bg-gradient-to-r from-purple-50/80 to-blue-50/80 dark:from-purple-900/30 dark:to-blue-900/30 p-4 rounded-2xl border border-purple-100/50 dark:border-purple-700/30 hover:from-purple-100/80 hover:to-blue-100/80 transition-all">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <span className="text-lg">{item.icon}</span>
                              <span className="font-semibold text-purple-700 dark:text-purple-300">{item.label}</span>
                            </div>
                            <span className="text-gray-900 dark:text-gray-100 font-medium text-right max-w-xs truncate" title={item.value}>
                              {item.value}
                            </span>
                          </div>
                        </div>
                      ))}
                      
                      {/* Website Field */}
                      <div className="bg-gradient-to-r from-purple-50/80 to-blue-50/80 dark:from-purple-900/30 dark:to-blue-900/30 p-4 rounded-2xl border border-purple-100/50 dark:border-purple-700/30 hover:from-purple-100/80 hover:to-blue-100/80 transition-all">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-lg">🌐</span>
                            <span className="font-semibold text-purple-700 dark:text-purple-300">Website</span>
                          </div>
                          <span className="text-gray-900 dark:text-gray-100 font-medium max-w-xs">
                            {selectedEntity?.website ? (
                              <a 
                                href={selectedEntity.website} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                              >
                                {selectedEntity.website}
                              </a>
                            ) : 'N/A'}
                          </span>
                        </div>
                      </div>

                      {/* Created Date */}
                      <div className="bg-gradient-to-r from-purple-50/80 to-blue-50/80 dark:from-purple-900/30 dark:to-blue-900/30 p-4 rounded-2xl border border-purple-100/50 dark:border-purple-700/30 hover:from-purple-100/80 hover:to-blue-100/80 transition-all">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-lg">📅</span>
                            <span className="font-semibold text-purple-700 dark:text-purple-300">Created</span>
                          </div>
                          <span className="text-gray-900 dark:text-gray-100 font-medium">
                            {selectedEntity.created_at ? new Date(selectedEntity.created_at).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status & Verification Card */}
                  <div className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-3xl p-8 shadow-lg border border-green-200/50 dark:border-green-700/30 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <h4 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Status & Verification</h4>
                    </div>
                    
                    <div className="space-y-5">
                      {selectedEntity.verification_status === 'approved' && (
                        <div className="bg-gradient-to-r from-green-50/80 to-emerald-50/80 dark:from-green-900/30 dark:to-emerald-900/30 p-5 rounded-2xl border border-green-100/50 dark:border-green-700/30">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <span className="text-lg">👤</span>
                              <span className="font-semibold text-green-700 dark:text-green-300">User Account</span>
                            </div>
                            <span className={`px-4 py-2 rounded-xl font-bold text-sm ${
                              selectedEntity.user_account_created 
                                ? 'bg-green-500 text-white' 
                                : 'bg-gray-400 text-white'
                            }`}>
                              {selectedEntity.user_account_created ? '✅ Created' : '❌ Not Created'}
                            </span>
                          </div>
                          {selectedEntity.user_account_created && (
                            <div className="bg-green-100/80 dark:bg-green-900/20 p-3 rounded-xl border border-green-200/50">
                              <p className="text-sm text-green-800 dark:text-green-200 flex items-center">
                                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                </svg>
                                Login email sent to <strong>{selectedEntity.email}</strong>
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="bg-gradient-to-r from-green-50/80 to-emerald-50/80 dark:from-green-900/30 dark:to-emerald-900/30 p-4 rounded-2xl border border-green-100/50 dark:border-green-700/30">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-lg">🕐</span>
                            <span className="font-semibold text-green-700 dark:text-green-300">Last Updated</span>
                          </div>
                          <span className="text-gray-900 dark:text-gray-100 font-medium">
                            {selectedEntity.updated_at ? new Date(selectedEntity.updated_at).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description & Notes Card */}
                {(selectedEntity.description || selectedEntity.additional_notes) && (
                  <div className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-3xl p-8 shadow-lg border border-indigo-200/50 dark:border-indigo-700/30 hover:shadow-xl transition-all duration-300 hover:scale-[1.01]">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <h4 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Description & Notes</h4>
                    </div>
                    
                    <div className="space-y-6">
                      {selectedEntity.description && (
                        <div className="bg-gradient-to-r from-indigo-50/80 to-purple-50/80 dark:from-indigo-900/30 dark:to-purple-900/30 p-6 rounded-2xl border border-indigo-100/50 dark:border-indigo-700/30">
                          <div className="flex items-center mb-3">
                            <span className="text-lg mr-3">📝</span>
                            <span className="font-bold text-indigo-700 dark:text-indigo-300 text-lg">Description</span>
                          </div>
                          <p className="text-gray-900 dark:text-gray-100 leading-relaxed text-base">{selectedEntity.description}</p>
                        </div>
                      )}
                      {selectedEntity.additional_notes && (
                        <div className="bg-gradient-to-r from-indigo-50/80 to-purple-50/80 dark:from-indigo-900/30 dark:to-purple-900/30 p-6 rounded-2xl border border-indigo-100/50 dark:border-indigo-700/30">
                          <div className="flex items-center mb-3">
                            <span className="text-lg mr-3">🗒️</span>
                            <span className="font-bold text-indigo-700 dark:text-indigo-300 text-lg">Additional Notes</span>
                          </div>
                          <p className="text-gray-900 dark:text-gray-100 leading-relaxed text-base">{selectedEntity.additional_notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Advertiser Details */}
                {selectedEntity.entity_type === 'advertiser' && selectedEntity.entity_metadata && (
                  <div className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-3xl p-8 shadow-lg border border-orange-200/50 dark:border-orange-700/30 hover:shadow-xl transition-all duration-300 hover:scale-[1.01]">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <h4 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Advertiser Details</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-5">
                        {[
                          { label: 'Company Name', value: selectedEntity.entity_metadata.company_name, icon: '🏢' },
                          { label: 'Program Name', value: selectedEntity.entity_metadata.program_name, icon: '🎯' },
                          { label: 'Category', value: selectedEntity.entity_metadata.program_category, icon: '📂' },
                          { label: 'Payment Terms', value: selectedEntity.entity_metadata.payment_terms, icon: '💳' }
                        ].map((item, index) => (
                          <div key={index} className="bg-gradient-to-r from-orange-50/80 to-red-50/80 dark:from-orange-900/30 dark:to-red-900/30 p-4 rounded-2xl border border-orange-100/50 dark:border-orange-700/30 hover:from-orange-100/80 hover:to-red-100/80 transition-all">
                            <div className="flex items-center space-x-3 mb-2">
                              <span className="text-lg">{item.icon}</span>
                              <span className="font-bold text-orange-700 dark:text-orange-300">{item.label}</span>
                            </div>
                            <p className="text-gray-900 dark:text-gray-100 ml-8 font-medium">{item.value || 'N/A'}</p>
                          </div>
                        ))}
                      </div>
                      
                      <div className="space-y-5">
                        <div className="bg-gradient-to-r from-orange-50/80 to-red-50/80 dark:from-orange-900/30 dark:to-red-900/30 p-4 rounded-2xl border border-orange-100/50 dark:border-orange-700/30 hover:from-orange-100/80 hover:to-red-100/80 transition-all">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="text-lg">🎨</span>
                            <span className="font-bold text-orange-700 dark:text-orange-300">Advertising Verticals</span>
                          </div>
                          <p className="text-gray-900 dark:text-gray-100 ml-8 font-medium">{
                            Array.isArray(selectedEntity.entity_metadata.industries)
                              ? selectedEntity.entity_metadata.industries.join(', ')
                              : selectedEntity.entity_metadata.industries || 'N/A'
                          }</p>
                        </div>
                        
                        <div className="bg-gradient-to-r from-orange-50/80 to-red-50/80 dark:from-orange-900/30 dark:to-red-900/30 p-4 rounded-2xl border border-orange-100/50 dark:border-orange-700/30 hover:from-orange-100/80 hover:to-red-100/80 transition-all">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="text-lg">💰</span>
                            <span className="font-bold text-orange-700 dark:text-orange-300">Referral Commission</span>
                          </div>
                          <p className="text-gray-900 dark:text-gray-100 ml-8 font-medium">{selectedEntity.entity_metadata.referral_commission || 'N/A'}</p>
                        </div>
                        
                        <div className="bg-gradient-to-r from-orange-50/80 to-red-50/80 dark:from-orange-900/30 dark:to-red-900/30 p-4 rounded-2xl border border-orange-100/50 dark:border-orange-700/30 hover:from-orange-100/80 hover:to-red-100/80 transition-all">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="text-lg">💸</span>
                            <span className="font-bold text-orange-700 dark:text-orange-300">Payout Types</span>
                          </div>
                          <p className="text-gray-900 dark:text-gray-100 ml-8 font-medium">{
                            Array.isArray(selectedEntity.entity_metadata.payout_types)
                              ? selectedEntity.entity_metadata.payout_types.join(', ')
                              : selectedEntity.entity_metadata.payout_types || 'N/A'
                          }</p>
                        </div>
                        
                        <div className="bg-gradient-to-r from-orange-50/80 to-red-50/80 dark:from-orange-900/30 dark:to-red-900/30 p-4 rounded-2xl border border-orange-100/50 dark:border-orange-700/30 hover:from-orange-100/80 hover:to-red-100/80 transition-all">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="text-lg">🔗</span>
                            <span className="font-bold text-orange-700 dark:text-orange-300">Signup URL</span>
                          </div>
                          <div className="ml-8">
                            {selectedEntity.entity_metadata.signup_url ? (
                              <a
                                href={selectedEntity.entity_metadata.signup_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 hover:underline font-medium break-all transition-colors"
                              >
                                {selectedEntity.entity_metadata.signup_url}
                              </a>
                            ) : (
                              <span className="text-gray-900 dark:text-gray-100 font-medium">N/A</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Affiliate Details */}
                {selectedEntity.entity_type === 'affiliate' && selectedEntity.entity_metadata && (
                  <div className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-3xl p-8 shadow-lg border border-blue-200/50 dark:border-blue-700/30 hover:shadow-xl transition-all duration-300 hover:scale-[1.01]">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                        </svg>
                      </div>
                      <h4 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Affiliate Details</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        { 
                          label: 'Traffic Sources', 
                          value: Array.isArray(selectedEntity.entity_metadata.traffic_provided_geos)
                            ? selectedEntity.entity_metadata.traffic_provided_geos.join(', ')
                            : selectedEntity.entity_metadata.traffic_provided_geos,
                          icon: '🌐'
                        },
                        { 
                          label: 'Verticals', 
                          value: Array.isArray(selectedEntity.entity_metadata.verticals)
                            ? selectedEntity.entity_metadata.verticals.join(', ')
                            : selectedEntity.entity_metadata.verticals,
                          icon: '🎯'
                        },
                        { 
                          label: 'Monthly Revenue', 
                          value: selectedEntity.entity_metadata.monthly_revenue,
                          icon: '💰'
                        }
                      ].map((item, index) => (
                        <div key={index} className="bg-gradient-to-r from-blue-50/80 to-cyan-50/80 dark:from-blue-900/30 dark:to-cyan-900/30 p-5 rounded-2xl border border-blue-100/50 dark:border-blue-700/30 hover:from-blue-100/80 hover:to-cyan-100/80 transition-all">
                          <div className="flex items-center space-x-3 mb-3">
                            <span className="text-xl">{item.icon}</span>
                            <span className="font-bold text-blue-700 dark:text-blue-300 text-lg">{item.label}</span>
                          </div>
                          <p className="text-gray-900 dark:text-gray-100 ml-10 font-medium leading-relaxed">{item.value || 'N/A'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Network Details */}
                {selectedEntity.entity_type === 'network' && selectedEntity.entity_metadata && (
                  <div className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-3xl p-8 shadow-lg border border-green-200/50 dark:border-green-700/30 hover:shadow-xl transition-all duration-300 hover:scale-[1.01]">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <h4 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">Network Details</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-5">
                        {[
                          { 
                            label: 'Verticals', 
                            value: Array.isArray(selectedEntity.entity_metadata.verticals)
                              ? selectedEntity.entity_metadata.verticals.join(', ')
                              : selectedEntity.entity_metadata.verticals,
                            icon: '🎯'
                          },
                          { 
                            label: 'Minimum Payout', 
                            value: selectedEntity.entity_metadata.minimum_payout,
                            icon: '💸'
                          },
                          { 
                            label: 'Referral Commission', 
                            value: selectedEntity.entity_metadata.referral_commission,
                            icon: '💰'
                          }
                        ].map((item, index) => (
                          <div key={index} className="bg-gradient-to-r from-green-50/80 to-teal-50/80 dark:from-green-900/30 dark:to-teal-900/30 p-5 rounded-2xl border border-green-100/50 dark:border-green-700/30 hover:from-green-100/80 hover:to-teal-100/80 transition-all">
                            <div className="flex items-center space-x-3 mb-3">
                              <span className="text-xl">{item.icon}</span>
                              <span className="font-bold text-green-700 dark:text-green-300 text-lg">{item.label}</span>
                            </div>
                            <p className="text-gray-900 dark:text-gray-100 ml-10 font-medium leading-relaxed">{item.value || 'N/A'}</p>
                          </div>
                        ))}
                      </div>
                      
                      <div className="space-y-5">
                        <div className="bg-gradient-to-r from-green-50/80 to-teal-50/80 dark:from-green-900/30 dark:to-teal-900/30 p-5 rounded-2xl border border-green-100/50 dark:border-green-700/30 hover:from-green-100/80 hover:to-teal-100/80 transition-all">
                          <div className="flex items-center space-x-3 mb-3">
                            <span className="text-xl">💳</span>
                            <span className="font-bold text-green-700 dark:text-green-300 text-lg">Payment Models</span>
                          </div>
                          <p className="text-gray-900 dark:text-gray-100 ml-10 font-medium leading-relaxed">{
                            Array.isArray(selectedEntity.entity_metadata.supported_models)
                              ? selectedEntity.entity_metadata.supported_models.join(', ')
                              : selectedEntity.entity_metadata.supported_models || 'N/A'
                          }</p>
                        </div>
                        
                        <div className="bg-gradient-to-r from-green-50/80 to-teal-50/80 dark:from-green-900/30 dark:to-teal-900/30 p-5 rounded-2xl border border-green-100/50 dark:border-green-700/30 hover:from-green-100/80 hover:to-teal-100/80 transition-all">
                          <div className="flex items-center space-x-3 mb-3">
                            <span className="text-xl">🔗</span>
                            <span className="font-bold text-green-700 dark:text-green-300 text-lg">Signup URL</span>
                          </div>
                          <div className="ml-10">
                            {selectedEntity.entity_metadata.signup_url ? (
                              <a
                                href={selectedEntity.entity_metadata.signup_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 hover:underline font-medium break-all transition-colors"
                              >
                                {selectedEntity.entity_metadata.signup_url}
                              </a>
                            ) : (
                              <span className="text-gray-900 dark:text-gray-100 font-medium">N/A</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Modal Footer */}
              <div className="bg-gradient-to-r from-purple-50/80 to-blue-50/80 dark:from-gray-800/90 dark:to-gray-700/90 p-6 border-t border-purple-200/50 dark:border-purple-700/30 backdrop-blur-md">
                <div className="flex justify-center">
                  <button
                    onClick={closeDetailsModal}
                    className="group bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 text-white px-10 py-4 rounded-2xl font-bold shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-purple-300/50 flex items-center space-x-3 text-lg"
                  >
                    <svg className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>Close Details</span>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={{ zIndex: 9999 }}
      />
    </div>
  );
}
