
import { useState } from 'react';
import { SiteData } from '@/hooks/site-initiation/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useLabpExport = (sites: SiteData[], projectId?: string) => {
  const [exporting, setExporting] = useState(false);

  const exportLabpSitesToCsv = async (selectedSiteRefs: string[]) => {
    if (selectedSiteRefs.length === 0) {
      toast({
        title: "No sites selected",
        description: "Please select at least one site to export.",
        variant: "destructive",
      });
      return;
    }

    try {
      setExporting(true);
      
      // Get project data to include Sponsor and Protocol number
      let projectData = null;
      if (projectId) {
        const { data: project } = await supabase
          .from('projects')
          .select('Sponsor, project_number, protocol_number')
          .eq('id', projectId)
          .single();
        
        projectData = project;
      }

      // Get only LABP site data for the selected references
      const selectedLabpSites: SiteData[] = [];
      
      // For each selected reference, get only LABP sites with that reference
      for (const ref of selectedSiteRefs) {
        const labpSitesWithRef = sites.filter(site => 
          site.pxl_site_reference_number === ref && 
          site.role === 'LABP'
        );
        
        if (labpSitesWithRef.length > 0) {
          selectedLabpSites.push(...labpSitesWithRef);
        }
      }
      
      if (selectedLabpSites.length === 0) {
        toast({
          title: "No LABP data to export",
          description: "The selected sites don't have any LABP data to export.",
          variant: "destructive",
        });
        return;
      }

      // Create CSV header with only the requested fields
      const headers = [
        'Sponsor',
        'project_id',
        'Protocol number',
        'country',
        'province_state',
        'city_town',
        'zip_code',
        'pxl_site_reference_number',
        'institution',
        'address',
        'site_personnel_name',
        'site_personnel_email_address',
        'site_personnel_telephone',
        'site_personnel_fax'
      ];

      // Format data to CSV
      const csvRows = [headers.join(',')];
      selectedLabpSites.forEach(site => {
        const row = [
          projectData?.Sponsor || '',
          projectData?.project_number || '', // Use project_number instead of projectId
          projectData?.protocol_number || '',
          site.country || '',
          site.province_state || '',
          site.city_town || '',
          site.zip_code || '',
          site.pxl_site_reference_number || '',
          site.institution || '',
          site.address || '',
          site.site_personnel_name || '',
          site.site_personnel_email_address || '',
          site.site_personnel_telephone || '',
          site.site_personnel_fax || ''
        ].map(value => {
          // Handle strings with commas by quoting them
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        });
        
        csvRows.push(row.join(','));
      });

      // Create CSV content
      const csvContent = csvRows.join('\n');

      // Create a downloadable blob with the CSV data
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      // Create a temporary link to download the file
      const link = document.createElement('a');
      link.href = url;
      
      // Create a file name with current date
      const date = new Date().toISOString().split('T')[0];
      const projectIdentifier = projectData?.project_number || projectId?.substring(0, 8) || 'all';
      link.download = `labp-site-data-${projectIdentifier}-${date}.csv`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export completed",
        description: `Successfully exported ${selectedLabpSites.length} LABP site records.`,
      });
    } catch (error) {
      console.error("Error exporting CSV:", error);
      toast({
        title: "Export failed",
        description: "Failed to generate CSV file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  return {
    exportLabpSitesToCsv,
    exporting
  };
};
