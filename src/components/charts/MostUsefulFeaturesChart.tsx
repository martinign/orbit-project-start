
import React from 'react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatFeatureName, getColorForFeature } from '@/utils/chartFormatUtils';
import { SurveyResponseData } from '../survey/SurveyTypes';

interface MostUsefulFeaturesChartProps {
  data: SurveyResponseData[];
  isMobile: boolean;
}

export const MostUsefulFeaturesChart: React.FC<MostUsefulFeaturesChartProps> = ({ data, isMobile }) => {
  const featureData = React.useMemo(() => {
    const counts: Record<string, number> = {
      'Project Management': 0,
      'Task Tracking': 0,
      'Team Collaboration': 0,
      'Reporting': 0
    };
    
    data.forEach(item => {
      const displayName = formatFeatureName(item.most_useful_feature);
      counts[displayName] = (counts[displayName] || 0) + 1;
    });
    
    return Object.entries(counts).map(([name, value]) => ({ 
      name, 
      value,
      color: getColorForFeature(name)
    }));
  }, [data]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={featureData} layout={isMobile ? "vertical" : "horizontal"}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" type={isMobile ? "number" : "category"} />
        <YAxis dataKey={isMobile ? "name" : "value"} type={isMobile ? "category" : "number"} />
        <Tooltip formatter={(value) => [`${value} responses`, 'Count']} />
        <Bar dataKey="value" fill="#8884d8">
          {featureData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};
