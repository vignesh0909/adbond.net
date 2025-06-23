import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/navbar';
import UserDashboard from '../components/UserDashboard';
import { authAPI } from '../services/auth';

export default function UserDashboardPage() {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = () => {
        const isLoggedIn = authAPI.isLoggedIn();
        const user = authAPI.getCurrentUser();

        if (isLoggedIn && user) {
            // Check if user should be redirected to a specific dashboard
            if (user.role === 'admin') {
                navigate('/admin');
                return;
            } else if (user.role === 'advertiser') {
                navigate('/advertiser-dashboard');
                return;
            } else if (user.role === 'affiliate') {
                navigate('/affiliate-dashboard');
                return;
            } else if (user.role === 'network') {
                navigate('/network-dashboard');
                return;
            }
            
            // For regular users or users without specific roles, show the dashboard
            setCurrentUser(user);
        } else {
            // Not logged in, redirect to login
            navigate('/login');
            return;
        }
        setLoading(false);
    };

    const handleLogout = () => {
        authAPI.logout();
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="pt-24 pb-16 px-6 max-w-6xl mx-auto">
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!currentUser) {
        return null; // Will redirect to login
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <UserDashboard currentUser={currentUser} onLogout={handleLogout} />
        </div>
    );
}
