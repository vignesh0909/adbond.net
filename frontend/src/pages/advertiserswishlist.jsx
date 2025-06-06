import React, { useState } from 'react';
function Header() {
  return (
    <header className="p-4 flex justify-between items-center shadow">
      <h1 className="text-xl font-bold flex items-center">
        <img src="/logo.svg" alt="logo" className="h-6 w-6 mr-2" /> linkin.us
      </h1>
      <nav className="space-x-4">
        <a href="#offers">Offers</a>
        <a href="#requests">Wishlist</a>
        <a href="#reviews">Reviews</a>
        <a href="#database">Database</a>
        <button className="bg-black text-white px-3 py-1 rounded hover:bg-gray-800">Log in</button>
      </nav>
    </header>
  );
}

// Write a Review Internal Page
export function WriteReviewPage() {
  const [entityType, setEntityType] = useState("");
  const [entityName, setEntityName] = useState("");
  const [rating, setRating] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [file, setFile] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const reviewData = {
      entityType,
      entityName,
      rating,
      title,
      body,
      tags,
      anonymous,
      file
    };
    console.log("Review Submitted:", reviewData);
    alert("Review submitted successfully!");
  };

  return (
    <section className="py-16 px-6 max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">Write a Review</h2>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label className="block font-semibold mb-2">Who are you reviewing?</label>
          <select value={entityType} onChange={e => setEntityType(e.target.value)} className="w-full border rounded px-3 py-2">
            <option value="">Select a Party Type</option>
            <option value="advertiser">Advertiser</option>
            <option value="network">Network</option>
            <option value="affiliate">Affiliate</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold mb-2">Entity Name</label>
          <input type="text" value={entityName} onChange={e => setEntityName(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="e.g. XYZ Media" />
        </div>

        <div>
          <label className="block font-semibold mb-2">Star Rating</label>
          <select value={rating} onChange={e => setRating(e.target.value)} className="w-full border rounded px-3 py-2">
            <option value="">Select Rating</option>
            {[1, 2, 3, 4, 5].map(n => <option key={n}>{n} Star{n > 1 ? 's' : ''}</option>)}
          </select>
        </div>

        <div>
          <label className="block font-semibold mb-2">Review Title</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="Short summary..." />
        </div>

        <div>
          <label className="block font-semibold mb-2">Review Body</label>
          <textarea value={body} onChange={e => setBody(e.target.value)} className="w-full border rounded px-3 py-2" rows="5" placeholder="Describe your experience in detail..."></textarea>
        </div>

        <div>
          <label className="block font-semibold mb-2">Tags (optional)</label>
          <input type="text" value={tags} onChange={e => setTags(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="e.g. Late Payment, Good Traffic, Bot Clicks" />
        </div>

        <div>
          <label className="block font-semibold mb-2">Upload Proof (optional)</label>
          <input type="file" onChange={e => setFile(e.target.files[0])} className="w-full border rounded px-3 py-2" />
        </div>

        <div className="flex items-center space-x-2">
          <input type="checkbox" id="anonymous" checked={anonymous} onChange={e => setAnonymous(e.target.checked)} />
          <label htmlFor="anonymous">Post review anonymously</label>
        </div>

        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700 transition-all">Submit Review</button>
      </form>
    </section>
  );
}

// Affiliates Wishlist Page (Standalone Export)
export default function AffiliatesWishlistPageStandalone() {
  const wishlist = [
    {
      vertical: "Health",
      geo: "US, CA",
      trafficType: "Meta Ads",
      expectedVolume: "10K+/day",
      notes: "Looking for top-converting offers in weight loss"
    },
    {
      vertical: "Finance",
      geo: "UK, AU",
      trafficType: "Native & Push",
      expectedVolume: "5K/day",
      notes: "Prefer CPL with fast approval"
    }
  ];

  return (
    <section className="py-16 px-6 max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">Affiliates Wishlist</h2>
      <p className="mb-6 text-gray-600">Explore what affiliates are actively seeking. Get in touch if your offer matches!</p>

      <div className="grid gap-6 md:grid-cols-2">
        {wishlist.map((item, index) => (
          <div key={index} className="border rounded-lg shadow p-5 bg-white">
            <h3 className="text-xl font-semibold mb-2">Vertical: {item.vertical}</h3>
            <p><strong>GEOs:</strong> {item.geo}</p>
            <p><strong>Traffic Type:</strong> {item.trafficType}</p>
            <p><strong>Expected Volume:</strong> {item.expectedVolume}</p>
            <p className="mt-2 text-gray-700"><strong>Notes:</strong> {item.notes}</p>
            <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">Contact Affiliate</button>
          </div>
        ))}
      </div>
    </section>
  );
}

// Remaining components remain unchanged...
function HeroSection() { /* ... */ }
function OffersSection() { /* ... */ }
function OfferRequestsSection() { /* ... */ }
function ReviewPreviewSection() { /* ... */ }
function DatabasePreview() { /* ... */ }
function CTASection() { /* ... */ }
function Footer() { /* ... */ }
function OfferCard({ title, payout, geo }) { /* ... */ }
function OfferRequestCard({ vertical, geo, trafficType }) { /* ... */ }
function ReviewCard({ entity, type, rating, comment }) { /* ... */ }
function CompanyCard({ name, type }) { /* ... */ }
