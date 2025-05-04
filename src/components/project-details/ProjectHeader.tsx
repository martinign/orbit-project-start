
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProjectHeaderProps {
  projectNumber: string;
  protocolTitle: string;
  sponsor?: string;
  protocolNumber?: string;
  status: string;
  projectType?: string;
}

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  projectNumber,
  protocolTitle,
  sponsor,
  protocolNumber,
  status,
  projectType = 'billable',
}) => {
  const isBillableProject = projectType === 'billable';

  return (
    <div className="sticky top-0 z-10 bg-background py-4 border-b">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/projects">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">
              {projectNumber}: {protocolTitle}
            </h1>
            {isBillableProject && sponsor && protocolNumber && (
              <p className="text-muted-foreground">
                Sponsor: {sponsor} • Protocol: {protocolNumber}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              status === 'active'
                ? 'bg-green-100 text-green-800'
                : status === 'pending'
                ? 'bg-yellow-100 text-yellow-800'
                : status === 'completed'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {status}
          </span>
        </div>
      </div>
    </div>
  );
};
