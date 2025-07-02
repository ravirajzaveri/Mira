import React from 'react';
import { clsx } from 'clsx';

interface BadgeProps {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  className?: string;
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  className,
  children
}) => {
  const variantClasses = {
    default: 'bg-gray-900 text-gray-50 hover:bg-gray-900/80',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-100/80',
    destructive: 'bg-red-500 text-gray-50 hover:bg-red-500/80',
    outline: 'text-gray-950 border border-gray-200 bg-white hover:bg-gray-100'
  };

  return (
    <div
      className={clsx(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </div>
  );
};