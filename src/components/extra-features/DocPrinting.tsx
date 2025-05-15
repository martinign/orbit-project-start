import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useDocPrintingRequests } from './doc-printing/useDocPrintingRequests';
import { DocPrintingRequestDialog } from './doc-printing/DocPrintingRequestDialog';
import { DocRequest, DocStatus, DocType, NewDocRequest } from './doc-printing/api/docRequestsApi';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { DocPrintingHeader } from './doc-printing/components/DocPrintingHeader';
import { DocPrintingStats } from './doc-printing/components/DocPrintingStats';
import { DocPrintingFilters } from './doc-printing/components/DocPrintingFilters';
import { DocPrintingContent } from './doc-printing/components/DocPrintingContent';
import { ProjectWarning } from './doc-printing/components/ProjectWarning';
import { supabase } from '@/integrations/supabase/client';
import { DocUpdateDialog } from './doc-printing/DocUpdateDialog';
import { DocUpdatesDisplay } from './doc-printing/DocUpdatesDisplay';
import { useDocRequestUpdates } from './doc-printing/hooks/useDocRequestUpdates';

interface DocPrintingProps {
  projectId?: string;
}

export const DocPrinting: React.FC<DocPrintingProps> = ({ projectId }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentRequest, setCurrentRequest] = useState<DocRequest | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  // Set up the active tab for SLB vs General
  const [activeDocType, setActiveDocType] = useState<DocType | 'all'>('all');

  // Updated to also show the updates functionality in the component
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isUpdatesDisplayOpen, setIsUpdatesDisplayOpen] = useState(false);
  const [selectedRequestForUpdates, setSelectedRequestForUpdates] = useState<DocRequest | null>(null);

  // Only proceed if we have a project ID
  const {
    requests,
    isLoading,
    filterDocType,
    setFilterDocType,
    filterStatus,
    setFilterStatus,
    createRequest,
    updateRequest,
    deleteRequest,
    updateStatus,
    statusCounts,
    isAuthenticated
  } = useDocPrintingRequests(projectId || '');

  const handleNewRequest = () => {
    if (!user) {
      toast.error("You must be logged in to create document requests");
      return;
    }
    setCurrentRequest(undefined);
    setIsDialogOpen(true);
  };

  const handleEditRequest = (request: DocRequest) => {
    setCurrentRequest(request);
    setIsDialogOpen(true);
  };

  const handleDeleteRequest = async (request: DocRequest) => {
    // If the request has a file, delete it first
    if (request.doc_file_path) {
      const { error } = await supabase.storage
        .from('doc-files')
        .remove([request.doc_file_path]);
      
      if (error) {
        console.error("Error deleting file:", error);
        toast.error("Could not delete the attached file");
        return;
      }
    }
    
    // Then delete the request
    deleteRequest(request.id);
  };

  const handleStatusChange = (requestId: string, status: DocStatus) => {
    updateStatus({ id: requestId, status });
  };

  const handleSubmit = async (data: NewDocRequest) => {
    if (!projectId) {
      toast.error('No project selected');
      return;
    }
    
    if (!user) {
      toast.error('You must be logged in to submit requests');
      return;
    }
    
    setIsSubmitting(true);
    try {
      if (currentRequest) {
        // If we're updating and there's a new file but an old file exists, delete the old file
        if (data.doc_file_path && 
            currentRequest.doc_file_path && 
            data.doc_file_path !== currentRequest.doc_file_path) {
          await supabase.storage
            .from('doc-files')
            .remove([currentRequest.doc_file_path]);
        }
        
        await updateRequest({ id: currentRequest.id, updates: data });
        setIsDialogOpen(false);
      } else {
        // Add project ID to the data
        const requestWithProject = {
          ...data,
          doc_project_id: projectId
        };
        console.log("Submitting new request:", requestWithProject);
        await createRequest(requestWithProject);
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error(`Error submitting request: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler for adding updates to documents
  const handleAddUpdate = (docRequest: DocRequest) => {
    setSelectedRequestForUpdates(docRequest);
    setIsUpdateDialogOpen(true);
  };
  
  const handleViewUpdates = (docRequest: DocRequest) => {
    setSelectedRequestForUpdates(docRequest);
    setIsUpdatesDisplayOpen(true);
  };

  // Handler to submit an update
  const handleSubmitUpdate = (content: string, file?: File) => {
    if (!selectedRequestForUpdates || !user) return;
    
    // Here we need to use the hook or function to add the update
    // This would be handled by a component using useDocRequestUpdates
    const { addUpdate, isSubmitting: isUpdateSubmitting } = useDocRequestUpdates(selectedRequestForUpdates.id);
    
    addUpdate({ content, file });
    setIsUpdateDialogOpen(false);
  };

  // Filter requests based on active tab
  const filteredRequests = requests.filter(r => 
    activeDocType === 'all' || r.doc_type === activeDocType
  );

  return (
    <div className="space-y-4">
      <Card>
        <DocPrintingHeader 
          onNewRequest={handleNewRequest}
          isDisabled={!projectId || !user}
        />
        <CardContent>
          <div className="mb-4 flex items-center justify-between">
            {/* Summary Stats */}
            <DocPrintingStats statusCounts={statusCounts} />
            
            {/* Filters */}
            <DocPrintingFilters
              activeDocType={activeDocType}
              setActiveDocType={setActiveDocType}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
            />
          </div>
          
          <DocPrintingContent
            isAuthenticated={!!user}
            isLoading={isLoading}
            filteredRequests={filteredRequests}
            onEdit={handleEditRequest}
            onDelete={handleDeleteRequest}
            onStatusChange={handleStatusChange}
            onAddUpdate={handleAddUpdate}
            onViewUpdates={handleViewUpdates}
          />
        </CardContent>
      </Card>
      
      <ProjectWarning hasProject={!!projectId} />
      
      {projectId && user && (
        <DocPrintingRequestDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSubmit={handleSubmit}
          projectId={projectId}
          initialData={currentRequest}
          isSubmitting={isSubmitting}
        />
      )}
      
      {/* Document Update Dialog */}
      {selectedRequestForUpdates && (
        <DocUpdateDialog
          open={isUpdateDialogOpen}
          onClose={() => setIsUpdateDialogOpen(false)}
          docRequestId={selectedRequestForUpdates.id}
          docTitle={selectedRequestForUpdates.doc_title}
          onAddUpdate={handleSubmitUpdate}
          isSubmitting={isSubmitting}
        />
      )}
      
      {/* Document Updates Display */}
      {selectedRequestForUpdates && (
        <DocUpdatesDisplay
          open={isUpdatesDisplayOpen}
          onClose={() => setIsUpdatesDisplayOpen(false)}
          docRequestId={selectedRequestForUpdates.id}
          docTitle={selectedRequestForUpdates.doc_title}
          onMarkViewed={() => {}}
          updates={[]}
          isLoading={false}
        />
      )}
    </div>
  );
};
