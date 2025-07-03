import React from 'react';
import useAuth from '../../hooks/useAuth';
import { logout } from '../../services/auth';
import { useNavigate } from 'react-router-dom';
import { LogOutIcon, UserIcon, BellIcon } from 'lucide-react';

const TopBar: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    return (
        <div className="flex justify-between items-center p-4 bg-white shadow-sm border-b border-gray-200">
            <div className="flex items-center">
                <h1 className="text-2xl font-semibold text-gray-800">
                    Good morning, {user?.displayName?.split(' ')[0] || 'User'}!
                </h1>
            </div>
            
            <div className="flex items-center space-x-4">
                {/* Notifications */}
                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
                    <BellIcon className="w-5 h-5" />
                </button>
                
                {/* User Info */}
                <div className="flex items-center space-x-3">
                    {user?.photoURL ? (
                        <img
                            src={user.photoURL}
                            alt="Profile"
                            className="w-8 h-8 rounded-full"
                        />
                    ) : (
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <UserIcon className="w-4 h-4 text-white" />
                        </div>
                    )}
                    <span className="text-sm font-medium text-gray-700">
                        {user?.displayName || user?.email}
                    </span>
                </div>
                
                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                >
                    <LogOutIcon className="w-4 h-4" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default TopBar;