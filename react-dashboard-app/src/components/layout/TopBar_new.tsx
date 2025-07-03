import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Bars3Icon,
  BellIcon,
  MagnifyingGlassIcon,
  SunIcon,
  MoonIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

interface TopBarProps {
  onMenuClick: () => void;
  sidebarOpen: boolean;
}

const TopBar: React.FC<TopBarProps> = ({ onMenuClick, sidebarOpen }) => {
  const { user, logout } = useAuth();
  const { currentTheme, toggleTheme } = useTheme();
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    switch (path) {
      case '/dashboard': return 'Dashboard';
      case '/tasks': return 'Tasks';
      case '/pomodoro': return 'Pomodoro';
      case '/ai-assistant': return 'AI Assistant';
      case '/calendar': return 'Calendar';
      case '/analytics': return 'Analytics';
      case '/settings': return 'Settings';
      default: return 'TaskTide';
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const mockNotifications = [
    { id: 1, title: 'Task deadline approaching', message: 'Complete "Review project proposal" by tomorrow', time: '2 min ago', unread: true },
    { id: 2, title: 'Pomodoro session completed', message: 'Great focus! You completed a 25-minute session', time: '15 min ago', unread: true },
    { id: 3, title: 'New AI suggestion', message: 'Break down your large task into smaller subtasks', time: '1 hour ago', unread: false },
  ];

  const unreadCount = mockNotifications.filter(n => n.unread).length;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="glass border-b border-white/10 sticky top-0 z-30 backdrop-blur-xl">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left Side */}
        <div className="flex items-center gap-4">
          {/* Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl glass hover:bg-white/10 transition-colors"
          >
            <Bars3Icon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>

          {/* Page Title & Greeting */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {getPageTitle()}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {getGreeting()}, {user?.displayName?.split(' ')[0] || 'User'}! 
              <span className="ml-2">Ready to be productive? 🚀</span>
            </p>
          </div>
        </div>

        {/* Center - Search Bar */}
        <div className="hidden md:flex flex-1 max-w-xl mx-8">
          <div className="relative w-full">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks, projects, or ask AI..."
              className="w-full pl-10 pr-4 py-2 glass rounded-xl border border-white/20 focus:border-primary-500/50 focus:ring-4 focus:ring-primary-500/20 transition-all duration-300 text-gray-700 dark:text-gray-200 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {/* Quick Add Button */}
          <button className="hidden sm:flex items-center gap-2 btn-primary text-sm px-4 py-2">
            <PlusIcon className="w-4 h-4" />
            Add Task
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-3 rounded-xl glass hover:bg-white/10 transition-all duration-300 hover:scale-105"
            aria-label="Toggle theme"
          >
            {currentTheme === 'dark' ? (
              <SunIcon className="w-5 h-5 text-yellow-500" />
            ) : (
              <MoonIcon className="w-5 h-5 text-gray-600" />
            )}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfile(false);
              }}
              className="relative p-3 rounded-xl glass hover:bg-white/10 transition-all duration-300 hover:scale-105"
            >
              <BellIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-80 glass rounded-2xl border border-white/20 shadow-xl overflow-hidden"
                >
                  <div className="p-4 border-b border-white/10">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{unreadCount} unread</p>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {mockNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer ${
                          notification.unread ? 'bg-primary-500/5' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            notification.unread ? 'bg-primary-500' : 'bg-gray-300'
                          }`}></div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                              {notification.title}
                            </h4>
                            <p className="text-gray-600 dark:text-gray-300 text-sm">
                              {notification.message}
                            </p>
                            <p className="text-gray-400 text-xs mt-1">
                              {notification.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 border-t border-white/10 text-center">
                    <button className="text-primary-500 hover:text-primary-400 text-sm font-medium">
                      View all notifications
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowProfile(!showProfile);
                setShowNotifications(false);
              }}
              className="flex items-center gap-3 p-2 rounded-xl glass hover:bg-white/10 transition-all duration-300 hover:scale-105"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user?.displayName || 'User'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Premium</p>
              </div>
            </button>

            {/* Profile Dropdown */}
            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-64 glass rounded-2xl border border-white/20 shadow-xl overflow-hidden"
                >
                  <div className="p-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                        {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {user?.displayName || 'User'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-2">
                    <button
                      onClick={() => {
                        navigate('/settings');
                        setShowProfile(false);
                      }}
                      className="w-full flex items-center gap-3 p-3 text-gray-700 dark:text-gray-200 hover:bg-white/10 rounded-xl transition-colors"
                    >
                      <Cog6ToothIcon className="w-5 h-5" />
                      Settings
                    </button>
                    
                    <button
                      onClick={() => {
                        navigate('/settings');
                        setShowProfile(false);
                      }}
                      className="w-full flex items-center gap-3 p-3 text-gray-700 dark:text-gray-200 hover:bg-white/10 rounded-xl transition-colors"
                    >
                      <UserCircleIcon className="w-5 h-5" />
                      Profile
                    </button>
                    
                    <div className="border-t border-white/10 my-2"></div>
                    
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                    >
                      <ArrowRightOnRectangleIcon className="w-5 h-5" />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="md:hidden px-6 pb-4">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 glass rounded-xl border border-white/20 focus:border-primary-500/50 focus:ring-4 focus:ring-primary-500/20 transition-all duration-300 text-gray-700 dark:text-gray-200 placeholder-gray-400"
          />
        </div>
      </div>

      {/* Click Outside Handler */}
      {(showProfile || showNotifications) && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => {
            setShowProfile(false);
            setShowNotifications(false);
          }}
        />
      )}
    </div>
  );
};

export default TopBar;
