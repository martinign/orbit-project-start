
import React from 'react';
import { History, CalendarClock, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { useStatusHistory } from '@/hooks/site-initiation/useStatusHistory';
import { SiteData } from '@/hooks/site-initiation/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface SiteHistoryTabProps {
  site: SiteData;
  onViewFullHistory: () => void;
}

export const SiteHistoryTab: React.FC<SiteHistoryTabProps> = ({ site, onViewFullHistory }) => {
  const { history, loading, error } = useStatusHistory(site.project_id, site.id);
  
  // Helper function to get field display name
  const getFieldDisplayName = (field: string): string => {
    switch (field) {
      case 'starter_pack':
        return 'Starter Pack';
      case 'registered_in_srp':
        return 'SRP Registration';
      case 'supplies_applied':
        return 'Supplies Applied';
      default:
        return field;
    }
  };

  // Helper function to render status value
  const renderStatusValue = (value: boolean | null) => {
    if (value === null) return <span className="text-gray-500">Not set</span>;
    
    return value ? (
      <span className="flex items-center text-green-600">
        <Check className="h-3 w-3 mr-1" /> Yes
      </span>
    ) : (
      <span className="flex items-center text-red-600">
        <X className="h-3 w-3 mr-1" /> No
      </span>
    );
  };

  return (
    <div className="py-1">
      <h4 className="text-sm font-medium mb-2 flex items-center">
        <History className="h-4 w-4 mr-1" /> Recent Status Changes
      </h4>
      
      <ScrollArea className="h-[120px]">
        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        ) : error ? (
          <div className="text-xs text-red-500">Failed to load history</div>
        ) : history.length === 0 ? (
          <div className="text-center py-3 text-xs text-gray-500">
            No status changes recorded
          </div>
        ) : (
          <div className="space-y-1 text-xs">
            {history.slice(0, 3).map(item => (
              <div key={item.id} className="border-b last:border-0 pb-1">
                <div className="flex justify-between">
                  <span className="font-medium">{getFieldDisplayName(item.field_changed)}</span>
                  <span className="text-gray-500 text-[10px] flex items-center">
                    <CalendarClock className="h-2 w-2 mr-1" />
                    {format(new Date(item.created_at), 'MM/dd/yyyy')}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {renderStatusValue(item.old_value)}
                  <span className="text-gray-400">→</span>
                  {renderStatusValue(item.new_value)}
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
      
      <div className="mt-2 flex justify-end">
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs h-7"
          onClick={onViewFullHistory}
        >
          View Full History
        </Button>
      </div>
    </div>
  );
};
