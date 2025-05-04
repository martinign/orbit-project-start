
import { useState } from "react";

export function useDashboardSections() {
  // Activity & Events sections
  const [isRecentActivitiesOpen, setIsRecentActivitiesOpen] = useState(true);
  const [isUpcomingEventsOpen, setIsUpcomingEventsOpen] = useState(true);
  
  return {
    isRecentActivitiesOpen,
    isUpcomingEventsOpen,
    setIsRecentActivitiesOpen,
    setIsUpcomingEventsOpen
  };
}
