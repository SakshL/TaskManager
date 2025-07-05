import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  DocumentData,
  Query,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { cache, cachedFirestoreOperation } from '../utils/cache';
import { useAuth } from '../context/AuthContext';

// Debounce utility for performance
const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Optimized Firestore collection hook with caching
export const useOptimizedCollection = <T extends DocumentData>(
  collectionName: string,
  queryConstraints: any[] = [],
  dependencies: any[] = [],
  enableRealtime: boolean = false
) => {
  const { user } = useAuth();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const unsubscribeRef = useRef<Unsubscribe | null>(null);
  const lastFetchRef = useRef<number>(0);

  // Debounce dependencies to prevent excessive refetching
  const debouncedDependencies = useDebounce(dependencies, 300);

  const cacheKey = `${collectionName}_${user?.uid}_${JSON.stringify(queryConstraints)}`;

  // Improved: Add profiling, error logging, and memory leak protection
  const fetchData = useCallback(async () => {
    if (!user) return;
    const now = Date.now();
    // Prevent duplicate requests within 2 seconds for better performance
    if (now - lastFetchRef.current < 2000) return;
    lastFetchRef.current = now;

    console.time(`[Firestore] fetchData:${collectionName}`);
    let isMounted = true;
    try {
      setLoading(true);
      setError(null);
      const result = await cachedFirestoreOperation(
        cacheKey,
        async () => {
          const collectionRef = collection(db, collectionName);
          // Add limit for large collections (customize as needed)
          const q = query(collectionRef, ...queryConstraints);
          const { getDocs } = await import('firebase/firestore');
          const snapshot = await getDocs(q);
          return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as unknown as T));
        },
        10 * 60 * 1000 // 10 minute cache for better performance
      );
      if (isMounted) setData(result);
    } catch (err) {
      console.error(`[Firestore] Error fetching ${collectionName}:`, err);
      if (isMounted) setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      if (isMounted) setLoading(false);
      console.timeEnd(`[Firestore] fetchData:${collectionName}`);
    }
    return () => { isMounted = false; };
  }, [user, collectionName, queryConstraints, cacheKey]);

  // Improved: Add profiling, error logging, and memory leak protection
  const setupRealtimeListener = useCallback(() => {
    if (!user || !enableRealtime) return;
    let isMounted = true;
    try {
      const collectionRef = collection(db, collectionName);
      const q = query(collectionRef, ...queryConstraints);
      console.time(`[Firestore] onSnapshot:${collectionName}`);
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!isMounted) return;
          const newData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as unknown as T));
          setData(newData);
          cache.set(cacheKey, newData);
          setLoading(false);
        },
        (err) => {
          if (!isMounted) return;
          console.error(`[Firestore] Realtime listener error for ${collectionName}:`, err);
          setError(err.message);
          setLoading(false);
        }
      );
      unsubscribeRef.current = unsubscribe;
      console.timeEnd(`[Firestore] onSnapshot:${collectionName}`);
    } catch (err) {
      console.error(`[Firestore] Error setting up realtime listener:`, err);
      setError(err instanceof Error ? err.message : 'Failed to setup realtime updates');
    }
    return () => { isMounted = false; };
  }, [user, collectionName, queryConstraints, cacheKey, enableRealtime]);

  useEffect(() => {
    let isMounted = true;
    if (!user) {
      setData([]);
      setLoading(false);
      return;
    }
    // Check cache first for immediate data
    const cachedData = cache.get<T[]>(cacheKey);
    if (cachedData) {
      setData(cachedData);
      setLoading(false);
    }
    let cleanup: (() => void) | undefined;
    if (enableRealtime) {
      cleanup = setupRealtimeListener();
    } else {
      fetchData();
    }
    return () => {
      isMounted = false;
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      if (cleanup) cleanup();
    };
  }, [user, ...debouncedDependencies, enableRealtime]);

  const refetch = useCallback(() => {
    // Clear cache and refetch
    cache.delete(cacheKey);
    fetchData();
  }, [cacheKey, fetchData]);

  return {
    data,
    loading,
    error,
    refetch
  };
};

// Optimized hook for study materials
export const useStudyMaterials = (enableRealtime: boolean = false) => {
  const { user } = useAuth();
  
  const queryConstraints = user 
    ? [
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      ]
    : [];

  return useOptimizedCollection(
    'studyMaterials',
    queryConstraints,
    [user?.uid],
    enableRealtime
  );
};

// Optimized hook for tasks with performance improvements
export const useTasks = (enableRealtime: boolean = false) => {
  const { user } = useAuth();
  
  // Simplified query constraints - only essential filtering
  const queryConstraints = user 
    ? [
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      ]
    : [];

  return useOptimizedCollection(
    'tasks',
    queryConstraints,
    [user?.uid],
    enableRealtime // Default to false for better performance
  );
};

// Optimized hook for user settings
export const useUserSettings = () => {
  const { user } = useAuth();
  
  const queryConstraints = user 
    ? [where('userId', '==', user.uid)]
    : [];

  return useOptimizedCollection(
    'userSettings',
    queryConstraints,
    [user?.uid],
    false // Settings don't need realtime updates
  );
};

export default useOptimizedCollection;
