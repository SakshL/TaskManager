import React from 'react';
import useAuth from '../hooks/useAuth';
import { logout } from '../services/auth';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    if (loading) {
        return (
            <div className="p-4">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="mt-2 text-gray-600">
                        Welcome back, {user?.displayName || user?.email || 'User'}!
                    </p>
                </div>
                <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                    Logout
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Tasks</h3>
                    <p className="text-3xl font-bold text-blue-600">0</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Completed Today</h3>
                    <p className="text-3xl font-bold text-green-600">0</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Focus Time</h3>
                    <p className="text-3xl font-bold text-purple-600">0h 0m</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
                <p className="text-gray-500">No recent activity to display.</p>
            </div>
        </div>
    );
};

export default Dashboard;