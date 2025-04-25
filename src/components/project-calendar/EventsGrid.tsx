
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EventCard } from "./EventCard";

interface Event {
  id: string;
  title: string;
  description: string | null;
  user_id: string;
  event_date: string | null;
}

interface EventsGridProps {
  events: Event[];
  selectedDate: Date | undefined;
  hasEditAccess: boolean;
  onDelete: (id: string) => void;
  onEdit: (event: Event) => void;
  isLoading: boolean;
}

export function EventsGrid({
  events,
  selectedDate,
  hasEditAccess,
  onDelete,
  onEdit,
  isLoading,
}: EventsGridProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Events</CardTitle>
        <CardDescription>
          {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'All events'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            <p>Loading events...</p>
          ) : events.length === 0 ? (
            <p className="text-muted-foreground">No events found</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onDelete={() => onDelete(event.id)}
                  onEdit={() => onEdit(event)}
                  hasEditAccess={hasEditAccess}
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
