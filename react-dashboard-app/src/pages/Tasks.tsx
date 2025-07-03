import React, { useState, useEffect } from 'react';
import { PlusIcon, EditIcon, TrashIcon, FilterIcon, SearchIcon } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { Task } from '../types';
import { createTask, updateTask, deleteTask, getUserTasks } from '../services/firestore';
import TaskModal from '../components/tasks/TaskModal';
import TaskCard from '../components/tasks/TaskCard';

const Tasks: React.FC = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'todo' | 'in-progress' | 'completed'>('all');
    const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high'>('all');

    useEffect(() => {
        if (user) {
            loadTasks();
        }
    }, [user]);

    const loadTasks = async () => {
        try {
            setLoading(true);
            const userTasks = await getUserTasks(user!.uid);
            setTasks(userTasks);
        } catch (error) {
            console.error('Error loading tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTask = async (taskData: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
        try {
            await createTask({ ...taskData, userId: user!.uid });
            await loadTasks();
            setShowModal(false);
        } catch (error) {
            console.error('Error creating task:', error);
        }
    };

    const handleUpdateTask = async (taskData: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
        if (!editingTask) return;
        
        try {
            await updateTask(editingTask.id, taskData);
            await loadTasks();
            setShowModal(false);
            setEditingTask(null);
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            try {
                await deleteTask(taskId);
                await loadTasks();
            } catch (error) {
                console.error('Error deleting task:', error);
            }
        }
    };

    const handleEditTask = (task: Task) => {
        setEditingTask(task);
        setShowModal(true);
    };

    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            task.description?.toLowerCase().includes(searchTerm.toLowerCase());
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
                    <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
                    <p className="text-gray-600 mt-1">Manage your tasks and stay productive</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <PlusIcon className="w-5 h-5" />
                    <span>New Task</span>
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <h3 className="text-sm font-medium text-gray-500">Total Tasks</h3>
                    <p className="text-2xl font-bold text-gray-900">{taskStats.total}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <h3 className="text-sm font-medium text-gray-500">To Do</h3>
                    <p className="text-2xl font-bold text-orange-600">{taskStats.todo}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <h3 className="text-sm font-medium text-gray-500">In Progress</h3>
                    <p className="text-2xl font-bold text-blue-600">{taskStats.inProgress}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <h3 className="text-sm font-medium text-gray-500">Completed</h3>
                    <p className="text-2xl font-bold text-green-600">{taskStats.completed}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    
                    {/* Status Filter */}
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as any)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="all">All Priority</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>
                </div>
            </div>

            {/* Tasks Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTasks.length > 0 ? (
                    filteredTasks.map((task) => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            onEdit={handleEditTask}
                            onDelete={handleDeleteTask}
                            onStatusChange={(taskId, status) => updateTask(taskId, { status })}
                        />
                    ))
                ) : (
                    <div className="col-span-full text-center py-12">
                        <div className="text-gray-400 text-lg">
                            {searchTerm || filterStatus !== 'all' || filterPriority !== 'all' 
                                ? 'No tasks match your filters' 
                                : 'No tasks yet. Create your first task!'}
                        </div>
                    </div>
                )}
            </div>

            {/* Task Modal */}
            {showModal && (
                <TaskModal
                    task={editingTask}
                    onSave={editingTask ? handleUpdateTask : handleCreateTask}
                    onCancel={() => {
                        setShowModal(false);
                        setEditingTask(null);
                    }}
                />
            )}
        </div>
    );
};

export default Tasks;