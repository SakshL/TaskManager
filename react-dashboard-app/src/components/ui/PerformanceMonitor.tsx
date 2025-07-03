import React, { useState, useEffect } from 'react';
import { Zap, AlertTriangle, CheckCircle } from 'lucide-react';

interface PerformanceMonitorProps {
  componentName: string;
  children: React.ReactNode;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ componentName, children }) => {
  const [renderTime, setRenderTime] = useState<number>(0);
  const [isSlowRender, setIsSlowRender] = useState(false);

  useEffect(() => {
    const startTime = performance.now();
    
    const checkRenderTime = () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      setRenderTime(duration);
      setIsSlowRender(duration > 100); // Flag renders over 100ms as slow
      
      if (duration > 100) {
        console.warn(`Slow render detected in ${componentName}: ${duration.toFixed(2)}ms`);
      }
    };

    // Use requestAnimationFrame to measure after render completion
    requestAnimationFrame(checkRenderTime);
  });

  return (
    <>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-mono ${
            isSlowRender 
              ? 'bg-red-100 text-red-800 border border-red-200' 
              : renderTime > 50
              ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
              : 'bg-green-100 text-green-800 border border-green-200'
          }`}>
            {isSlowRender ? (
              <AlertTriangle className="w-4 h-4" />
            ) : renderTime > 50 ? (
              <Zap className="w-4 h-4" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            <span>{componentName}: {renderTime.toFixed(1)}ms</span>
          </div>
        </div>
      )}
    </>
  );
};

export default PerformanceMonitor;
