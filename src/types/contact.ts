
export interface Contact {
  id: string;
  full_name: string;
  email: string;
  telephone?: string;
  company?: string;
  role?: string;
  location?: string;
  project_id: string;
  projects?: {
    project_number: string;
    Sponsor: string;
  };
}
