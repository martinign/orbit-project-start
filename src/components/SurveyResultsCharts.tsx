
import React from 'react';
import { useMediaQuery } from '@/hooks/use-mobile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SurveyResponseData } from './survey/SurveyTypes';
import { UsageFrequencyChart } from './charts/UsageFrequencyChart';
import { MostUsefulFeaturesChart } from './charts/MostUsefulFeaturesChart';
import { SatisfactionRatingsChart } from './charts/SatisfactionRatingsChart';
import { ImprovementAreasChart } from './charts/ImprovementAreasChart';

// Re-export the type for backward compatibility
export type { SurveyResponseData } from './survey/SurveyTypes';

interface SurveyResultsChartsProps {
  data: SurveyResponseData[];
}

export const SurveyResultsCharts: React.FC<SurveyResultsChartsProps> = ({ data }) => {
  const isMobile = useMediaQuery("(max-width: 640px)");
  const chartHeight = isMobile ? 180 : 220;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium">Usage Frequency</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div style={{ height: chartHeight }}>
            <UsageFrequencyChart data={data} isMobile={isMobile} />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium">Most Useful Features</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div style={{ height: chartHeight }}>
            <MostUsefulFeaturesChart data={data} isMobile={isMobile} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium">Satisfaction Ratings (Avg. out of 5)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div style={{ height: chartHeight }}>
            <SatisfactionRatingsChart data={data} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium">Improvement Areas</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div style={{ height: chartHeight }}>
            <ImprovementAreasChart data={data} isMobile={isMobile} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
