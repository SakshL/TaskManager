// Cache utility for performance optimization
// Acts as a Redis-like caching layer using localStorage and memory

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

class CacheManager {
  private memoryCache = new Map<string, any>();
  private readonly PREFIX = 'tasktide_cache_';
  
  // Default cache times (in milliseconds) - optimized for performance
  private readonly CACHE_TIMES = {
    STUDY_MATERIALS: 10 * 60 * 1000, // 10 minutes (increased)
    USER_DATA: 15 * 60 * 1000, // 15 minutes
    SETTINGS: 30 * 60 * 1000, // 30 minutes (increased)
    TASKS: 5 * 60 * 1000, // 5 minutes (increased)
    AI_RESPONSES: 60 * 60 * 1000, // 60 minutes (increased)
  };

  // Set data in cache with automatic expiry
  set<T>(key: string, data: T, customTTL?: number): void {
    const ttl = customTTL || this.CACHE_TIMES.STUDY_MATERIALS;
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttl
    };

    try {
      // Memory cache for immediate access
      this.memoryCache.set(key, item);
      
      // Persistent cache in localStorage
      localStorage.setItem(
        this.PREFIX + key, 
        JSON.stringify(item)
      );
    } catch (error) {
      console.warn('Cache storage failed:', error);
      // Fallback to memory only if localStorage fails
      this.memoryCache.set(key, item);
    }
  }

  // Get data from cache
  get<T>(key: string): T | null {
    try {
      // Check memory cache first (fastest)
      let item = this.memoryCache.get(key) as CacheItem<T>;
      
      // If not in memory, check localStorage
      if (!item) {
        const stored = localStorage.getItem(this.PREFIX + key);
        if (stored) {
          item = JSON.parse(stored) as CacheItem<T>;
          // Restore to memory cache
          this.memoryCache.set(key, item);
        }
      }

      // Check if item exists and hasn't expired
      if (item && Date.now() < item.expiry) {
        return item.data;
      }

      // Clean up expired item
      if (item) {
        this.delete(key);
      }

      return null;
    } catch (error) {
      console.warn('Cache retrieval failed:', error);
      return null;
    }
  }

  // Delete specific cache entry
  delete(key: string): void {
    this.memoryCache.delete(key);
    try {
      localStorage.removeItem(this.PREFIX + key);
    } catch (error) {
      console.warn('Cache deletion failed:', error);
    }
  }

  // Clear all cache
  clear(): void {
    this.memoryCache.clear();
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Cache clear failed:', error);
    }
  }

  // Clear expired entries
  clearExpired(): void {
    const now = Date.now();
    
    // Clear memory cache
    for (const [key, item] of this.memoryCache.entries()) {
      if (item.expiry < now) {
        this.memoryCache.delete(key);
      }
    }

    // Clear localStorage cache
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.PREFIX)) {
          try {
            const item = JSON.parse(localStorage.getItem(key) || '');
            if (item.expiry < now) {
              localStorage.removeItem(key);
            }
          } catch (error) {
            // Remove corrupted entries
            localStorage.removeItem(key);
          }
        }
      });
    } catch (error) {
      console.warn('Expired cache cleanup failed:', error);
    }
  }

  // Get cache statistics
  getStats(): { memorySize: number; localStorageSize: number; totalEntries: number } {
    const memorySize = this.memoryCache.size;
    
    let localStorageSize = 0;
    try {
      const keys = Object.keys(localStorage);
      localStorageSize = keys.filter(key => key.startsWith(this.PREFIX)).length;
    } catch (error) {
      console.warn('Cache stats failed:', error);
    }

    return {
      memorySize,
      localStorageSize,
      totalEntries: memorySize + localStorageSize
    };
  }

  // Preload frequently used data
  async preloadUserData(userId: string): Promise<void> {
    const cacheKeys = [
      `user_${userId}`,
      `tasks_${userId}`,
      `settings_${userId}`,
      `materials_${userId}`
    ];

    // Mark data as preloading to prevent duplicate requests
    cacheKeys.forEach(key => {
      if (!this.get(key)) {
        this.set(`${key}_loading`, true, 30000); // 30 second loading flag
      }
    });
  }

  // Check if data is currently loading
  isLoading(key: string): boolean {
    return !!this.get(`${key}_loading`);
  }

  // Mark loading as complete
  setLoadingComplete(key: string): void {
    this.delete(`${key}_loading`);
  }
}

// Create singleton instance
export const cache = new CacheManager();

// Auto-cleanup expired entries every 5 minutes
setInterval(() => {
  cache.clearExpired();
}, 5 * 60 * 1000);

// Cache-aware Firestore operations
export const cachedFirestoreOperation = async <T>(
  key: string,
  operation: () => Promise<T>,
  ttl?: number
): Promise<T> => {
  // Check cache first
  const cached = cache.get<T>(key);
  if (cached) {
    return cached;
  }

  // Check if already loading
  if (cache.isLoading(key)) {
    // Wait for existing operation to complete
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        const result = cache.get<T>(key);
        if (result || !cache.isLoading(key)) {
          clearInterval(checkInterval);
          resolve(result || operation());
        }
      }, 100);
    });
  }

  try {
    const result = await operation();
    cache.set(key, result, ttl);
    cache.setLoadingComplete(key);
    return result;
  } catch (error) {
    cache.setLoadingComplete(key);
    throw error;
  }
};

export default cache;
