
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface Event {
  id: string;
  title: string;
  description: string | null;
  user_id: string;
  event_date: string | null;
}

interface CalendarCardProps {
  selectedDate: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  hasEditAccess: boolean;
  events: Event[];
}

export function CalendarCard({ 
  selectedDate, 
  onSelect, 
  hasEditAccess,
  events 
}: CalendarCardProps) {
  const eventDates = events
    .filter(event => event.event_date)
    .reduce((acc: { [key: string]: boolean }, event) => {
      if (event.event_date) {
        const date = new Date(event.event_date).toISOString().split('T')[0];
        acc[date] = true;
      }
      return acc;
    }, {});

  const hasEvent = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return eventDates[dateStr];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calendar</CardTitle>
        <CardDescription>
          {hasEditAccess 
            ? "Click a date to create an event" 
            : "Select a date to view events"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={onSelect}
          className={cn(
            "pointer-events-auto bg-gray-100",
            hasEditAccess && "hover:cursor-pointer"
          )}
          modifiers={{ hasEvent: Object.keys(eventDates).map(d => new Date(d)) }}
          modifiersStyles={{
            hasEvent: {
              backgroundColor: "#E6F6FB",
              color: "#1EAEDB",
              fontWeight: "bold"
            }
          }}
        />
      </CardContent>
    </Card>
  );
}
