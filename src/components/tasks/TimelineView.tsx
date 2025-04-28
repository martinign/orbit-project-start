// src/components/tasks/timeline/TimelineView.tsx

import React, { useState, useEffect } from 'react';
import {
  format,
  isToday,
  eachDayOfInterval,
  addMonths,
  startOfMonth,
  endOfMonth,
} from 'date-fns';
import { TaskDetailsDialog } from './timeline/TaskDetailsDialog';
import { TimelineTaskList } from './timeline/TimelineTaskList';
import { TimelineTaskBar } from './timeline/TimelineTaskBar';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';
import { GripVertical } from 'lucide-react';
import { useTextWidth } from '@/hooks/useTextWidth';
import { toast } from '@/hooks/use-toast';

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

export const TimelineView: React.FC<TimelineViewProps> = ({
  tasks,
  isLoading,
}) => {
  const [days, setDays] = useState<Date[]>([]);
  const [months, setMonths] = useState<{ month: string; days: number }[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Measure task-list width
  const titles = tasks.map(t => t.title);
  const maxTitleW = useTextWidth(titles);

  // Build your date range once
  useEffect(() => {
    if (!tasks.length) return;
    try {
      const today = new Date();
      const createdDates = tasks
        .map(t => (t.created_at ? new Date(t.created_at) : null))
        .filter((d): d is Date => !!d);

      const earliest = createdDates.length
        ? new Date(Math.min(...createdDates.map(d => d.getTime())))
        : today;

      const rangeStart = startOfMonth(addMonths(earliest, -1));
      const rangeEnd   = endOfMonth(addMonths(today, 2));
      const allDays    = eachDayOfInterval({ start: rangeStart, end: rangeEnd });
      setDays(allDays);

      const cnts: Record<string,number> = {};
      allDays.forEach(d => {
        const key = format(d, 'MMM yyyy');
        cnts[key] = (cnts[key]||0) + 1;
      });
      setMonths(Object.entries(cnts).map(([month, cnt]) => ({ month, days: cnt })));
    } catch (err) {
      console.error(err);
      toast({ title:'Timeline Error', description:'Could not build date range', variant:'destructive' });
    }
  }, [tasks]);

  if (isLoading) return <div className="text-center py-6">Loading tasks…</div>;
  if (!tasks.length) return <div className="text-center py-6">No tasks found.</div>;
  if (!days.length)     return <div className="text-center py-6">Building timeline…</div>;

  // percent width per day
  const dayPct = 100 / days.length;
  const today = new Date();

  return (
    <div className="border rounded-md h-full overflow-hidden">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Left: Task list */}
        <ResizablePanel defaultSize={15} minSize={10} maxSize={30} className="min-w-0">
          <TimelineTaskList tasks={tasks} width={maxTitleW + 32} />
        </ResizablePanel>

        <ResizableHandle withHandle>
          <GripVertical className="h-4 w-4 text-gray-400" />
        </ResizableHandle>

        {/* Right: Timeline */}
        <ResizablePanel defaultSize={85} className="min-w-0 overflow-hidden">
          <div className="flex flex-col h-full">
            {/* Scrollable if you want to enforce min widths—but by default each day is >0% */}
            <div className="flex-1 overflow-x-auto">
              {/* Chart container always 100% wide */}
              <div className="relative w-full">
                {/* Months header */}
                <div className="sticky top-0 bg-background z-10">
                  <div className="flex h-8 border-b">
                    {months.map((m,i) => (
                      <div
                        key={i}
                        className="flex items-center justify-center border-r text-xs font-medium"
                        style={{ width: `${m.days * dayPct}%` }}
                      >
                        {m.month}
                      </div>
                    ))}
                  </div>
                  {/* Days header */}
                  <div className="flex h-8 border-b">
                    {days.map((d,i) => (
                      <div
                        key={i}
                        className={`flex-none flex items-center justify-center border-r ${
                          isToday(d) ? 'bg-blue-100 font-bold':''}`}
                        style={{ width: `${dayPct}%` }}
                      >
                        <span className="text-sm">{format(d,'d')}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Task bars */}
                <div className="relative divide-y">
                  {tasks.map(task => {
                    const startDt = task.created_at ? new Date(task.created_at) : today;
                    const endDt   = task.updated_at ? new Date(task.updated_at) : today;
                    const completed = task.status==='completed';

                    const offsetDays = Math.max(0,
                      Math.floor((startDt.getTime() - days[0].getTime())/(1000*60*60*24))
                    );
                    const rawDur = Math.ceil(((completed?endDt:today).getTime()-startDt.getTime())/(1000*60*60*24));
                    const dur = Math.max(1, rawDur);

                    return (
                      <div key={task.id} className="h-[33px] relative">
                        <TimelineTaskBar
                          task={task}
                          style={{
                            left:  `${offsetDays * dayPct}%`,
                            width: `${dur        * dayPct}%`,
                          }}
                          onClick={()=>setSelectedTask(task)}
                          durationDays={dur}
                          isCompleted={completed}
                        />
                      </div>
                    );
                  })}

                  {/* Today line */}
                  <div
                    className="absolute top-0 bottom-0 w-[2px] bg-blue-500 z-20"
                    style={{ left: `${days.findIndex(d=>isToday(d))*dayPct}%`}}
                  />
                </div>
              </div>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Details dialog */}
      <TaskDetailsDialog
        task={selectedTask}
        open={!!selectedTask}
        onOpenChange={()=>setSelectedTask(null)}
      />
    </div>
  );
};
