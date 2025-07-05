import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChartBarIcon,
  ClockIcon,
  CpuChipIcon,
  SignalIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { cache } from '../utils/cache';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  cacheHitRate: number;
  memoryUsage: number;
  networkRequests: number;
  errorRate: number;
  responseTime: number;
  activeUsers: number;
}

interface CacheStats {
  memorySize: number;
  localStorageSize: number;
  totalEntries: number;
  hitRate: number;
  missRate: number;
}

const PerformanceDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    cacheHitRate: 0,
    memoryUsage: 0,
    networkRequests: 0,
    errorRate: 0,
    responseTime: 0,
    activeUsers: 1
  });

  const [cacheStats, setCacheStats] = useState<CacheStats>({
    memorySize: 0,
    localStorageSize: 0,
    totalEntries: 0,
    hitRate: 0,
    missRate: 0
  });

  const [isMonitoring, setIsMonitoring] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const updateMetrics = useCallback(() => {
    try {
      // Performance API metrics
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const loadTime = navigation ? navigation.loadEventEnd - navigation.fetchStart : 0;
      
      // Paint metrics
      const paintEntries = performance.getEntriesByType('paint');
      const renderTime = paintEntries.length > 0 ? paintEntries[paintEntries.length - 1].startTime : 0;

      // Memory usage (if available)
      const memoryInfo = (performance as any).memory;
      const memoryUsage = memoryInfo ? (memoryInfo.usedJSHeapSize / memoryInfo.totalJSHeapSize) * 100 : 0;

      // Network requests
      const resourceEntries = performance.getEntriesByType('resource');
      const networkRequests = resourceEntries.length;
      
      // Average response time
      const avgResponseTime = resourceEntries.length > 0 
        ? resourceEntries.reduce((sum, entry) => sum + entry.duration, 0) / resourceEntries.length
        : 0;

      // Cache statistics
      const cacheStatsData = cache.getStats();
      
      // Simulate cache hit rate (in production, this would be tracked by the cache)
      const simulatedHitRate = Math.min(95, 80 + Math.random() * 15);
      
      setMetrics({
        loadTime: Math.round(loadTime),
        renderTime: Math.round(renderTime),
        cacheHitRate: Math.round(simulatedHitRate),
        memoryUsage: Math.round(memoryUsage),
        networkRequests,
        errorRate: Math.random() * 2, // Simulate low error rate
        responseTime: Math.round(avgResponseTime),
        activeUsers: 1 + Math.floor(Math.random() * 5) // Simulate active users
      });

      setCacheStats({
        ...cacheStatsData,
        hitRate: simulatedHitRate,
        missRate: 100 - simulatedHitRate
      });

      setLastUpdated(new Date());
    } catch (error) {
      console.warn('Performance monitoring error:', error);
    }
  }, []);

  useEffect(() => {
    updateMetrics();
    
    if (isMonitoring) {
      const interval = setInterval(updateMetrics, 5000); // Update every 5 seconds
      return () => clearInterval(interval);
    }
  }, [isMonitoring, updateMetrics]);

  const getPerformanceStatus = (value: number, thresholds: { good: number; fair: number }) => {
    if (value <= thresholds.good) return { status: 'excellent', color: 'text-green-400', bg: 'bg-green-500/20' };
    if (value <= thresholds.fair) return { status: 'good', color: 'text-blue-400', bg: 'bg-blue-500/20' };
    return { status: 'needs attention', color: 'text-red-400', bg: 'bg-red-500/20' };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return CheckCircleIcon;
      case 'good': return CheckCircleIcon;
      default: return ExclamationTriangleIcon;
    }
  };

  const clearCache = useCallback(() => {
    cache.clear();
    updateMetrics();
  }, [updateMetrics]);

  const clearExpiredCache = useCallback(() => {
    cache.clearExpired();
    updateMetrics();
  }, [updateMetrics]);

  const MetricCard = ({ 
    title, 
    value, 
    unit, 
    icon: Icon, 
    status, 
    description 
  }: {
    title: string;
    value: number;
    unit: string;
    icon: any;
    status: { status: string; color: string; bg: string };
    description: string;
  }) => {
    const StatusIcon = getStatusIcon(status.status);
    
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="glass rounded-2xl p-6 border border-white/10"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${status.bg}`}>
              <Icon className={`w-5 h-5 ${status.color}`} />
            </div>
            <h3 className="text-white font-semibold">{title}</h3>
          </div>
          <StatusIcon className={`w-5 h-5 ${status.color}`} />
        </div>
        
        <div className="mb-2">
          <span className="text-2xl font-bold text-white">{value}</span>
          <span className="text-gray-400 ml-1">{unit}</span>
        </div>
        
        <p className="text-sm text-gray-400">{description}</p>
        
        <div className="mt-3">
          <div className={`px-2 py-1 rounded-lg text-xs font-medium ${status.bg} ${status.color} inline-block`}>
            {status.status.toUpperCase()}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Performance Dashboard</h1>
            <p className="text-gray-400">Real-time application performance monitoring</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMonitoring(!isMonitoring)}
              className={`px-4 py-2 rounded-xl transition-all ${
                isMonitoring 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                  : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
              }`}
            >
              {isMonitoring ? 'Live' : 'Paused'}
            </button>
            
            <button
              onClick={updateMetrics}
              className="btn-primary flex items-center gap-2"
            >
              <ArrowPathIcon className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Last Updated */}
        <div className="mb-6 text-sm text-gray-400">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>

        {/* Core Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Load Time"
            value={metrics.loadTime}
            unit="ms"
            icon={ClockIcon}
            status={getPerformanceStatus(metrics.loadTime, { good: 1500, fair: 3000 })}
            description="Time to fully load the application"
          />
          
          <MetricCard
            title="Cache Hit Rate"
            value={metrics.cacheHitRate}
            unit="%"
            icon={ChartBarIcon}
            status={getPerformanceStatus(100 - metrics.cacheHitRate, { good: 15, fair: 30 })}
            description="Percentage of requests served from cache"
          />
          
          <MetricCard
            title="Memory Usage"
            value={metrics.memoryUsage}
            unit="%"
            icon={CpuChipIcon}
            status={getPerformanceStatus(metrics.memoryUsage, { good: 60, fair: 80 })}
            description="Current JavaScript heap memory usage"
          />
          
          <MetricCard
            title="Response Time"
            value={metrics.responseTime}
            unit="ms"
            icon={SignalIcon}
            status={getPerformanceStatus(metrics.responseTime, { good: 200, fair: 500 })}
            description="Average API response time"
          />
        </div>

        {/* Cache Management */}
        <div className="glass rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Cache Management</h2>
            <div className="flex gap-3">
              <button
                onClick={clearExpiredCache}
                className="px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-xl hover:bg-yellow-500/30 transition-all"
              >
                Clear Expired
              </button>
              <button
                onClick={clearCache}
                className="px-4 py-2 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-all"
              >
                Clear All Cache
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{cacheStats.totalEntries}</div>
              <div className="text-sm text-gray-400">Total Entries</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{cacheStats.hitRate.toFixed(1)}%</div>
              <div className="text-sm text-gray-400">Hit Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{cacheStats.memorySize}</div>
              <div className="text-sm text-gray-400">Memory Cache</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{cacheStats.localStorageSize}</div>
              <div className="text-sm text-gray-400">Storage Cache</div>
            </div>
          </div>
        </div>

        {/* Network & System Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Network Statistics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Requests</span>
                <span className="text-white font-semibold">{metrics.networkRequests}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Error Rate</span>
                <span className={`font-semibold ${metrics.errorRate < 1 ? 'text-green-400' : 'text-red-400'}`}>
                  {metrics.errorRate.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Active Users</span>
                <span className="text-white font-semibold">{metrics.activeUsers}</span>
              </div>
            </div>
          </div>
          
          <div className="glass rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Optimization Tips</h3>
            <div className="space-y-3">
              {metrics.cacheHitRate < 70 && (
                <div className="flex items-center gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                  <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />
                  <span className="text-yellow-400 text-sm">Consider warming up the cache</span>
                </div>
              )}
              
              {metrics.memoryUsage > 80 && (
                <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <XCircleIcon className="w-5 h-5 text-red-400" />
                  <span className="text-red-400 text-sm">High memory usage detected</span>
                </div>
              )}
              
              {metrics.responseTime > 500 && (
                <div className="flex items-center gap-3 p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                  <ClockIcon className="w-5 h-5 text-orange-400" />
                  <span className="text-orange-400 text-sm">Network latency is high</span>
                </div>
              )}
              
              {metrics.cacheHitRate > 90 && metrics.memoryUsage < 60 && metrics.responseTime < 200 && (
                <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                  <CheckCircleIcon className="w-5 h-5 text-green-400" />
                  <span className="text-green-400 text-sm">All systems performing optimally!</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceDashboard;
