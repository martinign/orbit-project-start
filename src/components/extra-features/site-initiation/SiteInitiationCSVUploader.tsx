import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  SiteData, 
  useSiteInitiationData, 
  isEligibleForStarterPack 
} from '@/hooks/useSiteInitiationData';
import { useCraCsvImport, CRAData, CRAOperationsResult } from '@/hooks/site-initiation/useCraCsvImport';
import { FileUp, AlertCircle, CheckCircle, Download, RefreshCw, XCircle, InfoIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';

interface SiteInitiationCSVUploaderProps {
  projectId?: string;
}

interface ValidationResult {
  isValid: boolean;
  missingFields: string[];
}

type ImportType = 'site-data' | 'cra-list';

export const SiteInitiationCSVUploader: React.FC<SiteInitiationCSVUploaderProps> = ({ projectId }) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedSiteData, setParsedSiteData] = useState<SiteData[]>([]);
  const [parsedCRAData, setParsedCRAData] = useState<CRAData[]>([]);
  const [processing, setProcessing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [importType, setImportType] = useState<ImportType>('site-data');
  const { user } = useAuth(); // Get current user
  
  const { processCSVData } = useSiteInitiationData(projectId);
  const { processCRACSVData } = useCraCsvImport(projectId, user?.id); // Pass user ID to the hook

  // Validate required fields in CSV data
  const validateSiteRecord = (record: any): ValidationResult => {
    const requiredFields = ['pxl_site_reference_number', 'site_personnel_name', 'role'];
    const missingFields = requiredFields.filter(field => !record[field]);
    
    return {
      isValid: missingFields.length === 0,
      missingFields
    };
  };

  // Process CSV data with upsert logic
  const processCRACSVDataInternal = async (records: CRAData[]): Promise<CRAOperationsResult> => {
    if (!user?.id) {
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
      user_id: user?.id,
      created_by: user?.id,
      created_date: new Date().toISOString()
    }));

    let successCount = 0;
    let errorCount = 0;

    try {
      setProcessing(true);
      
      console.log('Processed records before import:', JSON.stringify(processedRecords, null, 2));
      
      const result = await processCRACSVData(processedRecords);
      
      if (result.error > 0) {
        console.error('Some records failed to import');
        toast({
          title: "Import Partially Successful",
          description: `Imported ${result.success} records. ${result.error} records failed.`,
          variant: "default"
        });
      } else {
        toast({
          title: "Import Successful",
          description: `Successfully imported ${result.success} records.`,
        });
      }

      return result;
    } catch (error) {
      console.error('Error in CRA import:', error);
      toast({
        title: "Import Failed",
        description: "Failed to import CRA data. Please check the console for details.",
        variant: "destructive"
      });
      return { success: 0, error: processedRecords.length };
    }
  };

  // Validate CRA records
  const validateCRARecords = (records: any[]): CRAData[] => {
    return records.map(record => {
      // Map CSV fields to CRA data structure
      return {
        full_name: record['Full Name'] || record['full_name'] || `${record['First Name'] || record['first_name']} ${record['Last Name'] || record['last_name']}`,
        first_name: record['First Name'] || record['first_name'] || '',
        last_name: record['Last Name'] || record['last_name'] || '',
        study_site: record['Study Site'] || record['study_site'] || record['Site'] || '',
        status: record['Status'] || record['status'] || 'active',
        email: record['Email'] || record['email'] || record['Email Address'] || '',
        study_country: record['Study Country'] || record['study_country'] || record['Country'] || '',
        study_team_role: record['Study Team Role'] || record['study_team_role'] || record['Role'] || '',
        user_type: record['User Type'] || record['user_type'] || '',
        user_reference: record['User Reference'] || record['user_reference'] || '',
        project_id: projectId || ''
      };
    });
  };

  // Handle CSV file drop with improved error handling
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setParseError(null);
    setParsedSiteData([]);
    setParsedCRAData([]);
    
    const file = acceptedFiles[0];
    if (!file) return;

    setFile(file);
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          console.error('CSV parsing errors:', results.errors);
          setParseError(`CSV parsing error: ${results.errors[0].message}`);
          return;
        }
        
        try {
          console.log('Raw parsed data:', results.data);
          
          if (importType === 'site-data') {
            const mappedData = mapCSVToSiteData(results.data as any[]);
            
            // Validate all records
            const invalidRecords = mappedData.filter(record => {
              const validation = validateSiteRecord(record);
              return !validation.isValid;
            });
            
            if (invalidRecords.length > 0) {
              setParseError(`Found ${invalidRecords.length} records with missing required fields. Please check your CSV file.`);
              return;
            }
            
            setParsedSiteData(mappedData);
            toast({
              title: "Site data CSV file parsed successfully",
              description: `Found ${mappedData.length} records ready to be imported.`,
            });
          } else {
            // Handle CRA list data
            const validatedRecords = validateCRARecords(results.data as any[]);
            console.log('Validated CRA records:', validatedRecords);
            
            // Validate all records
            const invalidRecords = validatedRecords.filter(record => {
              return !record.full_name || !record.first_name || !record.last_name;
            });
            
            if (invalidRecords.length > 0) {
              setParseError(`Found ${invalidRecords.length} records with missing required fields (full name, first name, or last name). Please check your CSV file.`);
              return;
            }
            
            setParsedCRAData(validatedRecords);
            toast({
              title: "CRA list CSV file parsed successfully",
              description: `Found ${validatedRecords.length} records ready to be imported.`,
            });
          }
        } catch (error) {
          console.error('Error processing CSV data:', error);
          setParseError(`Error processing CSV data: ${(error as Error).message}`);
        }
      },
      error: (error) => {
        console.error('Error reading CSV file:', error);
        setParseError(`Error reading CSV file: ${error.message}`);
      }
    });
  }, [projectId, importType]);

  // Map CSV columns to site data fields
  const mapCSVToSiteData = (csvData: any[]): SiteData[] => {
    return csvData.map(row => {
      const mappedData = {
        pxl_site_reference_number: row['PXL Site Reference Number'] || row['pxl_site_reference_number'] || '',
        pi_name: row['PI Name'] || row['pi_name'] || '',
        site_personnel_name: row['Site Personnel Name'] || row['site_personnel_name'] || '',
        role: row['Role'] || row['role'] || '',
        site_personnel_email_address: row['Site Personnel Email Address'] || row['site_personnel_email_address'] || '',
        site_personnel_telephone: row['Site Personnel Telephone'] || row['site_personnel_telephone'] || '',
        site_personnel_fax: row['Site Personnel Fax'] || row['site_personnel_fax'] || '',
        institution: row['Institution'] || row['institution'] || '',
        address: row['Address'] || row['address'] || '',
        city_town: row['City/Town'] || row['city_town'] || '',
        province_state: row['Province/State'] || row['province_state'] || '',
        zip_code: row['Zip Code'] || row['zip_code'] || '',
        country: row['Country'] || row['country'] || '',
        project_id: projectId || '',
      };
      
      // Only set starter_pack to true if role is LABP and starter pack column exists and is true
      const starterPack = row['Starter Pack'] || row['starter_pack'] || '';
      const isStarterPackTrue = typeof starterPack === 'string'
        ? starterPack.toLowerCase() === 'yes' || starterPack.toLowerCase() === 'true'
        : Boolean(starterPack);
        
      return {
        ...mappedData,
        starter_pack: mappedData.role === 'LABP' && isStarterPackTrue
      };
    });
  };

  // Configure dropzone
  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv']
    },
    maxFiles: 1,
  });
  
  // Process the uploaded data
  const handleUpload = async () => {
    if (!projectId || !user?.id) {
      toast({
        title: "Authentication error",
        description: "You must be logged in to import data.",
        variant: "destructive",
      });
      return;
    }
    
    if (importType === 'site-data' && !parsedSiteData.length) return;
    if (importType === 'cra-list' && !parsedCRAData.length) return;
    
    setProcessing(true);
    setUploadProgress(0);
    
    try {
      if (importType === 'site-data') {
        const batchSize = 10;
        const totalBatches = Math.ceil(parsedSiteData.length / batchSize);
        
        let processedCount = 0;
        
        for (let i = 0; i < parsedSiteData.length; i += batchSize) {
          const batch = parsedSiteData.slice(i, i + batchSize);
          await processCSVData(batch);
          
          processedCount += batch.length;
          setUploadProgress(Math.floor((processedCount / parsedSiteData.length) * 100));
          
          // Small delay to prevent overwhelming the database
          await new Promise(resolve => setTimeout(resolve, 300));
        }
        
        toast({
          title: "Site data CSV import completed",
          description: `Successfully processed ${parsedSiteData.length} records.`,
        });
      } else {
        // Process CRA list data with improved error handling
        console.log('Starting CRA import with data:', parsedCRAData);
        
        const result = await processCRACSVDataInternal(parsedCRAData);
        console.log('CRA import result:', result);
        
        setUploadProgress(100);
      }
      
      // Reset the state
      setFile(null);
      setParsedSiteData([]);
      setParsedCRAData([]);
    } catch (error) {
      console.error(`Error processing ${importType} data:`, error);
      toast({
        title: `Error processing ${importType === 'site-data' ? 'site data' : 'CRA list'} CSV data`,
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
      setUploadProgress(0);
    }
  };

  // Reset the form
  const handleReset = () => {
    setFile(null);
    setParsedSiteData([]);
    setParsedCRAData([]);
    setParseError(null);
    setUploadProgress(0);
  };
  
  // Generate a template CSV file for download
  const handleDownloadTemplate = () => {
    if (importType === 'site-data') {
      const csvHeader = 'Country,PXL Site Reference Number,PI Name,Site Personnel Name,Role,Site Personnel Email Address,Site Personnel Telephone,Site Personnel Fax,Institution,Address,City/Town,Province/State,Zip Code,Starter Pack\n';
      const csvRow1 = 'Canada,PXL-123,Dr. John Doe,Jane Smith,LABP,jane@example.com,555-123-4567,555-123-4568,General Hospital,123 Main St,Toronto,Ontario,M5V 2K7,Yes\n';
      const csvRow2 = 'USA,PXL-124,Dr. Sarah Brown,Mike Johnson,CRA,mike@example.com,555-987-6543,555-987-6544,Research Center,456 Oak Ave,Boston,Massachusetts,02108,No\n';
      
      const blob = new Blob([csvHeader + csvRow1 + csvRow2], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'site_initiation_template.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const csvHeader = 'Full Name,First Name,Last Name,Study Site,Status,Email,Study Country,Study Team Role,User Type,User Reference\n';
      const csvRow1 = 'John Doe,John,Doe,Montreal General Hospital,active,john.doe@example.com,Canada,CRA,External,CRA-001\n';
      const csvRow2 = 'Jane Smith,Jane,Smith,Boston Medical Center,active,jane.smith@example.com,USA,CRA,Internal,CRA-002\n';
      
      const blob = new Blob([csvHeader + csvRow1 + csvRow2], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'cra_list_template.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Calculate statistics about the import data
  const getImportStatistics = () => {
    if (importType === 'site-data' && parsedSiteData.length) {
      const labpSites = parsedSiteData.filter(site => site.role === 'LABP');
      const starterPacksInData = parsedSiteData.filter(site => site.starter_pack).length;
      
      return {
        totalSites: parsedSiteData.length,
        labpSites: labpSites.length,
        eligibleWithStarterPack: labpSites.filter(site => site.starter_pack).length,
        ineligibleWithStarterPack: starterPacksInData - labpSites.filter(site => site.starter_pack).length,
      };
    } else if (importType === 'cra-list' && parsedCRAData.length) {
      return {
        totalCRAs: parsedCRAData.length,
        activeCRAs: parsedCRAData.filter(cra => cra.status === 'active').length,
        inactiveCRAs: parsedCRAData.filter(cra => cra.status === 'inactive').length,
        withEmail: parsedCRAData.filter(cra => !!cra.email).length,
        withoutEmail: parsedCRAData.filter(cra => !cra.email).length,
      };
    }
    
    return null;
  };

  const stats = getImportStatistics();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>CSV Import</span>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={handleDownloadTemplate}
          >
            <Download className="h-4 w-4" /> Download Template
          </Button>
        </CardTitle>
        <CardDescription>
          Upload a CSV file with {importType === 'site-data' ? 'site information' : 'CRA information'} to import into the tracker.
        </CardDescription>
        
        <Tabs 
          value={importType} 
          onValueChange={(value) => {
            setImportType(value as ImportType);
            handleReset();
          }}
          className="mt-2"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="site-data">Site Data</TabsTrigger>
            <TabsTrigger value="cra-list">CRA List</TabsTrigger>
          </TabsList>
        </Tabs>
        
        {importType === 'site-data' && (
          <div className="mt-1 flex items-center text-amber-600">
            <AlertCircle className="h-4 w-4 mr-1" />
            <span className="text-xs">Starter packs are only applicable to LABP roles</span>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {!file ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/30'
            } ${isDragReject ? 'border-red-500 bg-red-50' : ''}`}
          >
            <input {...getInputProps()} />
            <FileUp className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm font-medium">
              {isDragActive
                ? 'Drop the CSV file here...'
                : `Drag and drop a ${importType === 'site-data' ? 'site data' : 'CRA list'} CSV file here, or click to select`}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Only .csv files are accepted
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-blue-600 bg-blue-50">CSV</Badge>
                <span className="font-medium">{file.name}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleReset}>
                <XCircle className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
            
            {parseError ? (
              <div className="bg-red-50 p-4 rounded-md flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <p className="font-medium text-red-800">Error parsing CSV</p>
                  <p className="text-sm text-red-700">{parseError}</p>
                </div>
              </div>
            ) : (importType === 'site-data' && parsedSiteData.length > 0) || (importType === 'cra-list' && parsedCRAData.length > 0) ? (
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-md flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-800">CSV Validated Successfully</p>
                    <p className="text-sm text-green-700">
                      Found {importType === 'site-data' ? parsedSiteData.length : parsedCRAData.length} records ready to be imported.
                    </p>
                  </div>
                </div>
                
                {stats && (
                  <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-md">
                    <h3 className="text-sm font-semibold mb-2 flex items-center">
                      <InfoIcon className="h-4 w-4 mr-1 text-blue-500" />
                      Import Statistics
                    </h3>
                    <ul className="text-xs space-y-1 text-blue-800">
                      {importType === 'site-data' ? (
                        <>
                          <li>Total sites: {stats.totalSites}</li>
                          <li>LABP sites (eligible for starter packs): {stats.labpSites}</li>
                          <li>LABP sites with starter packs: {stats.eligibleWithStarterPack}</li>
                          {stats.ineligibleWithStarterPack > 0 && (
                            <li className="text-amber-600 font-medium">
                              Note: {stats.ineligibleWithStarterPack} non-LABP sites had starter packs marked. 
                              These will be imported with starter pack set to false.
                            </li>
                          )}
                        </>
                      ) : (
                        <>
                          <li>Total CRAs: {stats.totalCRAs}</li>
                          <li>Active CRAs: {stats.activeCRAs}</li>
                          <li>Inactive CRAs: {stats.inactiveCRAs}</li>
                          <li>CRAs with email: {stats.withEmail}</li>
                          <li>CRAs without email: {stats.withoutEmail}</li>
                        </>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex justify-center">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}
            
            {processing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Processing...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-end gap-2">
        <Button 
          variant="outline" 
          onClick={handleReset}
          disabled={!file || processing}
        >
          Cancel
        </Button>
        <Button
          onClick={handleUpload}
          disabled={
            (importType === 'site-data' && !parsedSiteData.length) || 
            (importType === 'cra-list' && !parsedCRAData.length) || 
            processing || 
            !projectId
          }
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          {processing ? 'Processing...' : 'Import Data'}
        </Button>
      </CardFooter>
    </Card>
  );
};
