
export interface TaskTemplate {
  id: string;
  title: string;
  description: string | null;
  user_id: string;  // Changed from optional to required to match usage in TaskTemplateList
  project_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface SOPTemplate {
  id: string;
  title: string;
  sop_id: string | null;
  sop_link: string | null;
}
