import React, { useEffect, useState } from 'react';
import Navbar from '../components/navbar';
import { entityAPI } from '../services/entity';

export default function CompanyDatabasePage() {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEntities = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await entityAPI.getPublicEntities(filterType);
        setCompanies(response.entities);
      } catch (err) {
        setError("Failed to fetch entities. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEntities();
  }, [filterType]);

  const filteredCompanies = companies.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-gray-50 text-gray-900 mt-20 font-sans">
      <Navbar />
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-4">Company Database</h2>
        <p className="mb-6 text-gray-600">
          Browse the affiliate marketing industry directory. Contact details are protected and available only on request.
        </p>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="font-semibold mb-1">Search by Company Name</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="e.g. AdBoost Media"
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div>
            <label className="font-semibold mb-1">Filter by Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="">All</option>
              <option value="Advertiser">Advertiser</option>
              <option value="Affiliate">Affiliate</option>
              <option value="Network">Network</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <table className="w-full table-auto border-collapse text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2 text-left">Company Name</th>
                <th className="border px-4 py-2 text-left">Type</th>
                <th className="border px-4 py-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCompanies.map((company, idx) => (
                <tr key={idx} className="bg-white hover:bg-gray-50">
                  <td className="border px-4 py-2">{company.name}</td>
                  <td className="border px-4 py-2">{company.entity_type}</td>
                  <td className="border px-4 py-2">
                    <button className="text-blue-600 hover:underline">Request Access</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
