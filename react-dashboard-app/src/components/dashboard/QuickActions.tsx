import React from 'react';
import { Plus, Clock, Target, Brain, Calendar, BarChart3, MessageSquare, Settings, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

const QuickActions: React.FC = () => {
  const actions = [
    {
      title: 'New Task',
      subtitle: 'Create a task',
      icon: Plus,
      color: 'from-blue-500 to-blue-600',
      href: '/tasks',
      shortcut: 'T'
    },
    {
      title: 'Pomodoro',
      subtitle: 'Start focus session',
      icon: Clock,
      color: 'from-red-500 to-red-600',
      href: '/pomodoro',
      shortcut: 'P'
    },
    {
      title: 'AI Assistant',
      subtitle: 'Get help',
      icon: Brain,
      color: 'from-purple-500 to-purple-600',
      href: '/ai-assistant',
      shortcut: 'A'
    },
    {
      title: 'Flashcards',
      subtitle: 'Study & review',
      icon: BookOpen,
      color: 'from-indigo-500 to-indigo-600',
      href: '/flashcards',
      shortcut: 'F'
    },
    {
      title: 'Calendar',
      subtitle: 'View schedule',
      icon: Calendar,
      color: 'from-green-500 to-green-600',
      href: '/calendar',
      shortcut: 'C'
    },
    {
      title: 'Analytics',
      subtitle: 'View progress',
      icon: BarChart3,
      color: 'from-orange-500 to-orange-600',
      href: '/analytics',
      shortcut: 'R'
    },
    {
      title: 'Settings',
      subtitle: 'Preferences',
      icon: Settings,
      color: 'from-gray-500 to-gray-600',
      href: '/settings',
      shortcut: 'S'
    }
  ];

  return (
    <div className="glass rounded-3xl p-6 border border-white/20" data-aos="fade-up" data-aos-delay="200">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20">
          <Target className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Quick Actions
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Jump to any section quickly
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {actions.map((action, index) => (
          <Link
            key={action.title}
            to={action.href}
            className="group relative overflow-hidden rounded-2xl p-4 hover:scale-105 transition-all duration-300 hover:shadow-lg"
            data-aos="zoom-in"
            data-aos-delay={100 + index * 50}
          >
            {/* Background gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-10 group-hover:opacity-20 transition-opacity duration-300`} />
            
            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${action.color} group-hover:scale-110 transition-transform duration-300`}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <div className="px-2 py-1 rounded-lg bg-white/20 dark:bg-black/20 backdrop-blur-sm">
                  <span className="text-xs font-mono text-gray-600 dark:text-gray-300">
                    ⌘{action.shortcut}
                  </span>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                  {action.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {action.subtitle}
                </p>
              </div>
            </div>

            {/* Hover effect */}
            <div className="absolute inset-0 border-2 border-transparent group-hover:border-white/30 rounded-2xl transition-colors duration-300" />
          </Link>
        ))}
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-gray-50/50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-700/50 border border-gray-200/50 dark:border-gray-600/50">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium">💡 Pro tip:</span>
          <span>Use keyboard shortcuts to navigate faster!</span>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
