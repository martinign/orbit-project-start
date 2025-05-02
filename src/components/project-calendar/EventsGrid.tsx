
import { useState } from "react";
import { format } from "date-fns";
import { ChevronDown, ChevronUp, Expand } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
  currentUserId: string | undefined; // Add the current user ID prop
}

export function EventsGrid({
  events,
  selectedDate,
  hasEditAccess,
  onDelete,
  onEdit,
  isLoading,
  currentUserId
}: EventsGridProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const initialEvents = events.slice(0, 6);
  const remainingEvents = events.slice(6);
  const hasMoreEvents = remainingEvents.length > 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
        <div>
          <CardTitle>Events</CardTitle>
          <CardDescription>
            {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'All events'}
          </CardDescription>
        </div>
        {hasMoreEvents && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 transition-transform"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <Expand className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            <p>Loading events...</p>
          ) : events.length === 0 ? (
            <p className="text-muted-foreground">No events found</p>
          ) : (
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {initialEvents.map(event => (
                  <EventCard 
                    key={event.id} 
                    event={event} 
                    onDelete={() => onDelete(event.id)} 
                    onEdit={() => onEdit(event)} 
                    hasEditAccess={hasEditAccess}
                    currentUserId={currentUserId} 
                  />
                ))}
              </div>

              {hasMoreEvents && (
                <>
                  <CollapsibleContent className="mt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {remainingEvents.map(event => (
                        <EventCard 
                          key={event.id} 
                          event={event} 
                          onDelete={() => onDelete(event.id)} 
                          onEdit={() => onEdit(event)} 
                          hasEditAccess={hasEditAccess}
                          currentUserId={currentUserId} 
                        />
                      ))}
                    </div>
                  </CollapsibleContent>

                  <CollapsibleTrigger asChild>
                    
                  </CollapsibleTrigger>
                </>
              )}
            </Collapsible>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
