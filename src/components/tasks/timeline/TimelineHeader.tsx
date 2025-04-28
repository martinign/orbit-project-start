
import React from 'react';
import { format, isToday } from 'date-fns';

interface TimelineHeaderProps {
  months: { month: string; days: number }[];
  days: Date[];
}

export const TimelineHeader: React.FC<TimelineHeaderProps> = ({ months, days }) => {
  return (
    <div className="sticky top-0 bg-background z-10">
      {/* Months row */}
      <div className="flex h-10 border-b">
        {months.map((monthInfo, i) => (
          <div 
            key={i}
            className="text-center font-medium border-r flex items-center justify-center"
            style={{ width: `${monthInfo.days * 30}px` }}
          >
            {monthInfo.month}
          </div>
        ))}
      </div>
      {/* Days row */}
      <div className="flex h-[42px] border-b">
        {days.map((day, i) => (
          <div 
            key={i}
            className={`w-[30px] flex-none flex justify-center items-center text-xs border-r
              ${isToday(day) ? 'bg-blue-100 font-bold' : ''}`}
          >
            {format(day, 'd')}
          </div>
        ))}
      </div>
    </div>
  );
};
