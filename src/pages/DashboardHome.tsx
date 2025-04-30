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
  const { features } = useExtraFeatures();
  const [isExtraFeaturesOpen, setIsExtraFeaturesOpen] = useState(true);

  // Hide badge when we first load the dashboard
  useEffect(() => {
    hideBadge();
  }, [hideBadge]);

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
        <RecentActivities filters={activitiesFilters} />
        <DashboardEvents filters={eventsFilters} newEventsCount={newEventsCount} />
      </div>

      {/* Extra Features Section - Moved below recent activities and events */}
      {hasEnabledFeatures && (
        <Collapsible 
          open={isExtraFeaturesOpen}
          onOpenChange={setIsExtraFeaturesOpen}
          className="border rounded-md bg-white shadow-sm"
        >
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold">Extra Features</h3>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                {isExtraFeaturesOpen ? 
                  <ChevronUp className="h-4 w-4" /> : 
                  <ChevronDown className="h-4 w-4" />
                }
              </Button>
            </CollapsibleTrigger>
          </div>
          
          <CollapsibleContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {features.importantLinks && (
                <div className="col-span-1">
                  <ImportantLinks />
                </div>
              )}
              
              {features.siteInitiationTracker && (
                <div className="col-span-1">
                  <SiteInitiationTracker />
                </div>
              )}
              
              {features.repository && (
                <div className="col-span-1 lg:col-span-1">
                  <Repository />
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
};

export default DashboardHome;
