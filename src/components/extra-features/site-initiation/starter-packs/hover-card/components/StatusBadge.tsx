
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Check, X } from 'lucide-react';

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
        variant={isActive ? "success" : "destructive"}
        className="gap-1 font-normal"
      >
        {isActive ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
        {label || (isActive ? 'Yes' : 'No')}
      </Badge>
    );
  }

  return (
    <div className="flex items-center space-x-1">
      <Switch 
        checked={!!isActive} 
        onCheckedChange={handleToggle}
        size="sm"
      />
      <span className="text-xs">{label || (isActive ? 'Yes' : 'No')}</span>
    </div>
  );
};
