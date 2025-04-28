// src/components/tasks/timeline/TimelineView.tsx
import React, { useState, useEffect } from 'react'
import { format, eachDayOfInterval, addMonths, startOfMonth, endOfMonth } from 'date-fns'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { TaskDetailsDialog } from './timeline/TaskDetailsDialog'
import { TimelineHeader } from './timeline/TimelineHeader'
import { TimelineTaskList } from './timeline/TimelineTaskList'
import { TaskTimelineContent } from './timeline/TaskTimelineContent'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable'
import { GripVertical } from 'lucide-react'
import { useTextWidth } from '@/hooks/useTextWidth'
import { toast } from '@/hooks/use-toast'

interface Task {
  id: string
  title: string
  status: string
  created_at: string | null
  updated_at: string | null
}

interface TimelineViewProps {
  tasks: Task[]
  isLoading: boolean
}

export const TimelineView: React.FC<TimelineViewProps> = ({ tasks, isLoading }) => {
  const [days, setDays] = useState<Date[]>([])
  const [months, setMonths] = useState<{ month: string; days: number }[]>([])
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [dayWidth, setDayWidth] = useState(30) // px per day

  // for measuring title widths if you want dynamic list sizing
  const taskTitles = tasks.map(t => t.title)
  const maxTitleWidth = useTextWidth(taskTitles)

  useEffect(() => {
    if (!tasks.length) return
    try {
      const today = new Date()
      const createdDates = tasks
        .map(t => (t.created_at ? new Date(t.created_at) : null))
        .filter((d): d is Date => d !== null)

      const earliest = createdDates.length
        ? new Date(Math.min(...createdDates.map(d => d.getTime())))
        : today

      const start = startOfMonth(addMonths(earliest, -1))
      const end = endOfMonth(addMonths(today, 2))

      const allDays = eachDayOfInterval({ start, end })
      setDays(allDays)

      const map: Record<string, number> = {}
      allDays.forEach(d => {
        const key = format(d, 'MMM yyyy')
        map[key] = (map[key] || 0) + 1
      })
      setMonths(Object.entries(map).map(([month, cnt]) => ({ month, days: cnt })))
    } catch (err) {
      console.error(err)
      toast({
        title: 'Timeline Error',
        description: 'Failed to generate timeline.',
        variant: 'destructive',
      })
    }
  }, [tasks])

  if (isLoading) return <div className="text-center py-6">Loading tasks…</div>
  if (!tasks.length) return <div className="text-center py-6">No tasks found.</div>

  const zoomIn = () => setDayWidth(w => Math.min(60, w + 5))
  const zoomOut = () => setDayWidth(w => Math.max(10, w - 5))

  return (
    <div className="border rounded-md h-full overflow-hidden">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* PINNED TASK LIST */}
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
          <TimelineTaskList tasks={tasks} width={maxTitleWidth + 48 /* padding */} />
        </ResizablePanel>

        <ResizableHandle>
          <GripVertical className="h-4 w-4 text-gray-400" />
        </ResizableHandle>

        {/* TIMELINE GRID */}
        <ResizablePanel defaultSize={80}>
          <div className="flex flex-col h-full">
            <TimelineHeader
              months={months}
              days={days}
              dayWidth={dayWidth}
              onZoomIn={zoomIn}
              onZoomOut={zoomOut}
            />
            <ScrollArea className="h-full">
              <div className="relative" style={{ width: `${days.length * dayWidth}px` }}>
                <TaskTimelineContent
                  tasks={tasks}
                  days={days}
                  dayWidth={dayWidth}
                  onTaskClick={setSelectedTask}
                />
              </div>
              <ScrollBar orientation="horizontal" />
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
  )
}
