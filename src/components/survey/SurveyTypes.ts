
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

export type ChartDataItem = {
  name: string;
  value: number;
  color?: string;
};
