
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { format } from 'date-fns';

interface ProjectTimelineProps {
  createdAt: string;
}

const ProjectTimeline = ({ createdAt }: ProjectTimelineProps) => {
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
        <CardDescription>Project created on {formatDate(createdAt)}</CardDescription>
      </CardHeader>
    </Card>
  );
};

export default ProjectTimeline;
