
import React, { useState, useEffect } from 'react';
import { format, isToday, eachDayOfInterval, addMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getStatusBadge } from '@/utils/statusBadge';

interface Task {
  id: string;
  title: string;
  status: string;
  created_at: string | null;
  updated_at: string | null;
}

interface TimelineViewProps {
  tasks: Task[];
  isLoading: boolean;
}

export const TimelineView: React.FC<TimelineViewProps> = ({ tasks, isLoading }) => {
  const [days, setDays] = useState<Date[]>([]);
  const [months, setMonths] = useState<{month: string, days: number}[]>([]);
  
  // Calculate days to show in timeline (today + 2 months)
  useEffect(() => {
    const today = new Date();
    const twoMonthsLater = addMonths(today, 2);
    
    // Get all days in the interval
    const allDays = eachDayOfInterval({
      start: startOfMonth(today),
      end: endOfMonth(twoMonthsLater)
    });
    
    setDays(allDays);
    
    // Group days by month
    const monthsMap: {[key: string]: number} = {};
    allDays.forEach(day => {
      const monthKey = format(day, 'MMM yyyy');
      if (!monthsMap[monthKey]) {
        monthsMap[monthKey] = 0;
      }
      monthsMap[monthKey]++;
    });
    
    const monthsArray = Object.entries(monthsMap).map(([month, days]) => ({
      month,
      days
    }));
    
    setMonths(monthsArray);
  }, []);
  
  if (isLoading) {
    return <div className="text-center py-6">Loading tasks...</div>;
  }
  
  if (!tasks || tasks.length === 0) {
    return <div className="text-center py-6">No tasks found.</div>;
  }
  
  const today = new Date();
  
  return (
    <div className="border rounded-md">
      <ScrollArea className="h-[600px]">
        <div className="min-w-[1500px]">
          {/* Header with months and days */}
          <div className="flex border-b sticky top-0 bg-background z-10">
            {/* Task column header */}
            <div className="min-w-[250px] p-2 font-medium border-r">
              Task
            </div>
            
            {/* Timeline headers */}
            <div className="flex-1">
              {/* Month headers */}
              <div className="flex border-b">
                {months.map((monthInfo, i) => (
                  <div 
                    key={i} 
                    className="text-center font-medium border-r"
                    style={{ width: `${monthInfo.days * 30}px` }}
                  >
                    {monthInfo.month}
                  </div>
                ))}
              </div>
              
              {/* Day headers */}
              <div className="flex h-8">
                {days.map((day, i) => (
                  <div 
                    key={i} 
                    className={`w-[30px] flex justify-center items-center text-xs border-r
                      ${isToday(day) ? 'bg-blue-100 font-bold' : ''}`}
                  >
                    {format(day, 'd')}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Tasks rows */}
          <div>
            {tasks.map((task) => {
              // Safely create date objects with null checks
              const createdDate = task.created_at ? new Date(task.created_at) : new Date();
              const updatedDate = task.updated_at ? new Date(task.updated_at) : new Date();
              const isCompleted = task.status === 'completed';
              
              // Calculate days from start of timeline
              const startOfTimeline = days[0];
              
              // Add null checks to avoid errors with getTime()
              const daysFromStart = startOfTimeline ? Math.max(
                0, 
                Math.floor((createdDate.getTime() - startOfTimeline.getTime()) / (1000 * 60 * 60 * 24))
              ) : 0;
              
              // Calculate task duration with null checks
              const endDate = isCompleted ? updatedDate : today;
              const durationDays = Math.max(
                1, 
                Math.ceil((endDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
              );
              
              // Check if task is visible in timeline with null check
              if (startOfTimeline && createdDate < addMonths(startOfTimeline, -1)) {
                return null; // Skip tasks that started too far in the past
              }
              
              return (
                <div key={task.id} className="flex border-b hover:bg-gray-50">
                  {/* Task title */}
                  <div className="min-w-[250px] p-2 border-r flex items-center">
                    <div className="truncate font-medium">{task.title}</div>
                    <div className="ml-2">{getStatusBadge(task.status)}</div>
                  </div>
                  
                  {/* Task timeline */}
                  <div className="flex-1 relative">
                    {/* Today indicator */}
                    {days.findIndex(day => isToday(day)) >= 0 && (
                      <div 
                        className="absolute top-0 bottom-0 w-[2px] bg-blue-500 z-10"
                        style={{ 
                          left: `${days.findIndex(day => isToday(day)) * 30 + 15}px`
                        }}
                      ></div>
                    )}
                    
                    {/* Task duration bar */}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div 
                            className={`absolute top-2 h-6 rounded-md ${isCompleted ? 'bg-green-200' : 'bg-blue-200'}`}
                            style={{ 
                              left: `${daysFromStart * 30}px`,
                              width: `${durationDays * 30}px`
                            }}
                          >
                            {durationDays > 3 && (
                              <div className="px-2 text-xs font-medium truncate flex items-center h-full">
                                {durationDays} days {isCompleted ? '(completed)' : ''}
                              </div>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="space-y-1">
                            <p className="font-medium">{task.title}</p>
                            <p className="text-xs">
                              Created: {format(createdDate, 'MMM d, yyyy')}
                            </p>
                            <p className="text-xs">
                              {isCompleted 
                                ? `Completed: ${format(updatedDate, 'MMM d, yyyy')}` 
                                : 'In progress'}
                            </p>
                            <p className="text-xs">Duration: {durationDays} days</p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
