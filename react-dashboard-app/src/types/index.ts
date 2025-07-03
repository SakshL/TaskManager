// User types
export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Date;
}

// Task types
export interface Task {
  id: string;
  title: string;
  description?: string;
  deadline?: Date;
  priority: 'low' | 'medium' | 'high';
  subject: string;
  status: 'todo' | 'in-progress' | 'completed';
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  estimatedTime?: number; // in minutes
  actualTime?: number; // in minutes
  tags?: string[]; // Task tags
}

// Pomodoro Session types
export interface PomodoroSession {
  id: string;
  taskId?: string;
  userId: string;
  duration: number; // in minutes
  type: 'work' | 'break';
  startTime: Date;
  endTime?: Date;
  completed: boolean;
}

// Subject/Category types
export interface Subject {
  id: string;
  name: string;
  color: string;
  userId: string;
}

// Analytics types
export interface ProductivityStats {
  totalTasks: number;
  completedTasks: number;
  totalFocusTime: number; // in minutes
  averageTaskCompletionTime: number;
  streakDays: number;
}

// AI Assistant types
export interface ChatMessage {
  id: string;
  userId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface AISession {
  id: string;
  userId: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

// Calendar Event
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  taskId?: string;
}

// Analytics Data
export interface AnalyticsData {
  date: string;
  value: number;
}

// Settings types
export interface UserSettings {
  userId: string;
  theme: 'light' | 'dark';
  notifications: boolean;
  pomodoroSettings: {
    workDuration: number;
    breakDuration: number;
    longBreakDuration: number;
    sessionsUntilLongBreak: number;
  };
  defaultView: 'dashboard' | 'tasks' | 'calendar';
}

// Toast notification types
export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}