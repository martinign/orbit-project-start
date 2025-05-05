
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
  project_id: string;
  updated_at?: string; // Add the updated_at property
}

export interface SiteOperationsResult {
  success: number;
  error: number;
}
