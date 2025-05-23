
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StatusBadgeProps {
  status?: boolean;
  onToggle?: (newValue: boolean) => Promise<void>;
  label?: string;
  value?: boolean; // Added to support existing usages
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  onToggle,
  label,
  value // Added to support existing usages
}) => {
  // Use value if provided, otherwise fall back to status
  const isActive = value !== undefined ? value : status;
  
  const handleToggle = async () => {
    if (onToggle) {
      await onToggle(!isActive);
    }
  };

  if (!onToggle) {
    return (
      <Badge 
        variant={isActive ? "default" : "destructive"}
        className={cn(
          "gap-1 font-normal",
          isActive && "bg-green-500 hover:bg-green-600"
        )}
      >
        {isActive ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
        {label || (isActive ? 'Yes' : 'No')}
      </Badge>
    );
  }

  return (
    <Switch 
      checked={!!isActive} 
      onCheckedChange={handleToggle}
      className="data-[state=checked]:bg-blue-500"
    />
  );
};
