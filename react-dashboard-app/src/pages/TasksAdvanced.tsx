import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Filter, Calendar, Clock, Target, CheckCircle2, Circle, Play, Trash2, Edit3, Star, Tag, SortAsc } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Task } from '../types';
import { subscribeToUserTasks, createTask, updateTask, deleteTask } from '../services/firestore';
import { useToast } from '../components/ui/Toast';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Modal from '../components/ui/Modal';

const TasksAdvanced: React.FC = () => {
    const { user } = useAuth();
    const { success, error: showError } = useToast();
    
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'todo' | 'in-progress' | 'completed'>('all');
    const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high'>('all');
    const [sortBy, setSortBy] = useState<'deadline' | 'priority' | 'created' | 'updated'>('deadline');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    
    // New task form state
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        subject: '',
        priority: 'medium' as 'low' | 'medium' | 'high',
        deadline: '',
        estimatedTime: 60,
        tags: [] as string[]
    });

    useEffect(() => {
        if (user) {
            const unsubscribe = subscribeToUserTasks(user.uid, (userTasks) => {
                setTasks(userTasks);
                setLoading(false);
            });
            return () => unsubscribe();
        }
    }, [user]);

    const filteredAndSortedTasks = useMemo(() => {
        let filtered = tasks.filter(task => {
            const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                task.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                task.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
            
            const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
            const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
            
            return matchesSearch && matchesStatus && matchesPriority;
        });

        // Sort tasks
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'deadline':
                    if (!a.deadline && !b.deadline) return 0;
                    if (!a.deadline) return 1;
                    if (!b.deadline) return -1;
                    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
                case 'priority':
                    const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
                    return priorityOrder[b.priority] - priorityOrder[a.priority];
                case 'created':
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case 'updated':
                    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
                default:
                    return 0;
            }
        });

        return filtered;
    }, [tasks, searchTerm, filterStatus, filterPriority, sortBy]);

    const handleCreateTask = async () => {
        if (!user || !newTask.title.trim()) return;

        try {
            const taskData = {
                ...newTask,
                userId: user.uid,
                status: 'todo' as const,
                deadline: newTask.deadline ? new Date(newTask.deadline) : undefined,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            await createTask(taskData);
            setShowCreateModal(false);
            setNewTask({
                title: '',
                description: '',
                subject: '',
                priority: 'medium',
                deadline: '',
                estimatedTime: 60,
                tags: []
            });
            success('Success!', 'Task created successfully');
        } catch (error) {
            console.error('Error creating task:', error);
            showError('Error', 'Failed to create task');
        }
    };

    const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
        try {
            await updateTask(taskId, { ...updates, updatedAt: new Date() });
            success('Updated!', 'Task updated successfully');
        } catch (error) {
            console.error('Error updating task:', error);
            showError('Error', 'Failed to update task');
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        try {
            await deleteTask(taskId);
            success('Deleted!', 'Task deleted successfully');
        } catch (error) {
            console.error('Error deleting task:', error);
            showError('Error', 'Failed to delete task');
        }
    };

    const toggleTaskStatus = (task: Task) => {
        const statusOrder = ['todo', 'in-progress', 'completed'] as const;
        const currentIndex = statusOrder.indexOf(task.status);
        const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
        handleUpdateTask(task.id, { status: nextStatus });
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle2 className="w-5 h-5 text-green-500" />;
            case 'in-progress':
                return <Play className="w-5 h-5 text-orange-500" />;
            default:
                return <Circle className="w-5 h-5 text-gray-400" />;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300';
            case 'medium':
                return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300';
            case 'low':
                return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300';
        }
    };

    const isOverdue = (deadline?: Date) => {
        if (!deadline) return false;
        return new Date(deadline) < new Date() && new Date(deadline).toDateString() !== new Date().toDateString();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner size="xl" text="Loading your tasks..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 dark:from-slate-900 dark:via-purple-900 dark:to-indigo-900 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center mb-8" data-aos="fade-down">
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent mb-4">
                        Task Manager
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        Organize, prioritize, and conquer your tasks with style! 📝
                    </p>
                </div>

                {/* Controls */}
                <div className="glass rounded-3xl p-6 border border-white/20 mb-8" data-aos="fade-up">
                    <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-6">
                        {/* Search */}
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search tasks..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                            />
                        </div>

                        {/* Create Task Button */}
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-semibold hover:scale-105 transition-transform duration-200 flex items-center gap-2 shadow-lg"
                        >
                            <Plus className="w-5 h-5" />
                            Create Task
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-4">
                        {/* Status Filter */}
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value as any)}
                            className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            <option value="all">All Status</option>
                            <option value="todo">To Do</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                        </select>

                        {/* Priority Filter */}
                        <select
                            value={filterPriority}
                            onChange={(e) => setFilterPriority(e.target.value as any)}
                            className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            <option value="all">All Priority</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                        </select>

                        {/* Sort By */}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            <option value="deadline">Sort by Deadline</option>
                            <option value="priority">Sort by Priority</option>
                            <option value="created">Sort by Created</option>
                            <option value="updated">Sort by Updated</option>
                        </select>
                    </div>
                </div>

                {/* Tasks Grid */}
                <div className="space-y-4">
                    {filteredAndSortedTasks.length > 0 ? (
                        filteredAndSortedTasks.map((task, index) => (
                            <div
                                key={task.id}
                                className={`glass rounded-3xl p-6 border border-white/20 hover:scale-[1.02] transition-all duration-300 hover:shadow-xl ${
                                    task.status === 'completed' ? 'opacity-75' : ''
                                } ${isOverdue(task.deadline) ? 'border-red-300 bg-red-50/50 dark:bg-red-900/20' : ''}`}
                                data-aos="fade-up"
                                data-aos-delay={index * 50}
                            >
                                <div className="flex items-start gap-4">
                                    {/* Status Toggle */}
                                    <button
                                        onClick={() => toggleTaskStatus(task)}
                                        className="mt-1 hover:scale-110 transition-transform duration-200"
                                    >
                                        {getStatusIcon(task.status)}
                                    </button>

                                    {/* Task Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4 mb-3">
                                            <div className="flex-1">
                                                <h3 className={`text-xl font-bold text-gray-900 dark:text-white mb-2 ${
                                                    task.status === 'completed' ? 'line-through opacity-60' : ''
                                                }`}>
                                                    {task.title}
                                                </h3>
                                                {task.description && (
                                                    <p className="text-gray-600 dark:text-gray-300 mb-3">
                                                        {task.description}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setEditingTask(task)}
                                                    className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 hover:scale-110 transition-transform duration-200"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteTask(task.id)}
                                                    className="p-2 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 hover:scale-110 transition-transform duration-200"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Task Meta */}
                                        <div className="flex flex-wrap items-center gap-3">
                                            <span className={`px-3 py-1 rounded-xl text-sm font-medium border ${getPriorityColor(task.priority)}`}>
                                                {task.priority} priority
                                            </span>
                                            
                                            <span className="px-3 py-1 rounded-xl text-sm font-medium bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300">
                                                {task.subject}
                                            </span>

                                            {task.deadline && (
                                                <div className={`flex items-center gap-1 px-3 py-1 rounded-xl text-sm font-medium ${
                                                    isOverdue(task.deadline) 
                                                        ? 'bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-300'
                                                        : 'bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-300'
                                                }`}>
                                                    <Calendar className="w-4 h-4" />
                                                    {new Date(task.deadline).toLocaleDateString()}
                                                    {isOverdue(task.deadline) && ' (Overdue)'}
                                                </div>
                                            )}

                                            {task.estimatedTime && (
                                                <div className="flex items-center gap-1 px-3 py-1 rounded-xl text-sm font-medium bg-purple-100 text-purple-700 border border-purple-200 dark:bg-purple-900/30 dark:text-purple-300">
                                                    <Clock className="w-4 h-4" />
                                                    {task.estimatedTime}min
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-16">
                            <div className="w-24 h-24 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Target className="w-12 h-12 text-purple-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                No tasks found
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-6">
                                {searchTerm || filterStatus !== 'all' || filterPriority !== 'all'
                                    ? 'Try adjusting your filters or search term'
                                    : 'Create your first task to get started!'
                                }
                            </p>
                            {!searchTerm && filterStatus === 'all' && filterPriority === 'all' && (
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-semibold hover:scale-105 transition-transform duration-200 inline-flex items-center gap-2"
                                >
                                    <Plus className="w-5 h-5" />
                                    Create Your First Task
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Create Task Modal */}
                <Modal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    title="Create New Task"
                >
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Title *
                            </label>
                            <input
                                type="text"
                                value={newTask.title}
                                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Enter task title..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Description
                            </label>
                            <textarea
                                value={newTask.description}
                                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Enter task description..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Subject
                                </label>
                                <input
                                    type="text"
                                    value={newTask.subject}
                                    onChange={(e) => setNewTask({ ...newTask, subject: e.target.value })}
                                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="e.g., Math, History..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Priority
                                </label>
                                <select
                                    value={newTask.priority}
                                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Deadline
                                </label>
                                <input
                                    type="datetime-local"
                                    value={newTask.deadline}
                                    onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Estimated Time (minutes)
                                </label>
                                <input
                                    type="number"
                                    value={newTask.estimatedTime}
                                    onChange={(e) => setNewTask({ ...newTask, estimatedTime: parseInt(e.target.value) || 0 })}
                                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="60"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-2xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateTask}
                                disabled={!newTask.title.trim()}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-semibold hover:scale-105 transition-transform duration-200 disabled:opacity-50 disabled:hover:scale-100"
                            >
                                Create Task
                            </button>
                        </div>
                    </div>
                </Modal>
            </div>
        </div>
    );
};

export default TasksAdvanced;
