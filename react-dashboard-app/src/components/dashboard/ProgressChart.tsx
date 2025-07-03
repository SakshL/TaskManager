import React, { useMemo } from 'react';
import { BarChart3, TrendingUp, Calendar, Target } from 'lucide-react';

interface ProgressChartProps {
  weeklyData?: Array<{
    day: string;
    completed: number;
    total: number;
  }>;
  loading?: boolean;
}

const ProgressChart: React.FC<ProgressChartProps> = ({ weeklyData = [], loading = false }) => {
  const defaultData = [
    { day: 'Mon', completed: 3, total: 5 },
    { day: 'Tue', completed: 4, total: 6 },
    { day: 'Wed', completed: 2, total: 4 },
    { day: 'Thu', completed: 5, total: 7 },
    { day: 'Fri', completed: 6, total: 8 },
    { day: 'Sat', completed: 4, total: 5 },
    { day: 'Sun', completed: 3, total: 4 }
  ];

  const data = weeklyData.length > 0 ? weeklyData : defaultData;
  
  const maxTotal = Math.max(...data.map(d => d.total));
  const totalCompleted = data.reduce((sum, d) => sum + d.completed, 0);
  const totalTasks = data.reduce((sum, d) => sum + d.total, 0);
  const completionRate = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

  const stats = useMemo(() => [
    {
      label: 'This Week',
      value: `${totalCompleted}/${totalTasks}`,
      subtitle: 'Tasks completed',
      icon: Target,
      color: 'text-blue-600'
    },
    {
      label: 'Success Rate',
      value: `${completionRate}%`,
      subtitle: 'Completion rate',
      icon: TrendingUp,
      color: 'text-green-600'
    },
    {
      label: 'Best Day',
      value: data.reduce((best, current) => 
        current.completed > best.completed ? current : best
      ).day,
      subtitle: `${data.reduce((best, current) => 
        current.completed > best.completed ? current : best
      ).completed} tasks`,
      icon: Calendar,
      color: 'text-purple-600'
    }
  ], [data, totalCompleted, totalTasks, completionRate]);

  if (loading) {
    return (
      <div className="glass rounded-3xl p-6 border border-white/20" data-aos="fade-up" data-aos-delay="400">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/3 mb-6"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-3xl p-6 border border-white/20" data-aos="fade-up" data-aos-delay="400">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500/20 to-indigo-500/20">
          <BarChart3 className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Weekly Progress
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Your task completion this week
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="mb-6">
        <div className="flex items-end justify-between h-32 gap-2">
          {data.map((day, index) => {
            const completedHeight = Math.max((day.completed / maxTotal) * 100, 8);
            const totalHeight = (day.total / maxTotal) * 100;
            
            return (
              <div 
                key={day.day} 
                className="flex-1 flex flex-col items-center gap-2"
                data-aos="fade-up"
                data-aos-delay={500 + index * 50}
              >
                {/* Bar */}
                <div className="relative w-full max-w-8 h-24 flex flex-col justify-end">
                  {/* Total bar (background) */}
                  <div 
                    className="absolute bottom-0 w-full bg-gray-200 dark:bg-gray-700 rounded-t-lg transition-all duration-500"
                    style={{ height: `${totalHeight}%` }}
                  />
                  {/* Completed bar (foreground) */}
                  <div 
                    className="absolute bottom-0 w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all duration-700 hover:scale-105 group cursor-pointer"
                    style={{ height: `${completedHeight}%` }}
                  >
                    {/* Tooltip */}
                    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-2 py-1 rounded-lg text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                      {day.completed}/{day.total}
                    </div>
                  </div>
                </div>
                
                {/* Day label */}
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {day.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <div 
            key={stat.label}
            className="p-4 rounded-2xl bg-gradient-to-br from-gray-50/50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-700/50 border border-gray-200/50 dark:border-gray-600/50 hover:scale-105 transition-transform duration-200"
            data-aos="zoom-in"
            data-aos-delay={600 + index * 100}
          >
            <div className="flex items-center gap-3 mb-2">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {stat.label}
              </span>
            </div>
            <div className="mb-1">
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {stat.subtitle}
            </p>
          </div>
        ))}
      </div>

      {/* Progress indicator */}
      <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200/50 dark:border-green-700/30">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-green-800 dark:text-green-200">
            Weekly Goal Progress
          </span>
          <span className="text-sm font-bold text-green-800 dark:text-green-200">
            {completionRate}%
          </span>
        </div>
        <div className="w-full bg-green-200 dark:bg-green-800 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${Math.min(completionRate, 100)}%` }}
          />
        </div>
        <p className="text-xs text-green-700 dark:text-green-300 mt-2">
          {completionRate >= 80 
            ? "🎉 Excellent progress! You're crushing your goals!" 
            : completionRate >= 60 
            ? "👍 Good progress! Keep up the momentum!" 
            : "💪 You've got this! A little more effort will go a long way!"
          }
        </p>
      </div>
    </div>
  );
};

export default ProgressChart;
