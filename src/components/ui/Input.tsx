import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', icon, error, disabled, ...props }, ref) => {
    
    const borderStyle = error ? 'border-2 border-error' : 'border border-border focus:border-2 focus:border-primary';
    const bgStyle = 'bg-background';
    const stateStyle = disabled ? 'opacity-60 cursor-not-allowed' : '';
    
    return (
      <div className={`relative w-full ${className}`}>
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          disabled={disabled}
          className={`w-full h-10 rounded-base outline-none text-body text-secondary placeholder-muted transition-all duration-150 ${borderStyle} ${bgStyle} ${stateStyle} ${icon ? 'pl-10 pr-3' : 'px-3'}`}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = 'Input';
