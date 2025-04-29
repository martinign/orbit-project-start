
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatImprovementArea, getColorForImprovementArea } from '@/utils/chartFormatUtils';
import { SurveyResponseData } from '../survey/SurveyTypes';

interface ImprovementAreasChartProps {
  data: SurveyResponseData[];
  isMobile: boolean;
}

export const ImprovementAreasChart: React.FC<ImprovementAreasChartProps> = ({ data, isMobile }) => {
  const improvementAreaData = React.useMemo(() => {
    const counts: Record<string, number> = {};
    
    data.forEach(item => {
      const displayName = formatImprovementArea(item.improvement_area);
      counts[displayName] = (counts[displayName] || 0) + 1;
    });
    
    return Object.entries(counts).map(([name, value]) => ({ 
      name, 
      value,
      color: getColorForImprovementArea(name)
    }));
  }, [data]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={improvementAreaData}
          cx="50%"
          cy="50%"
          outerRadius={isMobile ? 70 : 80}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
        >
          {improvementAreaData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [`${value} responses`, 'Count']} />
      </PieChart>
    </ResponsiveContainer>
  );
};
