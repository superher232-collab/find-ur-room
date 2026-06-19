import React from 'react';
import { Spinner } from '../ui';

export function RouteLoadingScreen() {
  return (
    <div className="fixed inset-0 z-[100] bg-secondary/30 backdrop-blur-sm flex items-center justify-center animate-fade-in p-4">
      <div className="bg-background w-full max-w-[160px] aspect-square rounded-card shadow-large flex flex-col items-center justify-center p-4 animate-dropdown-slide">
        <Spinner size={40} className="mb-4" />
        <p className="text-bodySmall text-muted text-center font-medium">Menghitung rute terbaik...</p>
      </div>
    </div>
  );
}
