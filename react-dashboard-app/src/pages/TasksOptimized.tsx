import React, { useState, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  AdjustmentsHorizontalIcon,
  CheckIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useTasks } from '../hooks/useOptimizedFirestore';
import { cache } from '../utils/cache';
import { addDoc, collection, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../services/firebase';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate?: Timestamp;
  createdAt: Timestamp;
  userId: string;
  tags: string[];
}

// Memoized task card component
const TaskCard = React.memo(({ 
  task, 
  onStatusChange, 
  onDelete, 
  onEdit 
}: {
  task: Task;
  onStatusChange: (id: string, status: Task['status']) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}) => {
  const getPriorityColor = useCallback((priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'low': return 'text-green-400 bg-green-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  }, []);

  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case 'completed': return CheckIcon;
      case 'in-progress': return ClockIcon;
      default: return ExclamationTriangleIcon;
    }
  }, []);

  const StatusIcon = getStatusIcon(task.status);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="glass rounded-2xl p-4 sm:p-6 hover:shadow-glow transition-all duration-300 group mobile-optimized"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={`p-2 rounded-xl ${getPriorityColor(task.priority)}`}>
            <StatusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-white font-semibold text-sm sm:text-base line-clamp-1 break-words">
              {task.title}
            </h3>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="capitalize">{task.priority}</span>
              <span>•</span>
              <span className="capitalize">{task.status.replace('-', ' ')}</span>
            </div>
          </div>
        </div>
      </div>

      {task.description && (
        <p className="text-gray-300 text-xs sm:text-sm mb-3 line-clamp-2 break-words">
          {task.description}
        </p>
      )}

      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.tags.slice(0, 3).map((tag: string) => (
            <span
              key={tag}
              className="px-2 py-1 bg-accent-500/20 text-accent-400 text-xs rounded-lg"
            >
              {tag}
            </span>
          ))}
          {task.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded-lg">
              +{task.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {task.dueDate && (
        <div className="text-xs text-gray-400 mb-3">
          Due: {task.dueDate.toDate().toLocaleDateString()}
        </div>
      )}

      <div className="flex gap-2">
        <select
          value={task.status}
          onChange={(e) => onStatusChange(task.id, e.target.value as Task['status'])}
          className="flex-1 px-3 py-2 bg-black/20 border border-white/10 rounded-xl text-white text-xs focus:border-primary-500 transition-all"
        >
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <button
          onClick={() => onEdit(task)}
          className="px-3 py-2 bg-primary-500/20 text-primary-400 rounded-xl hover:bg-primary-500/30 transition-all text-xs"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="px-3 py-2 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-all text-xs"
        >
          Delete
        </button>
      </div>
    </motion.div>
  );
});

TaskCard.displayName = 'TaskCard';

const TasksOptimized: React.FC = () => {
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  
  // Optimized hooks with caching and real-time updates
  const { data: tasks, loading, error, refetch } = useTasks(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [retrying, setRetrying] = useState(false);
  
  // Performance optimization: debounced search
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(value);
    }, 300);
  }, []);

  // Memoized filtered tasks for performance
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                           task.description?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                           task.tags.some((tag: string) => tag.toLowerCase().includes(debouncedSearchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, debouncedSearchTerm, statusFilter, priorityFilter]);

  // Memoized task statistics
  const taskStats = useMemo(() => {
    return {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'completed').length,
      inProgress: tasks.filter(t => t.status === 'in-progress').length,
      pending: tasks.filter(t => t.status === 'pending').length,
      overdue: tasks.filter(t => 
        t.dueDate && 
        t.status !== 'completed' && 
        t.dueDate.toDate() < new Date()
      ).length
    };
  }, [tasks]);

  // Optimized task operations with caching
  const updateTaskStatus = useCallback(async (taskId: string, status: Task['status']) => {
    try {
      await updateDoc(doc(db, 'tasks', taskId), { status });
      
      // Clear cache to force refresh
      if (user) {
        cache.delete(`tasks_${user.uid}_${JSON.stringify([])}`);
      }
      
      refetch();
      success(`Task marked as ${status.replace('-', ' ')}`);
    } catch (error) {
      console.error('Error updating task:', error);
      showError('Failed to update task');
    }
  }, [user, refetch, success, showError]);

  const deleteTask = useCallback(async (taskId: string) => {
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
      
      // Clear cache to force refresh
      if (user) {
        cache.delete(`tasks_${user.uid}_${JSON.stringify([])}`);
      }
      
      refetch();
      success('Task deleted successfully');
    } catch (error) {
      console.error('Error deleting task:', error);
      showError('Failed to delete task');
    }
  }, [user, refetch, success, showError]);

  const editTask = useCallback((task: Task) => {
    setEditingTask(task);
    setShowCreateModal(true);
  }, []);

  // Retry mechanism for failed operations
  const retryOperation = useCallback(async () => {
    setRetrying(true);
    try {
      await refetch();
      success('Data refreshed successfully');
    } catch (error) {
      showError('Retry failed. Please check your connection.');
    } finally {
      setRetrying(false);
    }
  }, [refetch, success, showError]);

  // Error boundary with retry
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="glass rounded-3xl p-8 text-center max-w-md">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <div className="flex gap-3">
            <button
              onClick={retryOperation}
              disabled={retrying}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              {retrying ? (
                <>
                  <ArrowPathIcon className="w-4 h-4 animate-spin mr-2" />
                  Retrying...
                </>
              ) : (
                <>
                  <ArrowPathIcon className="w-4 h-4 mr-2" />
                  Retry
                </>
              )}
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex-1 border border-white/10 text-gray-400 px-4 py-2 rounded-xl hover:border-white/20 hover:text-white transition-all"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading && tasks.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-gray-400 mt-4">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Tasks</h1>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>{taskStats.total} total</span>
              <span>{taskStats.completed} completed</span>
              <span>{taskStats.inProgress} in progress</span>
              {taskStats.overdue > 0 && (
                <span className="text-red-400">{taskStats.overdue} overdue</span>
              )}
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto touch-target"
          >
            <PlusIcon className="w-5 h-5" />
            Add Task
          </button>
        </div>

        {/* Mobile Filters Toggle */}
        <div className="block lg:hidden mb-4">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white hover:bg-black/30 transition-all touch-target"
          >
            <AdjustmentsHorizontalIcon className="w-5 h-5" />
            {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        {/* Filters */}
        <div className={`glass rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 ${!showMobileFilters ? 'hidden lg:block' : ''}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative sm:col-span-2">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
            >
              <option value="all">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Tasks Grid */}
        <div className="responsive-grid">
          <AnimatePresence>
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={updateTaskStatus}
                onDelete={deleteTask}
                onEdit={editTask}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredTasks.length === 0 && tasks.length > 0 && (
          <div className="text-center py-12">
            <MagnifyingGlassIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No tasks found</h3>
            <p className="text-gray-400 mb-6">Try adjusting your search or filters</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setDebouncedSearchTerm('');
                setStatusFilter('all');
                setPriorityFilter('all');
              }}
              className="btn-primary"
            >
              Clear Filters
            </button>
          </div>
        )}

        {filteredTasks.length === 0 && tasks.length === 0 && (
          <div className="text-center py-12">
            <CheckIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No tasks yet</h3>
            <p className="text-gray-400 mb-6">Create your first task to get started</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              Create Your First Task
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksOptimized;
