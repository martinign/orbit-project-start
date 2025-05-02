
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { RecentActivities } from "@/components/dashboard/RecentActivities";
import { DashboardEvents } from "@/components/dashboard/DashboardEvents";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";

interface ActivityEventsSectionProps {
  activitiesFilters: {
    projectId?: string;
    status?: string;
    projectType?: string;
    showNewTasks?: boolean;
    onToggleNewTasks?: () => void;
  };
  eventsFilters: {
    projectId?: string;
    startDate?: Date;
    endDate?: Date;
    projectType?: string;
    showNewEvents?: boolean;
    onToggleNewEvents?: () => void;
  };
  isRecentActivitiesOpen: boolean;
  isUpcomingEventsOpen: boolean;
  newEventsCount: number;
  newTasksCount: number;
  setIsRecentActivitiesOpen: (isOpen: boolean) => void;
  setIsUpcomingEventsOpen: (isOpen: boolean) => void;
}

export const ActivityEventsSection: React.FC<ActivityEventsSectionProps> = ({
  activitiesFilters,
  eventsFilters,
  isRecentActivitiesOpen,
  isUpcomingEventsOpen,
  newEventsCount,
  newTasksCount,
  setIsRecentActivitiesOpen,
  setIsUpcomingEventsOpen
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Recent Activities Section */}
      <Collapsible 
        open={isRecentActivitiesOpen}
        onOpenChange={setIsRecentActivitiesOpen}
      >
        <Card>
          <CardHeader className="border-b flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest actions across all projects</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {newTasksCount > 0 && (
                <Badge variant="default" className="bg-purple-500 hover:bg-purple-600">
                  {newTasksCount} new
                </Badge>
              )}
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  {isRecentActivitiesOpen ? 
                    <ChevronUp className="h-4 w-4" /> : 
                    <ChevronDown className="h-4 w-4" />
                  }
                </Button>
              </CollapsibleTrigger>
            </div>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="pt-4">
              <RecentActivities filters={activitiesFilters} />
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Dashboard Events Section */}
      <Collapsible 
        open={isUpcomingEventsOpen}
        onOpenChange={setIsUpcomingEventsOpen}
      >
        <Card>
          <CardHeader className="border-b flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>Events happening soon</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {newEventsCount > 0 && (
                <Badge variant="default" className="bg-purple-500 hover:bg-purple-600">
                  {newEventsCount} new
                </Badge>
              )}
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  {isUpcomingEventsOpen ? 
                    <ChevronUp className="h-4 w-4" /> : 
                    <ChevronDown className="h-4 w-4" />
                  }
                </Button>
              </CollapsibleTrigger>
            </div>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="pt-4">
              <DashboardEvents filters={eventsFilters} newEventsCount={newEventsCount} />
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
};
