import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'teal';
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  trend,
  className = ''
}) => {
  const colorClasses = {
    blue: {
      bg: 'from-blue-500/20 to-blue-600/30',
      icon: 'text-blue-600',
      accent: 'bg-blue-500/20',
      border: 'border-blue-500/30'
    },
    green: {
      bg: 'from-green-500/20 to-green-600/30',
      icon: 'text-green-600',
      accent: 'bg-green-500/20',
      border: 'border-green-500/30'
    },
    purple: {
      bg: 'from-purple-500/20 to-purple-600/30',
      icon: 'text-purple-600',
      accent: 'bg-purple-500/20',
      border: 'border-purple-500/30'
    },
    orange: {
      bg: 'from-orange-500/20 to-orange-600/30',
      icon: 'text-orange-600',
      accent: 'bg-orange-500/20',
      border: 'border-orange-500/30'
    },
    red: {
      bg: 'from-red-500/20 to-red-600/30',
      icon: 'text-red-600',
      accent: 'bg-red-500/20',
      border: 'border-red-500/30'
    },
    teal: {
      bg: 'from-teal-500/20 to-teal-600/30',
      icon: 'text-teal-600',
      accent: 'bg-teal-500/20',
      border: 'border-teal-500/30'
    }
  };

  const colors = colorClasses[color];

  return (
    <div 
      className={`glass rounded-3xl p-6 border ${colors.border} hover:scale-105 transition-all duration-300 hover:shadow-xl group ${className}`}
      data-aos="fade-up"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-3 rounded-2xl ${colors.accent} group-hover:scale-110 transition-transform duration-300`}>
              <Icon className={`w-6 h-6 ${colors.icon}`} />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {title}
              </h3>
              {trend && (
                <div className={`flex items-center gap-1 text-xs ${
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                }`}>
                  <span>{trend.isPositive ? '↗' : '↘'}</span>
                  <span>{Math.abs(trend.value)}%</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              {value}
            </div>
            {subtitle && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>
      
      {/* Animated background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10`} />
    </div>
  );
};

export default StatsCard;
