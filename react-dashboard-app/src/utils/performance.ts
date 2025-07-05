// Performance optimization utilities

// Improved route preloading with caching
const routeCache = new Map<string, Promise<any>>();

export const preloadRoute = (routeImport: () => Promise<any>, routeName: string) => {
  if (routeCache.has(routeName)) {
    return routeCache.get(routeName)!;
  }
  
  const componentPromise = routeImport();
  routeCache.set(routeName, componentPromise);
  return componentPromise;
};

// Aggressive preloading for critical routes
export const preloadCriticalRoutes = () => {
  const criticalRoutes = [
    { import: () => import('../pages/Dashboard'), name: 'dashboard' },
    { import: () => import('../pages/TasksAdvanced'), name: 'tasks' },
    { import: () => import('../pages/AIAssistantAdvanced'), name: 'ai' },
    { import: () => import('../pages/SettingsAdvanced'), name: 'settings' }
  ];

  // Use requestIdleCallback for better performance
  if ('requestIdleCallback' in window) {
    requestIdleCallback((deadline) => {
      criticalRoutes.forEach(route => {
        if (deadline.timeRemaining() > 0) {
          preloadRoute(route.import, route.name);
        }
      });
    }, { timeout: 2000 });
  } else {
    // Fallback with delay to avoid blocking initial render
    setTimeout(() => {
      criticalRoutes.forEach(route => {
        preloadRoute(route.import, route.name);
      });
    }, 500);
  }
};

// Enhanced resource hints with error handling
export const addResourceHints = () => {
  const head = document.head;
  
  // Preconnect to external services
  const preconnects = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com', 
    'https://api.openai.com',
    'https://firestore.googleapis.com',
    'https://identitytoolkit.googleapis.com'
  ];
  
  preconnects.forEach(url => {
    try {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = url;
      link.crossOrigin = 'anonymous';
      head.appendChild(link);
    } catch (error) {
      console.warn('Failed to add preconnect for:', url);
    }
  });

  // DNS prefetch for faster connections
  const dnsPrefetch = [
    'https://fonts.cdnfonts.com',
    'https://cdn.jsdelivr.net',
    'https://firebaseapp.com',
    'https://googleapis.com'
  ];
  
  dnsPrefetch.forEach(url => {
    try {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = url;
      head.appendChild(link);
    } catch (error) {
      console.warn('Failed to add DNS prefetch for:', url);
    }
  });
};

// Optimize images
export const optimizeImage = (src: string, width?: number, height?: number): string => {
  // If it's already optimized or a data URL, return as is
  if (src.startsWith('data:') || src.includes('w_')) {
    return src;
  }
  
  // Add optimization parameters for external image services
  if (src.includes('cloudinary.com')) {
    const baseUrl = src.split('/upload/')[0] + '/upload/';
    const path = src.split('/upload/')[1];
    let params = 'f_auto,q_auto';
    if (width) params += `,w_${width}`;
    if (height) params += `,h_${height}`;
    return `${baseUrl}${params}/${path}`;
  }
  
  return src;
};

// Performance monitoring
export const measurePerformance = (name: string, fn: () => void) => {
  if ('performance' in window) {
    const start = performance.now();
    fn();
    const end = performance.now();
    console.log(`${name} took ${end - start} milliseconds`);
  } else {
    fn();
  }
};

// Debounce function for performance
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Throttle function for performance
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let lastExecTime = 0;
  return (...args: Parameters<T>) => {
    const currentTime = Date.now();
    if (currentTime - lastExecTime > delay) {
      func(...args);
      lastExecTime = currentTime;
    }
  };
};

// Virtual scrolling for large lists
export const calculateVisibleItems = (
  containerHeight: number,
  itemHeight: number,
  scrollTop: number,
  totalItems: number,
  overscan: number = 5
) => {
  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight),
    totalItems - 1
  );
  
  return {
    start: Math.max(0, visibleStart - overscan),
    end: Math.min(totalItems - 1, visibleEnd + overscan),
    offsetY: Math.max(0, visibleStart - overscan) * itemHeight
  };
};

// Memory management
export const cleanupMemory = () => {
  if ('gc' in window) {
    // Force garbage collection in development
    (window as any).gc();
  }
};

// Service Worker registration
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered successfully:', registration);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
};

// Check if app is running as PWA
export const isPWA = () => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone ||
         document.referrer.includes('android-app://');
};
