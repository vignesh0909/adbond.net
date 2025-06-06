import React from 'react';

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

  return (
    <section className="py-16 px-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">Admin Panel</h2>

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
    </section>
  );
}
