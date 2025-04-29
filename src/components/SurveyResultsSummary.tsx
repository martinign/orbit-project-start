
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SurveyResponseData } from './survey/SurveyTypes';

interface SurveySummaryProps {
  data: SurveyResponseData[];
}

export const SurveyResultsSummary: React.FC<SurveySummaryProps> = ({ data }) => {
  const stats = useMemo(() => {
    if (!data.length) return null;
    
    // Calculate averages
    const avgEaseOfUse = data.reduce((sum, item) => sum + item.ease_of_use, 0) / data.length;
    const avgTaskManagement = data.reduce((sum, item) => sum + item.task_management_satisfaction, 0) / data.length;
    
    // Count responses for each type
    const usageFrequency: Record<string, number> = {};
    const mostUsefulFeature: Record<string, number> = {};
    
    data.forEach(item => {
      usageFrequency[item.usage_frequency] = (usageFrequency[item.usage_frequency] || 0) + 1;
      mostUsefulFeature[item.most_useful_feature] = (mostUsefulFeature[item.most_useful_feature] || 0) + 1;
    });
    
    // Find most common usage
    let topUsage = '';
    let topUsageCount = 0;
    Object.entries(usageFrequency).forEach(([key, value]) => {
      if (value > topUsageCount) {
        topUsage = key;
        topUsageCount = value;
      }
    });
    
    // Find most valued feature
    let topFeature = '';
    let topFeatureCount = 0;
    Object.entries(mostUsefulFeature).forEach(([key, value]) => {
      if (value > topFeatureCount) {
        topFeature = key;
        topFeatureCount = value;
      }
    });
    
    // Format feature name
    const formatFeatureName = (feature: string): string => {
      switch(feature) {
        case 'project_management': return 'Project Management';
        case 'task_tracking': return 'Task Tracking';
        case 'team_collaboration': return 'Team Collaboration';
        case 'reporting': return 'Reporting';
        default: return feature;
      }
    };
    
    return {
      responseCount: data.length,
      avgEaseOfUse,
      avgTaskManagement,
      topUsage,
      topFeature: formatFeatureName(topFeature),
      feedbackCount: data.filter(item => item.additional_feedback?.trim()).length
    };
  }, [data]);

  if (!stats) return null;

  return (
    <div className="grid gap-4 grid-cols-2 md:grid-cols-3 mb-6">
      <Card>
        <CardHeader className="py-2">
          <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{stats.responseCount}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="py-2">
          <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{stats.avgEaseOfUse.toFixed(1)}/5</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="py-2">
          <CardTitle className="text-sm font-medium">Top Feature</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-bold">{stats.topFeature}</p>
        </CardContent>
      </Card>
    </div>
  );
};
