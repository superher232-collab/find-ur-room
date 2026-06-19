import React from 'react';

type BadgeVariant = 'room' | 'floor' | 'error';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ children, variant = 'room', className = '', ...props }: BadgeProps) {
  let variantStyles = '';

  switch (variant) {
    case 'room':
      variantStyles = 'bg-primaryLight text-primary';
      break;
    case 'floor':
      variantStyles = 'bg-successLight text-success';
      break;
    case 'error':
      variantStyles = 'bg-errorLight text-errorDark';
      break;
  }

  return (
    <span
      className={`inline-flex items-center justify-center px-3 py-1.5 text-[12px] font-semibold rounded-pill ${variantStyles} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
