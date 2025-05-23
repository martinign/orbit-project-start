
export const columnsConfig = [
  {
    id: 'not-started',
    title: 'Not Started',
    status: 'not started',
    color: 'bg-gray-100 border-gray-300',
    badgeColor: 'bg-gray-500',
    borderColor: 'border-gray-500',
  },
  {
    id: 'pending',
    title: 'Pending',
    status: 'pending',
    color: 'bg-yellow-100 border-yellow-300',
    badgeColor: 'bg-yellow-500',
    borderColor: 'border-yellow-500',
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    status: 'in progress',
    color: 'bg-blue-100 border-blue-300',
    badgeColor: 'bg-blue-500',
    borderColor: 'border-blue-500',
  },
  {
    id: 'completed',
    title: 'Completed',
    status: 'completed',
    color: 'bg-green-100 border-green-300',
    badgeColor: 'bg-green-500',
    borderColor: 'border-green-500',
  },
  {
    id: 'stucked',
    title: 'Stucked',
    status: 'stucked',
    color: 'bg-red-100 border-red-300',
    badgeColor: 'bg-red-500',
    borderColor: 'border-red-500',
  },
  {
    id: 'archived',
    title: 'Archived',
    status: 'archived',
    color: 'bg-purple-100 border-purple-300',
    badgeColor: 'bg-purple-500',
    borderColor: 'border-purple-500',
    isArchive: true,
  }
];

// Get columns based on whether archive should be shown
export const getVisibleColumns = (showArchive: boolean = false, archiveOnlyMode: boolean = false) => {
  if (archiveOnlyMode) {
    // When in archive-only mode, show only the archive column
    return columnsConfig.filter(col => col.isArchive);
  }
  
  if (showArchive) {
    // Show all columns including archive
    return columnsConfig;
  }
  
  // Default: show all columns except archive
  return columnsConfig.filter(col => !col.isArchive);
};

// Helper function to get border color based on task status
export const getTaskBorderColor = (status: string, isArchived?: boolean) => {
  // If task is archived, always use purple border
  if (isArchived) {
    return 'border-purple-500';
  }
  
  // Find the matching column configuration
  const column = columnsConfig.find(col => 
    col.status.toLowerCase() === status.toLowerCase()
  );
  
  // Return the border color or default to gray if status not found
  return column?.borderColor || 'border-gray-500';
};

// Add interface for TypeScript type checking
export interface ColumnConfig {
  id: string;
  title: string;
  status: string;
  color: string;
  badgeColor: string;
  borderColor: string;
  isArchive?: boolean;
}

// Define a special droppable ID for the archive drop zone
export const ARCHIVE_DROPPABLE_ID = 'archive-drop-zone';
