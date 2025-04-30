
import { useState } from 'react';

export function useDashboardSections() {
  const [isRecentActivitiesOpen, setIsRecentActivitiesOpen] = useState(true);
  const [isUpcomingEventsOpen, setIsUpcomingEventsOpen] = useState(true);
  const [isImportantLinksOpen, setIsImportantLinksOpen] = useState(true);
  const [isSiteTrackerOpen, setIsSiteTrackerOpen] = useState(true);
  const [isRepositoryOpen, setIsRepositoryOpen] = useState(true);

  return {
    isRecentActivitiesOpen,
    isUpcomingEventsOpen,
    isImportantLinksOpen,
    isSiteTrackerOpen,
    isRepositoryOpen,
    setIsRecentActivitiesOpen,
    setIsUpcomingEventsOpen,
    setIsImportantLinksOpen,
    setIsSiteTrackerOpen,
    setIsRepositoryOpen
  };
}
