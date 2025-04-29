
import React from 'react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { SurveyResponseData } from '../survey/SurveyTypes';

interface SatisfactionRatingsChartProps {
  data: SurveyResponseData[];
}

export const SatisfactionRatingsChart: React.FC<SatisfactionRatingsChartProps> = ({ data }) => {
  const satisfactionData = React.useMemo(() => {
    if (!data.length) return [];
    
    const totalEaseOfUse = data.reduce((sum, item) => sum + item.ease_of_use, 0);
    const totalTaskManagement = data.reduce((sum, item) => sum + item.task_management_satisfaction, 0);
    const avgEaseOfUse = totalEaseOfUse / data.length;
    const avgTaskManagement = totalTaskManagement / data.length;
    
    return [
      { name: 'Ease of Use', value: avgEaseOfUse, color: '#3b82f6' },
      { name: 'Task Management', value: avgTaskManagement, color: '#22c55e' }
    ];
  }, [data]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={satisfactionData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis domain={[0, 5]} />
        <Tooltip formatter={(value) => [`${Number(value).toFixed(2)} / 5`, 'Average Rating']} />
        <Bar dataKey="value" fill="#8884d8">
          {satisfactionData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};
