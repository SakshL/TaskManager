import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Calendar, Clock, TrendingUp, CheckCircle2, Plus, Star, Target, Zap, BookOpen, Coffee, Users, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Task, PomodoroSession } from '../types';
import { subscribeToUserTasks, getUserPomodoroSessions } from '../services/firestore';
import { fetchAIResponse } from '../services/openai';
import { useToast } from '../components/ui/Toast';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import StatsCard from '../components/dashboard/StatsCard';
import QuickActions from '../components/dashboard/QuickActions';
import RecentActivity from '../components/dashboard/RecentActivity';
import ProgressChart from '../components/dashboard/ProgressChart';
import MotivationalQuote from '../components/dashboard/MotivationalQuote';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const { success, error: showError } = useToast();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [pomodoroSessions, setPomodoroSessions] = useState<PomodoroSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [motivationalQuote, setMotivationalQuote] = useState('');
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

    const loadPomodoroData = useCallback(async () => {
        try {
            const sessions = await getUserPomodoroSessions(user!.uid);
            setPomodoroSessions(sessions);
        } catch (error) {
            console.error('Error loading pomodoro data:', error);
            showError('Error', 'Failed to load Pomodoro sessions');
        }
    }, [user?.uid, showError]);

    const loadMotivationalQuote = useCallback(async () => {
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
    }, []);

    // Memoized calculations for performance
    const stats = useMemo(() => {
        const today = new Date();
        const todaysTasks = tasks.filter(task => {
            if (!task.deadline) return false;
            const taskDate = new Date(task.deadline);
            return taskDate.toDateString() === today.toDateString();
        });

        const completedToday = todaysTasks.filter(task => task.status === 'completed').length;
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.status === 'completed').length;
        const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
        
        const todayPomodoros = pomodoroSessions.filter(session => {
            const sessionDate = new Date(session.startTime);
            return sessionDate.toDateString() === today.toDateString() && session.completed;
        }).length;

        const totalFocusTime = pomodoroSessions
            .filter(s => s.completed && s.type === 'work')
            .reduce((total, session) => total + session.duration, 0);

        const progressPercentage = todaysTasks.length > 0 ? (completedToday / todaysTasks.length) * 100 : 0;

        return {
            todaysTasks: todaysTasks.length,
            completedToday,
            progressPercentage,
            totalTasks,
            completedTasks,
            inProgressTasks,
            todayPomodoros,
            totalFocusTime,
            completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
        };
    }, [tasks, pomodoroSessions]);

    const recentTasks = useMemo(() => {
        return [...tasks]
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
            .slice(0, 5);
    }, [tasks]);

    // Generate weekly data for chart
    const weeklyData = useMemo(() => {
        const data = [];
        const today = new Date();
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            
            const dayTasks = tasks.filter(task => {
                if (!task.deadline) return false;
                const taskDate = new Date(task.deadline);
                return taskDate.toDateString() === date.toDateString();
            });
            
            const completedTasks = dayTasks.filter(task => task.status === 'completed');
            
            data.push({
                day: date.toLocaleDateString('en-US', { weekday: 'short' }),
                completed: completedTasks.length,
                total: dayTasks.length
            });
        }
        
        return data;
    }, [tasks]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner size="xl" text="Loading your dashboard..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Welcome Header */}
                <div className="text-center mb-8" data-aos="fade-down">
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                        Welcome back, {user?.displayName?.split(' ')[0] || 'Student'}! 
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        Ready to crush your goals today? Let's make some progress! 🚀
                    </p>
                </div>

                {/* Key Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatsCard
                        title="Today's Tasks"
                        value={stats.completedToday}
                        subtitle={`of ${stats.todaysTasks} tasks`}
                        icon={Target}
                        color="blue"
                        trend={stats.progressPercentage > 50 ? { value: 12, isPositive: true } : undefined}
                    />
                    <StatsCard
                        title="Focus Sessions"
                        value={stats.todayPomodoros}
                        subtitle="completed today"
                        icon={Clock}
                        color="red"
                        trend={{ value: 8, isPositive: true }}
                    />
                    <StatsCard
                        title="Total Tasks"
                        value={stats.completedTasks}
                        subtitle={`of ${stats.totalTasks} tasks`}
                        icon={CheckCircle2}
                        color="green"
                        trend={{ value: stats.completionRate - 50, isPositive: stats.completionRate > 50 }}
                    />
                    <StatsCard
                        title="Focus Time"
                        value={`${Math.round(stats.totalFocusTime / 60)}h`}
                        subtitle="this week"
                        icon={Zap}
                        color="purple"
                        trend={{ value: 15, isPositive: true }}
                    />
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Progress Chart */}
                        <ProgressChart weeklyData={weeklyData} loading={false} />
                        
                        {/* Recent Activity */}
                        <RecentActivity 
                            recentTasks={recentTasks} 
                            totalPomodoros={stats.todayPomodoros}
                        />
                    </div>

                    {/* Right Column */}
                    <div className="space-y-8">
                        {/* Quick Actions */}
                        <QuickActions />
                        
                        {/* Motivational Quote */}
                        <MotivationalQuote 
                            quote={motivationalQuote}
                            loading={quoteLoading}
                            onRefresh={loadMotivationalQuote}
                        />

                        {/* Study Tips Card */}
                        <div className="glass rounded-3xl p-6 border border-white/20" data-aos="fade-up" data-aos-delay="600">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 rounded-xl bg-gradient-to-r from-orange-500/20 to-yellow-500/20">
                                    <BookOpen className="w-6 h-6 text-orange-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                        Study Tip
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Daily wisdom
                                    </p>
                                </div>
                            </div>
                            <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-50/50 to-yellow-50/50 dark:from-orange-900/20 dark:to-yellow-900/20">
                                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                    💡 Try the <strong>2-minute rule</strong>: If a task takes less than 2 minutes, do it now instead of adding it to your list. This prevents small tasks from piling up!
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Achievement Section */}
                {stats.completionRate >= 80 && (
                    <div className="glass rounded-3xl p-8 border border-white/20 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10" data-aos="bounce">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Award className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                🎉 Achievement Unlocked!
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                You've completed {stats.completionRate}% of your tasks! You're on fire! 🔥
                            </p>
                            <button 
                                onClick={() => success('Awesome!', 'Keep up the great work!')}
                                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-semibold hover:scale-105 transition-transform duration-200"
                            >
                                Celebrate 🎊
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
