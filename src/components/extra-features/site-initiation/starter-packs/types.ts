
import { SiteData } from '@/hooks/site-initiation/types';

export interface StarterPackSiteReference {
  reference: string;
  missingLabp: boolean;
  labpSite?: SiteData;
  hasStarterPack: boolean;
  starterPackUpdatedAt?: string;
  country: string;
  institution: string;
  personnel: string;
  allSitesForReference: SiteData[];
  missingRoles: string[];
}

export interface StarterPacksStats {
  total: number;
  sent: number;
  percentage: number;
}
