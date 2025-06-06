import React from 'react';
import Navbar from '../components/navbar';

export default function LoginDashboardPage() {
  const [loggedIn, setLoggedIn] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [agreed, setAgreed] = React.useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    if (email === "admin@linkin.us" && password === "password") {
      setLoggedIn(true);
    } else {
      alert("Invalid credentials");
    }
  };

  if (!loggedIn) {
    return (
         <div className="bg-gray-50 text-gray-900 mt-20 font-sans">
               <Navbar />
      <section className="py-20 px-6 max-w-md mx-auto">
        <h2 className="text-3xl font-bold mb-6">Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full border px-3 py-2 rounded"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full border px-3 py-2 rounded"
            required
          />
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1"
              required
            />
            <label className="text-xs text-gray-600">
              I agree that this platform is for informational use only and the data is not guaranteed. I accept the disclaimer below.
            </label>
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            disabled={!agreed}
          >
            Login
          </button>
        </form>
        <div className="mt-8 text-xs text-gray-500 border-t pt-4">
          <p>
            Statutory Notice: We are not liable for any information provided here. This platform is intended solely to help the affiliate marketing industry. We do not take responsibility for any content or claims posted.
          </p>
          <p className="mt-2">
            The company database (contact details, names, etc.) was personally gathered by us from LinkedIn and industry summits. We share it to help others — but we do not guarantee accuracy or results.
          </p>
        </div>
      </section>
      </div>
    );
  }

  return (
    <section className="py-16 px-6 max-w-5xl mx-auto">
      <button onClick={() => setLoggedIn(false)} className="mb-4 text-sm text-blue-600 underline">Logout</button>
      <h2 className="text-3xl font-bold mb-6">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border rounded p-4 shadow bg-white">
          <h3 className="font-semibold mb-2">My Reviews</h3>
          <p className="text-sm text-gray-600">You have written 2 reviews.</p>
        </div>
        <div className="border rounded p-4 shadow bg-white">
          <h3 className="font-semibold mb-2">Wishlist Offers</h3>
          <p className="text-sm text-gray-600">You’ve requested 4 offers this month.</p>
        </div>
        <div className="border rounded p-4 shadow bg-white">
          <h3 className="font-semibold mb-2">Submitted Offers</h3>
          <p className="text-sm text-gray-600">You have 3 active offers listed.</p>
        </div>
      </div>
    </section>
  );
}
