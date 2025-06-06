import React from 'react';
import Navbar from '../components/navbar';

export default function ReviewsDirectoryPage() {
  const [reviews, setReviews] = React.useState([
    {
      entity: "AdBoost Media",
      type: "Advertiser",
      rating: 4,
      comment: "Smooth cooperation, quick payouts.",
      date: "2024-04-22"
    },
    {
      entity: "ClickNova",
      type: "Affiliate",
      rating: 2,
      comment: "Low-quality traffic, high bounce.",
      date: "2024-03-18"
    },
    {
      entity: "LeadSpring Network",
      type: "Network",
      rating: 5,
      comment: "Excellent support and campaign variety.",
      date: "2024-04-12"
    }
  ]);

  const [entityType, setEntityType] = React.useState("");
  const [minRating, setMinRating] = React.useState("");
  const [searchTerm, setSearchTerm] = React.useState("");

  const filtered = reviews.filter(
    (r) =>
      (entityType === "" || r.type === entityType) &&
      (minRating === "" || r.rating >= parseInt(minRating)) &&
      r.entity.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
     <div className="bg-gray-50 text-gray-900 mt-20 font-sans">
       <Navbar />
    <section className="py-16 px-6 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold mb-4">Reviews Directory</h2>
            <p className="mb-6 text-gray-600">See what others are saying about advertisers, affiliates, and networks.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div>
          <label className="font-semibold mb-1">Filter by Entity Type</label>
          <select value={entityType} onChange={(e) => setEntityType(e.target.value)} className="w-full border px-3 py-2 rounded">
            <option value="">All</option>
            <option value="Advertiser">Advertiser</option>
            <option value="Affiliate">Affiliate</option>
            <option value="Network">Network</option>
          </select>
        </div>
        <div>
          <label className="font-semibold mb-1">Minimum Rating</label>
          <select value={minRating} onChange={(e) => setMinRating(e.target.value)} className="w-full border px-3 py-2 rounded">
            <option value="">Any</option>
            {[1, 2, 3, 4, 5].map((r) => (
              <option key={r} value={r}>{r} star{r > 1 ? "s" : ""}+</option>
            ))}
          </select>
        </div>
        <div>
          <label className="font-semibold mb-1">Search by Name</label>
          <input
            type="text"
            placeholder="e.g. AdBoost Media"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
        </div>
      </div>

      <div className="space-y-6">
        {filtered.map((review, idx) => (
          <div key={idx} className="border p-4 rounded shadow bg-white">
            <div className="flex justify-between">
              <h3 className="text-lg font-semibold">{review.entity}</h3>
              <span className="text-yellow-500">{"★".repeat(review.rating)}</span>
            </div>
            <p className="text-sm text-gray-500 mb-2">{review.type} | {review.date}</p>
            <p>{review.comment}</p>
          </div>
        ))}
      </div>
    </section>
    </div>
  );
}
