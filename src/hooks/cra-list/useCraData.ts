
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeSubscription } from '../useRealtimeSubscription';
import { CRAData } from './types';
import { useCraOperations } from './useCraOperations';
import { useCraCsvImport } from './useCraCsvImport';

export const useCraData = (projectId?: string, pageSize = 10, page = 1) => {
  const [cras, setCras] = useState<CRAData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const { user } = useAuth();
  
  const { addCra, updateCra, deleteCra, toggleCraStatus } = useCraOperations(projectId, user?.id);
  const { processCRACSVData, processing } = useCraCsvImport(projectId, user?.id);

  // Calculate offset for pagination
  const offset = (page - 1) * pageSize;

  // Fetch CRA data
  const fetchCras = async () => {
    if (!projectId) {
      setCras([]);
      setLoading(false);
      setTotalCount(0);
      return;
    }

    try {
      setLoading(true);

      // First get the total count
      const { count, error: countError } = await supabase
        .from('project_cra_list')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', projectId);

      if (countError) throw countError;
      setTotalCount(count || 0);

      // Then fetch the paginated data
      const { data, error } = await supabase
        .from('project_cra_list')
        .select('*')
        .eq('project_id', projectId)
        .order('full_name', { ascending: true })
        .range(offset, offset + pageSize - 1);

      if (error) throw error;
      setCras(data || []);
    } catch (error) {
      console.error('Error fetching CRA data:', error);
      setError(error as Error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchCras();
  }, [projectId, pageSize, page]);

  // Set up real-time subscription
  useRealtimeSubscription({
    table: 'project_cra_list',
    filter: 'project_id',
    filterValue: projectId,
    onRecordChange: () => {
      fetchCras();
    }
  });

  // Get CRAs by role
  const getCrasByRole = (role: string) => {
    return cras.filter(cra => cra.study_team_role === role);
  };

  // Get active CRAs
  const getActiveCras = () => {
    return cras.filter(cra => cra.status === 'active');
  };

  return {
    cras,
    loading,
    error,
    totalCount,
    addCra,
    updateCra,
    deleteCra,
    toggleCraStatus,
    processCRACSVData,
    refetch: fetchCras,
    getCrasByRole,
    getActiveCras,
    processing
  };
};
