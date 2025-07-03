import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  HomeIcon, 
  RectangleStackIcon, 
  CalendarIcon, 
  SparklesIcon,
  Cog6ToothIcon,
  ClockIcon,
  ChartBarIcon,
  XMarkIcon,
  CpuChipIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const navigationItems = [
    { 
      path: '/dashboard', 
      name: 'Dashboard', 
      icon: HomeIcon,
      description: 'Overview & insights'
    },
    { 
      path: '/tasks', 
      name: 'Tasks', 
      icon: RectangleStackIcon,
      description: 'Manage your tasks'
    },
    { 
      path: '/pomodoro', 
      name: 'Pomodoro', 
      icon: ClockIcon,
      description: 'Focus sessions'
    },
    { 
      path: '/ai-assistant', 
      name: 'AI Assistant', 
      icon: CpuChipIcon,
      description: 'Smart productivity tips'
    },
    { 
      path: '/calendar', 
      name: 'Calendar', 
      icon: CalendarIcon,
      description: 'Schedule & events'
    },
    { 
      path: '/flashcards', 
      name: 'Flashcards', 
      icon: BookOpenIcon,
      description: 'Study & memorize'
    },
    { 
      path: '/analytics', 
      name: 'Analytics', 
      icon: ChartBarIcon,
      description: 'Progress tracking'
    },
    { 
      path: '/settings', 
      name: 'Settings', 
      icon: Cog6ToothIcon,
      description: 'Preferences & account'
    },
  ];

  const isActive = (path: string) => {
    // Handle dashboard route specially
    if (path === '/dashboard' && (location.pathname === '/dashboard' || location.pathname === '/')) {
      return true;
    }
    return location.pathname === path;
  };

  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex flex-col h-full w-72 glass border-r border-white/10 relative"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/10">
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <SparklesIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold text-white">TaskTide</span>
            <div className="text-xs text-primary-400 font-medium">Premium</div>
          </div>
        </Link>
        
        {/* Close Button (Mobile) */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-xl glass hover:bg-white/10 transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-400" />
          </button>
        )}
      </div>

      {/* User Profile */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold truncate">
              {user?.displayName || 'User'}
            </p>
            <p className="text-gray-400 text-sm truncate">
              {user?.email}
            </p>
          </div>
        </div>
        
        {/* Status Indicator */}
        <div className="mt-4 flex items-center gap-2 text-sm">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-gray-300">Active now</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navigationItems.map((item, index) => {
          const IconComponent = item.icon;
          const active = isActive(item.path);
          
          return (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Link
                to={item.path}
                onClick={onClose}
                className={`group flex items-center gap-4 p-4 rounded-xl transition-all duration-300 relative ${
                  active
                    ? 'bg-gradient-to-r from-primary-500/20 to-accent-500/20 text-white border border-primary-500/30 shadow-glow'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {/* Active Indicator */}
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-primary-500 to-accent-500 rounded-r-full"></div>
                )}
                
                {/* Icon */}
                <div className={`p-2 rounded-lg transition-all duration-300 ${
                  active 
                    ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white scale-110' 
                    : 'bg-white/5 group-hover:bg-white/10 group-hover:scale-105'
                }`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                
                {/* Text */}
                <div className="flex-1">
                  <div className={`font-semibold transition-colors ${
                    active ? 'text-white' : 'group-hover:text-white'
                  }`}>
                    {item.name}
                  </div>
                  <div className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">
                    {item.description}
                  </div>
                </div>

                {/* Hover Arrow */}
                <div className={`transition-all duration-300 ${
                  active ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'
                }`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-white/10 space-y-3">
        {/* Quick Stats */}
        <div className="glass rounded-xl p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-1">47</div>
            <div className="text-xs text-gray-400">Tasks completed today</div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 p-3 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-300 group"
        >
          <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </motion.div>
  );
};

export default Sidebar;
