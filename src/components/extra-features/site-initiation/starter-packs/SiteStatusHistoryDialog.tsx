
import React from 'react';
import { format } from 'date-fns';
import { Shield, Check, X, History, CalendarClock } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useStatusHistory } from '@/hooks/site-initiation/useStatusHistory';
import { SiteStatusHistoryRecord } from '@/hooks/site-initiation/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

interface SiteStatusHistoryDialogProps {
  open: boolean;
  onClose: () => void;
  projectId?: string;
  siteId?: string;
  siteRef: string;
  siteName: string;
}

export const SiteStatusHistoryDialog: React.FC<SiteStatusHistoryDialogProps> = ({
  open,
  onClose,
  projectId,
  siteId,
  siteRef,
  siteName
}) => {
  const { history, loading, error } = useStatusHistory(projectId, siteId, siteRef);

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
        <Check className="h-4 w-4 mr-1" /> Yes
      </span>
    ) : (
      <span className="flex items-center text-red-600">
        <X className="h-4 w-4 mr-1" /> No
      </span>
    );
  };

  // Render status history item
  const renderHistoryItem = (item: SiteStatusHistoryRecord) => (
    <div key={item.id} className="border-b last:border-0 pb-3 pt-3">
      <div className="flex flex-col sm:flex-row justify-between mb-1">
        <div className="flex items-center">
          <Shield className="h-4 w-4 text-blue-600 mr-2" />
          <span className="font-medium">{getFieldDisplayName(item.field_changed)}</span>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <CalendarClock className="h-3 w-3 mr-1" />
          {format(new Date(item.created_at), 'MMM dd, yyyy HH:mm')}
        </div>
      </div>
      <div className="flex items-center space-x-3 pl-6">
        <div className="flex items-center">
          <span className="text-gray-500 mr-2">From:</span> 
          {renderStatusValue(item.old_value)}
        </div>
        <span className="text-gray-400">→</span>
        <div className="flex items-center">
          <span className="text-gray-500 mr-2">To:</span>
          {renderStatusValue(item.new_value)}
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <History className="mr-2 h-5 w-5" />
            Status Change History
          </DialogTitle>
          <DialogDescription>
            Status changes for site {siteRef} ({siteName})
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[400px] pr-4">
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-6">
              <p className="text-red-500">Failed to load history data</p>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12">
              <History className="mx-auto h-12 w-12 text-gray-300 mb-2" />
              <p className="text-gray-500">No status changes have been recorded yet.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {history.map(renderHistoryItem)}
            </div>
          )}
        </ScrollArea>
        
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
