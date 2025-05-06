
import { useState } from "react";

export function useDashboardSections() {
  // Activity & Events sections
  const [isRecentActivitiesOpen, setIsRecentActivitiesOpen] = useState(true);
  const [isUpcomingTasksOpen, setIsUpcomingTasksOpen] = useState(true);
  const [isUpcomingEventsOpen, setIsUpcomingEventsOpen] = useState(true);
  
  return {
    isRecentActivitiesOpen,
    isUpcomingTasksOpen,
    isUpcomingEventsOpen,
    setIsRecentActivitiesOpen,
    setIsUpcomingTasksOpen,
    setIsUpcomingEventsOpen
  };
}
