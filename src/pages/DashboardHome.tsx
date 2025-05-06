
import { useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";
import { StatisticsSection } from "@/components/dashboard/StatisticsSection";
import { ActivityEventsSection } from "@/components/dashboard/ActivityEventsSection";
import { useTotalNewItemsCount } from "@/hooks/useTotalNewItemsCount";
import { useExtraFeatures } from "@/hooks/useExtraFeatures";
import { useDashboardFilters } from "@/hooks/useDashboardFilters";
import { useDashboardRealtime } from "@/hooks/useDashboardRealtime";
import { useDashboardSections } from "@/hooks/useDashboardSections";

const DashboardHome = () => {
  // Custom hooks
  const { features, setFeatures } = useExtraFeatures();
  const { newTasksCount, newEventsCount, hideBadge } = useTotalNewItemsCount();
  const { 
    filters, 
    showNewTasks, 
    showNewEvents, 
    handleFiltersChange, 
    toggleNewTasksFilter, 
    toggleNewEventsFilter, 
    clearNewTasksFilter 
  } = useDashboardFilters();
  
  const {
    isRecentActivitiesOpen,
    isUpcomingTasksOpen,
    isUpcomingEventsOpen,
    setIsRecentActivitiesOpen,
    setIsUpcomingTasksOpen,
    setIsUpcomingEventsOpen
  } = useDashboardSections();
  
  // Setup realtime subscriptions
  useDashboardRealtime();

  // Hide badge when first load the dashboard
  useEffect(() => {
    hideBadge();
  }, [hideBadge]);

  // Ensure we see the extra features immediately when they're enabled
  useEffect(() => {
    const savedFeatures = localStorage.getItem("extraFeatures");
    if (savedFeatures) {
      setFeatures(JSON.parse(savedFeatures));
    }
    
    // Listen for storage events
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'extraFeatures' && e.newValue) {
        setFeatures(JSON.parse(e.newValue));
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [setFeatures]);

  // Filter setups for activities and events
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

  return (
    <div className="w-full space-y-6">
      <DashboardHeader />
      
      <DashboardFilters 
        onFilterChange={handleFiltersChange}
        showNewTasks={showNewTasks}
        onClearNewTasks={clearNewTasksFilter}
      />

      {/* Statistics Cards Section */}
      <StatisticsSection filters={filters} />

      {/* Activities and Events Section */}
      <ActivityEventsSection 
        activitiesFilters={activitiesFilters}
        eventsFilters={eventsFilters}
        isRecentActivitiesOpen={isRecentActivitiesOpen}
        isUpcomingTasksOpen={isUpcomingTasksOpen}
        isUpcomingEventsOpen={isUpcomingEventsOpen}
        newEventsCount={newEventsCount}
        setIsRecentActivitiesOpen={setIsRecentActivitiesOpen}
        setIsUpcomingTasksOpen={setIsUpcomingTasksOpen}
        setIsUpcomingEventsOpen={setIsUpcomingEventsOpen}
      />
    </div>
  );
};

export default DashboardHome;
