import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  CheckSquareIcon, 
  CalendarIcon, 
  BotIcon, 
  SettingsIcon,
  TimerIcon,
  BarChartIcon
} from 'lucide-react';

const Sidebar: React.FC = () => {
    const location = useLocation();
    
    const navigationItems = [
        { path: '/dashboard', name: 'Dashboard', icon: HomeIcon },
        { path: '/tasks', name: 'Tasks', icon: CheckSquareIcon },
        { path: '/calendar', name: 'Calendar', icon: CalendarIcon },
        { path: '/pomodoro', name: 'Pomodoro', icon: TimerIcon },
        { path: '/analytics', name: 'Analytics', icon: BarChartIcon },
        { path: '/ai-assistant', name: 'AI Assistant', icon: BotIcon },
        { path: '/settings', name: 'Settings', icon: SettingsIcon },
    ];

    return (
        <div className="flex flex-col h-full bg-gray-900 text-white w-64 shadow-lg">
            <div className="flex items-center justify-center h-16 border-b border-gray-700">
                <h1 className="text-xl font-bold text-blue-400">Task Manager</h1>
            </div>
            <nav className="flex-1 p-4">
                <ul className="space-y-2">
                    {navigationItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        
                        return (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${
                                        isActive 
                                            ? 'bg-blue-600 text-white' 
                                            : 'hover:bg-gray-800 text-gray-300'
                                    }`}
                                >
                                    <Icon className="w-5 h-5 mr-3" />
                                    <span className="font-medium">{item.name}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </div>
    );
};

export default Sidebar;