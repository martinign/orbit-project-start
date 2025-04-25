import React from 'react';
import { format, parseISO, differenceInDays, isBefore } from 'date-fns';
import { Calendar, Clock, User } from 'lucide-react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Badge } from '@/components/ui/badge';
import { Task, TeamMember } from '../TaskTimelineView';

interface TimelineTaskBarProps {
  task: Task;
  timelineDates: Date[];
  teamMembers: TeamMember[];
}

export const TimelineTaskBar: React.FC<TimelineTaskBarProps> = ({ 
  task, 
  timelineDates,
  teamMembers 
}) => {
  if (!task.created_at) return null;
    
  const startDate = parseISO(task.created_at);
  const endDate = task.status === 'completed' && task.updated_at 
    ? parseISO(task.updated_at)
    : new Date();

  let visibleStartDate = startDate;
  if (isBefore(startDate, timelineDates[0])) {
    visibleStartDate = timelineDates[0];
  }

  const taskStartIndex = timelineDates.findIndex(date => 
    date.getFullYear() === visibleStartDate.getFullYear() &&
    date.getMonth() === visibleStartDate.getMonth() &&
    date.getDate() === visibleStartDate.getDate()
  );

  if (taskStartIndex === -1) return null;

  let durationDays = differenceInDays(endDate, visibleStartDate) + 1;
  const remainingDays = timelineDates.length - taskStartIndex;
  durationDays = Math.min(durationDays, remainingDays);
  durationDays = Math.max(1, durationDays);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-500';
      case 'in progress': return 'bg-blue-500';
      case 'stucked': return 'bg-red-500';
      case 'pending': return 'bg-yellow-500';
      case 'not started':
      default: return 'bg-gray-500';
    }
  };

  const assignedTeamMember = teamMembers.find(member => member.user_id === task.assigned_to);
  const createdByTeamMember = teamMembers.find(member => member.user_id === task.user_id);

  return (
    <div className="flex min-h-[2.5rem] items-center border-b border-gray-100">
      <div className="w-64 flex-shrink-0 px-4 py-2 border-r border-gray-200">
        <div className="flex items-center space-x-2">
          <span className="font-medium truncate">{task.title}</span>
        </div>
      </div>
      
      <div 
        className="flex-1 grid relative" 
        style={{ gridTemplateColumns: `repeat(${timelineDates.length}, minmax(30px, 1fr))` }}
      >
        <div className="absolute w-full border-b border-dotted border-gray-300" style={{ top: '50%' }} />
        
        <HoverCard>
          <HoverCardTrigger>
            <div
              className={`h-6 rounded-md ${getStatusColor(task.status)}`}
              style={{ 
                gridColumn: `${taskStartIndex + 1} / span ${durationDays}`,
                transition: 'all 0.2s ease-in-out'
              }}
            />
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <div className="space-y-2">
              <h3 className="text-lg font-bold">{task.title}</h3>
              {task.description && (
                <p className="text-sm text-gray-600">{task.description}</p>
              )}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div className="font-medium">Status:</div>
                  <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
                </div>
                
                <div>
                  <div className="font-medium">Priority:</div>
                  <span className="capitalize">{task.priority}</span>
                </div>
                
                <div>
                  <div className="font-medium">Created by:</div>
                  <div className="flex items-center">
                    <User className="h-3 w-3 mr-1" />
                    <span>
                      {createdByTeamMember 
                        ? `${createdByTeamMember.full_name || ''} ${createdByTeamMember.last_name || ''}`.trim() 
                        : 'Unknown'}
                    </span>
                  </div>
                </div>
                
                <div>
                  <div className="font-medium">Assigned to:</div>
                  <div className="flex items-center">
                    <User className="h-3 w-3 mr-1" />
                    <span>
                      {assignedTeamMember 
                        ? `${assignedTeamMember.full_name || ''} ${assignedTeamMember.last_name || ''}`.trim() 
                        : 'Unassigned'}
                    </span>
                  </div>
                </div>
                
                <div>
                  <div className="font-medium">Created:</div>
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {format(parseISO(task.created_at), 'MMM dd, yyyy')}
                  </div>
                </div>

                {task.status === 'completed' && task.updated_at && (
                  <div>
                    <div className="font-medium">Completed:</div>
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {format(parseISO(task.updated_at), 'MMM dd, yyyy')}
                    </div>
                  </div>
                )}
                
                <div>
                  <div className="font-medium">Duration:</div>
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {durationDays} days
                  </div>
                </div>
                
                {task.status === 'completed' && task.completion_time !== undefined && (
                  <div>
                    <div className="font-medium">Time to complete:</div>
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {task.completion_time > 24 
                        ? `${Math.round(task.completion_time / 24)} days ${Math.round(task.completion_time % 24)} hours`
                        : `${Math.round(task.completion_time)} hours`
                      }
                    </div>
                  </div>
                )}
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>
    </div>
  );
};
