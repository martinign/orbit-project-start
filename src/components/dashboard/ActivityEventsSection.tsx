
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RecentActivities } from "@/components/dashboard/RecentActivities";
import { DashboardEvents } from "@/components/dashboard/DashboardEvents";
import { UpcomingTasks } from "@/components/dashboard/UpcomingTasks";

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
  newEventsCount: number;
}

export const ActivityEventsSection: React.FC<ActivityEventsSectionProps> = ({
  activitiesFilters,
  eventsFilters,
  newEventsCount
}) => {
  return <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Recent Activities Section */}
      <Card>
        <CardHeader className="border-b pb-2">
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest actions across all projects</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <RecentActivities filters={activitiesFilters} />
        </CardContent>
      </Card>

      {/* Upcoming Tasks Section */}
      <Card>
        <CardHeader className="border-b pb-2">
          <CardTitle>Upcoming Tasks</CardTitle>
          <CardDescription>Tasks due in the next 7 days</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <UpcomingTasks filters={activitiesFilters} hideHeader={true} />
        </CardContent>
      </Card>

      {/* Dashboard Events Section */}
      <Card>
        <CardHeader className="border-b pb-2">
          <CardTitle>Upcoming Events</CardTitle>
          <CardDescription>Events happening soon</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <DashboardEvents filters={eventsFilters} newEventsCount={newEventsCount} />
        </CardContent>
      </Card>
    </div>;
};
