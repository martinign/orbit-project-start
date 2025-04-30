
import { useState, useCallback } from 'react';

interface DashboardFilters {
  projectId?: string;
  status?: string;
  category?: string;
  projectType?: string;
  showNewTasks?: boolean;
  showNewEvents?: boolean;
}

export function useDashboardFilters() {
  const [filters, setFilters] = useState<DashboardFilters>({});
  const [showNewTasks, setShowNewTasks] = useState(false);
  const [showNewEvents, setShowNewEvents] = useState(false);

  const handleFiltersChange = (newFilters: Omit<DashboardFilters, 'showNewTasks' | 'showNewEvents'>) => {
    setFilters(current => ({
      ...newFilters,
      showNewTasks: current.showNewTasks,
      showNewEvents: current.showNewEvents
    }));
  };

  const toggleNewTasksFilter = useCallback(() => {
    setShowNewTasks(prev => !prev);
    setFilters(current => ({
      ...current,
      showNewTasks: !current.showNewTasks
    }));
  }, []);

  const toggleNewEventsFilter = useCallback(() => {
    setShowNewEvents(prev => !prev);
    setFilters(current => ({
      ...current,
      showNewEvents: !current.showNewEvents
    }));
  }, []);

  const clearNewTasksFilter = useCallback(() => {
    setShowNewTasks(false);
    setFilters(current => ({
      ...current,
      showNewTasks: false
    }));
  }, []);

  return {
    filters,
    showNewTasks,
    showNewEvents,
    handleFiltersChange,
    toggleNewTasksFilter,
    toggleNewEventsFilter,
    clearNewTasksFilter
  };
}
