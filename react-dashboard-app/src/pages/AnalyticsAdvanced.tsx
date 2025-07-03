import React, { useState, useEffect, useMemo } from 'react';
import { BarChart3, TrendingUp, Calendar, Clock, Target, CheckCircle2, Zap, Award, Download, Filter } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { subscribeToUserTasks, getUserPomodoroSessions } from '../services/firestore';
import { Task, PomodoroSession } from '../types';
import LoadingSpinner from '../components/ui/LoadingSpinner';

// Animated Counter Component
const AnimatedCounter: React.FC<{ 
  value: number; 
  duration?: number; 
  suffix?: string;
  prefix?: string;
}> = ({ value, duration = 1000, suffix = '', prefix = '' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animateCount = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      setCount(Math.floor(progress * value));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animateCount);
      }
    };

    animationFrame = requestAnimationFrame(animateCount);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [value, duration]);

  return <span>{prefix}{count}{suffix}</span>;
};

const AnalyticsAdvanced: React.FC = () => {
  const { user } = useAuth();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [pomodoroSessions, setPomodoroSessions] = useState<PomodoroSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');

  useEffect(() => {
    if (user) {
      const unsubscribe = subscribeToUserTasks(user.uid, (userTasks) => {
        setTasks(userTasks);
        setLoading(false);
      });

      loadPomodoroData();
      return () => unsubscribe();
    }
  }, [user]);

  const loadPomodoroData = async () => {
    if (user) {
      try {
        const sessions = await getUserPomodoroSessions(user.uid);
        setPomodoroSessions(sessions);
      } catch (error) {
        console.error('Error loading pomodoro data:', error);
      }
    }
  };

  // Calculate analytics data
  const analytics = useMemo(() => {
    const now = new Date();
    const periodStart = new Date();
    
    switch (selectedPeriod) {
      case 'week':
        periodStart.setDate(now.getDate() - 7);
        break;
      case 'month':
        periodStart.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        periodStart.setFullYear(now.getFullYear() - 1);
        break;
    }

    const periodTasks = tasks.filter(task => 
      new Date(task.createdAt) >= periodStart
    );
    
    const periodPomodoros = pomodoroSessions.filter(session => 
      new Date(session.startTime) >= periodStart
    );

    const completedTasks = periodTasks.filter(task => task.status === 'completed');
    const completionRate = periodTasks.length > 0 ? (completedTasks.length / periodTasks.length) * 100 : 0;
    
    const totalFocusTime = periodPomodoros
      .filter(s => s.completed && s.type === 'work')
      .reduce((total, session) => total + session.duration, 0);

    // Daily breakdown
    const dailyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const dayTasks = tasks.filter(task => {
        const taskDate = new Date(task.createdAt);
        return taskDate.toDateString() === date.toDateString();
      });
      
      const dayCompleted = dayTasks.filter(task => task.status === 'completed').length;
      
      const dayPomodoros = pomodoroSessions.filter(session => {
        const sessionDate = new Date(session.startTime);
        return sessionDate.toDateString() === date.toDateString() && session.completed;
      }).length;

      dailyData.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        tasks: dayTasks.length,
        completed: dayCompleted,
        pomodoros: dayPomodoros,
        focusTime: pomodoroSessions
          .filter(s => {
            const sessionDate = new Date(s.startTime);
            return sessionDate.toDateString() === date.toDateString() && s.completed && s.type === 'work';
          })
          .reduce((total, session) => total + session.duration, 0)
      });
    }

    // Subject breakdown
    const subjectStats = tasks.reduce((acc, task) => {
      if (!acc[task.subject]) {
        acc[task.subject] = { total: 0, completed: 0 };
      }
      acc[task.subject].total++;
      if (task.status === 'completed') {
        acc[task.subject].completed++;
      }
      return acc;
    }, {} as Record<string, { total: number; completed: number }>);

    // Priority breakdown
    const priorityStats = tasks.reduce((acc, task) => {
      if (!acc[task.priority]) {
        acc[task.priority] = { total: 0, completed: 0 };
      }
      acc[task.priority].total++;
      if (task.status === 'completed') {
        acc[task.priority].completed++;
      }
      return acc;
    }, {} as Record<string, { total: number; completed: number }>);

    // Performance trends
    const avgTasksPerDay = dailyData.reduce((sum, day) => sum + day.tasks, 0) / 7;
    const avgPomodorosPerDay = dailyData.reduce((sum, day) => sum + day.pomodoros, 0) / 7;
    const avgFocusTimePerDay = dailyData.reduce((sum, day) => sum + day.focusTime, 0) / 7;

    return {
      totalTasks: periodTasks.length,
      completedTasks: completedTasks.length,
      completionRate,
      totalFocusTime,
      totalPomodoros: periodPomodoros.filter(s => s.completed).length,
      dailyData,
      subjectStats,
      priorityStats,
      avgTasksPerDay,
      avgPomodorosPerDay,
      avgFocusTimePerDay
    };
  }, [tasks, pomodoroSessions, selectedPeriod]);

  const getPerformanceGrade = (rate: number) => {
    if (rate >= 90) return { grade: 'A+', color: 'text-green-600', bg: 'bg-green-100' };
    if (rate >= 80) return { grade: 'A', color: 'text-green-600', bg: 'bg-green-100' };
    if (rate >= 70) return { grade: 'B', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (rate >= 60) return { grade: 'C', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { grade: 'D', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const exportReport = () => {
    const report = `
TASKTIDE ANALYTICS REPORT
========================
Period: Last ${selectedPeriod}
Generated: ${new Date().toLocaleString()}

OVERVIEW
--------
Total Tasks: ${analytics.totalTasks}
Completed Tasks: ${analytics.completedTasks}
Completion Rate: ${analytics.completionRate.toFixed(1)}%
Total Focus Time: ${Math.round(analytics.totalFocusTime / 60)}h ${analytics.totalFocusTime % 60}m
Total Pomodoros: ${analytics.totalPomodoros}

DAILY AVERAGES
--------------
Tasks per day: ${analytics.avgTasksPerDay.toFixed(1)}
Pomodoros per day: ${analytics.avgPomodorosPerDay.toFixed(1)}
Focus time per day: ${Math.round(analytics.avgFocusTimePerDay)}m

SUBJECT BREAKDOWN
-----------------
${Object.entries(analytics.subjectStats).map(([subject, stats]) => 
  `${subject}: ${stats.completed}/${stats.total} (${((stats.completed / stats.total) * 100).toFixed(1)}%)`
).join('\n')}

DAILY BREAKDOWN
---------------
${analytics.dailyData.map(day => 
  `${day.date}: ${day.completed}/${day.tasks} tasks, ${day.pomodoros} pomodoros, ${day.focusTime}m focus`
).join('\n')}
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tasktide-analytics-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="xl" text="Loading your analytics..." />
      </div>
    );
  }

  const performanceGrade = getPerformanceGrade(analytics.completionRate);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-900 dark:via-teal-900 dark:to-cyan-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center mb-8" data-aos="fade-down">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent mb-4">
            Performance Analytics
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover insights about your productivity and learning progress 📊
          </p>
        </div>

        {/* Controls */}
        <div className="glass rounded-3xl p-6 border border-white/20 mb-8" data-aos="fade-up">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Time Period:</span>
              <div className="flex gap-2">
                {(['week', 'month', 'year'] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                      selectedPeriod === period
                        ? 'bg-emerald-500 text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    Last {period}
                  </button>
                ))}
              </div>
            </div>
            
            <button
              onClick={exportReport}
              className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors duration-200 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Overall Performance */}
          <div className="glass rounded-3xl p-6 border border-white/20 text-center" data-aos="fade-up">
            <div className="flex items-center justify-center mb-4">
              <div className={`p-4 rounded-full ${performanceGrade.bg}`}>
                <Award className={`w-8 h-8 ${performanceGrade.color}`} />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Overall Grade</h3>
            <div className={`text-3xl font-bold ${performanceGrade.color} mb-2`}>
              {performanceGrade.grade}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {analytics.completionRate.toFixed(1)}% completion rate
            </p>
          </div>

          {/* Tasks Completed */}
          <div className="glass rounded-3xl p-6 border border-white/20" data-aos="fade-up" data-aos-delay="100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Tasks Completed</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">This {selectedPeriod}</p>
              </div>
            </div>
            <div className="text-3xl font-bold text-green-600 mb-2">
              <AnimatedCounter value={analytics.completedTasks} />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              of <AnimatedCounter value={analytics.totalTasks} /> total tasks
            </p>
          </div>

          {/* Focus Time */}
          <div className="glass rounded-3xl p-6 border border-white/20" data-aos="fade-up" data-aos-delay="200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Focus Time</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total minutes</p>
              </div>
            </div>
            <div className="text-3xl font-bold text-purple-600 mb-2">
              <AnimatedCounter value={Math.round(analytics.totalFocusTime / 60)} suffix="h" /> <AnimatedCounter value={analytics.totalFocusTime % 60} suffix="m" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <AnimatedCounter value={analytics.totalPomodoros} /> pomodoro sessions
            </p>
          </div>

          {/* Productivity Score */}
          <div className="glass rounded-3xl p-6 border border-white/20" data-aos="fade-up" data-aos-delay="300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-orange-100 dark:bg-orange-900/30">
                <Zap className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Daily Average</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tasks per day</p>
              </div>
            </div>
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {analytics.avgTasksPerDay.toFixed(1)}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {analytics.avgPomodorosPerDay.toFixed(1)} pomodoros/day
            </p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Daily Progress Chart */}
          <div className="glass rounded-3xl p-6 border border-white/20" data-aos="fade-up">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              Daily Progress
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.dailyData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis 
                    dataKey="date" 
                    fontSize={12}
                    tick={{ fill: 'currentColor' }}
                  />
                  <YAxis fontSize={12} tick={{ fill: 'currentColor' }} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Bar dataKey="completed" fill="#10b981" name="Completed Tasks" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="tasks" fill="#e5e7eb" name="Total Tasks" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Focus Time Trend */}
          <div className="glass rounded-3xl p-6 border border-white/20" data-aos="fade-up" data-aos-delay="100">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Clock className="w-6 h-6 text-purple-600" />
              Focus Time Trend
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.dailyData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis 
                    dataKey="date" 
                    fontSize={12}
                    tick={{ fill: 'currentColor' }}
                  />
                  <YAxis fontSize={12} tick={{ fill: 'currentColor' }} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="focusTime" 
                    stroke="#8b5cf6" 
                    strokeWidth={3}
                    dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Focus Time (min)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="pomodoros" 
                    stroke="#06b6d4" 
                    strokeWidth={2}
                    dot={{ fill: '#06b6d4', strokeWidth: 2, r: 3 }}
                    name="Pomodoro Sessions"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Subject Performance */}
        <div className="glass rounded-3xl p-6 border border-white/20 mt-8" data-aos="fade-up">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Target className="w-6 h-6 text-orange-600" />
            Subject Performance
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Pie Chart */}
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={Object.entries(analytics.subjectStats).map(([subject, stats]) => ({
                      name: subject,
                      value: stats.completed,
                      total: stats.total,
                    }))}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {Object.entries(analytics.subjectStats).map((_, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 6]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Progress Bars */}
            <div className="space-y-4">
              {Object.entries(analytics.subjectStats).map(([subject, stats], index) => {
                const percentage = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
                const colors = ['bg-purple-500', 'bg-cyan-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500'];
                return (
                  <div key={subject} className="space-y-2" data-aos="slide-left" data-aos-delay={index * 100}>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">{subject}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        <AnimatedCounter value={percentage} suffix="%" />
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div 
                        className={`${colors[index % colors.length]} h-3 rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span><AnimatedCounter value={stats.completed} /> completed</span>
                      <span><AnimatedCounter value={stats.total} /> total</span>
                    </div>
                  </div>
                );
              })}
              
              {Object.keys(analytics.subjectStats).length === 0 && (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">No subject data available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Insights & Recommendations */}
        <div className="glass rounded-3xl p-8 border border-white/20" data-aos="fade-up">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-8 h-8 text-emerald-600" />
            Insights & Recommendations
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Productivity Insights */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 border border-emerald-200 dark:border-emerald-700">
              <h4 className="font-bold text-emerald-800 dark:text-emerald-200 mb-3">🎯 Productivity</h4>
              <p className="text-sm text-emerald-700 dark:text-emerald-300 mb-2">
                {analytics.completionRate >= 80 
                  ? "Excellent work! You're consistently hitting your targets."
                  : analytics.completionRate >= 60
                  ? "Good progress! Try breaking larger tasks into smaller chunks."
                  : "Consider setting more realistic daily goals to build momentum."
                }
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                Current completion rate: {analytics.completionRate.toFixed(1)}%
              </p>
            </div>

            {/* Focus Insights */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 border border-purple-200 dark:border-purple-700">
              <h4 className="font-bold text-purple-800 dark:text-purple-200 mb-3">⏰ Focus Time</h4>
              <p className="text-sm text-purple-700 dark:text-purple-300 mb-2">
                {analytics.avgFocusTimePerDay >= 120 
                  ? "Great focus! You're maintaining excellent concentration habits."
                  : analytics.avgFocusTimePerDay >= 60
                  ? "Good focus time! Try adding one more Pomodoro session per day."
                  : "Consider using the Pomodoro technique to improve focus duration."
                }
              </p>
              <p className="text-xs text-purple-600 dark:text-purple-400">
                Daily average: {Math.round(analytics.avgFocusTimePerDay)} minutes
              </p>
            </div>

            {/* Streak Insights */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/30 dark:to-yellow-900/30 border border-orange-200 dark:border-orange-700">
              <h4 className="font-bold text-orange-800 dark:text-orange-200 mb-3">🔥 Consistency</h4>
              <p className="text-sm text-orange-700 dark:text-orange-300 mb-2">
                {analytics.avgTasksPerDay >= 3 
                  ? "Fantastic consistency! You're building strong productivity habits."
                  : analytics.avgTasksPerDay >= 1
                  ? "Good daily rhythm! Try to maintain this consistency."
                  : "Start with small daily goals to build a consistent habit."
                }
              </p>
              <p className="text-xs text-orange-600 dark:text-orange-400">
                Daily task average: {analytics.avgTasksPerDay.toFixed(1)} tasks
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsAdvanced;
