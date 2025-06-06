import React from 'react';

export default function EntityProfilePage() {
  const entity = {
    name: "AdBoost Media",
    type: "Advertiser",
    rating: 4.2,
    reviews: [
      {
        rating: 5,
        comment: "Very responsive and clear communication.",
        date: "2024-04-12"
      },
      {
        rating: 4,
        comment: "Had one delay but overall a good experience.",
        date: "2024-03-25"
      }
    ],
    tags: ["Quick Payout", "Responsive", "Trusted"]
  };

  return (
    <section className="py-16 px-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-2">{entity.name}</h2>
      <p className="text-gray-600 mb-2">{entity.type}</p>
      <p className="text-yellow-500 font-semibold mb-4">Overall Rating: {entity.rating.toFixed(1)} ★</p>

      <div className="mb-6">
        {entity.tags.map((tag, index) => (
          <span
            key={index}
            className="inline-block bg-blue-100 text-blue-700 px-3 py-1 text-sm rounded-full mr-2 mb-2"
          >
            #{tag}
          </span>
        ))}
      </div>

      <h3 className="text-xl font-semibold mb-4">Reviews</h3>
      <div className="space-y-4">
        {entity.reviews.map((rev, idx) => (
          <div key={idx} className="border p-4 rounded bg-white shadow">
            <div className="flex justify-between">
              <span className="text-yellow-500">{"★".repeat(rev.rating)}</span>
              <span className="text-sm text-gray-500">{rev.date}</span>
            </div>
            <p className="mt-2">{rev.comment}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
