
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useWorkdayCodeDetails } from '@/hooks/useWorkdayCodeDetails';

interface TaskHoverContentProps {
  title: string;
  description?: string;
  priority?: string;
  dueDate?: string;
  assignedToName?: string;
  createdAt?: string;
  userId?: string;
  workdayCodeId?: string;
}

export const TaskHoverContent: React.FC<TaskHoverContentProps> = ({
  title,
  description,
  priority,
  dueDate,
  assignedToName,
  createdAt,
  userId,
  workdayCodeId,
}) => {
  const { data: userProfile } = useUserProfile(userId);
  const { data: workdayCodeDetails } = useWorkdayCodeDetails(workdayCodeId);
  
  const getPriorityColor = (priority: string) => {
    switch(priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-200 text-red-800';
      case 'medium':
        return 'bg-orange-200 text-orange-800';
      case 'low':
        return 'bg-green-200 text-green-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return null;
    }
  };

  return (
    <div className="space-y-2">
      <h4 className="font-semibold">{title}</h4>
      
      {description && (
        <div>
          <h5 className="text-xs font-medium text-gray-500">Description</h5>
          <p className="text-sm">{description}</p>
        </div>
      )}
      
      <div className="flex flex-wrap gap-2 pt-1">
        {priority && (
          <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(priority)}`}>
            {priority}
          </span>
        )}
        
        {dueDate && formatDate(dueDate) && (
          <span className="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-800 flex items-center">
            <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
            {formatDate(dueDate)}
          </span>
        )}
      </div>
      
      {assignedToName && (
        <div>
          <h5 className="text-xs font-medium text-gray-500">Assigned To</h5>
          <p className="text-sm flex items-center">
            <User className="h-3 w-3 mr-1 flex-shrink-0" />
            {assignedToName}
          </p>
        </div>
      )}
      
      {/* Workday code information */}
      {workdayCodeDetails && (
        <div>
          <h5 className="text-xs font-medium text-gray-500">Workday Code</h5>
          <p className="text-sm flex items-center">
            <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
            {workdayCodeDetails.label}
          </p>
        </div>
      )}
      
      {/* Creator information */}
      {userProfile && (
        <div>
          <h5 className="text-xs font-medium text-gray-500">Created By</h5>
          <p className="text-sm flex items-center">
            <User className="h-3 w-3 mr-1 flex-shrink-0" />
            {userProfile.displayName}
          </p>
        </div>
      )}
      
      {/* Creation date */}
      {createdAt && formatDate(createdAt) && (
        <div>
          <h5 className="text-xs font-medium text-gray-500">Created On</h5>
          <p className="text-sm flex items-center">
            <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
            {formatDate(createdAt)}
          </p>
        </div>
      )}
    </div>
  );
};
