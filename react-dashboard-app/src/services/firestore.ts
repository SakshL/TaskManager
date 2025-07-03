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
} from 'firebase/firestore';
import { db } from './firebase';
import { Task, PomodoroSession, Subject, UserSettings } from '../types';

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
  const q = query(
    collection(db, 'tasks'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate(),
    deadline: doc.data().deadline?.toDate(),
  })) as Task[];
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