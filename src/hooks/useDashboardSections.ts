
import { useState } from "react";

export function useDashboardSections() {
  // Activity & Events sections
  const [isRecentActivitiesOpen, setIsRecentActivitiesOpen] = useState(true);
  const [isUpcomingEventsOpen, setIsUpcomingEventsOpen] = useState(true);
  
  // Extra Features sections
  const [isImportantLinksOpen, setIsImportantLinksOpen] = useState(true);
  const [isSiteTrackerOpen, setIsSiteTrackerOpen] = useState(true);
  const [isRepositoryOpen, setIsRepositoryOpen] = useState(true);
  const [isDocPrintingOpen, setIsDocPrintingOpen] = useState(true);
  
  return {
    isRecentActivitiesOpen,
    isUpcomingEventsOpen,
    isImportantLinksOpen,
    isSiteTrackerOpen,
    isRepositoryOpen,
    isDocPrintingOpen,
    setIsRecentActivitiesOpen,
    setIsUpcomingEventsOpen,
    setIsImportantLinksOpen,
    setIsSiteTrackerOpen,
    setIsRepositoryOpen,
    setIsDocPrintingOpen
  };
}
