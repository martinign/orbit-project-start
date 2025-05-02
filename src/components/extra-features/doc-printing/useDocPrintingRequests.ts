
import { useState, useCallback, useEffect } from 'react';
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
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export const useDocPrintingRequests = (projectId: string) => {
  const queryClient = useQueryClient();
  const [filterDocType, setFilterDocType] = useState<DocType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<DocStatus | 'all'>('all');
  const { user } = useAuth();

  const queryKey = ['doc-requests', projectId];
  
  // Fetch document requests
  const { data: requests = [], isLoading, error } = useQuery({
    queryKey: queryKey,
    queryFn: () => fetchDocRequests(projectId),
    enabled: !!projectId
  });

  // Realtime subscription for document requests
  useRealtimeSubscription({
    table: 'project_doc_requests',
    filter: 'doc_project_id',
    filterValue: projectId,
    onRecordChange: (payload) => {
      console.log('Realtime update for doc requests:', payload);
      queryClient.invalidateQueries({ queryKey });
    }
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
    mutationFn: async (newRequest: NewDocRequest) => {
      console.log("Submitting new doc request with data:", newRequest);
      if (!user) {
        throw new Error("You must be logged in to create requests");
      }
      return await createDocRequest(newRequest);
    },
    onSuccess: (data) => {
      console.log("Document request created successfully:", data);
      queryClient.invalidateQueries({ queryKey });
    }
  });

  // Update request mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<DocRequest> }) => 
      updateDocRequest(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    }
  });

  // Delete request mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteDocRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    }
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: DocStatus }) => 
      updateDocRequestStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
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
    isAuthenticated: !!user,
  };
};
