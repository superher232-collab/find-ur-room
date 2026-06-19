import React from 'react';

export function Spinner({ className = '', size = 40 }: { className?: string, size?: number }) {
  // A 3-circle pulse loader
  return (
    <div className={`flex items-center justify-center space-x-1 ${className}`} style={{ height: size }}>
      <div className="w-3 h-3 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
      <div className="w-3 h-3 bg-primary rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></div>
      <div className="w-3 h-3 bg-primary rounded-full animate-pulse" style={{ animationDelay: '400ms' }}></div>
    </div>
  );
}
