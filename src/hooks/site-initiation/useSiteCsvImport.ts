
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { SiteData, SiteOperationsResult } from './types';

export const useSiteCsvImport = (projectId?: string, userId?: string) => {
  const [processing, setProcessing] = useState(false);

  // Process CSV data with improved upsert logic that preserves existing status columns
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

        // For each record in the batch, check if it already exists and preserve status columns
        const batchWithPreservedStatus = await Promise.all(
          batch.map(async (record) => {
            try {
              // Check if record already exists
              const { data: existingRecord } = await supabase
                .from('project_csam_site')
                .select('id, starter_pack, registered_in_srp, supplies_applied')
                .eq('pxl_site_reference_number', record.pxl_site_reference_number)
                .eq('site_personnel_name', record.site_personnel_name)
                .eq('role', record.role)
                .eq('project_id', projectId)
                .maybeSingle();

              // Prepare the record with preserved status values
              const recordWithPreservedStatus = {
                ...record,
                user_id: userId,
                project_id: projectId
              };

              if (existingRecord) {
                // Preserve existing status values if the CSV record doesn't have explicit values
                // Only update status fields if they were explicitly provided in the CSV
                if (record.starter_pack === undefined || record.starter_pack === null) {
                  recordWithPreservedStatus.starter_pack = existingRecord.starter_pack;
                }
                if (record.registered_in_srp === undefined || record.registered_in_srp === null) {
                  recordWithPreservedStatus.registered_in_srp = existingRecord.registered_in_srp;
                }
                if (record.supplies_applied === undefined || record.supplies_applied === null) {
                  recordWithPreservedStatus.supplies_applied = existingRecord.supplies_applied;
                }
                
                // Store the existing record ID to ensure proper update
                recordWithPreservedStatus.id = existingRecord.id;
              } else {
                // For new records, set default values for undefined status fields
                if (record.starter_pack === undefined || record.starter_pack === null) {
                  recordWithPreservedStatus.starter_pack = false;
                }
                if (record.registered_in_srp === undefined || record.registered_in_srp === null) {
                  recordWithPreservedStatus.registered_in_srp = false;
                }
                if (record.supplies_applied === undefined || record.supplies_applied === null) {
                  recordWithPreservedStatus.supplies_applied = false;
                }
              }

              return recordWithPreservedStatus;
            } catch (error) {
              console.error('Error checking existing record:', error);
              // If there's an error checking, proceed with the original record
              return {
                ...record,
                user_id: userId,
                project_id: projectId
              };
            }
          })
        );

        // Use upsert operation with proper conflict detection
        const { data, error } = await supabase
          .from('project_csam_site')
          .upsert(batchWithPreservedStatus, {
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

      const statusMessage = errorCount > 0 
        ? `Successfully processed ${successCount} records. Failed to process ${errorCount} records.`
        : `Successfully processed ${successCount} records.`;

      toast({
        title: "CSV Import Completed",
        description: `${statusMessage} Existing status values have been preserved for fields not included in the CSV.`,
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
