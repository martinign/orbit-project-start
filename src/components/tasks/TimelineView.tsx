import React, { useState, useEffect } from 'react';
import { format, isToday, eachDayOfInterval, addMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { TimelineTaskBar } from './timeline/TimelineTaskBar';
import { TimelineTaskList } from './timeline/TimelineTaskList';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { GripVertical } from 'lucide-react';
import { useTextWidth } from '@/hooks/useTextWidth';

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
    if (tasks.length === 0) return;

    const today = new Date();
    const createdDates = tasks
      .map(task => task.created_at ? new Date(task.created_at) : null)
      .filter((date): date is Date => date !== null);

    const earliestCreated = createdDates.length > 0
      ? new Date(Math.min(...createdDates.map(d => d.getTime())))
      : today;

    const start = startOfMonth(addMonths(earliestCreated, -1));
    const end = endOfMonth(addMonths(today, 2));

    const allDays = eachDayOfInterval({ start, end });
    setDays(allDays);

    const monthsMap: { [key: string]: number } = {};
    allDays.forEach(day => {
      const monthKey = format(day, 'MMM yyyy');
      monthsMap[monthKey] = (monthsMap[monthKey] || 0) + 1;
    });

    setMonths(Object.entries(monthsMap).map(([month, days]) => ({ month, days })));
  }, [tasks]);

  if (isLoading) return <div className="text-center py-6">Loading tasks...</div>;
  if (!tasks || tasks.length === 0) return <div className="text-center py-6">No tasks found.</div>;

  const today = new Date();

  return (
    <div className="border rounded-md h-full overflow-hidden">
      <ResizablePanelGroup direction="horizontal" className="h-full">

        {/* Task List Panel */}
        <ResizablePanel 
          defaultSize={10}
          minSize={6}
          maxSize={Math.min(10, (maxTitleWidth / window.innerWidth) * 100)}
        >
          <TimelineTaskList tasks={tasks} />
        </ResizablePanel>

        <ResizableHandle withHandle>
          <GripVertical className="h-4 w-4 text-gray-400" />
        </ResizableHandle>

        {/* Timeline Panel */}
        <ResizablePanel defaultSize={85}>
          <ScrollArea className="h-full">
            <div className="relative" style={{ width: `${days.length * 20}px` }}>

              {/* Timeline Header (Months and Days) */}
              <div className="sticky top-0 bg-background z-10">

                {/* Months Row */}
                <div className="flex h-8 border-b">
                  {months.map((monthInfo, i) => (
                    <div 
                      key={i}
                      className="text-center font-medium border-r flex items-center justify-center text-xs"
                      style={{ width: `${monthInfo.days * 20}px` }}
                    >
                      {monthInfo.month}
                    </div>
                  ))}
                </div>

                {/* Days Row */}
                <div className="flex h-8 border-b">
                  {days.map((day, i) => (
                    <div 
                      key={i}
                      className={`w-[20px] flex-none flex justify-center items-center text-[10px] border-r ${isToday(day) ? 'bg-blue-100 font-bold' : ''}`}
                    >
                      {format(day, 'd')}
                    </div>
                  ))}
                </div>

              </div>

              {/* Task Timeline Bars */}
              <div className="relative divide-y">
                {tasks.map((task) => {
                  const createdDate = task.created_at ? new Date(task.created_at) : today;
                  const updatedDate = task.updated_at ? new Date(task.updated_at) : today;
                  const isCompleted = task.status === 'completed';

                  const startOfTimeline = days[0];
                  const daysFromStart = startOfTimeline ? Math.max(0, Math.floor((createdDate.getTime() - startOfTimeline.getTime()) / (1000 * 60 * 60 * 24))) : 0;

                  const endDate = isCompleted ? updatedDate : today;
                  const durationDays = Math.max(1, Math.ceil((endDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)));

                  return (
                    <div key={task.id} className="h-8 relative">
                      <TimelineTaskBar
                        task={task}
                        style={{ 
                          left: `${daysFromStart * 20}px`,
                          width: `${durationDays * 20}px`
                        }}
                        onClick={() => setSelectedTask(task)}
                        durationDays={durationDays}
                      />
                    </div>
                  );
                })}

                {/* Today's Line */}
                <div 
                  className="absolute top-0 bottom-0 w-[2px] bg-blue-500 z-20"
                  style={{ left: `${days.findIndex(day => isToday(day)) * 20}px` }}
                />
              </div>

            </div>

            {/* Bottom Horizontal ScrollBar */}
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Task Details Dialog */}
      <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
        <DialogContent className="sm:max-w-[425px]">
          {selectedTask && (
            <div className="space-y-4 p-4">
              <h3 className="text-lg font-semibold">{selectedTask.title}</h3>
              <div className="space-y-2 text-sm">
                <p>Status: {selectedTask.status}</p>
                <p>Created: {selectedTask.created_at ? format(new Date(selectedTask.created_at), 'PPP') : 'N/A'}</p>
                {selectedTask.status === 'completed' && selectedTask.updated_at && (
                  <p>Completed: {format(new Date(selectedTask.updated_at), 'PPP')}</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
