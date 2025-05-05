
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface CRAData {
  full_name: string;
  first_name: string;
  last_name: string;
  study_site?: string;
  status?: string;
  email?: string;
  study_country?: string;
  study_team_role?: string;
  user_type?: string;
  user_reference?: string;
  project_id: string;
}

export interface CRAOperationsResult {
  success: number;
  error: number;
}

export const useCraCsvImport = (projectId?: string, userId?: string) => {
  const [processing, setProcessing] = useState(false);

  // Process CSV data with upsert logic
  const processCRACSVData = async (records: CRAData[]): Promise<CRAOperationsResult> => {
    if (!userId) {
      console.error('User ID is required for CRA CSV import');
      toast({
        title: "Authentication Error",
        description: "You must be logged in to import CRA data.",
        variant: "destructive",
      });
      return { success: 0, error: records.length };
    }
    
    if (!projectId || !records.length) return { success: 0, error: 0 };

    // Process the CRA records
    const processedRecords = records.map(record => ({
      ...record,
      // Default status to 'active' if not provided
      status: record.status || 'active',
      // Ensure these fields are populated
      project_id: projectId,
      user_id: userId,
      created_by: userId
    }));

    let successCount = 0;
    let errorCount = 0;

    try {
      setProcessing(true);
      
      // Process records in batches to avoid overwhelming the database
      const batchSize = 50;
      const batchCount = Math.ceil(processedRecords.length / batchSize);

      for (let i = 0; i < batchCount; i++) {
        const batchStart = i * batchSize;
        const batchEnd = Math.min((i + 1) * batchSize, processedRecords.length);
        const batch = processedRecords.slice(batchStart, batchEnd);

        console.log('Processing batch of CRA records:', batch);

        // Use upsert operation with conflict detection on the combination of fields
        // that should be unique for a CRA in a project
        const { data, error } = await supabase
          .from('project_cra_list')
          .upsert(batch, {
            onConflict: 'full_name,project_id',
            ignoreDuplicates: false
          })
          .select();

        if (error) {
          console.error('Batch error:', error);
          errorCount += batch.length;
        } else {
          successCount += (data?.length || 0);
          errorCount += batch.length - (data?.length || 0);
        }
      }

      toast({
        title: "CRA CSV Import Completed",
        description: `Successfully processed ${successCount} records. ${errorCount > 0 ? `Failed to process ${errorCount} records.` : ''}`,
        variant: errorCount > 0 ? "default" : "default",
      });

      return { success: successCount, error: errorCount };
    } catch (error) {
      console.error('Error processing CRA CSV data:', error);
      toast({
        title: "CRA CSV Import Failed",
        description: (error as Error).message,
        variant: "destructive",
      });
      return { success: successCount, error: errorCount };
    } finally {
      setProcessing(false);
    }
  };

  return {
    processing,
    processCRACSVData
  };
};
