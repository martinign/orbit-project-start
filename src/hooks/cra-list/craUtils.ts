
import { CRAData, CRASummary } from './types';

// Function to validate a CRA record
export const validateCRARecord = (record: CRAData): boolean => {
  return Boolean(
    record.full_name && 
    record.first_name && 
    record.last_name && 
    record.project_id
  );
};

// Function to normalize a CRA record
export const normalizeCRARecord = (record: any, projectId: string, userId: string): CRAData => {
  return {
    full_name: record.full_name || `${record.first_name || ''} ${record.last_name || ''}`.trim(),
    first_name: record.first_name || '',
    last_name: record.last_name || '',
    study_site: record.study_site || null,
    status: record.status || 'active',
    email: record.email || null,
    study_country: record.study_country || null,
    study_team_role: record.study_team_role || null,
    user_type: record.user_type || null,
    user_reference: record.user_reference || null,
    project_id: projectId,
    created_by: userId,
    user_id: userId
  };
};

// Function to calculate CRA summary statistics
export const calculateCRASummary = (craList: CRAData[]): CRASummary => {
  const activeCRAs = craList.filter(cra => cra.status === 'active').length;
  
  // Initialize country and role maps
  const countryMap: Record<string, number> = {};
  const roleMap: Record<string, number> = {};
  
  // Populate maps
  craList.forEach(cra => {
    if (cra.study_country) {
      countryMap[cra.study_country] = (countryMap[cra.study_country] || 0) + 1;
    }
    
    if (cra.study_team_role) {
      roleMap[cra.study_team_role] = (roleMap[cra.study_team_role] || 0) + 1;
    }
  });
  
  return {
    totalCRAs: craList.length,
    activeCRAs,
    inactiveCRAs: craList.length - activeCRAs,
    byCountry: countryMap,
    byRole: roleMap
  };
};
