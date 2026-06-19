import React from 'react';
import { Spinner } from './Spinner';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'link' | 'icon';
  size?: 'large' | 'standard' | 'auto';
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'standard', isLoading, fullWidth, children, disabled, ...props }, ref) => {
    
    let baseStyles = 'inline-flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 active:animate-button-press';
    
    let variantStyles = '';
    let sizeStyles = '';

    if (variant === 'primary' || variant === 'secondary') {
      sizeStyles = size === 'large' ? 'h-12 px-6 text-[12px] uppercase font-semibold tracking-[0.5px]' : 'h-10 px-4 text-[12px] uppercase font-semibold tracking-[0.5px]';
    }

    switch (variant) {
      case 'primary':
        variantStyles = 'bg-primary text-white border-none rounded-base hover:bg-primaryDark hover:shadow-subtle disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary disabled:hover:shadow-none';
        break;
      case 'secondary':
        variantStyles = 'bg-transparent text-primary border-2 border-primary rounded-base hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent';
        break;
      case 'link':
        variantStyles = 'bg-transparent text-primary text-[14px] font-semibold underline hover:text-primaryDark p-0 h-auto';
        baseStyles = baseStyles.replace('active:animate-button-press', ''); // no scale for links
        break;
      case 'icon':
        variantStyles = 'bg-transparent text-secondary rounded-base hover:bg-surface w-10 h-10 p-0 disabled:opacity-50 disabled:cursor-not-allowed';
        break;
    }

    const widthStyle = fullWidth ? 'w-full' : '';
    const stateStyles = isLoading ? 'opacity-80 pointer-events-none' : '';

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variantStyles} ${sizeStyles} ${widthStyle} ${stateStyles} ${className}`}
        {...props}
      >
        {isLoading && variant !== 'icon' && variant !== 'link' && <Spinner className="mr-2" size={20} />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
