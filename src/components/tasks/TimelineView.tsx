import React, { useState, useEffect } from 'react';
import { format, isToday, eachDayOfInterval, addMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  
  useEffect(() => {
    const today = new Date();
    const twoMonthsLater = addMonths(today, 2);
    
    const allDays = eachDayOfInterval({
      start: startOfMonth(today),
      end: endOfMonth(twoMonthsLater)
    });
    
    setDays(allDays);
    
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
    <div className="border rounded-md h-full">
      <div className="flex h-full">
        <div className="w-[200px] flex-none bg-background border-r">
          <div className="sticky top-0 p-2 font-medium border-b bg-background z-20">
            Task
          </div>
          <div>
            {tasks.map((task) => (
              <div key={task.id} className="p-2 border-b truncate" title={task.title}>
                {task.title}
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <ScrollArea>
            <div className="relative">
              <div className="sticky top-0 bg-background z-10">
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
                <div className="flex h-8 border-b">
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
              <div>
                {tasks.map((task) => {
                  const createdDate = task.created_at ? new Date(task.created_at) : new Date();
                  const updatedDate = task.updated_at ? new Date(task.updated_at) : new Date();
                  const isCompleted = task.status === 'completed';
                  
                  const startOfTimeline = days[0];
                  const daysFromStart = startOfTimeline ? Math.max(
                    0, 
                    Math.floor((createdDate.getTime() - startOfTimeline.getTime()) / (1000 * 60 * 60 * 24))
                  ) : 0;
                  
                  const endDate = isCompleted ? updatedDate : today;
                  const durationDays = Math.max(
                    1, 
                    Math.ceil((endDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
                  );
                  
                  if (startOfTimeline && createdDate < addMonths(startOfTimeline, -1)) {
                    return null;
                  }
                  
                  return (
                    <div key={task.id} className="relative h-[33px] border-b">
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
                  );
                })}
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};
