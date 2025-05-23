
import { Dispatch, SetStateAction } from 'react';

export interface SiteData {
  id?: string;
  country?: string;
  pxl_site_reference_number: string;
  pi_name?: string;
  site_personnel_name: string;
  role: string;
  site_personnel_email_address?: string;
  site_personnel_telephone?: string;
  site_personnel_fax?: string;
  institution?: string;
  address?: string;
  city_town?: string;
  province_state?: string;
  zip_code?: string;
  starter_pack?: boolean;
  registered_in_srp?: boolean;
  supplies_applied?: boolean;
  project_id: string;
  updated_at?: string; // Used for tracking when starter packs are sent
}

export interface SiteOperationsResult {
  success: number;
  error: number;
}

export interface SiteStatusHistoryRecord {
  id: string;
  site_id: string;
  project_id: string;
  user_id: string;
  pxl_site_reference_number: string;
  site_personnel_name: string;
  role: string;
  field_changed: string;
  old_value: boolean | null;
  new_value: boolean | null;
  created_at: string;
}
