
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { SiteData, SiteOperationsResult } from './types';

export const useSiteCsvImport = (projectId?: string, userId?: string) => {
  const [processing, setProcessing] = useState(false);

  // Process CSV data with upsert logic
  const processCSVData = async (records: SiteData[]): Promise<SiteOperationsResult> => {
    if (!userId || !projectId || !records.length) return { success: 0, error: 0 };

    // Update records to ensure starter_pack is false for non-LABP roles
    const processedRecords = records.map(record => ({
      ...record,
      starter_pack: record.role === 'LABP' ? Boolean(record.starter_pack) : false
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

        // Prepare batch with user_id and project_id
        const batchWithIds = batch.map(record => ({
          ...record,
          user_id: userId,
          project_id: projectId
        }));

        // Use upsert operation - now with proper conflict detection
        const { data, error } = await supabase
          .from('project_csam_site')
          .upsert(batchWithIds, {
            onConflict: 'pxl_site_reference_number,site_personnel_name,role,project_id',
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
        title: "CSV Import Completed",
        description: `Successfully processed ${successCount} records. ${errorCount > 0 ? `Failed to process ${errorCount} records.` : ''}`,
        variant: errorCount > 0 ? "default" : "default",
      });

      return { success: successCount, error: errorCount };
    } catch (error) {
      console.error('Error processing CSV data:', error);
      toast({
        title: "CSV Import Failed",
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
    processCSVData
  };
};
