
// This hook is no longer needed as we've removed the collapsible functionality
// The file is kept for compatibility but could be removed if not used elsewhere

export function useDashboardSections() {
  return {
    isRecentActivitiesOpen: true,
    isUpcomingTasksOpen: true,
    isUpcomingEventsOpen: true,
    setIsRecentActivitiesOpen: () => {},
    setIsUpcomingTasksOpen: () => {},
    setIsUpcomingEventsOpen: () => {}
  };
}
