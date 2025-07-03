import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  onSnapshot,
  QuerySnapshot,
  DocumentData,
} from 'firebase/firestore';
import { db } from './firebase';
import { Task, PomodoroSession, Subject, UserSettings, ChatMessage } from '../types';

// Performance optimizations
const cache = new Map();
const CACHE_DURATION = 30000; // 30 seconds

// Debounce function to prevent excessive API calls
const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Cache helper functions
const getCacheKey = (collection: string, userId?: string) => 
  userId ? `${collection}_${userId}` : collection;

const isValidCache = (cacheEntry: any) => 
  cacheEntry && (Date.now() - cacheEntry.timestamp) < CACHE_DURATION;

// Task operations
export const createTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
  const now = new Date();
  const taskData = {
    ...task,
    createdAt: Timestamp.fromDate(now),
    updatedAt: Timestamp.fromDate(now),
  };
  
  const docRef = await addDoc(collection(db, 'tasks'), taskData);
  return docRef.id;
};

export const updateTask = async (taskId: string, updates: Partial<Task>) => {
  const taskRef = doc(db, 'tasks', taskId);
  const updateData = {
    ...updates,
    updatedAt: Timestamp.fromDate(new Date()),
  };
  
  await updateDoc(taskRef, updateData);
};

export const deleteTask = async (taskId: string) => {
  const taskRef = doc(db, 'tasks', taskId);
  await deleteDoc(taskRef);
};

export const getUserTasks = async (userId: string): Promise<Task[]> => {
  const cacheKey = getCacheKey('tasks', userId);
  const cached = cache.get(cacheKey);
  
  if (isValidCache(cached)) {
    return cached.data;
  }
  
  const q = query(
    collection(db, 'tasks'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  const tasks = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate(),
    deadline: doc.data().deadline?.toDate(),
  })) as Task[];
  
  cache.set(cacheKey, { data: tasks, timestamp: Date.now() });
  return tasks;
};

// Pomodoro Session operations
export const createPomodoroSession = async (session: Omit<PomodoroSession, 'id'>) => {
  const sessionData = {
    ...session,
    startTime: Timestamp.fromDate(session.startTime),
    endTime: session.endTime ? Timestamp.fromDate(session.endTime) : null,
  };
  
  const docRef = await addDoc(collection(db, 'pomodoroSessions'), sessionData);
  return docRef.id;
};

export const updatePomodoroSession = async (sessionId: string, updates: Partial<PomodoroSession>) => {
  const sessionRef = doc(db, 'pomodoroSessions', sessionId);
  const updateData = {
    ...updates,
    endTime: updates.endTime ? Timestamp.fromDate(updates.endTime) : null,
  };
  
  await updateDoc(sessionRef, updateData);
};

export const getUserPomodoroSessions = async (userId: string): Promise<PomodoroSession[]> => {
  const q = query(
    collection(db, 'pomodoroSessions'),
    where('userId', '==', userId),
    orderBy('startTime', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    startTime: doc.data().startTime?.toDate(),
    endTime: doc.data().endTime?.toDate(),
  })) as PomodoroSession[];
};

// Subject operations
export const createSubject = async (subject: Omit<Subject, 'id'>) => {
  const docRef = await addDoc(collection(db, 'subjects'), subject);
  return docRef.id;
};

export const getUserSubjects = async (userId: string): Promise<Subject[]> => {
  const q = query(
    collection(db, 'subjects'),
    where('userId', '==', userId)
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Subject[];
};

// User Settings operations
export const getUserSettings = async (userId: string): Promise<UserSettings | null> => {
  const settingsRef = doc(db, 'userSettings', userId);
  const settingsSnap = await getDoc(settingsRef);
  
  if (settingsSnap.exists()) {
    return settingsSnap.data() as UserSettings;
  }
  return null;
};

export const updateUserSettings = async (userId: string, settings: Partial<UserSettings>) => {
  const settingsRef = doc(db, 'userSettings', userId);
  await updateDoc(settingsRef, settings);
};

// Analytics helpers
export const getTaskStats = async (userId: string) => {
  const tasks = await getUserTasks(userId);
  const completedTasks = tasks.filter(task => task.status === 'completed');
  
  return {
    totalTasks: tasks.length,
    completedTasks: completedTasks.length,
    completionRate: tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0,
  };
};

export const getPomodoroStats = async (userId: string) => {
  const sessions = await getUserPomodoroSessions(userId);
  const completedSessions = sessions.filter(session => session.completed);
  const totalFocusTime = completedSessions
    .filter(session => session.type === 'work')
    .reduce((total, session) => total + session.duration, 0);
  
  return {
    totalSessions: sessions.length,
    completedSessions: completedSessions.length,
    totalFocusTime,
  };
};

// Real-time listeners
export const subscribeToUserTasks = (userId: string, callback: (tasks: Task[]) => void) => {
  const q = query(
    collection(db, 'tasks'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const tasks = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
      deadline: doc.data().deadline?.toDate(),
    })) as Task[];
    callback(tasks);
  }, (error) => {
    console.error('Error listening to tasks:', error);
  });
};

// Chat message operations
export const createChatMessage = async (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
  const messageData = {
    ...message,
    timestamp: Timestamp.fromDate(new Date()),
  };
  
  const docRef = await addDoc(collection(db, 'chatMessages'), messageData);
  return docRef.id;
};

export const getUserChatMessages = async (userId: string): Promise<ChatMessage[]> => {
  const q = query(
    collection(db, 'chatMessages'),
    where('userId', '==', userId),
    orderBy('timestamp', 'asc')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    timestamp: doc.data().timestamp?.toDate(),
  })) as ChatMessage[];
};

export const subscribeToUserChatMessages = (userId: string, callback: (messages: ChatMessage[]) => void) => {
  const q = query(
    collection(db, 'chatMessages'),
    where('userId', '==', userId),
    orderBy('timestamp', 'asc')
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const messages = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate(),
    })) as ChatMessage[];
    callback(messages);
  }, (error) => {
    console.error('Error listening to chat messages:', error);
  });
};

// Error handling utilities
export const handleFirestoreError = (error: any) => {
  console.error('Firestore error:', error);
  
  if (error.code === 'permission-denied') {
    return 'You do not have permission to perform this action.';
  } else if (error.code === 'unavailable') {
    return 'Service is temporarily unavailable. Please try again.';
  } else if (error.code === 'deadline-exceeded') {
    return 'Request timed out. Please check your connection and try again.';
  } else {
    return 'An error occurred. Please try again.';
  }
};