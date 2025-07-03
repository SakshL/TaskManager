import React, { useState, useEffect } from 'react';
import { Activity, Zap, Clock, Wifi, WifiOff, AlertTriangle, CheckCircle } from 'lucide-react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  isOnline: boolean;
  lastUpdate: Date;
}

interface PerformanceMonitorProps {
  componentName?: string;
  children?: React.ReactNode;
  showFloating?: boolean;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ 
  componentName, 
  children, 
  showFloating = false 
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    isOnline: navigator.onLine,
    lastUpdate: new Date()
  });

  const [isVisible, setIsVisible] = useState(false);
  const [componentRenderTime, setComponentRenderTime] = useState<number>(0);
  const [isSlowRender, setIsSlowRender] = useState(false);

  // Component-specific performance monitoring
  useEffect(() => {
    if (componentName) {
      const startTime = performance.now();
      
      const checkRenderTime = () => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        setComponentRenderTime(duration);
        setIsSlowRender(duration > 100);
        
        if (duration > 100) {
          console.warn(`Slow render detected in ${componentName}: ${duration.toFixed(2)}ms`);
        }
      };

      requestAnimationFrame(checkRenderTime);
    }
  });

  // Global performance monitoring
  useEffect(() => {
    if (!showFloating) return;

    const loadTime = performance.now();
    
    const updateMetrics = () => {
      const memory = (performance as any).memory;
      const renderStart = performance.now();
      
      requestAnimationFrame(() => {
        const renderTime = performance.now() - renderStart;
        
        setMetrics(prev => ({
          ...prev,
          loadTime: Math.round(loadTime),
          renderTime: Math.round(renderTime * 100) / 100,
          memoryUsage: memory ? Math.round(memory.usedJSHeapSize / 1024 / 1024) : 0,
          isOnline: navigator.onLine,
          lastUpdate: new Date()
        }));
      });
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000);

    const handleOnline = () => setMetrics(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setMetrics(prev => ({ ...prev, isOnline: false }));
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showFloating]);

  // Component performance indicator
  if (componentName && !showFloating) {
    return (
      <div className="relative">
        {children}
        {process.env.NODE_ENV === 'development' && isSlowRender && (
          <div className="absolute top-2 right-2 z-50">
            <div className="bg-red-500/90 text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Slow render: {componentRenderTime.toFixed(1)}ms
            </div>
          </div>
        )}
      </div>
    );
  }

  // Floating performance monitor
  if (!showFloating) return children || null;

  const isDev = process.env.NODE_ENV === 'development';
  
  if (!isDev && !isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 w-12 h-12 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white/60 hover:text-white transition-colors z-50"
        title="Show Performance Monitor"
      >
        <Activity className="w-5 h-5" />
      </button>
    );
  }

  const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'text-green-400';
    if (value <= thresholds.warning) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-black/90 backdrop-blur-md rounded-2xl p-4 text-white min-w-[250px] shadow-2xl border border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium">Performance</span>
          </div>
          {!isDev && (
            <button
              onClick={() => setIsVisible(false)}
              className="text-white/60 hover:text-white transition-colors"
            >
              ×
            </button>
          )}
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-3 h-3 text-purple-400" />
              <span>Load Time</span>
            </div>
            <span className={getStatusColor(metrics.loadTime, { good: 1000, warning: 3000 })}>
              {metrics.loadTime}ms
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3 text-orange-400" />
              <span>Render Time</span>
            </div>
            <span className={getStatusColor(metrics.renderTime, { good: 16, warning: 32 })}>
              {metrics.renderTime}ms
            </span>
          </div>

          {metrics.memoryUsage > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-3 h-3 text-cyan-400" />
                <span>Memory</span>
              </div>
              <span className={getStatusColor(metrics.memoryUsage, { good: 50, warning: 100 })}>
                {metrics.memoryUsage}MB
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {metrics.isOnline ? (
                <Wifi className="w-3 h-3 text-green-400" />
              ) : (
                <WifiOff className="w-3 h-3 text-red-400" />
              )}
              <span>Connection</span>
            </div>
            <span className={metrics.isOnline ? 'text-green-400' : 'text-red-400'}>
              {metrics.isOnline ? 'Online' : 'Offline'}
            </span>
          </div>

          <div className="pt-2 border-t border-white/10">
            <div className="flex items-center justify-between">
              <span className="font-medium">Score</span>
              <span className="text-green-400 font-mono">
                {(() => {
                  let score = 100;
                  if (metrics.loadTime > 1000) score -= 20;
                  if (metrics.loadTime > 3000) score -= 30;
                  if (metrics.renderTime > 16) score -= 10;
                  if (metrics.renderTime > 32) score -= 20;
                  if (metrics.memoryUsage > 50) score -= 10;
                  if (metrics.memoryUsage > 100) score -= 20;
                  if (!metrics.isOnline) score -= 50;
                  return Math.max(0, score);
                })()}
                /100
              </span>
            </div>
          </div>

          <div className="text-center text-white/40 text-xs pt-1">
            Updated {metrics.lastUpdate.toLocaleTimeString()}
          </div>
        </div>

        {(metrics.loadTime > 3000 || metrics.renderTime > 32 || metrics.memoryUsage > 100) && (
          <div className="mt-3 pt-3 border-t border-white/10">
            <div className="text-xs text-yellow-400 mb-1">💡 Performance Tips:</div>
            <div className="text-xs text-white/70 space-y-1">
              {metrics.loadTime > 3000 && <div>• Check your internet connection</div>}
              {metrics.renderTime > 32 && <div>• Close unused browser tabs</div>}
              {metrics.memoryUsage > 100 && <div>• Restart your browser</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceMonitor;
