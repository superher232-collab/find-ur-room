import React from 'react';
import { ArrowLeft } from './icons';

interface HeaderProps {
  title?: string;
  onBack?: () => void;
  showLogo?: boolean;
}

export function Header({ title, onBack, showLogo = true }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full h-14 bg-background border-b border-border flex items-center px-4 justify-between">
      <div className="w-10 flex items-center justify-start">
        {onBack && (
          <button 
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center rounded-base hover:bg-surface text-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
            aria-label="Kembali"
          >
            <ArrowLeft size={24} />
          </button>
        )}
      </div>
      
      <div className="flex-1 flex justify-center text-h3 text-secondary font-semibold truncate px-2">
        {title}
      </div>

      <div className="w-10 flex items-center justify-end">
        {showLogo && (
          <img 
            src="/logo.png" 
            alt="UAJY Logo" 
            className="w-8 h-8 object-contain"
          />
        )}
      </div>
    </header>
  );
}
