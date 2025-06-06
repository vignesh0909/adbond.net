import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from './components/navbar';

const LinkinPage = () => {
  return (
    <div className="bg-gray-50 text-gray-900 font-sans">
      {/* Header */}
    <Navbar />

      {/* Hero Section */}
       <section className="text-center py-20 px-4 mt-20 bg-gray-50">
      <h1 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight">
        Where Trust Links Us All
      </h1>
      <p className="mb-8 text-gray-800 max-w-2xl mx-auto text-base sm:text-lg">
        A platform for advertisers, networks, and affiliates to share feedback and help each other.
      </p>
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <a
          href="/writereview"
          className="bg-blue-600 hover:bg-blue-700 transition text-white px-6 py-3 rounded text-sm sm:text-base"
        >
          Write a Review
        </a>
        <a
          href="/affiliatedwishlist"
          className="bg-blue-600 hover:bg-blue-700 transition text-white px-6 py-3 rounded text-sm sm:text-base"
        >
          Affiliates Wishlist
        </a>
        <Link
          to="/showcase"
          className="bg-blue-600 hover:bg-blue-700 transition text-white px-6 py-3 rounded text-sm sm:text-base"
        >
          Advertisers Showcase
        </Link>
      </div>
    </section>


      {/* Top Performing Offers */}
     <section className="px-4 sm:px-6 lg:px-20 py-14 bg-gray-50" id="offers">
  <h2 className="text-2xl sm:text-3xl font-semibold mb-8 text-center">
     Top Performing Offers from Advertisers
  </h2>
  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
    {[
      { title: 'Keto CPA Offer', payout: '$ 45/lead', geo: 'US, CA' },
      { title: 'Finance CPL', payout: '$ 25/lead', geo: 'UK' },
      { title: 'Sweepstakes Offer', payout: '$ 1.2/click', geo: 'IN, PK' }
    ].map((offer, i) => (
      <div
        key={i}
        className="bg-white shadow-sm rounded-lg p-6 hover:shadow-md transition-shadow"
      >
        <h3 className="font-bold text-xl mb-2">{offer.title}</h3>
        <p className="text-md text-gray-700 mb-1"><strong>Payout:</strong> {offer.payout}</p>
        <p className="text-md text-gray-700"><strong>Target GEO:</strong> {offer.geo}</p>
        <button className="mt-4 bg-blue-600 text-white px-5 py-2 rounded text-sm hover:bg-blue-700">
          Apply
        </button>
      </div>
    ))}
  </div>
</section>


      {/* Affiliate Offer Requests */}
      <section className="px-4 sm:px-6 lg:px-20 py-12 bg-white">
  <h2 className="text-2xl sm:text-3xl font-semibold mb-8 text-center">
     Popular Offer Requests from Affiliates
  </h2>
  <div className="flex flex-wrap justify-center gap-6">
    {[
      { vertical: 'Health', geo: 'US', traffic: 'Meta Ads' },
      { vertical: 'Finance', geo: 'UK', traffic: 'Native + Push' }
    ].map((req, i) => (
      <div
        key={i}
        className="bg-gray-100 p-4 rounded-lg shadow-sm hover:shadow-md w-auto min-w-[400px] max-w-sm"
      >
        <p className="text-lg text-gray-700 mb-2">
          <strong>Vertical:</strong> {req.vertical}
        </p>
        <p className="text-lg text-gray-700 mb-2">
          <strong>Target GEO:</strong> {req.geo}
        </p>
        <p className="text-lg text-gray-700">
          <strong>Traffic Type:</strong> {req.traffic}
        </p>
      </div>
    ))}
  </div>
</section>



      {/* Reviews */}
      <section className="px-4 sm:px-6 lg:px-20 py-12 bg-gray-50" id="reviews">
  <h2 className="text-2xl sm:text-3xl font-semibold mb-8 text-center"> Recent Reviews</h2>
  
  <div className="flex flex-wrap justify-center gap-6">
    {[
      {
        name: "AffiliateX (Publisher)",
        rating: "★★★★★",
        feedback: "Delivered decent traffic, but had conversion issues."
      },
      {
        name: "NetworkABC (Network)",
        rating: "★★★★★",
        feedback: "Fast payments & helpful account manager."
      }
    ].map((review, i) => (
      <div
        key={i}
        className="bg-white p-5 rounded-lg shadow-sm hover:shadow-md max-w-[400px] w-full"
      >
        <h4 className="font-semibold  text-lg text-base mb-1">{review.name}</h4>
        <p className="text-yellow-500 text-lg mb-2">{review.rating}</p>
        <p className="text-gray-700 text-md">{review.feedback}</p>
      </div>
    ))}
  </div>
</section>


      {/* Industry Database */}
      <section className="px-4 sm:px-6 lg:px-20 py-12 bg-white" id="database">
  <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-center"> Affiliate Industry Database</h2>
  <p className="mb-8 text-center text-gray-600 max-w-2xl mx-auto">
    Search 70,000+ verified companies (identity required for full access)
  </p>

  <div className="flex flex-wrap justify-center gap-6">
    {[
      { name: 'ClickHub Media', type: 'Network' },
      { name: 'AdServePro', type: 'Advertiser' }
    ].map((entry, i) => (
      <div
        key={i}
        className="bg-gray-100 rounded-lg p-5 w-full max-w-[400px] shadow hover:shadow-md transition"
      >
        <p className="text-lg font-semibold mb-2">{entry.name}</p>
        <p className="text-gl text-gray-700 mb-3">Type: {entry.type}</p>
        <a href="#" className="text-blue-600 text-lgfont-medium">Request Access</a>
      </div>
    ))}
  </div>
</section>


      {/* CTA Section */}
      <section className="py-16 bg-gray-100 text-center px-4">
        <h2 className="text-2xl font-bold mb-4">Ready to Join the Movement?</h2>
        <p className="mb-6">Get early access to the platform and help shape the future of affiliate marketing.</p>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded">Join Telegram Group</button>
      </section>

      {/* Footer */}
      <footer className="text-center text-sm py-6 bg-white border-t">
        © 2025 Linkin.us. All rights reserved.
      </footer>
    </div>
  );
};

export default LinkinPage;
