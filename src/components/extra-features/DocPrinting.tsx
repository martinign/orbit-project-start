
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Filter } from 'lucide-react';
import { useDocPrintingRequests } from './doc-printing/useDocPrintingRequests';
import { DocPrintingRequests } from './doc-printing/DocPrintingRequests';
import { DocPrintingRequestDialog } from './doc-printing/DocPrintingRequestDialog';
import { DocRequest, DocStatus, DocType, NewDocRequest } from './doc-printing/api/docRequestsApi';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DocPrintingProps {
  projectId?: string;
}

export const DocPrinting: React.FC<DocPrintingProps> = ({ projectId }) => {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentRequest, setCurrentRequest] = useState<DocRequest | undefined>(undefined);

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
    statusCounts
  } = useDocPrintingRequests(projectId || '');

  const handleNewRequest = () => {
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

  const handleSubmit = (data: NewDocRequest) => {
    if (currentRequest) {
      updateRequest({ id: currentRequest.id, updates: data });
    } else {
      createRequest(data);
    }
    setIsDialogOpen(false);
  };

  // Filter requests based on active tab
  const filteredRequests = requests.filter(r => 
    activeDocType === 'all' || r.doc_type === activeDocType
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-medium">Document Printing</CardTitle>
          <div className="flex items-center gap-2">
            <Button 
              onClick={handleNewRequest}
              className="bg-blue-500 hover:bg-blue-600 text-white"
              disabled={!projectId}
            >
              <Plus className="h-4 w-4 mr-1" /> New Request
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center justify-between">
            {/* Summary Stats */}
            <div className="flex gap-4">
              <div className="text-sm">
                <span className="text-gray-500">Total: </span>
                <span className="font-medium">{statusCounts.total}</span>
              </div>
              <div className="text-sm">
                <span className="text-yellow-500">Pending: </span>
                <span className="font-medium">{statusCounts.pending}</span>
              </div>
              <div className="text-sm">
                <span className="text-blue-500">Approved: </span>
                <span className="font-medium">{statusCounts.approved}</span>
              </div>
              <div className="text-sm">
                <span className="text-green-500">Completed: </span>
                <span className="font-medium">{statusCounts.completed}</span>
              </div>
            </div>
            
            {/* Filters */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select
                value={activeDocType}
                onValueChange={(value) => setActiveDocType(value as DocType | 'all')}
              >
                <SelectTrigger className="h-8 w-[150px]">
                  <SelectValue placeholder="Document Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="SLB">SLB</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
              
              <Select
                value={filterStatus}
                onValueChange={(value) => setFilterStatus(value as DocStatus | 'all')}
              >
                <SelectTrigger className="h-8 w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <p>Loading document requests...</p>
            </div>
          ) : (
            <DocPrintingRequests
              requests={filteredRequests}
              onEdit={handleEditRequest}
              onDelete={handleDeleteRequest}
              onStatusChange={handleStatusChange}
            />
          )}
        </CardContent>
      </Card>
      
      {!projectId && (
        <div className="bg-yellow-50 text-yellow-800 p-4 rounded-md text-sm">
          Note: For full functionality, please select a project.
        </div>
      )}
      
      {projectId && (
        <DocPrintingRequestDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSubmit={handleSubmit}
          projectId={projectId}
          initialData={currentRequest}
          isSubmitting={false}
        />
      )}
    </div>
  );
};
