import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Calendar, Clock, Tag, CheckCircle2, Circle, AlertCircle, Star, Trash2, Edit3, X } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { Task } from '../types';
import { createTask, updateTask, deleteTask, subscribeToUserTasks, handleFirestoreError } from '../services/firestore';
import { useToast } from '../components/ui/Toast';
import LoadingSpinner, { CardLoader } from '../components/ui/LoadingSpinner';

const Tasks: React.FC = () => {
    const { user } = useAuth();
    const { success, error: showError } = useToast();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'todo' | 'in-progress' | 'completed'>('all');
    const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high'>('all');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state for new task
    const [taskForm, setTaskForm] = useState({
        title: '',
        description: '',
        deadline: '',
        priority: 'medium' as Task['priority'],
        subject: '',
        status: 'todo' as Task['status'],
        estimatedTime: ''
    });

    useEffect(() => {
        if (user) {
            setLoading(true);
            const unsubscribe = subscribeToUserTasks(user.uid, (userTasks) => {
                setTasks(userTasks);
                setLoading(false);
            });

            return () => unsubscribe();
        }
    }, [user]);

    const resetForm = () => {
        setTaskForm({
            title: '',
            description: '',
            deadline: '',
            priority: 'medium',
            subject: '',
            status: 'todo',
            estimatedTime: ''
        });
    };

    const handleCreateTask = async () => {
        if (!taskForm.title.trim()) {
            showError('Title Required', 'Please enter a task title');
            return;
        }

        try {
            setIsSubmitting(true);
            const taskData = {
                ...taskForm,
                userId: user!.uid,
                deadline: taskForm.deadline ? new Date(taskForm.deadline) : undefined,
                estimatedTime: taskForm.estimatedTime ? parseInt(taskForm.estimatedTime) : undefined,
            };

            await createTask(taskData);
            success('Task Created', 'Your task has been created successfully');
            
            resetForm();
            setShowModal(false);
        } catch (err) {
            showError('Error', handleFirestoreError(err));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateTask = async () => {
        if (!editingTask || !taskForm.title.trim()) {
            showError('Title Required', 'Please enter a task title');
            return;
        }

        try {
            setIsSubmitting(true);
            const updates = {
                ...taskForm,
                deadline: taskForm.deadline ? new Date(taskForm.deadline) : undefined,
                estimatedTime: taskForm.estimatedTime ? parseInt(taskForm.estimatedTime) : undefined,
            };

            await updateTask(editingTask.id, updates);
            success('Task Updated', 'Your task has been updated successfully');
            
            setEditingTask(null);
            setShowModal(false);
            resetForm();
        } catch (err) {
            showError('Error', handleFirestoreError(err));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        if (!confirm('Are you sure you want to delete this task?')) return;

        try {
            await deleteTask(taskId);
            success('Task Deleted', 'Your task has been deleted successfully');
        } catch (err) {
            showError('Error', handleFirestoreError(err));
        }
    };

    const handleToggleStatus = async (task: Task) => {
        try {
            const newStatus = task.status === 'completed' ? 'todo' : 'completed';
            await updateTask(task.id, { status: newStatus });
            success(
                newStatus === 'completed' ? 'Task Completed' : 'Task Reopened',
                `Task marked as ${newStatus}`
            );
        } catch (err) {
            showError('Error', handleFirestoreError(err));
        }
    };

    const openEditModal = (task: Task) => {
        setEditingTask(task);
        setTaskForm({
            title: task.title,
            description: task.description || '',
            deadline: task.deadline ? task.deadline.toISOString().split('T')[0] : '',
            priority: task.priority,
            subject: task.subject,
            status: task.status,
            estimatedTime: task.estimatedTime?.toString() || ''
        });
        setShowModal(true);
    };

    const openCreateModal = () => {
        setEditingTask(null);
        resetForm();
        setShowModal(true);
    };

    const filteredTasks = tasks.filter((task: Task) => {
        const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            task.subject.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
        const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
        
        return matchesSearch && matchesStatus && matchesPriority;
    });

    const taskStats = {
        total: tasks.length,
        todo: tasks.filter(t => t.status === 'todo').length,
        inProgress: tasks.filter(t => t.status === 'in-progress').length,
        completed: tasks.filter(t => t.status === 'completed').length,
    };

    const getPriorityColor = (priority: Task['priority']) => {
        switch (priority) {
            case 'high':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'low':
                return 'bg-green-100 text-green-800 border-green-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusColor = (status: Task['status']) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'in-progress':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'todo':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <CardLoader key={i} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                Task Manager
                            </h1>
                            <p className="text-gray-600 mt-2">Organize and track your tasks efficiently</p>
                        </div>
                        <button
                            onClick={openCreateModal}
                            className="mt-4 md:mt-0 flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                        >
                            <Plus className="w-5 h-5" />
                            <span>New Task</span>
                        </button>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Tasks</p>
                                    <p className="text-2xl font-bold text-gray-900">{taskStats.total}</p>
                                </div>
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                    <Tag className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </div>
                        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">To Do</p>
                                    <p className="text-2xl font-bold text-gray-900">{taskStats.todo}</p>
                                </div>
                                <div className="w-12 h-12 bg-gradient-to-r from-gray-500 to-gray-600 rounded-xl flex items-center justify-center">
                                    <Circle className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </div>
                        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">In Progress</p>
                                    <p className="text-2xl font-bold text-blue-600">{taskStats.inProgress}</p>
                                </div>
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                                    <Clock className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </div>
                        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Completed</p>
                                    <p className="text-2xl font-bold text-green-600">{taskStats.completed}</p>
                                </div>
                                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                                    <CheckCircle2 className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl mb-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search tasks..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                                />
                            </div>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value as any)}
                                className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                            >
                                <option value="all">All Status</option>
                                <option value="todo">To Do</option>
                                <option value="in-progress">In Progress</option>
                                <option value="completed">Completed</option>
                            </select>
                            <select
                                value={filterPriority}
                                onChange={(e) => setFilterPriority(e.target.value as any)}
                                className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                            >
                                <option value="all">All Priority</option>
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Task Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTasks.map((task) => (
                        <div
                            key={task.id}
                            className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => handleToggleStatus(task)}
                                        className="text-gray-400 hover:text-green-500 transition-colors"
                                    >
                                        {task.status === 'completed' ? (
                                            <CheckCircle2 className="w-6 h-6 text-green-500" />
                                        ) : (
                                            <Circle className="w-6 h-6" />
                                        )}
                                    </button>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                                        {task.priority}
                                    </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => openEditModal(task)}
                                        className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteTask(task.id)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <h3 className={`text-lg font-semibold mb-2 ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                {task.title}
                            </h3>
                            
                            {task.description && (
                                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                    {task.description}
                                </p>
                            )}

                            <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                                <span className="flex items-center space-x-1">
                                    <Tag className="w-4 h-4" />
                                    <span>{task.subject}</span>
                                </span>
                                {task.estimatedTime && (
                                    <span className="flex items-center space-x-1">
                                        <Clock className="w-4 h-4" />
                                        <span>{task.estimatedTime}m</span>
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center justify-between">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                                    {task.status.replace('-', ' ')}
                                </span>
                                {task.deadline && (
                                    <span className="flex items-center space-x-1 text-xs text-gray-500">
                                        <Calendar className="w-4 h-4" />
                                        <span>{task.deadline.toLocaleDateString()}</span>
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {filteredTasks.length === 0 && (
                    <div className="text-center py-12">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Tag className="w-12 h-12 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No tasks found</h3>
                        <p className="text-gray-500 mb-6">Create your first task to get started!</p>
                        <button
                            onClick={openCreateModal}
                            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
                        >
                            Create Task
                        </button>
                    </div>
                )}

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {editingTask ? 'Edit Task' : 'Create New Task'}
                                </h2>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Title *
                                    </label>
                                    <input
                                        type="text"
                                        value={taskForm.title}
                                        onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                                        placeholder="Enter task title..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={taskForm.description}
                                        onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                                        placeholder="Enter task description..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Priority
                                        </label>
                                        <select
                                            value={taskForm.priority}
                                            onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as Task['priority'] })}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Status
                                        </label>
                                        <select
                                            value={taskForm.status}
                                            onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value as Task['status'] })}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                                        >
                                            <option value="todo">To Do</option>
                                            <option value="in-progress">In Progress</option>
                                            <option value="completed">Completed</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Subject
                                    </label>
                                    <input
                                        type="text"
                                        value={taskForm.subject}
                                        onChange={(e) => setTaskForm({ ...taskForm, subject: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                                        placeholder="e.g., Math, Science, Work..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Deadline
                                        </label>
                                        <input
                                            type="date"
                                            value={taskForm.deadline}
                                            onChange={(e) => setTaskForm({ ...taskForm, deadline: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Est. Time (min)
                                        </label>
                                        <input
                                            type="number"
                                            value={taskForm.estimatedTime}
                                            onChange={(e) => setTaskForm({ ...taskForm, estimatedTime: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                                            placeholder="60"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex space-x-3 mt-6">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={editingTask ? handleUpdateTask : handleCreateTask}
                                    disabled={isSubmitting}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                >
                                    {isSubmitting ? (
                                        <LoadingSpinner size="sm" color="blue" />
                                    ) : (
                                        editingTask ? 'Update Task' : 'Create Task'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Tasks;
