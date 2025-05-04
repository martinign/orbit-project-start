
import React from 'react';

interface ProjectWarningProps {
  hasProject: boolean;
}

export const ProjectWarning: React.FC<ProjectWarningProps> = ({ hasProject }) => {
  if (hasProject) return null;
  
  return (
    <div className="bg-yellow-50 text-yellow-800 p-4 rounded-md text-sm">
      Note: For full functionality, please select a project.
    </div>
  );
};
