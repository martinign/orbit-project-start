
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  DocRequest, DocType, 
  fetchDocRequests, 
  createDocRequest, 
  updateDocRequest, 
  deleteDocRequest, 
  updateDocRequestStatus,
  NewDocRequest,
  DocStatus
} from './api/docRequestsApi';

export const useDocPrintingRequests = (projectId: string) => {
  const queryClient = useQueryClient();
  const [filterDocType, setFilterDocType] = useState<DocType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<DocStatus | 'all'>('all');

  const queryKey = ['doc-requests', projectId];
  
  // Fetch document requests
  const { data: requests = [], isLoading, error } = useQuery({
    queryKey: queryKey,
    queryFn: () => fetchDocRequests(projectId),
    enabled: !!projectId
  });

  // Filtered requests based on current filters
  const filteredRequests = useCallback(() => {
    if (!requests) return [];
    
    return requests.filter(request => {
      const matchesType = filterDocType === 'all' || request.doc_type === filterDocType;
      const matchesStatus = filterStatus === 'all' || request.doc_status === filterStatus;
      return matchesType && matchesStatus;
    });
  }, [requests, filterDocType, filterStatus]);

  // Create request mutation
  const createMutation = useMutation({
    mutationFn: (newRequest: NewDocRequest) => createDocRequest(newRequest),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => {
      console.error('Error creating doc request:', error);
    }
  });

  // Update request mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<DocRequest> }) => 
      updateDocRequest(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => {
      console.error('Error updating doc request:', error);
    }
  });

  // Delete request mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteDocRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => {
      console.error('Error deleting doc request:', error);
    }
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: DocStatus }) => 
      updateDocRequestStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => {
      console.error('Error updating doc status:', error);
    }
  });

  // Count documents by status
  const statusCounts = useCallback(() => {
    if (!requests) return { pending: 0, approved: 0, completed: 0, cancelled: 0, total: 0 };
    
    const counts = {
      pending: 0,
      approved: 0,
      completed: 0,
      cancelled: 0,
      total: requests.length
    };
    
    requests.forEach(request => {
      if (request.doc_status in counts) {
        counts[request.doc_status as DocStatus]++;
      }
    });
    
    return counts;
  }, [requests]);

  return {
    requests: filteredRequests(),
    isLoading,
    error,
    filterDocType,
    setFilterDocType,
    filterStatus,
    setFilterStatus,
    createRequest: createMutation.mutate,
    updateRequest: updateMutation.mutate,
    deleteRequest: deleteMutation.mutate,
    updateStatus: updateStatusMutation.mutate,
    statusCounts: statusCounts(),
  };
};
