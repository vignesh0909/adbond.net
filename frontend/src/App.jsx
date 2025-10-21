import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ToastProvider from './components/ToastProvider';
import TokenExpirationWarning from './components/TokenExpirationWarning';
import ProtectedRoute from './components/ProtectedRoute';
import NavigationGuard from './components/NavigationGuard';
import { AuthProvider } from './contexts/AuthContext';
import AdBondPage from './AdBondPage';
import AdminPanel from './pages/adminpanel';
import DataBase from './pages/database';
import LogIn from './pages/login';
import WriteReview from './pages/writeReview';
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
import ResetPasswordPage from './pages/resetPassword';
import Wishlists from './pages/wishlists';
import OpenChatPage from './pages/openChat';

const App = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <TokenExpirationWarning />
        <NavigationGuard />
        <Routes>
          <Route path="/" element={<AdBondPage />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/wishlist" element={
            <ProtectedRoute requireAuth={true}>
              <Wishlists />
            </ProtectedRoute>
          } />
          <Route path="/affliate-industry" element={<DataBase />} />
          <Route path="/login" element={<LogIn />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/verify-email" element={<EmailVerificationPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/register-entity" element={<RegisterEntityPage />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/write-review" element={<WriteReview />} />
          <Route path="/writereview" element={<Navigate to="/write-review" />} />
          <Route path="/advertiser-dashboard" element={
            <ProtectedRoute requireAuth={true} requireEntity={true}>
              <AdvertiserDashboard />
            </ProtectedRoute>
          } />
          <Route path="/affiliate-dashboard" element={
            <ProtectedRoute requireAuth={true}>
              <AffiliateDashboard />
            </ProtectedRoute>
          } />
          <Route path="/network-dashboard" element={
            <ProtectedRoute requireAuth={true}>
              <NetworkDashboard />
            </ProtectedRoute>
          } />
          <Route path="/user-dashboard" element={
            <ProtectedRoute requireAuth={true}>
              <UserDashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute requireAuth={true}>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/chat" element={
            <ProtectedRoute requireAuth={true}>
              <OpenChatPage />
            </ProtectedRoute>
          } />
          <Route path="/offer/:offerId" element={<OfferDetails />} />
          <Route path="/entity/:entityId" element={<EntityDetails />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;