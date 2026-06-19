import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from './icons';
import { Input } from './Input';

export interface DropdownOption {
  value: string;
  label: string;
  subLabel?: string;
  icon?: React.ReactNode;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export function Dropdown({ options, value, onChange, placeholder = 'Select...', icon, disabled }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(search.toLowerCase()) || 
    (opt.subLabel && opt.subLabel.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div 
        className={`relative w-full h-10 border border-border bg-background rounded-base flex items-center px-3 cursor-pointer transition-colors ${disabled ? 'opacity-60 cursor-not-allowed' : 'hover:border-primary'} ${isOpen ? 'border-primary ring-1 ring-primary' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        {icon && <span className="mr-2 text-muted">{icon}</span>}
        <span className={`flex-1 truncate text-body ${selectedOption ? 'text-secondary' : 'text-muted'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={20} className={`text-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-base shadow-medium animate-dropdown-slide overflow-hidden">
          <div className="p-2 border-b border-border">
            <Input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari..."
              autoFocus
              className="h-8 text-sm"
            />
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div
                  key={opt.value}
                  className={`flex items-center px-4 py-3 cursor-pointer transition-colors hover:bg-surface ${value === opt.value ? 'bg-primaryLight border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'}`}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                    setSearch('');
                  }}
                >
                  {opt.icon && <span className="mr-3 text-muted">{opt.icon}</span>}
                  <div className="flex flex-col">
                    <span className={`text-body ${value === opt.value ? 'text-primary font-medium' : 'text-secondary'}`}>
                      {opt.label}
                    </span>
                    {opt.subLabel && (
                      <span className="text-bodySmall text-muted mt-0.5">{opt.subLabel}</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-6 text-center text-bodySmall text-muted">
                Tidak ada hasil ditemukan
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
