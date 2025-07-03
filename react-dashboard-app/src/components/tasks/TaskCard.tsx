import React from 'react';
import { Task } from '../../types';
import { EditIcon, TrashIcon, CalendarIcon, ClockIcon } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, status: Task['status']) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, onStatusChange }) => {
  const priorityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
  };

  const statusColors = {
    'todo': 'bg-gray-100 text-gray-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    'completed': 'bg-green-100 text-green-800',
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return null;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'completed';

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-4 transition-shadow hover:shadow-md ${isOverdue ? 'border-red-300' : 'border-gray-200'}`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-gray-900 line-clamp-2">{task.title}</h3>
        <div className="flex space-x-1 ml-2">
          <button
            onClick={() => onEdit(task)}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
          >
            <EditIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-3">{task.description}</p>
      )}

      {/* Subject */}
      <div className="mb-3">
        <span className="inline-block px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
          {task.subject}
        </span>
      </div>

      {/* Priority and Status */}
      <div className="flex space-x-2 mb-3">
        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${priorityColors[task.priority]}`}>
          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
        </span>
        <select
          value={task.status}
          onChange={(e) => onStatusChange(task.id, e.target.value as Task['status'])}
          className={`text-xs font-medium rounded-full px-2 py-1 border-0 focus:ring-2 focus:ring-blue-500 ${statusColors[task.status]}`}
        >
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        {task.deadline && (
          <div className={`flex items-center space-x-1 ${isOverdue ? 'text-red-600' : ''}`}>
            <CalendarIcon className="w-3 h-3" />
            <span>{formatDate(task.deadline)}</span>
            {isOverdue && <span className="font-medium">(Overdue)</span>}
          </div>
        )}
        {task.estimatedTime && (
          <div className="flex items-center space-x-1">
            <ClockIcon className="w-3 h-3" />
            <span>{task.estimatedTime}m</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
