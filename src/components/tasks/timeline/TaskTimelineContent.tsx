// src/components/tasks/timeline/TaskTimelineContent.tsx
import React from 'react'
import { isToday } from 'date-fns'
import { TimelineTaskBar } from './TimelineTaskBar'

interface Task {
  id: string
  title: string
  status: string
  created_at: string | null
  updated_at: string | null
}

interface TaskTimelineContentProps {
  tasks: Task[]
  days: Date[]
  dayWidth: number
  onTaskClick: (task: Task) => void
}

export const TaskTimelineContent: React.FC<TaskTimelineContentProps> = ({
  tasks,
  days,
  dayWidth,
  onTaskClick,
}) => {
  // Don’t render until days[] is populated
  if (!days || days.length === 0) {
    return null
  }

  const today = new Date()
  const start = days[0]
  const todayIndex = days.findIndex(d => isToday(d))

  return (
    <div className="relative divide-y">
      {tasks.map(task => {
        const created = task.created_at ? new Date(task.created_at) : today
        const isCompleted = task.status === 'completed'
        const updated = task.updated_at ? new Date(task.updated_at) : today

        // Safe to call getTime() on start now
        const daysFromStart = Math.max(
          0,
          Math.floor((created.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
        )

        const rawDuration = isCompleted
          ? Math.ceil((updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
          : Math.ceil((today.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))

        const duration = Math.max(1, rawDuration)

        return (
          <div key={task.id} className="h-[33px] relative">
            <TimelineTaskBar
              task={task as any}
              style={{
                left: `${daysFromStart * dayWidth}px`,
                width: `${duration * dayWidth}px`,
              }}
              onClick={() => onTaskClick(task)}
              durationDays={duration}
              isCompleted={isCompleted}
            />
          </div>
        )
      })}

      {/* Today Indicator */}
      <div
        className="absolute top-0 bottom-0 w-[2px] bg-blue-500 z-20"
        style={{ left: `${todayIndex * dayWidth}px` }}
      />
    </div>
  )
}
