import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { authAPI } from '../services/auth';
import { entityAPI } from '../services/entity';
import AdminReviewsModeration from '../components/AdminReviewsModeration';
import Navbar from '../components/navbar';
import {
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Check,
  X,
  Trash2,
  LogOut,
  Shield,
  FileCheck,
  AlertTriangle,
  ChevronDown,
  User,
  Building,
  Phone,
  Mail,
  MapPin,
  Globe,
  Calendar,
  Settings,
  FolderOpen,
  UserIcon,
  Award,
  FileText,
  Megaphone,
  MapPinIcon,
  ChevronRight
} from 'lucide-react';

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
              <Shield className="w-7 h-7 text-white" />
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
            <LogOut className="w-5 h-5 inline mr-2 group-hover:rotate-12 transition-transform" />
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
              <Building className="w-5 h-5 inline mr-2" />
              Entity Management
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold text-lg transition-all duration-200 ${activeTab === 'reviews'
                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg transform scale-105'
                : 'text-gray-600 dark:text-gray-400 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-gray-800'
                }`}
            >
              <FileCheck className="w-5 h-5 inline mr-2" />
              Review Moderation
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold text-lg transition-all duration-200 ${activeTab === 'users'
                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg transform scale-105'
                : 'text-gray-600 dark:text-gray-400 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-gray-800'
                }`}
            >
              <Users className="w-5 h-5 inline mr-2" />
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
                <div className="relative">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="appearance-none bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-purple-200 dark:border-gray-700 rounded-xl px-4 py-2 pr-8 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <option value="all">All Entities</option>
                    <option value="pending">Pending Review</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-purple-600 dark:text-purple-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
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
                <AlertTriangle className="w-6 h-6 inline mr-2" />
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
                            <FolderOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
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
                                {entity.verification_status === 'approved' ? (
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                ) : entity.verification_status === 'rejected' ? (
                                  <XCircle className="w-3 h-3 mr-1" />
                                ) : (
                                  <Clock className="w-3 h-3 mr-1" />
                                )}
                                {entity.verification_status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleViewDetails(entity)}
                                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                                >
                                  <Eye className="w-4 h-4 inline mr-1" />
                                  View
                                </button>
                                {entity.verification_status === 'pending' && (
                                  <>
                                    <button
                                      onClick={() => handleApproveEntity(getEntityId(entity))}
                                      disabled={loadingStates[getEntityId(entity)]}
                                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-green-300 disabled:to-emerald-300 disabled:cursor-not-allowed text-white px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 flex items-center shadow-lg hover:shadow-xl disabled:shadow-md"
                                    >
                                      {loadingStates[getEntityId(entity)] ? (
                                        <>
                                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                                          <span>Approving...</span>
                                        </>
                                      ) : (
                                        <>
                                          <Check className="w-4 h-4 inline mr-1" />
                                          Approve
                                        </>
                                      )}
                                    </button>
                                    <button
                                      onClick={() => handleRejectEntity(getEntityId(entity))}
                                      disabled={loadingStates[getEntityId(entity)]}
                                      className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 disabled:from-red-300 disabled:to-pink-300 disabled:cursor-not-allowed text-white px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 flex items-center shadow-lg hover:shadow-xl disabled:shadow-md"
                                    >
                                      {loadingStates[getEntityId(entity)] ? (
                                        <>
                                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                                          <span>Rejecting...</span>
                                        </>
                                      ) : (
                                        <>
                                          <X className="w-4 h-4 inline mr-1" />
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
                                    className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 disabled:from-red-300 disabled:to-pink-300 disabled:cursor-not-allowed text-white px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 flex items-center shadow-lg hover:shadow-xl disabled:shadow-md"
                                  >
                                    {loadingStates[getEntityId(entity)] ? (
                                      <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                                        <span>Rejecting...</span>
                                      </>
                                    ) : (
                                      <>
                                        <X className="w-4 h-4 inline mr-1" />
                                        Reject
                                      </>
                                    )}
                                  </button>
                                )}
                                {entity.verification_status === 'rejected' && (
                                  <button
                                    onClick={() => handleApproveEntity(getEntityId(entity))}
                                    disabled={loadingStates[getEntityId(entity)]}
                                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-green-300 disabled:to-emerald-300 disabled:cursor-not-allowed text-white px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 flex items-center shadow-lg hover:shadow-xl disabled:shadow-md"
                                  >
                                    {loadingStates[getEntityId(entity)] ? (
                                      <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                                        <span>Approving...</span>
                                      </>
                                    ) : (
                                      <>
                                        <Check className="w-4 h-4 inline mr-1" />
                                        Approve
                                      </>
                                    )}
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteEntity(getEntityId(entity))}
                                  disabled={loadingStates[getEntityId(entity)]}
                                  className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 flex items-center shadow-lg hover:shadow-xl disabled:shadow-md"
                                >
                                  {loadingStates[getEntityId(entity)] ? (
                                    <>
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                                      <span>Deleting...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Trash2 className="w-4 h-4 inline mr-1" />
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
                            <User className="w-3 h-3 mr-1" />
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${user.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}>
                            {user.status === 'active' ? (
                              <CheckCircle className="w-3 h-3 mr-1" />
                            ) : (
                              <XCircle className="w-3 h-3 mr-1" />
                            )}
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleUserToggle(user.id)}
                            className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl ${user.status === "active" ?
                              'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white' :
                              'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white'
                              }`}
                          >
                            {user.status === "active" ? (
                              <X className="w-4 h-4 inline mr-1" />
                            ) : (
                              <Check className="w-4 h-4 inline mr-1" />
                            )}
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
                        <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold backdrop-blur-md border border-white/30 ${selectedEntity.verification_status === 'approved'
                          ? 'bg-green-500/80 text-white'
                          : selectedEntity.verification_status === 'rejected'
                            ? 'bg-red-500/80 text-white'
                            : 'bg-yellow-500/80 text-white'
                          }`}>
                          {selectedEntity.verification_status === 'approved' ? (
                            <CheckCircle className="w-4 h-4 mr-2" />
                          ) : selectedEntity.verification_status === 'rejected' ? (
                            <XCircle className="w-4 h-4 mr-2" />
                          ) : (
                            <Clock className="w-4 h-4 mr-2" />
                          )}
                          {selectedEntity.verification_status?.toUpperCase()}
                        </span>
                        <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold bg-white/20 text-white backdrop-blur-md border border-white/30">
                          <User className="w-4 h-4 mr-2" />
                          {selectedEntity.entity_type?.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={closeDetailsModal}
                    className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-2xl flex items-center justify-center text-white hover:text-gray-100 transition-all duration-200 backdrop-blur-md border border-white/30 hover:scale-110 hover:rotate-90"
                  >
                    <X className="w-6 h-6" />
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
                        <UserIcon className="w-6 h-6 text-white" />
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
                        <Award className="w-6 h-6 text-white" />
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
                            <span className={`px-4 py-2 rounded-xl font-bold text-sm ${selectedEntity.user_account_created
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-400 text-white'
                              }`}>
                              {selectedEntity.user_account_created ? '✅ Created' : '❌ Not Created'}
                            </span>
                          </div>
                          {selectedEntity.user_account_created && (
                            <div className="bg-green-100/80 dark:bg-green-900/20 p-3 rounded-xl border border-green-200/50">
                              <p className="text-sm text-green-800 dark:text-green-200 flex items-center">
                                <Mail className="w-4 h-4 mr-2" />
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
                        <FileText className="w-6 h-6 text-white" />
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
                        <Megaphone className="w-6 h-6 text-white" />
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
                        <Users className="w-6 h-6 text-white" />
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
                        <MapPinIcon className="w-6 h-6 text-white" />
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
                    <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                    <span>Close Details</span>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
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
