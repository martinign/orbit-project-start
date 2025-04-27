
import React, { useState, useEffect } from 'react';
import { format, eachDayOfInterval, addMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { GripVertical } from 'lucide-react';
import { useTextWidth } from '@/hooks/useTextWidth';
import { TimelineTaskList } from './timeline/TimelineTaskList';
import { TimelineHeader } from './timeline/TimelineHeader';
import { TaskTimelineContent } from './timeline/TaskTimelineContent';
import { TaskDetailsDialog } from './timeline/TaskDetailsDialog';

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
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  const taskTitles = tasks.map(task => task.title);
  const maxTitleWidth = useTextWidth(taskTitles);
  
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
      monthsMap[monthKey] = (monthsMap[monthKey] || 0) + 1;
    });
    
    setMonths(Object.entries(monthsMap).map(([month, days]) => ({
      month,
      days
    })));
  }, []);
  
  if (isLoading) {
    return <div className="text-center py-6">Loading tasks...</div>;
  }
  
  if (!tasks || tasks.length === 0) {
    return <div className="text-center py-6">No tasks found.</div>;
  }
  
  return (
    <div className="border rounded-md h-full overflow-hidden">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        <ResizablePanel 
          defaultSize={15} 
          minSize={8} 
          maxSize={Math.min(40, (maxTitleWidth / window.innerWidth) * 100)}
        >
          <TimelineTaskList tasks={tasks} />
        </ResizablePanel>
        
        <ResizableHandle withHandle>
          <GripVertical className="h-4 w-4 text-gray-400" />
        </ResizableHandle>
        
        <ResizablePanel defaultSize={85}>
          <div className="overflow-hidden">
            <ScrollArea className="h-full">
              <div className="relative">
                <TimelineHeader months={months} days={days} />
                <div className="sticky top-[82px] z-10 bg-background">
                  <ScrollBar orientation="horizontal" />
                </div>
                <TaskTimelineContent 
                  tasks={tasks} 
                  days={days} 
                  onTaskClick={setSelectedTask}
                />
              </div>
              <ScrollBar />
            </ScrollArea>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      <TaskDetailsDialog
        task={selectedTask}
        open={!!selectedTask}
        onOpenChange={() => setSelectedTask(null)}
      />
    </div>
  );
};
