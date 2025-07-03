import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Clock, TrendingUp, CheckCircle2, Plus, Star, Target, Zap, BookOpen, Coffee } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { Task, PomodoroSession } from '../types';
import { subscribeToUserTasks, getUserPomodoroSessions } from '../services/firestore';
import { fetchAIResponse } from '../services/openai';
import { useToast } from '../components/ui/Toast';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const { error: showError } = useToast();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [pomodoroSessions, setPomodoroSessions] = useState<PomodoroSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [motivationalQuote, setMotivationalQuote] = useState('');
    const [quickNotes, setQuickNotes] = useState('');
    const [quoteLoading, setQuoteLoading] = useState(false);

    useEffect(() => {
        if (user) {
            loadPomodoroData();
            loadMotivationalQuote();
            
            // Subscribe to real-time task updates
            const unsubscribe = subscribeToUserTasks(user.uid, (userTasks) => {
                setTasks(userTasks);
                setLoading(false);
            });

            return () => unsubscribe();
        }
    }, [user]);

    const loadPomodoroData = async () => {
        try {
            const sessions = await getUserPomodoroSessions(user!.uid);
            setPomodoroSessions(sessions);
        } catch (error) {
            console.error('Error loading pomodoro data:', error);
            showError('Error', 'Failed to load Pomodoro sessions');
        }
    };

    const loadMotivationalQuote = async () => {
        try {
            setQuoteLoading(true);
            const prompt = "Give me a short, motivational quote (max 20 words) for students to stay productive and focused. Just return the quote without any additional text.";
            const quote = await fetchAIResponse(prompt);
            setMotivationalQuote(quote);
        } catch (error) {
            console.error('Error loading motivational quote:', error);
            setMotivationalQuote("Success is not final, failure is not fatal: it is the courage to continue that counts.");
        } finally {
            setQuoteLoading(false);
        }
    };

    // Memoized calculations for performance
    const todaysTasks = useMemo(() => {
        return tasks.filter(task => {
            if (!task.deadline) return false;
            const today = new Date();
            const taskDate = new Date(task.deadline);
            return taskDate.toDateString() === today.toDateString();
        });
    }, [tasks]);

    const completedToday = useMemo(() => {
        return todaysTasks.filter(task => task.status === 'completed').length;
    }, [todaysTasks]);

    const progressPercentage = useMemo(() => {
        return todaysTasks.length > 0 ? (completedToday / todaysTasks.length) * 100 : 0;
    }, [todaysTasks.length, completedToday]);

    const totalFocusTime = useMemo(() => {
        return pomodoroSessions
            .filter(s => s.completed && s.type === 'work')
            .reduce((total, session) => total + session.duration, 0);
    }, [pomodoroSessions]);

    const upcomingTasks = useMemo(() => {
        return tasks
            .filter(task => task.deadline && new Date(task.deadline) > new Date() && task.status !== 'completed')
            .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
            .slice(0, 3);
    }, [tasks]);

    const taskStats = useMemo(() => {
        return {
            total: tasks.length,
            completed: tasks.filter(t => t.status === 'completed').length,
            inProgress: tasks.filter(t => t.status === 'in-progress').length,
            overdue: tasks.filter(t => 
                t.deadline && 
                new Date(t.deadline) < new Date() && 
                t.status !== 'completed'
            ).length
        };
    }, [tasks]);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-800 border-red-200';
            case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'low': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center">
                <div className="text-center">
                    <LoadingSpinner size="xl" color="purple" />
                    <p className="mt-4 text-lg font-medium text-gray-700">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            {getGreeting()}, {user?.displayName?.split(' ')[0] || 'Student'}! 👋
                        </h1>
                        <p className="text-gray-600 text-lg mt-2">Ready to crush your goals today?</p>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-gray-500">Today's Date</div>
                        <div className="text-lg font-semibold text-gray-900">
                            {new Date().toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Motivational Quote */}
            <div className="mb-8">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                            <Star className="w-5 h-5 mr-2" />
                            <span className="font-medium">Daily Motivation</span>
                        </div>
                        <button
                            onClick={loadMotivationalQuote}
                            disabled={quoteLoading}
                            className="text-white/80 hover:text-white transition-colors disabled:opacity-50"
                        >
                            {quoteLoading ? (
                                <LoadingSpinner size="sm" color="blue" />
                            ) : (
                                "🔄"
                            )}
                        </button>
                    </div>
                    <p className="text-lg font-medium italic">
                        {quoteLoading ? "Generating inspiration..." : `"${motivationalQuote}"`}
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Tasks</p>
                            <p className="text-3xl font-bold text-gray-900">{taskStats.total}</p>
                            <p className="text-xs text-green-600 mt-1">
                                {taskStats.completed} completed
                            </p>
                        </div>
                        <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                            <CheckCircle2 className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Today's Progress</p>
                            <p className="text-3xl font-bold text-green-600">{Math.round(progressPercentage)}%</p>
                            <p className="text-xs text-gray-600 mt-1">
                                {completedToday} of {todaysTasks.length} done
                            </p>
                        </div>
                        <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                            <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Focus Time</p>
                            <p className="text-3xl font-bold text-purple-600">{Math.floor(totalFocusTime / 60)}h</p>
                            <p className="text-xs text-gray-600 mt-1">
                                {totalFocusTime % 60}m today
                            </p>
                        </div>
                        <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                            <Clock className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">In Progress</p>
                            <p className="text-3xl font-bold text-orange-600">{taskStats.inProgress}</p>
                            <p className="text-xs text-red-600 mt-1">
                                {taskStats.overdue} overdue
                            </p>
                        </div>
                        <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
                            <Target className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Today's Tasks */}
                <div className="lg:col-span-2">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Today's Tasks</h2>
                            <Link 
                                to="/tasks" 
                                className="text-purple-600 hover:text-purple-700 font-medium text-sm"
                            >
                                View All
                            </Link>
                        </div>

                        {todaysTasks.length > 0 ? (
                            <div className="space-y-4">
                                {todaysTasks.slice(0, 5).map((task) => (
                                    <div key={task.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                        <div className={`w-3 h-3 rounded-full ${
                                            task.status === 'completed' ? 'bg-green-500' : 
                                            task.status === 'in-progress' ? 'bg-blue-500' : 'bg-gray-300'
                                        }`}></div>
                                        <div className="flex-1">
                                            <p className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                                {task.title}
                                            </p>
                                            <p className="text-sm text-gray-500">{task.subject}</p>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                                            {task.priority}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500">No tasks scheduled for today</p>
                                <Link 
                                    to="/tasks" 
                                    className="inline-flex items-center mt-4 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Task
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-6">
                        <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <Link 
                                to="/tasks" 
                                className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
                            >
                                <Plus className="w-5 h-5" />
                                <span>Add New Task</span>
                            </Link>
                            <Link 
                                to="/pomodoro" 
                                className="flex items-center space-x-3 p-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200"
                            >
                                <Clock className="w-5 h-5" />
                                <span>Start Focus Session</span>
                            </Link>
                            <Link 
                                to="/ai-assistant" 
                                className="flex items-center space-x-3 p-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-200"
                            >
                                <Zap className="w-5 h-5" />
                                <span>Ask AI Assistant</span>
                            </Link>
                        </div>
                    </div>

                    {/* Upcoming Tasks */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-6">
                        <h3 className="font-bold text-gray-900 mb-4">Upcoming Deadlines</h3>
                        {upcomingTasks.length > 0 ? (
                            <div className="space-y-3">
                                {upcomingTasks.map((task) => (
                                    <div key={task.id} className="p-3 bg-gray-50 rounded-lg">
                                        <p className="font-medium text-gray-900 text-sm">{task.title}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Due: {new Date(task.deadline!).toLocaleDateString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-sm">No upcoming deadlines</p>
                        )}
                    </div>

                    {/* Quick Notes */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-6">
                        <h3 className="font-bold text-gray-900 mb-4">Quick Notes</h3>
                        <textarea
                            value={quickNotes}
                            onChange={(e) => setQuickNotes(e.target.value)}
                            placeholder="Jot down your thoughts..."
                            className="w-full h-24 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;