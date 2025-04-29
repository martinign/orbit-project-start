
import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useMediaQuery } from '@/hooks/use-mobile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Define types for survey data
export type SurveyResponseData = {
  id: string;
  user_id: string;
  created_at: string;
  usage_frequency: 'daily' | 'weekly' | 'monthly' | 'rarely';
  most_useful_feature: 'project_management' | 'task_tracking' | 'team_collaboration' | 'reporting';
  ease_of_use: number;
  improvement_area: 'ui_design' | 'performance' | 'feature_set' | 'documentation' | 'other';
  task_management_satisfaction: number;
  workday_codes_usage: 'frequently' | 'occasionally' | 'rarely' | 'never';
  additional_feedback?: string;
};

type ChartDataItem = {
  name: string;
  value: number;
  color?: string;
};

interface SurveyResultsChartsProps {
  data: SurveyResponseData[];
}

export const SurveyResultsCharts: React.FC<SurveyResultsChartsProps> = ({ data }) => {
  const isMobile = useMediaQuery("(max-width: 640px)");
  
  const usageFrequencyData = useMemo(() => {
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

  const featureData = useMemo(() => {
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

  const satisfactionData = useMemo(() => {
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

  const improvementAreaData = useMemo(() => {
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

  // Format utility functions
  function formatFeatureName(feature: string): string {
    switch(feature) {
      case 'project_management': return 'Project Management';
      case 'task_tracking': return 'Task Tracking';
      case 'team_collaboration': return 'Team Collaboration';
      case 'reporting': return 'Reporting';
      default: return feature;
    }
  }

  function formatImprovementArea(area: string): string {
    switch(area) {
      case 'ui_design': return 'UI Design';
      case 'performance': return 'Performance';
      case 'feature_set': return 'Feature Set';
      case 'documentation': return 'Documentation';
      case 'other': return 'Other';
      default: return area;
    }
  }

  // Color utility functions
  function getColorForUsageFrequency(frequency: string): string {
    switch(frequency) {
      case 'daily': return '#3b82f6';  // blue
      case 'weekly': return '#22c55e'; // green
      case 'monthly': return '#eab308'; // yellow
      case 'rarely': return '#ef4444'; // red
      default: return '#888888';
    }
  }

  function getColorForFeature(feature: string): string {
    switch(feature) {
      case 'Project Management': return '#3b82f6';
      case 'Task Tracking': return '#22c55e';
      case 'Team Collaboration': return '#eab308';
      case 'Reporting': return '#ef4444';
      default: return '#888888';
    }
  }

  function getColorForImprovementArea(area: string): string {
    switch(area) {
      case 'UI Design': return '#3b82f6';
      case 'Performance': return '#22c55e';
      case 'Feature Set': return '#eab308';
      case 'Documentation': return '#ef4444';
      case 'Other': return '#888888';
      default: return '#888888';
    }
  }

  const chartHeight = isMobile ? 180 : 220;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium">Usage Frequency</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div style={{ height: chartHeight }}>
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
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium">Most Useful Features</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div style={{ height: chartHeight }}>
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
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium">Satisfaction Ratings (Avg. out of 5)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div style={{ height: chartHeight }}>
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
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium">Improvement Areas</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div style={{ height: chartHeight }}>
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
