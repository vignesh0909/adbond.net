import React from 'react';
import Navbar from '../components/navbar';

export default function AdvertisersShowcasePage() {
  const [offers, setOffers] = React.useState([]);
  const [searchTerm, setSearchTerm] = React.useState("");

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        setOffers(json);
      } catch {
        alert("Invalid JSON format. Please upload a valid offer file.");
      }
    };
    if (file) reader.readAsText(file);
  };

  return (
       <div className="bg-gray-50 text-gray-900 font-sans">
       <Navbar />

    <section className="py-16 px-6 max-w-5xl mx-auto">
        

      <h2 className="text-3xl font-bold mb-2">Offers</h2>
      <p className="mb-4 text-gray-600">Discover all available offers. Filter and explore what's best for your traffic.. You can also search for specific categories, GEOs, or titles.</p>

      <div className="mb-6 flex flex-col md:flex-row gap-4 items-start md:items-end">
        <div className="flex flex-col w-full md:w-1/2">
          <label className="font-semibold mb-1">Upload Offers (JSON)</label>
          <input type="file" accept="application/json" onChange={handleFileUpload} className="border px-3 py-2 rounded" />
        </div>
        <div className="flex flex-col w-full md:w-1/2">
          <label className="font-semibold mb-1">Search Offers</label>
          <input type="text" placeholder="Search by title, GEO or category..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="border px-3 py-2 rounded" />
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const newOffer = {
            title: e.target.title.value,
            geo: e.target.geo.value,
            payout: e.target.payout.value,
            category: e.target.category.value,
            description: e.target.description.value,
          };
          setOffers([...offers, newOffer]);
          e.target.reset();
        }}
        className="space-y-4 border p-4 rounded mb-8 bg-gray-50"
      >
        <h3 className="text-xl font-semibold">Add Offer Manually</h3>
        <input name="title" required className="w-full border px-3 py-2 rounded" placeholder="Offer Title" />
        <input name="geo" required className="w-full border px-3 py-2 rounded" placeholder="Target GEOs (e.g. US, CA)" />
        <input name="payout" required className="w-full border px-3 py-2 rounded" placeholder="Payout (e.g. $45/lead)" />
        <input name="category" required className="w-full border px-3 py-2 rounded" placeholder="Category (e.g. Health, Finance)" />
        <textarea name="description" required className="w-full border px-3 py-2 rounded" rows="4" placeholder="Brief description"></textarea>
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          Add Offer
        </button>
      </form>

      <div className="overflow-auto">
  <table className="w-full table-auto border-collapse border text-sm">
    <thead className="bg-gray-100">
      <tr>
        <th className="border px-4 py-2 text-left">Title</th>
        <th className="border px-4 py-2 text-left">Category</th>
        <th className="border px-4 py-2 text-left">Target GEO</th>
        <th className="border px-4 py-2 text-left">Payout</th>
        <th className="border px-4 py-2 text-left">Description</th>
        <th className="border px-4 py-2 text-left">Action</th>
      </tr>
    </thead>
    <tbody>
      {offers.map((offer, index) => (
        <tr key={index} className="bg-white hover:bg-gray-50">
          <td className="border px-4 py-2">{offer.title}</td>
          <td className="border px-4 py-2">{offer.category}</td>
          <td className="border px-4 py-2">{offer.geo}</td>
          <td className="border px-4 py-2">{offer.payout}</td>
          <td className="border px-4 py-2">{offer.description}</td>
          <td className="border px-4 py-2">
            <button className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 transition">
              Contact Advertiser
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
    </section>
    </div>
  );
}
