import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LinkinPage from './LinkinPage';
import Showcase from './pages/showcase';
import AdminPanel from './pages/adminpanel';
import AffiliatedWishlist from './pages/affiliatedwishlist';
import AdvertisersWishlist from './pages/advertiserswishlist';
import DataBase from './pages/database';
import LogIn from './pages/login';
import WriteReview from './pages/writereview';
import Offers from './pages/offers';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<LinkinPage />} />
      <Route path="/showcase" element={<Showcase />} />
      <Route path="/admin" element={<AdminPanel />} />
      <Route path="/affiliatedwishlist" element={<AffiliatedWishlist />} />
      <Route path="/advertiserswishlist" element={<AdvertisersWishlist />} />
      <Route path="/database" element={<DataBase />} />
      <Route path="/login" element={<LogIn />} />
       <Route path="/offers" element={<Offers />} />
       <Route path="/writereview" element={<WriteReview />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;