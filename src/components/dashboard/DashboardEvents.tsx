
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { CircleDashed, CalendarClock } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface DashboardEventsProps {
  filters: {
    projectId?: string;
    startDate?: Date;
    endDate?: Date;
    projectType?: string;
    showNewEvents?: boolean;
    onToggleNewEvents?: () => void;
  };
  newEventsCount?: number;
}

export function DashboardEvents({ filters, newEventsCount = 0 }: DashboardEventsProps) {
  const queryClient = useQueryClient();
  // Track if the new events filter is active
  const isNewEventsFilterActive = filters.showNewEvents || false;

  // Add real-time subscription for events
  useEffect(() => {
    const channel = supabase.channel('dashboard_events_changes')
      .on('postgres_changes',
        {
          event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'project_events'
        },
        (payload) => {
          console.log('Dashboard events change detected:', payload);
          // Invalidate the queries to trigger a refresh
          queryClient.invalidateQueries({ queryKey: ['dashboard_events'] });
          queryClient.invalidateQueries({ queryKey: ['new_events_count'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const { data: events, isLoading } = useQuery({
    queryKey: ["dashboard_events", filters],
    queryFn: async () => {
      const now = new Date();
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      
      let query = supabase
        .from("project_events")
        .select(`
          id, 
          title, 
          event_date, 
          description,
          project_id,
          projects:project_id(project_number, Sponsor, project_type)
        `)
        .gte("event_date", now.toISOString())
        .lte("event_date", nextMonth.toISOString())
        .order("event_date", { ascending: true })
        .limit(5);
      
      if (filters.projectId) {
        query = query.eq("project_id", filters.projectId);
      }
      
      if (filters.showNewEvents) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        query = query.gte("created_at", yesterday.toISOString());
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Filter by project type if specified
      let filteredData = data || [];
      if (filters.projectType && filters.projectType !== "all") {
        filteredData = filteredData.filter(event => 
          event.projects?.project_type === filters.projectType
        );
      }
      
      return filteredData;
    },
    refetchOnWindowFocus: false,
  });

  const handleNewEventsClick = () => {
    if (filters.onToggleNewEvents) {
      filters.onToggleNewEvents();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        {newEventsCount > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger onClick={handleNewEventsClick} asChild>
                <Badge 
                  className={`cursor-pointer ${
                    isNewEventsFilterActive 
                      ? "bg-purple-700 hover:bg-purple-800" 
                      : "bg-purple-500 hover:bg-purple-600"
                  }`}
                >
                  {newEventsCount} new
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Click to {isNewEventsFilterActive ? 'hide' : 'show'} new events in the last 24 hours</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <p className="text-muted-foreground">Loading events...</p>
        </div>
      ) : events && events.length > 0 ? (
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <CalendarClock className="h-5 w-5 text-orange-500" />
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
                  {event.event_date ? format(new Date(event.event_date), "MMM d, h:mm a") : "No date"}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
          <CircleDashed className="h-8 w-8 mb-2" />
          <p>No upcoming events found</p>
          <p className="text-sm mt-1">Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
}
