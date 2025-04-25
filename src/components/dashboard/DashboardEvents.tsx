
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function DashboardEvents({ filters }: { filters: any }) {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  const { data: events, isLoading } = useQuery({
    queryKey: ["dashboard_events", filters],
    queryFn: async () => {
      const today = new Date();
      const sevenDaysLater = new Date();
      sevenDaysLater.setDate(today.getDate() + 7);
      
      let eventsQuery = supabase
        .from("project_events")
        .select(`
          id,
          title,
          description,
          created_at,
          event_date,
          user_id,
          project_id,
          projects:project_id (
            project_number,
            Sponsor
          )
        `)
        .gte("event_date", today.toISOString())
        .lte("event_date", sevenDaysLater.toISOString())
        .order("event_date", { ascending: true })
        .limit(5);
      
      if (filters.projectId) {
        eventsQuery = eventsQuery.eq("project_id", filters.projectId);
      }
      
      const { data, error } = await eventsQuery;
      
      if (error) throw error;
      return data || [];
    },
  });

  const navigateToProject = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  const EventCreator = ({ userId }: { userId: string }) => {
    const { data: userProfile } = useUserProfile(userId);
    return <span>{userProfile?.full_name || "Unknown user"}</span>;
  };

  if (isLoading) {
    return (
      <Card className="min-h-[300px]">
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
          <CardDescription>Events in the next 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-40">
            <p className="text-muted-foreground">Loading events...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const initialEvents = events?.slice(0, 2) || [];
  const remainingEvents = events?.slice(2) || [];
  const hasMoreEvents = remainingEvents.length > 0;

  return (
    <Card className="min-h-[300px]">
      <CardHeader>
        <CardTitle>Upcoming Events</CardTitle>
        <CardDescription>Events in the next 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        {events && events.length > 0 ? (
          <Collapsible>
            <div className="space-y-4">
              {initialEvents.map((event) => (
                <HoverCard key={event.id}>
                  <HoverCardTrigger asChild>
                    <div 
                      className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md cursor-pointer" 
                      onClick={() => navigateToProject(event.project_id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          <Calendar className="h-5 w-5 text-purple-500" />
                        </div>
                        <div>
                          <p className="font-medium">{event.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {event.projects?.project_number} - {event.projects?.Sponsor}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {event.event_date ? format(new Date(event.event_date), "MMM d") : "No date"}
                      </p>
                    </div>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">{event.title}</h4>
                      {event.description && (
                        <p className="text-sm text-muted-foreground">
                          {event.description}
                        </p>
                      )}
                      <div className="text-xs text-muted-foreground">
                        <p>Created by: <EventCreator userId={event.user_id} /></p>
                        <p>Project: {event.projects?.project_number}</p>
                        <p>Date: {event.event_date ? format(new Date(event.event_date), "MMMM d, yyyy") : "No date set"}</p>
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              ))}

              {hasMoreEvents && (
                <>
                  <CollapsibleContent className="space-y-4">
                    {remainingEvents.map((event) => (
                      <HoverCard key={event.id}>
                        <HoverCardTrigger asChild>
                          <div 
                            className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md cursor-pointer" 
                            onClick={() => navigateToProject(event.project_id)}
                          >
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5">
                                <Calendar className="h-5 w-5 text-purple-500" />
                              </div>
                              <div>
                                <p className="font-medium">{event.title}</p>
                                <p className="text-sm text-muted-foreground">
                                  {event.projects?.project_number} - {event.projects?.Sponsor}
                                </p>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {event.event_date ? format(new Date(event.event_date), "MMM d") : "No date"}
                            </p>
                          </div>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-80">
                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold">{event.title}</h4>
                            {event.description && (
                              <p className="text-sm text-muted-foreground">
                                {event.description}
                              </p>
                            )}
                            <div className="text-xs text-muted-foreground">
                              <p>Created by: <EventCreator userId={event.user_id} /></p>
                              <p>Project: {event.projects?.project_number}</p>
                              <p>Date: {event.event_date ? format(new Date(event.event_date), "MMMM d, yyyy") : "No date set"}</p>
                            </div>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    ))}
                  </CollapsibleContent>
                  
                  <CollapsibleTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={() => setIsExpanded(!isExpanded)}
                    >
                      {isExpanded ? (
                        <>
                          Show Less <ChevronUp className="ml-2 h-4 w-4" />
                        </>
                      ) : (
                        <>
                          Show More ({remainingEvents.length} more) <ChevronDown className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </CollapsibleTrigger>
                </>
              )}
            </div>
          </Collapsible>
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <Calendar className="h-8 w-8 mb-2" />
            <p>No upcoming events</p>
            <p className="text-sm mt-1">Nothing scheduled for the next 7 days</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
