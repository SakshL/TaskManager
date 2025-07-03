import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import useAuth from '../hooks/useAuth';
import { Task, PomodoroSession } from '../types';
import { subscribeToUserTasks, getUserPomodoroSessions } from '../services/firestore';
import { TrendingUp, Clock, CheckCircle, Target, BarChart3, Calendar, Award } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const Analytics: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sessions, setSessions] = useState<PomodoroSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('week');

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Subscribe to real-time tasks
      const unsubscribe = subscribeToUserTasks(user!.uid, (userTasks) => {
        setTasks(userTasks);
      });

      // Load Pomodoro sessions
      const pomodoroSessions = await getUserPomodoroSessions(user!.uid);
      setSessions(pomodoroSessions);

      setLoading(false);
      
      return () => unsubscribe();
    } catch (error) {
      console.error('Error loading analytics data:', error);
      setLoading(false);
    }
  };

  // Calculate stats
  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    todo: tasks.filter(t => t.status === 'todo').length,
  };

  const completionRate = taskStats.total > 0 ? (taskStats.completed / taskStats.total) * 100 : 0;

  const totalFocusTime = sessions
    .filter(s => s.completed && s.type === 'work')
    .reduce((total, session) => total + session.duration, 0);

  const totalSessions = sessions.filter(s => s.completed).length;

  // Chart data
  const getTaskCompletionData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const completedTasks = tasks.filter(task => 
        task.status === 'completed' && 
        task.updatedAt && 
        (task.updatedAt instanceof Date 
          ? task.updatedAt.toISOString().split('T')[0] === date
          : new Date((task.updatedAt as any).seconds * 1000).toISOString().split('T')[0] === date)
      ).length;

      return {
        date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        completed: completedTasks,
      };
    });
  };

  const getFocusTimeData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const dayFocusTime = sessions
        .filter(session => 
          session.completed && 
          session.type === 'work' &&
          session.startTime &&
          (session.startTime instanceof Date 
            ? session.startTime.toISOString().split('T')[0] === date
            : new Date((session.startTime as any).seconds * 1000).toISOString().split('T')[0] === date)
        )
        .reduce((total, session) => total + session.duration, 0);

      return {
        date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        minutes: dayFocusTime,
      };
    });
  };

  const getSubjectDistribution = () => {
    const subjectCounts = tasks.reduce((acc, task) => {
      const subject = task.subject || 'Uncategorized';
      acc[subject] = (acc[subject] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
    
    return Object.entries(subjectCounts).map(([subject, count], index) => ({
      name: subject,
      value: count,
      color: colors[index % colors.length],
    }));
  };

  const getPriorityDistribution = () => {
    const priorityCounts = tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      { name: 'High', value: priorityCounts.high || 0, color: '#EF4444' },
      { name: 'Medium', value: priorityCounts.medium || 0, color: '#F59E0B' },
      { name: 'Low', value: priorityCounts.low || 0, color: '#10B981' },
    ];
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Analytics</h2>
          <p className="text-indigo-200">Please log in to view your analytics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 mb-6 border border-white/10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
                <p className="text-indigo-200">Track your productivity and progress</p>
              </div>
            </div>
            
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value as any)}
              className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            >
              <option value="week" className="text-gray-900">Last 7 Days</option>
              <option value="month" className="text-gray-900">Last 30 Days</option>
              <option value="year" className="text-gray-900">Last Year</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner size="xl" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 border border-white/10 hover:bg-white/15 transition-all duration-200">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-indigo-200">Tasks Completed</p>
                    <p className="text-3xl font-bold text-white">{taskStats.completed}</p>
                  </div>
                </div>
              </div>

              <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 border border-white/10 hover:bg-white/15 transition-all duration-200">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-indigo-200">Completion Rate</p>
                    <p className="text-3xl font-bold text-white">{completionRate.toFixed(1)}%</p>
                  </div>
                </div>
              </div>

              <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 border border-white/10 hover:bg-white/15 transition-all duration-200">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-indigo-200">Focus Time</p>
                    <p className="text-3xl font-bold text-white">{Math.floor(totalFocusTime / 60)}h {totalFocusTime % 60}m</p>
                  </div>
                </div>
              </div>

              <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 border border-white/10 hover:bg-white/15 transition-all duration-200">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-indigo-200">Pomodoro Sessions</p>
                    <p className="text-3xl font-bold text-white">{totalSessions}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Task Completion Chart */}
              <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Daily Task Completion
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getTaskCompletionData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="date" tick={{ fill: 'white', fontSize: 12 }} />
                    <YAxis tick={{ fill: 'white', fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(0,0,0,0.8)', 
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px',
                        color: 'white'
                      }} 
                    />
                    <Bar dataKey="completed" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Focus Time Chart */}
              <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Daily Focus Time
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={getFocusTimeData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="date" tick={{ fill: 'white', fontSize: 12 }} />
                    <YAxis tick={{ fill: 'white', fontSize: 12 }} />
                    <Tooltip 
                      formatter={(value) => [`${value} minutes`, 'Focus Time']}
                      contentStyle={{ 
                        backgroundColor: 'rgba(0,0,0,0.8)', 
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px',
                        color: 'white'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="minutes" 
                      stroke="#10B981" 
                      strokeWidth={3}
                      dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Subject Distribution */}
              <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Tasks by Subject</h3>
                {getSubjectDistribution().length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={getSubjectDistribution()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getSubjectDistribution().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(0,0,0,0.8)', 
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '8px',
                          color: 'white'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-72 text-indigo-200">
                    No tasks to display
                  </div>
                )}
              </div>

              {/* Priority Distribution */}
              <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Tasks by Priority</h3>
                {getPriorityDistribution().some(p => p.value > 0) ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={getPriorityDistribution()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getPriorityDistribution().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(0,0,0,0.8)', 
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '8px',
                          color: 'white'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-72 text-indigo-200">
                    No tasks to display
                  </div>
                )}
              </div>
            </div>

            {/* Detailed Stats */}
            <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                <Award className="w-5 h-5 mr-2" />
                Detailed Statistics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h4 className="font-medium text-white mb-4">Task Status Breakdown</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-2 bg-white/5 rounded-lg">
                      <span className="text-sm text-indigo-200">To Do</span>
                      <span className="font-medium text-white">{taskStats.todo}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white/5 rounded-lg">
                      <span className="text-sm text-indigo-200">In Progress</span>
                      <span className="font-medium text-white">{taskStats.inProgress}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white/5 rounded-lg">
                      <span className="text-sm text-indigo-200">Completed</span>
                      <span className="font-medium text-white">{taskStats.completed}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-white mb-4">Focus Statistics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-2 bg-white/5 rounded-lg">
                      <span className="text-sm text-indigo-200">Total Sessions</span>
                      <span className="font-medium text-white">{totalSessions}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white/5 rounded-lg">
                      <span className="text-sm text-indigo-200">Average Session</span>
                      <span className="font-medium text-white">
                        {totalSessions > 0 ? Math.round(totalFocusTime / totalSessions) : 0} min
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white/5 rounded-lg">
                      <span className="text-sm text-indigo-200">Total Focus Time</span>
                      <span className="font-medium text-white">{Math.floor(totalFocusTime / 60)}h {totalFocusTime % 60}m</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-white mb-4">Productivity Insights</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-2 bg-white/5 rounded-lg">
                      <span className="text-sm text-indigo-200">Avg. Tasks/Day</span>
                      <span className="font-medium text-white">{(taskStats.completed / 7).toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white/5 rounded-lg">
                      <span className="text-sm text-indigo-200">Avg. Focus/Day</span>
                      <span className="font-medium text-white">{Math.round(totalFocusTime / 7)} min</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white/5 rounded-lg">
                      <span className="text-sm text-indigo-200">Completion Rate</span>
                      <span className="font-medium text-white">{completionRate.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
