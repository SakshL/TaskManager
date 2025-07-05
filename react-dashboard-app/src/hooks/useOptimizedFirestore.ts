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

  const fetchData = useCallback(async () => {
    if (!user) return;

    const now = Date.now();
    // Prevent duplicate requests within 1 second
    if (now - lastFetchRef.current < 1000) {
      return;
    }
    lastFetchRef.current = now;

    try {
      setLoading(true);
      setError(null);

      const result = await cachedFirestoreOperation(
        cacheKey,
        async () => {
          const collectionRef = collection(db, collectionName);
          const q = query(collectionRef, ...queryConstraints);
          
          // Use getDocs for cached data, onSnapshot for realtime
          const { getDocs } = await import('firebase/firestore');
          const snapshot = await getDocs(q);
          
          return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as unknown as T));
        },
        5 * 60 * 1000 // 5 minute cache
      );

      setData(result);
    } catch (err) {
      console.error(`Error fetching ${collectionName}:`, err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [user, collectionName, queryConstraints, cacheKey]);

  const setupRealtimeListener = useCallback(() => {
    if (!user || !enableRealtime) return;

    try {
      const collectionRef = collection(db, collectionName);
      const q = query(collectionRef, ...queryConstraints);

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const newData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as unknown as T));

          setData(newData);
          // Update cache with fresh data
          cache.set(cacheKey, newData);
          setLoading(false);
        },
        (err) => {
          console.error(`Realtime listener error for ${collectionName}:`, err);
          setError(err.message);
          setLoading(false);
        }
      );

      unsubscribeRef.current = unsubscribe;
    } catch (err) {
      console.error(`Error setting up realtime listener:`, err);
      setError(err instanceof Error ? err.message : 'Failed to setup realtime updates');
    }
  }, [user, collectionName, queryConstraints, cacheKey, enableRealtime]);

  useEffect(() => {
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

    if (enableRealtime) {
      setupRealtimeListener();
    } else {
      fetchData();
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
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

// Optimized hook for tasks
export const useTasks = (enableRealtime: boolean = true) => {
  const { user } = useAuth();
  
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
    enableRealtime
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
