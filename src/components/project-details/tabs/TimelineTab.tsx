
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import TaskTimelineView from '@/components/TaskTimelineView';

interface TimelineTabProps {
  projectId: string;
}

export const TimelineTab: React.FC<TimelineTabProps> = ({ projectId }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Timeline</CardTitle>
        <CardDescription>View tasks on a timeline with completion metrics</CardDescription>
      </CardHeader>
      <CardContent>
        <TaskTimelineView projectId={projectId} />
      </CardContent>
    </Card>
  );
};
