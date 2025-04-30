
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface ProjectDescriptionProps {
  description?: string | null;
}

export const ProjectDescription: React.FC<ProjectDescriptionProps> = ({
  description
}) => {
  if (!description) return null;
  
  return (
    <Card>
      <CardContent className="pt-6">
        <p>{description}</p>
      </CardContent>
    </Card>
  );
};
