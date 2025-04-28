// src/components/tasks/timeline/TimelineHeader.tsx
import React from 'react'
import { format, isToday } from 'date-fns'
import { Button } from '@/components/ui/button' // or your own

interface TimelineHeaderProps {
  months: { month: string; days: number }[]
  days: Date[]
  dayWidth: number
  onZoomIn: () => void
  onZoomOut: () => void
}

export const TimelineHeader: React.FC<TimelineHeaderProps> = ({
  months,
  days,
  dayWidth,
  onZoomIn,
  onZoomOut,
}) => {
  return (
    <div className="sticky top-0 bg-background z-10">
      <div className="flex items-center justify-between px-4 border-b h-10">
        <div className="font-medium">Timeline</div>
        <div className="space-x-2">
          <Button size="sm" onClick={onZoomOut}>–</Button>
          <span className="text-sm">{dayWidth}px/day</span>
          <Button size="sm" onClick={onZoomIn}>＋</Button>
        </div>
      </div>
      <div className="flex h-8 border-b">
        {months.map((m, i) => (
          <div
            key={i}
            className="flex items-center justify-center border-r font-medium text-xs"
            style={{ width: `${m.days * dayWidth}px` }}
          >
            {m.month}
          </div>
        ))}
      </div>
      <div className="flex h-10 border-b">
        {days.map((d, i) => (
          <div
            key={i}
            className={`flex-none flex items-center justify-center text-[10px] border-r ${
              isToday(d) ? 'bg-blue-100 font-bold' : ''
            }`}
            style={{ width: `${dayWidth}px` }}
          >
            {format(d, 'd')}
          </div>
        ))}
      </div>
    </div>
  )
}
