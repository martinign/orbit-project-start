
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { format } from 'date-fns';
import { User } from 'lucide-react';

interface ProjectTimelineProps {
  createdAt: string;
  creatorProfile?: {
    displayName: string;
  } | null;
}

export const ProjectTimeline: React.FC<ProjectTimelineProps> = ({
  createdAt,
  creatorProfile
}) => {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Timeline</CardTitle>
        <CardDescription className="space-y-1">
          <div>Project created on {formatDate(createdAt)}</div>
          {creatorProfile && (
            <div className="flex items-center text-sm gap-1 text-muted-foreground">
              <User className="h-3.5 w-3.5" />
              <span>Created by {creatorProfile.displayName}</span>
            </div>
          )}
        </CardDescription>
      </CardHeader>
    </Card>
  );
};
