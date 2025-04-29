
import React from 'react';
import { Edit, Trash2, User, Calendar } from 'lucide-react';
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
import { SubtaskHoverContent } from './SubtaskHoverContent';

interface Subtask {
  id: string;
  title: string;
  description?: string;
  status: string;
  due_date?: string;
  assigned_to?: string;
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
        <Card className="shadow-sm hover:shadow-md transition-shadow">
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
      <HoverCardContent className="w-80">
        <SubtaskHoverContent
          title={subtask.title}
          description={subtask.description}
          status={subtask.status}
          dueDate={subtask.due_date}
          assignedToName={subtaskAssignedToName}
        />
      </HoverCardContent>
    </HoverCard>
  );
};
