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
import { getUserTasks, getUserPomodoroSessions, getTaskStats, getPomodoroStats } from '../services/firestore';
import { TrendingUpIcon, ClockIcon, CheckCircleIcon, TargetIcon } from 'lucide-react';

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
      const [userTasks, pomodoroSessions] = await Promise.all([
        getUserTasks(user!.uid),
        getUserPomodoroSessions(user!.uid),
      ]);
      setTasks(userTasks);
      setSessions(pomodoroSessions);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
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
        task.updatedAt.toISOString().split('T')[0] === date
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
          session.startTime.toISOString().split('T')[0] === date
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
      acc[task.subject] = (acc[task.subject] || 0) + 1;
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">Track your productivity and progress</p>
        </div>
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
          <option value="year">Last Year</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CheckCircleIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Tasks Completed</p>
              <p className="text-2xl font-bold text-gray-900">{taskStats.completed}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUpIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{completionRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ClockIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Focus Time</p>
              <p className="text-2xl font-bold text-gray-900">{Math.floor(totalFocusTime / 60)}h {totalFocusTime % 60}m</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TargetIcon className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pomodoro Sessions</p>
              <p className="text-2xl font-bold text-gray-900">{totalSessions}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Completion Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Daily Task Completion</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getTaskCompletionData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="completed" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Focus Time Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Daily Focus Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={getFocusTimeData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value} minutes`, 'Focus Time']} />
              <Line type="monotone" dataKey="minutes" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Subject Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Tasks by Subject</h3>
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
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Priority Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Tasks by Priority</h3>
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
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Detailed Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Task Status Breakdown</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">To Do</span>
                <span className="font-medium">{taskStats.todo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">In Progress</span>
                <span className="font-medium">{taskStats.inProgress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Completed</span>
                <span className="font-medium">{taskStats.completed}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">Focus Statistics</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Sessions</span>
                <span className="font-medium">{totalSessions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Average Session</span>
                <span className="font-medium">
                  {totalSessions > 0 ? Math.round(totalFocusTime / totalSessions) : 0} min
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Focus Time</span>
                <span className="font-medium">{Math.floor(totalFocusTime / 60)}h {totalFocusTime % 60}m</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">Productivity Insights</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg. Tasks/Day</span>
                <span className="font-medium">{(taskStats.completed / 7).toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg. Focus/Day</span>
                <span className="font-medium">{Math.round(totalFocusTime / 7)} min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Completion Rate</span>
                <span className="font-medium">{completionRate.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
