import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  const eventDates = events.filter(event => event.event_date).reduce((acc: {
    [key: string]: boolean;
  }, event) => {
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
  return <Card>
      <CardHeader>
        <CardTitle>Calendar</CardTitle>
        <CardDescription>
          {hasEditAccess ? "Click a date to create an event" : "Select a date to view events"}
        </CardDescription>
      </CardHeader>
      <CardContent className="bg-zinc-50">
        <Calendar mode="single" selected={selectedDate} onSelect={onSelect} modifiers={{
        hasEvent: Object.keys(eventDates).map(d => new Date(d))
      }} modifiersStyles={{
        hasEvent: {
          backgroundColor: "#0FA0CE",
          // Bright blue from the color palette
          color: "white",
          fontWeight: "bold"
        }
      }} className="bg-slate-50" />
      </CardContent>
    </Card>;
}