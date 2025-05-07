
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  variant?: 'default' | 'outline' | 'secondary';
  className?: string;
  children: React.ReactNode;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  variant = 'default',
  className, 
  children 
}) => {
  return (
    <Badge 
      variant={variant} 
      className={cn(className)}
    >
      {children}
    </Badge>
  );
};
