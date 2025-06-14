import React, { useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { entityAPI } from '../services/entity';

export default function AdminPanelPage() {
  const [reviews, setReviews] = React.useState([
    { id: 1, entity: "ClickNova", type: "Affiliate", comment: "Fake traffic", flagged: true },
    { id: 2, entity: "AdBoost Media", type: "Advertiser", comment: "Responsive", flagged: false },
    { id: 3, entity: "LeadSpring Network", type: "Network", comment: "No payouts", flagged: true }
  ]);

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

  const handleReviewAction = (id, action) => {
    if (action === "remove") {
      setReviews(reviews.filter((r) => r.id !== id));
    } else if (action === "approve") {
      setReviews(reviews.map((r) => (r.id === id ? { ...r, flagged: false } : r)));
    }
  };

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
    <section className="pt-24 pb-16 px-6 max-w-6xl mx-auto">
      {/* <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Admin Panel</h2>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm"
        >
          Logout
        </button>
      </div> */}

      {/* Entity Management Section */}
      <h3 className="text-xl font-semibold mb-4">Entity Management</h3>
      <div className="mb-4">
        <span className="mr-2">Filter by status:</span>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {loadingEntities && <p>Loading entities...</p>}
      {errorEntities && <p className="text-red-500">Error: {errorEntities}</p>}
      {!loadingEntities && !errorEntities && (
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse text-sm mb-10">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2 text-left">Name</th>
                <th className="border px-4 py-2 text-left">Type</th>
                <th className="border px-4 py-2 text-left">Email</th>
                <th className="border px-4 py-2 text-left">Status</th>
                <th className="border px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {entities.length === 0 ? (
                <tr>
                  <td colSpan="5" className="border px-4 py-2 text-center text-gray-500">
                    No entities found for "{filterStatus}" status.
                  </td>
                </tr>
              ) : (
                entities.map((entity) => (
                  <tr key={entity._id} className="bg-white hover:bg-gray-50">
                    <td className="border px-4 py-2">{entity.name}</td>
                    <td className="border px-4 py-2">{entity.entity_type}</td>
                    <td className="border px-4 py-2">{entity.email}</td>
                    <td className="border px-4 py-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${entity.verification_status === 'approved' ? 'bg-green-100 text-green-800' :
                        entity.verification_status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                        {entity.verification_status}
                      </span>
                    </td>
                    <td className="border px-4 py-2 space-x-1">
                      <button
                        onClick={() => handleViewDetails(entity)}
                        className="text-xs bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded mr-1"
                      >
                        View Details
                      </button>
                      {entity.verification_status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApproveEntity(entity.entity_id)}
                            className="text-xs bg-green-500 hover:bg-green-600 text-white py-1 px-2 rounded"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectEntity(entity._id)}
                            className="text-xs bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {entity.verification_status === 'approved' && (
                        <button
                          onClick={() => handleRejectEntity(entity._id)}
                          className="text-xs bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded"
                        >
                          Reject
                        </button>
                      )}
                      {entity.verification_status === 'rejected' && (
                        <button
                          onClick={() => handleApproveEntity(entity.entity_id)}
                          className="text-xs bg-green-500 hover:bg-green-600 text-white py-1 px-2 rounded"
                        >
                          Approve
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteEntity(entity._id)}
                        className="text-xs bg-gray-500 hover:bg-gray-600 text-white py-1 px-2 rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <h3 className="text-xl font-semibold mb-4">Flagged Reviews</h3>
      <div className="space-y-4 mb-10">
        {reviews.filter(r => r.flagged).length === 0 ? (
          <p className="text-gray-500">No flagged reviews.</p>
        ) : (
          reviews.filter(r => r.flagged).map((rev) => (
            <div key={rev.id} className="border p-4 rounded bg-white shadow">
              <p><strong>{rev.entity}</strong> ({rev.type})</p>
              <p className="text-sm text-gray-700 mt-1">"{rev.comment}"</p>
              <div className="mt-2 space-x-2">
                <button onClick={() => handleReviewAction(rev.id, "approve")} className="text-green-600 hover:underline">Approve</button>
                <button onClick={() => handleReviewAction(rev.id, "remove")} className="text-red-600 hover:underline">Remove</button>
              </div>
            </div>
          ))
        )}
      </div>

      <h3 className="text-xl font-semibold mb-4">User Management</h3>
      <table className="w-full table-auto border-collapse text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2 text-left">Name</th>
            <th className="border px-4 py-2 text-left">Role</th>
            <th className="border px-4 py-2 text-left">Status</th>
            <th className="border px-4 py-2 text-left">Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="bg-white hover:bg-gray-50">
              <td className="border px-4 py-2">{user.name}</td>
              <td className="border px-4 py-2">{user.role}</td>
              <td className="border px-4 py-2">{user.status}</td>
              <td className="border px-4 py-2">
                <button onClick={() => handleUserToggle(user.id)} className="text-blue-600 hover:underline">
                  {user.status === "active" ? "Ban" : "Unban"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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
  );
}
