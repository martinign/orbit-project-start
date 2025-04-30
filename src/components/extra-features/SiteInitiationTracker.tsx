
import React from 'react';

interface SiteInitiationTrackerProps {
  projectId?: string;
}

export const SiteInitiationTracker: React.FC<SiteInitiationTrackerProps> = ({ projectId }) => {
  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-medium mb-2">Site Initiation Tracker</h3>
      {projectId ? (
        <p className="text-muted-foreground">Project-specific tracker for project ID: {projectId}</p>
      ) : (
        <p className="text-muted-foreground">Global site initiation tracker</p>
      )}
      <div className="mt-4">
        <p className="text-sm text-muted-foreground">Track site initiation progress here.</p>
      </div>
    </div>
  );
};
