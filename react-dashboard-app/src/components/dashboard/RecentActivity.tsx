import React from 'react';
import { CheckCircle2, Clock, Target, TrendingUp, Star, ArrowRight } from 'lucide-react';
import { Task } from '../../types';

interface RecentActivityProps {
  recentTasks: Task[];
  totalPomodoros: number;
}

const RecentActivity: React.FC<RecentActivityProps> = ({ recentTasks, totalPomodoros }) => {
  const getActivityIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'in-progress':
        return <Clock className="w-4 h-4 text-orange-500" />;
      default:
        return <Target className="w-4 h-4 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <div className="glass rounded-3xl p-6 border border-white/20" data-aos="fade-up" data-aos-delay="300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Recent Activity
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Your latest progress
            </p>
          </div>
        </div>
        <button className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1 hover:gap-2 transition-all duration-200">
          View All
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Activity Feed */}
      <div className="space-y-4">
        {/* Pomodoro Sessions Summary */}
        {totalPomodoros > 0 && (
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-gradient-to-r from-red-50/50 to-pink-50/50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200/50 dark:border-red-700/30" data-aos="slide-left">
            <div className="p-2 rounded-xl bg-red-500/20">
              <Clock className="w-4 h-4 text-red-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-gray-900 dark:text-white">
                  {totalPomodoros} Focus Sessions
                </span>
                <span className="px-2 py-1 rounded-lg bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 text-xs font-medium">
                  Today
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Great focus! You completed {totalPomodoros} Pomodoro session{totalPomodoros !== 1 ? 's' : ''} today.
              </p>
            </div>
          </div>
        )}

        {/* Recent Tasks */}
        {recentTasks.length > 0 ? (
          recentTasks.slice(0, 4).map((task, index) => (
            <div 
              key={task.id} 
              className="flex items-start gap-4 p-4 rounded-2xl hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors duration-200 border border-transparent hover:border-gray-200/50 dark:hover:border-gray-700/50"
              data-aos="slide-left"
              data-aos-delay={index * 100}
            >
              <div className="mt-1">
                {getActivityIcon(task.status)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-medium text-gray-900 dark:text-white truncate">
                    {task.title}
                  </h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {formatTimeAgo(task.updatedAt)}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                  <span className="px-2 py-1 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-xs font-medium">
                    {task.subject}
                  </span>
                  {task.status === 'completed' && (
                    <div className="flex items-center gap-1 text-green-600">
                      <Star className="w-3 h-3 fill-current" />
                      <span className="text-xs font-medium">Completed</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
              <Target className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 mb-2">No recent activity</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Create your first task to get started!
            </p>
          </div>
        )}
      </div>

      {/* Achievement Badge */}
      {recentTasks.filter(t => t.status === 'completed').length >= 3 && (
        <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200/50 dark:border-yellow-700/30" data-aos="bounce">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-yellow-500/20">
              <Star className="w-5 h-5 text-yellow-600 fill-current" />
            </div>
            <div>
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">
                🎉 Productivity Streak!
              </h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                You've completed multiple tasks recently. Keep it up!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentActivity;
