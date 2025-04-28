
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CircleDashed, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useNewEventsCount } from "@/hooks/useNewEventsCount";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DashboardEventsProps {
  filters: any;
}

export function DashboardEvents({ filters }: DashboardEventsProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showNewEventsBadge, setShowNewEventsBadge] = useState(false);
  const [showOnlyNewEvents, setShowOnlyNewEvents] = useState(false);
  
  const { data: newEventsCount } = useNewEventsCount();

  // Set the badge visibility based on new events count
  useEffect(() => {
    setShowNewEventsBadge(!!newEventsCount && newEventsCount > 0);
  }, [newEventsCount]);

  const { data: events, isLoading } = useQuery({
    queryKey: ["dashboard_events", filters, showOnlyNewEvents],
    queryFn: async () => {
      let eventsQuery = supabase
        .from("project_events")
        .select("id, title, description, event_date, project_id, projects:project_id(project_number, Sponsor)")
        .order("event_date", { ascending: true })
        .limit(5);
      
      if (filters.projectId) {
        eventsQuery = eventsQuery.eq("project_id", filters.projectId);
      }
      
      // If showing only new events, filter for those created in the last 24 hours
      if (showOnlyNewEvents) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        eventsQuery = eventsQuery.gte("created_at", yesterday.toISOString());
      } else {
        // Show upcoming events (events with a date in the future)
        const today = new Date();
        eventsQuery = eventsQuery.gte("event_date", today.toISOString());
      }
      
      const { data, error } = await eventsQuery;
      
      if (error) throw error;
      return data || [];
    },
  });

  const navigateToEvent = (eventId: string, projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  const toggleNewEventsFilter = () => {
    setShowOnlyNewEvents(prev => !prev);
    // Invalidate the query to trigger a refetch
    queryClient.invalidateQueries({ queryKey: ["dashboard_events"] });
  };

  useEffect(() => {
    const channel = supabase.channel('events_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'project_events'
      }, () => {
        queryClient.invalidateQueries({ queryKey: ["new_events_count"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard_events"] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return (
    <Card className="min-h-[300px]">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Upcoming Events</CardTitle>
          <CardDescription>Events scheduled for your projects</CardDescription>
        </div>
        {showNewEventsBadge && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger onClick={toggleNewEventsFilter} asChild>
                <Badge 
                  className={`cursor-pointer ${
                    showOnlyNewEvents 
                      ? "bg-indigo-700 hover:bg-indigo-800" 
                      : "bg-indigo-500 hover:bg-indigo-600"
                  }`}
                >
                  {newEventsCount} new
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Click to {showOnlyNewEvents ? 'show all' : 'show only new'} events</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <p className="text-muted-foreground">Loading events...</p>
          </div>
        ) : events && events.length > 0 ? (
          <div className="space-y-4">
            {events.map((event) => (
              <div 
                key={event.id} 
                className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md cursor-pointer"
                onClick={() => navigateToEvent(event.id, event.project_id)}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <Calendar className="h-5 w-5 text-indigo-500" />
                  </div>
                  <div>
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {event.projects?.project_number} - {event.projects?.Sponsor}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(event.event_date), "MMM d, h:mm a")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <CircleDashed className="h-8 w-8 mb-2" />
            <p>No {showOnlyNewEvents ? 'new' : 'upcoming'} events found</p>
            <p className="text-sm mt-1">
              {showOnlyNewEvents ? 'Try viewing all events' : 'Schedule events in your projects'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
