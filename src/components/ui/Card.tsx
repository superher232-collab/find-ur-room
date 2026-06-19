import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'standard' | 'position' | 'destination' | 'route';
  elevation?: 'subtle' | 'medium' | 'large';
  noPadding?: boolean;
}

export function Card({ 
  children, 
  variant = 'standard', 
  elevation = 'subtle', 
  noPadding = false,
  className = '', 
  ...props 
}: CardProps) {
  
  const baseStyle = 'bg-background rounded-card transition-all duration-200';
  const paddingStyle = noPadding ? '' : 'p-4';
  
  let elevationStyle = '';
  switch (elevation) {
    case 'subtle': elevationStyle = 'shadow-subtle'; break;
    case 'medium': elevationStyle = 'shadow-medium'; break;
    case 'large': elevationStyle = 'shadow-large'; break;
  }

  let variantStyle = 'border border-border';
  switch (variant) {
    case 'position':
      variantStyle = 'border border-border border-l-4 border-l-primary';
      break;
    case 'destination':
      variantStyle = 'border border-border border-l-4 border-l-success';
      break;
    case 'route':
      variantStyle = 'border border-border border-t-[3px] border-t-success';
      break;
  }

  // If onClick is provided, we can assume it's interactive
  const interactiveStyle = props.onClick ? 'cursor-pointer hover:shadow-medium hover:-translate-y-[2px]' : '';

  return (
    <div 
      className={`${baseStyle} ${paddingStyle} ${elevationStyle} ${variantStyle} ${interactiveStyle} ${className}`} 
      {...props}
    >
      {children}
    </div>
  );
}
