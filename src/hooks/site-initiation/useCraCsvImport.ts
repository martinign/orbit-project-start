
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { CRAData, CRAOperationsResult } from '../cra-list/types';

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
    
    if (!projectId || !records.length) {
      console.error('Missing project ID or records', { projectId, recordCount: records.length });
      return { success: 0, error: 0 };
    }

    // Process the CRA records
    const processedRecords = records.map(record => ({
      ...record,
      status: record.status || 'active',
      project_id: projectId,
      user_id: userId,
      created_by: userId,
      created_date: new Date().toISOString()
    }));

    let successCount = 0;
    let errorCount = 0;

    try {
      setProcessing(true);
      
      // Process records in batches to avoid overwhelming the database
      const batchSize = 5; // Reduced batch size for better error handling
      const batchCount = Math.ceil(processedRecords.length / batchSize);

      for (let i = 0; i < batchCount; i++) {
        const batchStart = i * batchSize;
        const batchEnd = Math.min((i + 1) * batchSize, processedRecords.length);
        const batch = processedRecords.slice(batchStart, batchEnd);

        console.log('Processing batch of CRA records:', JSON.stringify(batch, null, 2));
        
        // Updated to use the simplified constraint
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
          
          toast({
            title: "Error Processing Batch",
            description: `Failed to process records: ${error.message}`,
            variant: "destructive",
          });
        } else {
          console.log('Successfully processed batch:', data);
          successCount += (data?.length || 0);
          errorCount += batch.length - (data?.length || 0);
        }

        // Add a small delay between batches to prevent rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const variant = errorCount > 0 ? "default" : "default";
      toast({
        title: "CRA CSV Import Completed",
        description: `Successfully processed ${successCount} records. ${errorCount > 0 ? `Failed to process ${errorCount} records.` : ''}`,
        variant,
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
