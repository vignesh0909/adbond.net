import React, { useState, useEffect } from 'react';
import { Building2, Globe2, CreditCard, User2, Mail, Loader2, Check, X as XIcon, AlertTriangle, Edit2, Eye, EyeOff, Lock, Shield, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from '../components/navbar';
import { authAPI } from '../services/auth';
import { entityAPI } from '../services/entity';
import { useAuthContext } from '../contexts/AuthContext';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { isAuthenticated, user: authUser, isLoading: authLoading } = useAuthContext();
  const [currentUser, setCurrentUser] = useState(null);
  const [entityData, setEntityData] = useState(null);
  const [entityLoading, setEntityLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [avatarColor, setAvatarColor] = useState('#3B82F6');
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    bio: '',
    company: '',
    website: '',
    location: '',
    timezone: ''
  });

  const [entityFormData, setEntityFormData] = useState({
    company_name: '',
    description: '',
    website: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    payment_terms: ''
  });

  // Authentication check with modern context
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        // toast.error('Please login to access your profile', {
        //   position: "top-right",
        //   autoClose: 3000,
        // });
        navigate('/login');
        return;
      }

      // Use auth context user if available, fallback to localStorage
      const user = authUser || authAPI.getCurrentUser();
      if (!user) {
        toast.error('User data not found', {
          position: "top-right",
          autoClose: 3000,
        });
        navigate('/login');
        return;
      }

      setCurrentUser(user);
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        company: user.company || '',
        website: user.website || '',
        location: user.location || '',
        timezone: user.timezone || ''
      });

      // Generate consistent avatar color based on user email
      if (user.email) {
        const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'];
        const colorIndex = user.email.charCodeAt(0) % colors.length;
        setAvatarColor(colors[colorIndex]);
      }

      // Fetch entity data if user has entity_id
      if (user.entity_id) {
        fetchEntityData(user.entity_id);
        // Set default tab to entity for entity users
        setActiveTab('entity');
      }

      setLoading(false);
    }
  }, [authLoading, isAuthenticated, authUser, navigate]);

  // Fetch entity data
  const fetchEntityData = async (entityId) => {
    try {
      setEntityLoading(true);
      const response = await entityAPI.getEntityById(entityId);
      const entity = response.entity;
      setEntityData(entity);

      // Set entity form data
      if (entity.entity_metadata) {
        setEntityFormData({
          company_name: entity.entity_metadata.company_name || '',
          description: entity.entity_metadata.description || '',
          website: entity.entity_metadata.website || '',
          contact_email: entity.entity_metadata.contact_email || '',
          contact_phone: entity.entity_metadata.contact_phone || '',
          address: entity.entity_metadata.address || '',
          payment_terms: entity.entity_metadata.payment_terms || ''
        });
      }
    } catch (error) {
      console.error('Error fetching entity data:', error);
      toast.error('Failed to load entity details', {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setEntityLoading(false);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setError(''); // Clear any previous errors
    if (isEditing) {
      // Reset form data when canceling edit
      setFormData({
        first_name: currentUser.first_name || '',
        last_name: currentUser.last_name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        bio: currentUser.bio || '',
        company: currentUser.company || '',
        website: currentUser.website || '',
        location: currentUser.location || '',
        timezone: currentUser.timezone || ''
      });

      // Reset entity form data
      if (entityData?.entity_metadata) {
        setEntityFormData({
          company_name: entityData.entity_metadata.company_name || '',
          description: entityData.entity_metadata.description || '',
          website: entityData.entity_metadata.website || '',
          contact_email: entityData.entity_metadata.contact_email || '',
          contact_phone: entityData.entity_metadata.contact_phone || '',
          address: entityData.entity_metadata.address || '',
          payment_terms: entityData.entity_metadata.payment_terms || ''
        });
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleEntityInputChange = (e) => {
    const { name, value } = e.target;
    setEntityFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.first_name.trim()) {
      setError('First name is required');
      return false;
    }
    if (!formData.last_name.trim()) {
      setError('Last name is required');
      return false;
    }
    if (formData.website && !formData.website.match(/^https?:\/\/.+/)) {
      setError('Please enter a valid website URL (starting with http:// or https://)');
      return false;
    }
    return true;
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      setError('');

      const response = await authAPI.updateProfile(currentUser.user_id, formData);

      // Update localStorage and state with new user data
      const updatedUser = { ...currentUser, ...formData };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      setIsEditing(false);

      toast.success('Profile updated successfully!', {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update profile';
      setError(errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 4000,
      });
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEntity = async (e) => {
    e.preventDefault();

    if (!entityFormData.company_name.trim()) {
      setError('Company name is required');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const entityUpdateData = {
        entity_metadata: entityFormData
      };

      await entityAPI.updateEntity(currentUser.entity_id, entityUpdateData);

      // Refresh entity data
      await fetchEntityData(currentUser.entity_id);
      setIsEditing(false);

      toast.success('Company details updated successfully!', {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update company details';
      setError(errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 4000,
      });
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const getUserInitials = () => {
    // Prioritize entity company name for initials if available
    if (entityData?.entity_metadata?.company_name) {
      const companyName = entityData.entity_metadata.company_name;
      const words = companyName.split(' ').filter(word => word.length > 0);
      if (words.length >= 2) {
        return `${words[0][0]}${words[1][0]}`.toUpperCase();
      } else if (words.length === 1) {
        return words[0].substring(0, 2).toUpperCase();
      }
    }

    // Fallback to user name initials
    if (currentUser?.first_name && currentUser?.last_name) {
      return `${currentUser.first_name[0]}${currentUser.last_name[0]}`.toUpperCase();
    }
    if (currentUser?.email) {
      return currentUser.email[0].toUpperCase();
    }
    return 'U';
  };

  const getUserDisplayName = () => {
    // Prioritize entity company name for display
    if (entityData?.entity_metadata?.company_name) {
      return entityData.entity_metadata.company_name;
    }

    // Fallback to user name
    if (currentUser?.first_name && currentUser?.last_name) {
      return `${currentUser.first_name} ${currentUser.last_name}`;
    }
    return currentUser?.email || 'User';
  };

  const getRoleDisplayInfo = () => {
    const role = currentUser?.role || 'user';
    const roleColors = {
      'advertiser': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'affiliate': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'network': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      'user': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    };

    return {
      role: role.charAt(0).toUpperCase() + role.slice(1),
      colorClass: roleColors[role] || roleColors['user']
    };
  };

  const getMemberSince = () => {
    if (currentUser?.created_at) {
      return new Date(currentUser.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long'
      });
    }
    return 'Recently';
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (passwordError) setPasswordError('');
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validatePasswordForm = () => {
    if (!passwordData.currentPassword.trim()) {
      setPasswordError('Current password is required');
      return false;
    }
    if (!passwordData.newPassword.trim()) {
      setPasswordError('New password is required');
      return false;
    }
    if (passwordData.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long');
      return false;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return false;
    }
    if (passwordData.currentPassword === passwordData.newPassword) {
      setPasswordError('New password must be different from current password');
      return false;
    }
    return true;
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!validatePasswordForm()) {
      return;
    }

    try {
      setPasswordLoading(true);
      setPasswordError('');

      // Call API to change password
      await authAPI.resetPassword({
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword
      });

      // Clear form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      toast.success('Password changed successfully!', {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to change password';
      setPasswordError(errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 4000,
      });
      console.error(err);
    } finally {
      setPasswordLoading(false);
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, text: '', color: '' };

    let strength = 0;
    const checks = [
      password.length >= 8,
      /[a-z]/.test(password),
      /[A-Z]/.test(password),
      /[0-9]/.test(password),
      /[^A-Za-z0-9]/.test(password)
    ];

    strength = checks.filter(Boolean).length;

    const strengthLevels = [
      { text: 'Very Weak', color: 'text-red-500' },
      { text: 'Weak', color: 'text-orange-500' },
      { text: 'Fair', color: 'text-yellow-500' },
      { text: 'Good', color: 'text-blue-500' },
      { text: 'Strong', color: 'text-green-500' }
    ];

    return {
      strength,
      text: strengthLevels[strength - 1]?.text || 'Very Weak',
      color: strengthLevels[strength - 1]?.color || 'text-red-500'
    };
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-gray-100 font-sans">
        <Navbar />
        <div className="pt-20 flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">
              {authLoading ? 'Authenticating...' : 'Loading profile...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-gray-100 font-sans">
      <Navbar />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white/80 dark:bg-gray-900/80 rounded-2xl shadow-xl p-8 mb-8 border border-blue-100 dark:border-gray-800 backdrop-blur-md">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-center gap-6">
                <div
                  className="w-24 h-24 rounded-full text-white flex items-center justify-center text-3xl font-bold shadow-lg ring-4 ring-white dark:ring-gray-700"
                  style={{ backgroundColor: avatarColor }}
                >
                  {getUserInitials()}
                </div>
                <div>
                  <h1 className="text-3xl font-extrabold text-blue-700 dark:text-blue-300 mb-2 tracking-tight">
                    {getUserDisplayName()}
                  </h1>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleDisplayInfo().colorClass}`}>
                      {getRoleDisplayInfo().role}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">
                      Member since {getMemberSince()}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <Mail className="w-4 h-4 mr-2" />
                    {currentUser?.email}
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                {!isEditing && (
                  <button
                    onClick={handleEditToggle}
                    className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all transform hover:scale-105 flex items-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="bg-white/80 dark:bg-gray-900/80 rounded-2xl shadow-lg mb-8 border border-blue-100 dark:border-gray-800">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="-mb-px flex space-x-8 px-6">
                {currentUser?.entity_id && (
                  <button
                    onClick={() => setActiveTab('entity')}
                    className={`py-4 px-1 border-b-2 font-semibold text-lg transition-all ${activeTab === 'entity'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-300'
                      : 'border-transparent text-gray-500 hover:text-blue-700 dark:hover:text-blue-200'
                      }`}
                  >
                    Company Details
                  </button>
                )}
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`py-4 px-1 border-b-2 font-semibold text-lg transition-all ${activeTab === 'profile'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-300'
                    : 'border-transparent text-gray-500 hover:text-blue-700 dark:hover:text-blue-200'
                    }`}
                >
                  {currentUser?.entity_id ? 'Personal Details' : 'Profile Details'}
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`py-4 px-1 border-b-2 font-semibold text-lg transition-all ${activeTab === 'security'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-300'
                    : 'border-transparent text-gray-500 hover:text-blue-700 dark:hover:text-blue-200'
                    }`}
                >
                  Security
                </button>
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'entity' && currentUser?.entity_id && (
                <div>
                  {/* Entity Loading State */}
                  {entityLoading && (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-3 text-gray-600 dark:text-gray-300">Loading company details...</span>
                    </div>
                  )}

                  {/* Entity Details Form */}
                  {!entityLoading && entityData && (
                    <form onSubmit={handleSaveEntity}>
                      <div className="space-y-8">
                        {/* Company Information */}
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
                            <Building2 className="w-6 h-6 mr-3 text-blue-600 dark:text-blue-400" />
                            Company Information
                          </h3>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                Company Name *
                              </label>
                              <input
                                type="text"
                                name="company_name"
                                value={entityFormData.company_name}
                                onChange={handleEntityInputChange}
                                disabled={!isEditing}
                                placeholder="Your Company Name"
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:text-gray-500"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                Website
                              </label>
                              <input
                                type="url"
                                name="website"
                                value={entityData.website}
                                onChange={handleEntityInputChange}
                                disabled={!isEditing}
                                placeholder="https://yourcompany.com"
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:text-gray-500"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                Payment Terms
                              </label>
                              <input
                                type="text"
                                name="payment_terms"
                                value={entityFormData.payment_terms}
                                onChange={handleEntityInputChange}
                                disabled={!isEditing}
                                placeholder="e.g., Net 30, NET-30, or 30,60,90"
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:text-gray-500"
                              />
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Enter payment terms like "Net 30" or multiple options separated by commas
                              </p>
                            </div>

                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                Company Description
                              </label>
                              <textarea
                                name="description"
                                value={entityData.description}
                                onChange={handleEntityInputChange}
                                disabled={!isEditing}
                                rows={4}
                                placeholder="Describe your company, services, and what makes you unique..."
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:text-gray-500"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Contact Information */}
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
                            <Mail className="w-6 h-6 mr-3 text-green-600 dark:text-green-400" />
                            Contact Information
                          </h3>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                Contact Email
                              </label>
                              <input
                                type="email"
                                name="contact_email"
                                value={entityData.email}
                                onChange={handleEntityInputChange}
                                disabled={!isEditing}
                                placeholder="contact@yourcompany.com"
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:text-gray-500"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                Contact Phone
                              </label>
                              <input
                                type="tel"
                                name="contact_phone"
                                value={entityData.contact_info.phone}
                                onChange={handleEntityInputChange}
                                disabled={!isEditing}
                                placeholder="+1 (555) 123-4567"
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:text-gray-500"
                              />
                            </div>

                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                Company Address
                              </label>
                              <textarea
                                name="address"
                                value={entityData.contact_info.address}
                                onChange={handleEntityInputChange}
                                disabled={!isEditing}
                                rows={3}
                                placeholder="Full company address including street, city, state, and country"
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:text-gray-500"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Entity Stats */}
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
                            <CreditCard className="w-6 h-6 mr-3 text-purple-600 dark:text-purple-400" />
                            Company Statistics
                          </h3>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Entity Type</div>
                              <div className="text-lg font-semibold text-blue-600 dark:text-blue-400 capitalize">
                                {entityData.entity_type || 'N/A'}
                              </div>
                            </div>

                            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Verification Status</div>
                              <div className={`text-lg font-semibold capitalize ${entityData.verification_status === 'verified'
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-yellow-600 dark:text-yellow-400'
                                }`}>
                                {entityData.verification_status || 'Pending'}
                              </div>
                            </div>

                            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Member Since</div>
                              <div className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                                {getMemberSince()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {activeTab === 'profile' && (
                <div>
                  {/* Error Display */}
                  {error && (
                    <div className="mb-6 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-700 rounded-lg p-4">
                      <div className="flex items-center">
                        <AlertTriangle className="w-5 h-5 text-red-400 mr-3" />
                        <span className="text-red-700 dark:text-red-300">{error}</span>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSaveProfile} className="space-y-6">
                    {/* Personal Information */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                        <User2 className="w-5 h-5 mr-2 text-blue-500" />
                        Personal Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                            First Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            required
                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:text-gray-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                            Last Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            required
                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:text-gray-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                            Email Address
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            disabled
                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-4 py-3 shadow-sm text-gray-500 cursor-not-allowed"
                          />
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Email cannot be changed</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            placeholder="+1 (555) 123-4567"
                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:text-gray-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Bio Section */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                        Bio
                      </label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        rows={4}
                        placeholder="Tell us about yourself..."
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:text-gray-500 resize-none"
                      />
                    </div>

                    {/* Action Buttons */}
                    {isEditing && (
                      <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <button
                          type="submit"
                          disabled={saving}
                          className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {saving ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Saving...
                            </>
                          ) : (
                            <>
                              <Check className="w-4 h-4" />
                              Save Changes
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={handleEditToggle}
                          disabled={saving}
                          className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-bold py-3 px-8 rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          <XIcon className="w-4 h-4" />
                          Cancel
                        </button>
                      </div>
                    )}
                  </form>
                </div>
              )}

              {activeTab === 'security' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
                    <Lock className="w-5 h-5 mr-2 text-blue-500" />
                    Password & Security
                  </h3>

                  {/* Password Error Display */}
                  {passwordError && (
                    <div className="mb-6 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-700 rounded-lg p-4">
                      <div className="flex items-center">
                        <AlertTriangle className="w-5 h-5 text-red-400 mr-3" />
                        <span className="text-red-700 dark:text-red-300">{passwordError}</span>
                      </div>
                    </div>
                  )}

                  {/* Change Password Form */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-8">
                    <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                      <Shield className="w-4 h-4 mr-2 text-green-500" />
                      Change Password
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                      Keep your account secure by using a strong, unique password.
                    </p>

                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                      {/* Current Password */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                          Current Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.current ? "text" : "password"}
                            name="currentPassword"
                            value={passwordData.currentPassword}
                            onChange={handlePasswordChange}
                            required
                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 pr-12 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            placeholder="Enter your current password"
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility('current')}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            {showPasswords.current ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* New Password */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                          New Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.new ? "text" : "password"}
                            name="newPassword"
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            required
                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 pr-12 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            placeholder="Enter your new password"
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility('new')}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            {showPasswords.new ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            )}
                          </button>
                        </div>
                        {/* Password Strength Indicator */}
                        {passwordData.newPassword && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className={`font-medium ${getPasswordStrength(passwordData.newPassword).color}`}>
                                Password strength: {getPasswordStrength(passwordData.newPassword).text}
                              </span>
                            </div>
                            <div className="mt-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrength(passwordData.newPassword).strength <= 1 ? 'bg-red-500' :
                                  getPasswordStrength(passwordData.newPassword).strength <= 2 ? 'bg-orange-500' :
                                    getPasswordStrength(passwordData.newPassword).strength <= 3 ? 'bg-yellow-500' :
                                      getPasswordStrength(passwordData.newPassword).strength <= 4 ? 'bg-blue-500' : 'bg-green-500'
                                  }`}
                                style={{ width: `${(getPasswordStrength(passwordData.newPassword).strength / 5) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          <p>Password should contain:</p>
                          <ul className="list-disc list-inside mt-1 space-y-1">
                            <li className={passwordData.newPassword.length >= 8 ? 'text-green-600 dark:text-green-400' : ''}>
                              At least 8 characters
                            </li>
                            <li className={/[a-z]/.test(passwordData.newPassword) ? 'text-green-600 dark:text-green-400' : ''}>
                              Lowercase letters
                            </li>
                            <li className={/[A-Z]/.test(passwordData.newPassword) ? 'text-green-600 dark:text-green-400' : ''}>
                              Uppercase letters
                            </li>
                            <li className={/[0-9]/.test(passwordData.newPassword) ? 'text-green-600 dark:text-green-400' : ''}>
                              Numbers
                            </li>
                            <li className={/[^A-Za-z0-9]/.test(passwordData.newPassword) ? 'text-green-600 dark:text-green-400' : ''}>
                              Special characters
                            </li>
                          </ul>
                        </div>
                      </div>

                      {/* Confirm New Password */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                          Confirm New Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.confirm ? "text" : "password"}
                            name="confirmPassword"
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                            required
                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 pr-12 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            placeholder="Confirm your new password"
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility('confirm')}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            {showPasswords.confirm ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            )}
                          </button>
                        </div>
                        {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400">Passwords do not match</p>
                        )}
                        {passwordData.confirmPassword && passwordData.newPassword === passwordData.confirmPassword && (
                          <p className="mt-1 text-sm text-green-600 dark:text-green-400">Passwords match!</p>
                        )}
                      </div>

                      {/* Submit Button */}
                      <div className="pt-4">
                        <button
                          type="submit"
                          disabled={passwordLoading}
                          className="bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {passwordLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Changing Password...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                              Change Password
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Security Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Account Security */}
                    <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-6 border border-blue-200 dark:border-blue-700">
                      <h4 className="text-md font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Account Security
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700 dark:text-gray-300">Password</span>
                          <span className="text-green-600 dark:text-green-400 font-medium">Protected</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700 dark:text-gray-300">Two-Factor Auth</span>
                          <span className="text-yellow-600 dark:text-yellow-400 font-medium">Coming Soon</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700 dark:text-gray-300">Login History</span>
                          <span className="text-yellow-600 dark:text-yellow-400 font-medium">Coming Soon</span>
                        </div>
                      </div>
                    </div>

                    {/* Security Tips */}
                    <div className="bg-yellow-50 dark:bg-yellow-900/30 rounded-xl p-6 border border-yellow-200 dark:border-yellow-700">
                      <h4 className="text-md font-semibold text-yellow-900 dark:text-yellow-100 mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        Security Tips
                      </h4>
                      <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                        <li className="flex items-start">
                          <svg className="w-4 h-4 mr-2 mt-0.5 text-yellow-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Use a unique, strong password
                        </li>
                        <li className="flex items-start">
                          <svg className="w-4 h-4 mr-2 mt-0.5 text-yellow-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Change your password regularly
                        </li>
                        <li className="flex items-start">
                          <svg className="w-4 h-4 mr-2 mt-0.5 text-yellow-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Never share your password
                        </li>
                        <li className="flex items-start">
                          <svg className="w-4 h-4 mr-2 mt-0.5 text-yellow-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Log out from public devices
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
