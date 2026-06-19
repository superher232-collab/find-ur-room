import React, { useEffect } from 'react';
import { CheckCircle, WifiOff, X } from './icons';

// Simple toast for success messages
export function Toast({ message, visible, onClose }: { message: string, visible: boolean, onClose: () => void }) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-safe-4 left-4 right-4 z-50 flex items-center p-4 bg-secondary text-white rounded-card shadow-large animate-error-slide">
      <CheckCircle size={24} className="text-success mr-3 shrink-0" />
      <span className="text-body font-medium flex-1">{message}</span>
      <button onClick={onClose} className="p-1 text-muted hover:text-white transition-colors focus:outline-none">
        <X size={20} />
      </button>
    </div>
  );
}

// Sticky banner for offline indicator
export function OfflineBanner({ visible, onClose }: { visible: boolean, onClose?: () => void }) {
  if (!visible) return null;

  return (
    <div className="sticky top-0 z-[100] w-full bg-warningLight border-b border-warning p-3 flex items-start sm:items-center justify-between animate-dropdown-slide">
      <div className="flex items-center">
        <WifiOff size={20} className="text-warning mr-3 shrink-0" />
        <span className="text-bodySmall font-medium text-secondary">
          Mode Offline — Peta tersimpan, fitur terbatas
        </span>
      </div>
      {onClose && (
        <button onClick={onClose} className="p-1 ml-2 text-warning hover:text-secondary transition-colors focus:outline-none shrink-0">
          <X size={16} />
        </button>
      )}
    </div>
  );
}
