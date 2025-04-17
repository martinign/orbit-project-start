
import { Card, CardContent } from '@/components/ui/card';

interface ProjectDescriptionProps {
  description: string | null | undefined;
}

const ProjectDescription = ({ description }: ProjectDescriptionProps) => {
  if (!description) return null;

  return (
    <Card>
      <CardContent className="pt-6">
        <p>{description}</p>
      </CardContent>
    </Card>
  );
};

export default ProjectDescription;
