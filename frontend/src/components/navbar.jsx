import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <header className="fixed top-0 left-0 w-full bg-gray-50 z-50 h-18 sm:h-24">
      <div className="container mx-auto flex justify-between items-center h-full px-4 sm:px-6 lg:px-20 flex-wrap">
        <a href="/" className="flex items-center">
          <img src="/assets/linkinlogo.png" alt="Linkin Logo" className="h-18 w-[140px] sm:h-12" />
        </a>

        <nav className="flex flex-wrap gap-4 sm:gap-6  items-center">
          <a href="/offers" className="text-sm sm:text-base font-semibold hover:text-blue-700">Offers</a>
          <Link to="/affiliatedwishlist" className="text-sm sm:text-base font-semibold hover:text-blue-700">Wishlist</Link>
          <a href="/writereview" className="text-sm sm:text-base font-semibold hover:text-blue-700">Reviews</a>
          <a href="/database" className="text-sm sm:text-base font-semibold hover:text-blue-700">Database</a>
          <Link to="/login">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm sm:text-base">
              Log in
            </button>
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
