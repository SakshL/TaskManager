import React from 'react';
import { CheckCircle2, Circle, Clock, Calendar, Star, Trash2, Edit3 } from 'lucide-react';
import { Task } from '../../types';

interface TaskCardProps {
  task: Task;
  onToggle: (taskId: string, currentStatus: Task['status']) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = React.memo(({ task, onToggle, onEdit, onDelete }) => {
  const priorityColors = {
    low: 'border-green-200 bg-green-50',
    medium: 'border-yellow-200 bg-yellow-50',
    high: 'border-red-200 bg-red-50'
  };

  const statusIcons = {
    todo: Circle,
    'in-progress': Clock,
    completed: CheckCircle2
  };

  const StatusIcon = statusIcons[task.status];

  return (
    <div className={`p-4 rounded-xl border-2 ${priorityColors[task.priority]} backdrop-blur-sm hover:shadow-lg transition-all duration-300 group`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onToggle(task.id, task.status)}
            className={`p-2 rounded-full transition-all duration-300 ${
              task.status === 'completed'
                ? 'bg-green-100 text-green-600 hover:bg-green-200'
                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
            }`}
          >
            <StatusIcon className="w-5 h-5" />
          </button>
          <div>
            <h3 className={`font-semibold text-lg ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
              {task.title}
            </h3>
            {task.subject && (
              <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full mt-1">
                {task.subject}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={() => onEdit(task)}
            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {task.description && (
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{task.description}</p>
      )}

      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-4">
          {task.deadline && (
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{new Date(task.deadline).toLocaleDateString()}</span>
            </div>
          )}
          {task.estimatedTime && (
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{task.estimatedTime}h</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-1">
          <Star className={`w-4 h-4 ${task.priority === 'high' ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
          <span className="capitalize">{task.priority}</span>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for better performance
  return (
    prevProps.task.id === nextProps.task.id &&
    prevProps.task.status === nextProps.task.status &&
    prevProps.task.title === nextProps.task.title &&
    prevProps.task.priority === nextProps.task.priority &&
    prevProps.task.deadline === nextProps.task.deadline
  );
});

TaskCard.displayName = 'TaskCard';

export default TaskCard;
