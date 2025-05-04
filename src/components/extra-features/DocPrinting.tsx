
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

  const handleDeleteRequest = (request: DocRequest) => {
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
    </div>
  );
};
