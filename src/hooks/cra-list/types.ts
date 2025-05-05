
export interface CRAData {
  id?: string;
  full_name: string;
  first_name: string;
  last_name: string;
  study_site?: string | null;
  status?: string | null;
  email?: string | null;
  study_country?: string | null;
  study_team_role?: string | null;
  user_type?: string | null;
  user_reference?: string | null;
  project_id: string;
  created_by?: string;
  created_date?: string;
  updated_at?: string;
  end_date?: string | null;
  user_id?: string; // Added this field as it's required by the database
}

export interface CRAOperationsResult {
  success: number;
  error: number;
}

export type CRAFilterOptions = {
  status?: string;
  country?: string;
  role?: string;
};
