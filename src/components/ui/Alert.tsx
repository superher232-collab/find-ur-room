import React from 'react';
import { AlertTriangle, CheckCircle, MapPin } from './icons';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'error' | 'warning' | 'success';
  message: string;
}

export function Alert({ variant = 'error', message, className = '', ...props }: AlertProps) {
  let containerStyle = '';
  let textStyle = '';
  let Icon = AlertTriangle;

  switch (variant) {
    case 'error':
      containerStyle = 'bg-errorLight border-l-4 border-error';
      textStyle = 'text-errorDark';
      Icon = AlertTriangle;
      break;
    case 'warning':
      containerStyle = 'bg-warningLight border-l-4 border-warning';
      textStyle = 'text-secondary';
      Icon = AlertTriangle; // Reusing triangle for warning but could change if requested
      break;
    case 'success':
      containerStyle = 'bg-successLight border-l-4 border-success';
      textStyle = 'text-success';
      Icon = CheckCircle;
      break;
  }

  return (
    <div className={`flex items-start p-3 rounded-base animate-error-slide ${containerStyle} ${className}`} {...props}>
      <Icon className={`mr-3 shrink-0 ${variant === 'warning' ? 'text-warning' : textStyle}`} size={20} />
      <div className={`text-bodySmall font-medium ${textStyle}`}>
        {message}
      </div>
    </div>
  );
}
