
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SiteData, useSiteInitiationData, isEligibleForStarterPack } from '@/hooks/useSiteInitiationData';
import { FileUp, AlertCircle, CheckCircle, Download, RefreshCw, XCircle, InfoIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SiteInitiationCSVUploaderProps {
  projectId?: string;
}

interface ValidationResult {
  isValid: boolean;
  missingFields: string[];
}

export const SiteInitiationCSVUploader: React.FC<SiteInitiationCSVUploaderProps> = ({ projectId }) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<SiteData[]>([]);
  const [processing, setProcessing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { processCSVData } = useSiteInitiationData(projectId);

  // Validate required fields in CSV data
  const validateRecord = (record: any): ValidationResult => {
    const requiredFields = ['pxl_site_reference_number', 'site_personnel_name', 'role'];
    const missingFields = requiredFields.filter(field => !record[field]);
    
    return {
      isValid: missingFields.length === 0,
      missingFields
    };
  };

  // Map CSV columns to database fields
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

  // Handle CSV file drop
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setParseError(null);
    setParsedData([]);
    
    const file = acceptedFiles[0];
    if (!file) return;

    setFile(file);
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setParseError(`CSV parsing error: ${results.errors[0].message}`);
          return;
        }
        
        try {
          const mappedData = mapCSVToSiteData(results.data as any[]);
          
          // Validate all records
          const invalidRecords = mappedData.filter(record => {
            const validation = validateRecord(record);
            return !validation.isValid;
          });
          
          if (invalidRecords.length > 0) {
            setParseError(`Found ${invalidRecords.length} records with missing required fields. Please check your CSV file.`);
            return;
          }
          
          setParsedData(mappedData);
          toast({
            title: "CSV file parsed successfully",
            description: `Found ${mappedData.length} records ready to be imported.`,
          });
        } catch (error) {
          setParseError(`Error processing CSV data: ${(error as Error).message}`);
        }
      },
      error: (error) => {
        setParseError(`Error reading CSV file: ${error.message}`);
      }
    });
  }, [projectId]);

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
    if (!parsedData.length || !projectId) return;
    
    setProcessing(true);
    setUploadProgress(0);
    
    try {
      const batchSize = 10;
      const totalBatches = Math.ceil(parsedData.length / batchSize);
      
      let processedCount = 0;
      
      for (let i = 0; i < parsedData.length; i += batchSize) {
        const batch = parsedData.slice(i, i + batchSize);
        await processCSVData(batch);
        
        processedCount += batch.length;
        setUploadProgress(Math.floor((processedCount / parsedData.length) * 100));
        
        // Small delay to prevent overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      toast({
        title: "CSV import completed",
        description: `Successfully processed ${parsedData.length} records.`,
      });
      
      // Reset the state
      setFile(null);
      setParsedData([]);
    } catch (error) {
      toast({
        title: "Error processing CSV data",
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
    setParsedData([]);
    setParseError(null);
    setUploadProgress(0);
  };
  
  // Generate a template CSV file for download
  const handleDownloadTemplate = () => {
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
  };

  // Calculate statistics about the import data
  const getImportStatistics = () => {
    if (!parsedData.length) return null;
    
    const labpSites = parsedData.filter(site => site.role === 'LABP');
    const starterPacksInData = parsedData.filter(site => site.starter_pack).length;
    
    return {
      totalSites: parsedData.length,
      labpSites: labpSites.length,
      eligibleWithStarterPack: labpSites.filter(site => site.starter_pack).length,
      ineligibleWithStarterPack: starterPacksInData - labpSites.filter(site => site.starter_pack).length,
    };
  };

  const stats = getImportStatistics();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>CSV Site Import</span>
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
          Upload a CSV file with site information to import into the tracker.
          <div className="mt-1 flex items-center text-amber-600">
            <AlertCircle className="h-4 w-4 mr-1" />
            <span className="text-xs">Starter packs are only applicable to LABP roles</span>
          </div>
        </CardDescription>
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
                : 'Drag and drop a CSV file here, or click to select'}
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
            ) : parsedData.length > 0 ? (
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-md flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-800">CSV Validated Successfully</p>
                    <p className="text-sm text-green-700">
                      Found {parsedData.length} records ready to be imported.
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
                      <li>Total sites: {stats.totalSites}</li>
                      <li>LABP sites (eligible for starter packs): {stats.labpSites}</li>
                      <li>LABP sites with starter packs: {stats.eligibleWithStarterPack}</li>
                      {stats.ineligibleWithStarterPack > 0 && (
                        <li className="text-amber-600 font-medium">
                          Note: {stats.ineligibleWithStarterPack} non-LABP sites had starter packs marked. 
                          These will be imported with starter pack set to false.
                        </li>
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
          disabled={!parsedData.length || processing || !projectId}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          {processing ? 'Processing...' : 'Import Data'}
        </Button>
      </CardFooter>
    </Card>
  );
};
