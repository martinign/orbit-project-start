
// Utility functions for chart formatting and color selection

export function formatFeatureName(feature: string): string {
  switch(feature) {
    case 'project_management': return 'Project Management';
    case 'task_tracking': return 'Task Tracking';
    case 'team_collaboration': return 'Team Collaboration';
    case 'reporting': return 'Reporting';
    default: return feature;
  }
}

export function formatImprovementArea(area: string): string {
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
export function getColorForUsageFrequency(frequency: string): string {
  switch(frequency) {
    case 'daily': return '#3b82f6';  // blue
    case 'weekly': return '#22c55e'; // green
    case 'monthly': return '#eab308'; // yellow
    case 'rarely': return '#ef4444'; // red
    default: return '#888888';
  }
}

export function getColorForFeature(feature: string): string {
  switch(feature) {
    case 'Project Management': return '#3b82f6';
    case 'Task Tracking': return '#22c55e';
    case 'Team Collaboration': return '#eab308';
    case 'Reporting': return '#ef4444';
    default: return '#888888';
  }
}

export function getColorForImprovementArea(area: string): string {
  switch(area) {
    case 'UI Design': return '#3b82f6';
    case 'Performance': return '#22c55e';
    case 'Feature Set': return '#eab308';
    case 'Documentation': return '#ef4444';
    case 'Other': return '#888888';
    default: return '#888888';
  }
}
