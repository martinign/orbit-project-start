
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { getColorForUsageFrequency } from '@/utils/chartFormatUtils';
import { SurveyResponseData } from '../survey/SurveyTypes';

type ChartDataItem = {
  name: string;
  value: number;
  color?: string;
};

interface UsageFrequencyChartProps {
  data: SurveyResponseData[];
  isMobile: boolean;
}

export const UsageFrequencyChart: React.FC<UsageFrequencyChartProps> = ({ data, isMobile }) => {
  const usageFrequencyData = React.useMemo(() => {
    const counts: Record<string, number> = {
      'daily': 0,
      'weekly': 0,
      'monthly': 0,
      'rarely': 0
    };
    
    data.forEach(item => {
      counts[item.usage_frequency] = (counts[item.usage_frequency] || 0) + 1;
    });
    
    return Object.entries(counts).map(([name, value]) => ({ 
      name: name.charAt(0).toUpperCase() + name.slice(1), 
      value,
      color: getColorForUsageFrequency(name)
    }));
  }, [data]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={usageFrequencyData}
          cx="50%"
          cy="50%"
          outerRadius={isMobile ? 70 : 80}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
        >
          {usageFrequencyData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [`${value} responses`, 'Count']} />
      </PieChart>
    </ResponsiveContainer>
  );
};
