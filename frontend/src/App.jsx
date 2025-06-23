import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ToastProvider from './components/ToastProvider';
import AdBondPage from './AdBondPage';
import Showcase from './pages/showcase';
import AdminPanel from './pages/adminpanel';
import AffiliatedWishlist from './pages/affiliatedwishlist';
import AdvertisersWishlist from './pages/advertiserswishlist';
import DataBase from './pages/database';
import LogIn from './pages/login';
import WriteReview from './pages/writereview';
import WriteReviewNew from './pages/writeReviewNew';
import Offers from './pages/offers';
import SignupPage from './pages/signup';
import RegisterEntityPage from './pages/registerEntity';
import AdvertiserDashboard from './pages/advertiserDashboard';
import AffiliateDashboard from './pages/affiliateDashboard';
import NetworkDashboard from './pages/networkDashboard';
import UserDashboardPage from './pages/userDashboard';
import ProfilePage from './pages/profilepage';
import OfferDetails from './pages/offerDetails';
import EntityDetails from './pages/entityDetails';
import EmailVerificationPage from './pages/emailVerification';

const App = () => {
  return (
    <ToastProvider>
      <Routes>
        <Route path="/" element={<AdBondPage />} />
        <Route path="/showcase" element={<Showcase />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/affiliatedwishlist" element={<AffiliatedWishlist />} />
        <Route path="/advertiserswishlist" element={<AdvertisersWishlist />} />
        <Route path="/affliate-industry" element={<DataBase />} />
        <Route path="/login" element={<LogIn />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/verify-email" element={<EmailVerificationPage />} />
        <Route path="/register-entity" element={<RegisterEntityPage />} />
        <Route path="/offers" element={<Offers />} />
        <Route path="/writereview" element={<WriteReview />} />
        <Route path="/write-review" element={<WriteReviewNew />} />
        <Route path="/advertiser-dashboard" element={<AdvertiserDashboard />} />
        <Route path="/affiliate-dashboard" element={<AffiliateDashboard />} />
        <Route path="/network-dashboard" element={<NetworkDashboard />} />
        <Route path="/user-dashboard" element={<UserDashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/offer/:offerId" element={<OfferDetails />} />
        <Route path="/entity/:entityId" element={<EntityDetails />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </ToastProvider>
  );
};

export default App;