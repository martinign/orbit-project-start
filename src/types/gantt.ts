
export interface GanttTask {
  id: string;
  title: string;
  description?: string;
  status: string;
  project_id: string;
  user_id: string;
  start_date?: string;
  duration_days?: number;
  dependencies?: string[];
  assigned_to?: string | null;
  is_gantt_task: boolean;
}

export interface GanttTaskData {
  id: string;
  task_id: string;
  project_id: string;
  start_date?: string;
  duration_days?: number;
  dependencies?: string[];
}

