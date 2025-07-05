import React from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon,
  Square3Stack3DIcon as CheckSquareIcon,
  CalendarIcon,
  ChartBarIcon,
  SparklesIcon,
  ClockIcon,
  CogIcon,
  BookOpenIcon,
  TrophyIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';

const AppFooter: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const quickLinks = [
    { icon: HomeIcon, label: 'Dashboard', path: '/dashboard' },
    { icon: CheckSquareIcon, label: 'Tasks', path: '/tasks' },
    { icon: CalendarIcon, label: 'Calendar', path: '/calendar' },
    { icon: ChartBarIcon, label: 'Analytics', path: '/analytics' },
    { icon: SparklesIcon, label: 'AI Assistant', path: '/ai-assistant' },
  ];

  const mobileNavLinks = [
    { icon: HomeIcon, label: 'Home', path: '/dashboard' },
    { icon: CheckSquareIcon, label: 'Tasks', path: '/tasks' },
    { icon: ClockIcon, label: 'Pomodoro', path: '/pomodoro' },
    { icon: ChartBarIcon, label: 'Analytics', path: '/analytics' },
    { icon: SparklesIcon, label: 'AI', path: '/ai-assistant' },
  ];

  const isActivePath = (path: string) => location.pathname === path;

  return (
    <>
      {/* Desktop Footer */}
      <footer className="hidden lg:block bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Quick Links */}
            <div className="flex items-center space-x-6">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Quick Access:</span>
              <div className="flex items-center space-x-4">
                {quickLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActivePath(link.path)
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                        : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <link.icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Right: User Info and Settings */}
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Welcome back, <span className="font-medium text-gray-900 dark:text-white">{user?.displayName?.split(' ')[0] || 'Student'}</span>
              </div>
              <Link
                to="/settings"
                className="p-2 rounded-lg text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Settings"
              >
                <CogIcon className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-t border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center justify-around py-2">
          {mobileNavLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200 ${
                isActivePath(link.path)
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <link.icon className={`w-6 h-6 mb-1 ${isActivePath(link.path) ? 'scale-110' : ''} transition-transform`} />
              <span className="text-xs font-medium">{link.label}</span>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Quick Action Floating Button (Mobile) */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 260, damping: 20 }}
        className="lg:hidden fixed bottom-20 right-4 z-40"
      >
        <Link
          to="/tasks?action=create"
          className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
        >
          <CheckSquareIcon className="w-7 h-7" />
        </Link>
      </motion.div>
    </>
  );
};

export default AppFooter;
