
import { useState, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ProjectsStatisticsCard } from "@/components/dashboard/ProjectsStatisticsCard";
import { TasksStatisticsCard } from "@/components/dashboard/TasksStatisticsCard";
import { TaskPrioritiesCard } from "@/components/dashboard/TaskPrioritiesCard";
import { InvitationsStatisticsCard } from "@/components/dashboard/InvitationsStatisticsCard";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";
import { RecentActivities } from "@/components/dashboard/RecentActivities";
import { DashboardEvents } from "@/components/dashboard/DashboardEvents";
import { UpcomingTasks } from "@/components/dashboard/UpcomingTasks";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";
import { useTotalNewItemsCount } from "@/hooks/useTotalNewItemsCount";
import { useExtraFeatures } from "@/hooks/useExtraFeatures";
import { ImportantLinks } from "@/components/extra-features/ImportantLinks";
import { SiteInitiationTracker } from "@/components/extra-features/SiteInitiationTracker";
import { Repository } from "@/components/extra-features/Repository";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

interface DashboardFilters {
  projectId?: string;
  status?: string;
  category?: string;
  projectType?: string;
  showNewTasks?: boolean;
  showNewEvents?: boolean;
}

// Helper for debounced query invalidation
const debounce = (func: Function, wait: number) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: any[]) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const DashboardHome = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<DashboardFilters>({});
  const [showNewTasks, setShowNewTasks] = useState(false);
  const [showNewEvents, setShowNewEvents] = useState(false);
  const { newTasksCount, newEventsCount, hideBadge } = useTotalNewItemsCount();
  const { features, setFeatures } = useExtraFeatures();
  
  // Collapsible states for each section
  const [isRecentActivitiesOpen, setIsRecentActivitiesOpen] = useState(true);
  const [isUpcomingEventsOpen, setIsUpcomingEventsOpen] = useState(true);
  const [isImportantLinksOpen, setIsImportantLinksOpen] = useState(true);
  const [isSiteTrackerOpen, setIsSiteTrackerOpen] = useState(true);
  const [isRepositoryOpen, setIsRepositoryOpen] = useState(true);

  // Hide badge when we first load the dashboard
  useEffect(() => {
    hideBadge();
  }, [hideBadge]);

  // Ensure we see the extra features immediately when they're enabled
  useEffect(() => {
    const savedFeatures = localStorage.getItem("extraFeatures");
    if (savedFeatures) {
      setFeatures(JSON.parse(savedFeatures));
    }
  }, [setFeatures]);

  // Create debounced invalidation functions to prevent UI freezes
  const debouncedInvalidateProjects = useCallback(
    debounce(() => {
      queryClient.invalidateQueries({ queryKey: ["projects_statistics"] });
      queryClient.invalidateQueries({ queryKey: ["recent_activities"] });
    }, 300),
    [queryClient]
  );

  const debouncedInvalidateTasks = useCallback(
    debounce(() => {
      queryClient.invalidateQueries({ queryKey: ["tasks_statistics"] });
      queryClient.invalidateQueries({ queryKey: ["task_priorities"] });
      queryClient.invalidateQueries({ queryKey: ["upcoming_tasks"] });
      queryClient.invalidateQueries({ queryKey: ["recent_activities"] });
      queryClient.invalidateQueries({ queryKey: ["new_tasks_count"] });
    }, 300),
    [queryClient]
  );

  const debouncedInvalidateInvitations = useCallback(
    debounce(() => {
      queryClient.invalidateQueries({ queryKey: ["invitations_statistics"] });
      queryClient.invalidateQueries({ queryKey: ["recent_activities"] });
    }, 300),
    [queryClient]
  );

  const debouncedInvalidateEvents = useCallback(
    debounce(() => {
      queryClient.invalidateQueries({ queryKey: ["dashboard_events"] });
      queryClient.invalidateQueries({ queryKey: ["new_events_count"] });
    }, 300),
    [queryClient]
  );

  // Use our custom realtime subscription hook instead of creating channels directly
  useRealtimeSubscription({
    table: 'projects',
    onRecordChange: debouncedInvalidateProjects
  });

  useRealtimeSubscription({
    table: 'project_tasks',
    onRecordChange: debouncedInvalidateTasks
  });

  useRealtimeSubscription({
    table: 'project_invitations',
    onRecordChange: debouncedInvalidateInvitations
  });

  useRealtimeSubscription({
    table: 'project_events',
    onRecordChange: debouncedInvalidateEvents
  });

  useEffect(() => {
    const invalidateAll = debounce(() => {
      queryClient.invalidateQueries({ queryKey: ["projects_statistics"] });
      queryClient.invalidateQueries({ queryKey: ["tasks_statistics"] });
      queryClient.invalidateQueries({ queryKey: ["task_priorities"] });
      queryClient.invalidateQueries({ queryKey: ["invitations_statistics"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard_events"] });
    }, 300);
    
    invalidateAll();
  }, [filters, queryClient]);

  const handleFiltersChange = (newFilters: Omit<DashboardFilters, 'showNewTasks' | 'showNewEvents'>) => {
    setFilters(current => ({
      ...newFilters,
      showNewTasks: current.showNewTasks,
      showNewEvents: current.showNewEvents
    }));
  };

  const toggleNewTasksFilter = () => {
    setShowNewTasks(prev => !prev);
    setFilters(current => ({
      ...current,
      showNewTasks: !current.showNewTasks
    }));
  };

  const toggleNewEventsFilter = () => {
    setShowNewEvents(prev => !prev);
    setFilters(current => ({
      ...current,
      showNewEvents: !current.showNewEvents
    }));
  };

  const activitiesFilters = {
    ...filters,
    showNewTasks,
    onToggleNewTasks: toggleNewTasksFilter
  };

  const eventsFilters = {
    ...filters,
    showNewEvents,
    onToggleNewEvents: toggleNewEventsFilter
  };

  // Function to determine if any extra features are enabled
  const hasEnabledFeatures = features.importantLinks || features.siteInitiationTracker || features.repository;

  return (
    <div className="w-full space-y-6">
      <DashboardHeader />
      <DashboardFilters 
        onFilterChange={handleFiltersChange}
        showNewTasks={showNewTasks}
        onClearNewTasks={() => {
          setShowNewTasks(false);
          setFilters(current => ({
            ...current,
            showNewTasks: false
          }));
        }}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ProjectsStatisticsCard filters={filters} />
        <TasksStatisticsCard filters={filters} />
        <TaskPrioritiesCard filters={filters} />
        <InvitationsStatisticsCard filters={filters} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Activities Section - Now Collapsible */}
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
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  {isRecentActivitiesOpen ? 
                    <ChevronUp className="h-4 w-4" /> : 
                    <ChevronDown className="h-4 w-4" />
                  }
                </Button>
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent className="pt-4">
                <RecentActivities filters={activitiesFilters} />
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Dashboard Events Section - Now Collapsible */}
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
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  {isUpcomingEventsOpen ? 
                    <ChevronUp className="h-4 w-4" /> : 
                    <ChevronDown className="h-4 w-4" />
                  }
                </Button>
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent className="pt-4">
                <DashboardEvents filters={eventsFilters} newEventsCount={newEventsCount} />
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </div>

      {/* Extra Features Section - Each with its own collapsible */}
      {hasEnabledFeatures && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.importantLinks && (
            <Collapsible 
              open={isImportantLinksOpen}
              onOpenChange={setIsImportantLinksOpen}
              className="col-span-1"
            >
              <Card>
                <CardHeader className="border-b flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle>Important Links</CardTitle>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      {isImportantLinksOpen ? 
                        <ChevronUp className="h-4 w-4" /> : 
                        <ChevronDown className="h-4 w-4" />
                      }
                    </Button>
                  </CollapsibleTrigger>
                </CardHeader>
                <CollapsibleContent>
                  <CardContent className="pt-4">
                    <ImportantLinks projectId={filters.projectId} />
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          )}
          
          {features.siteInitiationTracker && (
            <Collapsible 
              open={isSiteTrackerOpen}
              onOpenChange={setIsSiteTrackerOpen}
              className="col-span-1"
            >
              <Card>
                <CardHeader className="border-b flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle>Site Initiation Tracker</CardTitle>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      {isSiteTrackerOpen ? 
                        <ChevronUp className="h-4 w-4" /> : 
                        <ChevronDown className="h-4 w-4" />
                      }
                    </Button>
                  </CollapsibleTrigger>
                </CardHeader>
                <CollapsibleContent>
                  <CardContent className="pt-4">
                    <SiteInitiationTracker projectId={filters.projectId} />
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          )}
          
          {features.repository && (
            <Collapsible 
              open={isRepositoryOpen}
              onOpenChange={setIsRepositoryOpen}
              className="col-span-1"
            >
              <Card>
                <CardHeader className="border-b flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle>Repository</CardTitle>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      {isRepositoryOpen ? 
                        <ChevronUp className="h-4 w-4" /> : 
                        <ChevronDown className="h-4 w-4" />
                      }
                    </Button>
                  </CollapsibleTrigger>
                </CardHeader>
                <CollapsibleContent>
                  <CardContent className="pt-4">
                    <Repository projectId={filters.projectId} />
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardHome;
