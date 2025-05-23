
export const columnsConfig = [
  {
    id: 'not-started',
    title: 'Not Started',
    status: 'not started',
    color: 'bg-gray-100 border-gray-300',
    badgeColor: 'bg-gray-500',
  },
  {
    id: 'pending',
    title: 'Pending',
    status: 'pending',
    color: 'bg-yellow-100 border-yellow-300',
    badgeColor: 'bg-yellow-500',
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    status: 'in progress',
    color: 'bg-blue-100 border-blue-300',
    badgeColor: 'bg-blue-500',
  },
  {
    id: 'completed',
    title: 'Completed',
    status: 'completed',
    color: 'bg-green-100 border-green-300',
    badgeColor: 'bg-green-500',
  },
  {
    id: 'stucked',
    title: 'Stucked',
    status: 'stucked',
    color: 'bg-red-100 border-red-300',
    badgeColor: 'bg-red-500',
  },
  {
    id: 'archived',
    title: 'Archived',
    status: 'archived',
    color: 'bg-purple-100 border-purple-300',
    badgeColor: 'bg-purple-500',
    isArchive: true,
  }
];

// Get columns based on whether archive should be shown
export const getVisibleColumns = (showArchive: boolean = false) => {
  if (showArchive) {
    return columnsConfig;
  }
  return columnsConfig.filter(col => !col.isArchive);
};

// Add interface for TypeScript type checking
export interface ColumnConfig {
  id: string;
  title: string;
  status: string;
  color: string;
  badgeColor: string;
  isArchive?: boolean;
}

// Define a special droppable ID for the archive drop zone
export const ARCHIVE_DROPPABLE_ID = 'archive-drop-zone';
