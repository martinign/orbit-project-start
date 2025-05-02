
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

// --- Types ---
export type DocRequestType = 'printing' | 'proposal';
export type DocType = 'SLB' | 'general';
export type DocStatus = 'pending' | 'approved' | 'completed' | 'cancelled';

export interface DocRequest {
  id: string;
  doc_project_id: string;
  doc_type: DocType;
  doc_request_type: DocRequestType;
  doc_title: string;
  doc_version?: string | null;
  doc_delivery_address?: string | null;
  doc_description?: string | null;
  doc_assigned_to?: string | null;
  doc_due_date?: string | null;
  doc_comments?: string | null;
  doc_status: DocStatus;
  doc_process_number_range?: string | null;
  doc_selected_vendor?: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

// Modified to explicitly exclude user_id since it will be added by the createDocRequest function
export type NewDocRequest = Omit<
  DocRequest,
  'id' | 'created_at' | 'updated_at' | 'user_id'
>;

// --- API Functions ---

// Function to fetch document requests
export async function fetchDocRequests(projectId: string): Promise<DocRequest[]> {
  const { data, error } = await supabase
    .from('project_doc_requests')
    .select('*')
    .eq('doc_project_id', projectId)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data as DocRequest[];
}

// Function to create a document request
export async function createDocRequest(newRequest: NewDocRequest): Promise<DocRequest> {
  // Get current user session
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !sessionData.session) {
    console.error("Session error:", sessionError);
    throw new Error('Not authenticated');
  }
  
  const userId = sessionData.session.user.id;
  console.log("Creating document request with user ID:", userId);
  console.log("Request data:", newRequest);
  
  // Add user_id to the request data
  const requestWithUserId = {
    ...newRequest,
    user_id: userId
  };

  try {
    const { data, error } = await supabase
      .from('project_doc_requests')
      .insert(requestWithUserId)
      .select('*')
      .single();

    if (error) {
      console.error("Error creating document request:", error);
      throw error;
    }
    
    if (!data) {
      console.error("No data returned from insert operation");
      throw new Error("Failed to create document request - no data returned");
    }
    
    console.log("Document request created successfully:", data);
    return data as DocRequest;
  } catch (error) {
    console.error("Exception during document request creation:", error);
    throw error;
  }
}

// Function to update a document request
export async function updateDocRequest(id: string, updates: Partial<DocRequest>): Promise<DocRequest> {
  const { data, error } = await supabase
    .from('project_doc_requests')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return data as DocRequest;
}

// Function to delete a document request
export async function deleteDocRequest(id: string): Promise<void> {
  const { error } = await supabase
    .from('project_doc_requests')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Function to update document request status
export async function updateDocRequestStatus(id: string, status: DocStatus): Promise<DocRequest> {
  return updateDocRequest(id, { doc_status: status });
}

// --- Hooks ---

// Hook to fetch document requests
export function useDocRequests(projectId: string) {
  return useQuery({
    queryKey: ["project_doc_requests", projectId],
    queryFn: () => fetchDocRequests(projectId),
    enabled: !!projectId
  });
}

// Hook to create a new document request
export function useCreateDocRequest(projectId: string) {
  const { user } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newReq: NewDocRequest) => {
      if (!user) throw new Error('Not authenticated');

      const payload = {
        ...newReq,
        doc_project_id: projectId,
        doc_process_number_range:
          newReq.doc_type === 'SLB' ? newReq.doc_process_number_range : null,
      };

      // createDocRequest will add the user_id
      return createDocRequest(payload);
    },
    onSuccess() {
      toast.toast({
        title: "Success",
        description: "Document request created successfully"
      });
      queryClient.invalidateQueries({ queryKey: ["project_doc_requests", projectId] });
      queryClient.invalidateQueries({ queryKey: ["new_items_count", projectId] });
    },
    onError(err) {
      toast.toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to create request: ${err instanceof Error ? err.message : String(err)}`
      });
    },
  });
}

// Hook to update a document request
export function useUpdateDocRequest(projectId: string) {
  const toast = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DocRequest> & { id: string }) => {
      const payload = {
        ...updates,
        doc_process_number_range:
          updates.doc_type && updates.doc_type !== 'SLB'
            ? null
            : updates.doc_process_number_range,
      };

      const { data, error } = await supabase
        .from('project_doc_requests')
        .update(payload)
        .eq('id', id)
        .select('*')
        .single();

      if (error) throw error;
      return data as DocRequest;
    },
    onSuccess() {
      toast.toast({
        title: "Success",
        description: "Document request updated successfully"
      });
      queryClient.invalidateQueries({ queryKey: ["project_doc_requests", projectId] });
    },
    onError(err) {
      toast.toast({
        variant: "destructive",
        title: "Error",
        description: `Update failed: ${err instanceof Error ? err.message : String(err)}`
      });
    },
  });
}

// Hook to delete a document request
export function useDeleteDocRequest(projectId: string) {
  const toast = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('project_doc_requests')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess() {
      toast.toast({
        title: "Success",
        description: "Document request deleted successfully"
      });
      queryClient.invalidateQueries({ queryKey: ["project_doc_requests", projectId] });
      queryClient.invalidateQueries({ queryKey: ["new_items_count", projectId] });
    },
    onError(err) {
      toast.toast({
        variant: "destructive",
        title: "Error",
        description: `Delete failed: ${err instanceof Error ? err.message : String(err)}`
      });
    },
  });
}
