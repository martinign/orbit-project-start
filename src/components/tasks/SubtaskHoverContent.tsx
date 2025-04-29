
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Calendar, User } from 'lucide-react';
import { format } from 'date-fns';

interface SubtaskHoverContentProps {
  title: string;
  description?: string;
  status: string;
  dueDate?: string;
  assignedToName?: string;
}

export const SubtaskHoverContent: React.FC<SubtaskHoverContentProps> = ({
  title,
  description,
  status,
  dueDate,
  assignedToName,
}) => {
  const getStatusColor = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-200 text-green-800';
      case 'in progress':
        return 'bg-blue-200 text-blue-800';
      case 'pending':
        return 'bg-orange-200 text-orange-800';
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
        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(status)}`}>
          {status}
        </span>
        
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
    </div>
  );
};
