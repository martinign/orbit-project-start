
import React from 'react';
import { Edit, Trash2, User, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { useTeamMemberName } from '@/hooks/useTeamMembers';
import { useUserProfile } from '@/hooks/useUserProfile';

interface Subtask {
  id: string;
  title: string;
  description?: string;
  status: string;
  due_date?: string;
  assigned_to?: string;
  user_id?: string;
  created_at?: string;
}

interface SubtaskItemProps {
  subtask: Subtask;
  onEdit: (subtask: Subtask) => void;
  onDelete: (subtask: Subtask) => void;
}

export const SubtaskItem: React.FC<SubtaskItemProps> = ({
  subtask,
  onEdit,
  onDelete,
}) => {
  const { memberName: subtaskAssignedToName } = useTeamMemberName(subtask.assigned_to);
  const { data: userProfile } = useUserProfile(subtask.user_id);

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-200 text-green-800';
      case 'in progress':
        return 'bg-blue-200 text-blue-800';
      case 'pending':
        return 'bg-yellow-200 text-yellow-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Card className="shadow-sm">
          <CardContent className="p-2">
            <div className="flex justify-between items-start">
              <div className="flex-grow min-w-0">
                <div className="flex justify-between items-start gap-1">
                  <h5 className="text-sm font-medium truncate">{subtask.title}</h5>
                  <Badge className={`flex-shrink-0 ml-1 ${getStatusColor(subtask.status)}`}>
                    {subtask.status}
                  </Badge>
                </div>
                {subtask.description && (
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {subtask.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 mt-1">
                  {subtask.due_date && formatDate(subtask.due_date) && (
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1 text-gray-500 flex-shrink-0" />
                      <span className="text-xs text-gray-600 truncate">
                        {formatDate(subtask.due_date)}
                      </span>
                    </div>
                  )}
                  {subtaskAssignedToName && (
                    <div className="flex items-center">
                      <User className="h-3 w-3 mr-1 text-gray-500 flex-shrink-0" />
                      <span className="text-xs text-gray-600 truncate">
                        {subtaskAssignedToName}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-1 ml-2 flex-shrink-0">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(subtask);
                        }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Edit Subtask</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-red-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(subtask);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Delete Subtask</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </CardContent>
        </Card>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 p-4">
        <div className="space-y-3">
          <div className="flex justify-between">
            <h4 className="text-base font-semibold">{subtask.title}</h4>
            <Badge className={getStatusColor(subtask.status)}>
              {subtask.status}
            </Badge>
          </div>
          
          {subtask.description && (
            <div>
              <h5 className="text-xs font-medium text-gray-500 mb-1">Description</h5>
              <p className="text-sm text-gray-700">{subtask.description}</p>
            </div>
          )}
          
          <div className="pt-2 flex flex-col gap-2">
            {subtask.due_date && formatDate(subtask.due_date) && (
              <div>
                <h5 className="text-xs font-medium text-gray-500 mb-1">Due Date</h5>
                <div className="flex items-center">
                  <Calendar className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
                  <span className="text-sm">{formatDate(subtask.due_date)}</span>
                </div>
              </div>
            )}
            
            {subtaskAssignedToName && (
              <div>
                <h5 className="text-xs font-medium text-gray-500 mb-1">Assigned To</h5>
                <div className="flex items-center">
                  <User className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
                  <span className="text-sm">{subtaskAssignedToName}</span>
                </div>
              </div>
            )}
            
            {/* Created by information */}
            {userProfile && (
              <div>
                <h5 className="text-xs font-medium text-gray-500 mb-1">Created By</h5>
                <div className="flex items-center">
                  <User className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
                  <span className="text-sm">{userProfile.displayName}</span>
                </div>
              </div>
            )}
            
            {/* Creation date */}
            {subtask.created_at && formatDate(subtask.created_at) && (
              <div>
                <h5 className="text-xs font-medium text-gray-500 mb-1">Created On</h5>
                <div className="flex items-center">
                  <Clock className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
                  <span className="text-sm">{formatDate(subtask.created_at)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};
