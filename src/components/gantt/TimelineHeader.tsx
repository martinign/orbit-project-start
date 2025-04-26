
import React from 'react';
import { format } from 'date-fns';
import { ChevronDown } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface TimelineHeaderProps {
  months: Record<string, Date[]>;
  visibleDates: Date[];
  collapsedMonths: Set<string>;
  columnWidth: number;
  onToggleMonth: (monthKey: string) => void;
}

export const TimelineHeader: React.FC<TimelineHeaderProps> = ({
  months,
  visibleDates,
  collapsedMonths,
  columnWidth,
  onToggleMonth
}) => {
  return (
    <div className="sticky top-0 bg-muted/50 z-20">
      {/* Month row with collapsible buttons */}
      <div className="flex border-b">
        {Object.entries(months).map(([monthKey, dates]) => {
          const isCollapsed = collapsedMonths.has(monthKey);
          const monthWidth = dates.length * columnWidth;
          
          return (
            <div 
              key={monthKey}
              className="flex-shrink-0 border-r hover:bg-accent/50 transition-colors relative" 
              style={{ width: monthWidth }}
            >
              <Button 
                variant="ghost" 
                className="w-full h-10 flex justify-start gap-2 rounded-none"
                onClick={() => onToggleMonth(monthKey)}
              >
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isCollapsed ? '' : 'rotate-180'}`} />
                {monthKey}
              </Button>
              <div className={`absolute inset-0 bg-background/50 transition-opacity duration-200 ${isCollapsed ? 'opacity-50' : 'opacity-0 pointer-events-none'}`} />
            </div>
          );
        })}
      </div>
      
      {/* Day numbers row */}
      <div className="flex h-10 border-b">
        {visibleDates.map(date => (
          <div
            key={date.toISOString()}
            style={{ width: columnWidth }}
            className="flex-shrink-0 border-r text-xs font-normal flex items-center justify-center"
          >
            {format(date, 'd')}
          </div>
        ))}
      </div>
    </div>
  );
};
