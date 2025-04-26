
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
  onToggleMonth,
}) => {
  return (
    <div className="sticky top-0 bg-muted/50 z-20">
      {/* Month row with collapsible buttons */}
      <div className="flex border-b">
        {Object.entries(months).map(([monthKey, dates]) => {
          const isCollapsed = collapsedMonths.has(monthKey);
          const monthWidth = isCollapsed ? columnWidth : dates.length * columnWidth;
          
          return (
            <Collapsible key={monthKey} open={!isCollapsed}>
              <div
                className="flex-shrink-0 border-r hover:bg-accent/50 transition-colors"
                style={{ width: monthWidth }}
              >
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="w-full h-10 flex justify-start gap-2 rounded-none"
                    onClick={() => onToggleMonth(monthKey)}
                  >
                    <ChevronDown 
                      className={`h-4 w-4 transition-transform duration-200 ${
                        isCollapsed ? '' : 'rotate-180'
                      }`}
                    />
                    {monthKey}
                  </Button>
                </CollapsibleTrigger>
              </div>
            </Collapsible>
          );
        })}
      </div>
      
      {/* Day numbers row */}
      <div className="flex h-10 border-b">
        {visibleDates.map((date) => (
          <div
            key={date.toISOString()}
            className="flex-shrink-0 border-r px-2 py-1 text-sm font-medium flex items-center justify-center"
            style={{ width: columnWidth }}
          >
            {format(date, 'd')}
          </div>
        ))}
      </div>
    </div>
  );
};
