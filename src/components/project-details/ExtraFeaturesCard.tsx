
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PuzzleIcon } from 'lucide-react';
import { useExtraFeatures } from '@/hooks/useExtraFeatures';

interface ExtraFeaturesCardProps {
  projectId: string;
}

export const ExtraFeaturesCard: React.FC<ExtraFeaturesCardProps> = ({ projectId }) => {
  const { features } = useExtraFeatures(projectId);
  
  // Count enabled features
  const enabledFeaturesCount = Object.values(features).filter(Boolean).length;
  const totalFeatures = Object.keys(features).length;
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center">
          <PuzzleIcon className="h-5 w-5 text-blue-500 mr-2" />
          <CardTitle className="text-xl">Extra Features</CardTitle>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          Configure
        </Button>
      </CardHeader>
      <CardContent>
        <div className="text-sm">
          <p>
            <span className="font-semibold">{enabledFeaturesCount}</span> of{" "}
            <span className="font-semibold">{totalFeatures}</span> extra features enabled
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {Object.entries(features).map(([key, enabled]) => (
              <div 
                key={key}
                className={`text-xs px-2 py-1 rounded-full ${
                  enabled ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-500"
                }`}
              >
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
