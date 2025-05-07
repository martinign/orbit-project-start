
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  variant?: 'default' | 'outline' | 'secondary' | 'destructive' | 'success';
  className?: string;
  children: React.ReactNode;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  variant = 'default',
  className, 
  children 
}) => {
  // Custom styling based on variant
  const getCustomClass = () => {
    switch (variant) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200';
      case 'destructive':
        return 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200';
      default:
        return '';
    }
  };
  
  return (
    <Badge 
      variant={variant === 'success' || variant === 'destructive' ? 'outline' : variant}
      className={cn(getCustomClass(), className)}
    >
      {children}
    </Badge>
  );
};
