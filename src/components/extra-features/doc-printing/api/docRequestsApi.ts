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
  user_id: string;
  created_at: string;
  updated_at: string;
}

export type NewDocRequest = Omit<
  DocRequest,
  'id' | 'created_at' | 'updated_at' | 'user_id'
>;

// --- Hook to fetch document requests ---
export function useDocRequests(projectId: string) {
  return useQuery<DocRequest[], Error>(
    ["project_doc_requests", projectId],
    async () => {
      const { data, error } = await supabase
        .from('project_doc_requests')
        .select('*')
        .eq('doc_project_id', projectId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data as DocRequest[];
    }
  );
}

// --- Hook to create a new document request ---
export function useCreateDocRequest(projectId: string) {
  const { user } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();

  return useMutation<DocRequest, Error, NewDocRequest>(
    async (newReq) => {
      if (!user) throw new Error('Not authenticated');

      const payload = {
        ...newReq,
        doc_project_id: projectId,
        user_id: user.id,
        doc_process_number_range:
          newReq.doc_type === 'SLB' ? newReq.doc_process_number_range : null,
      };

      const { data, error } = await supabase
        .from('project_doc_requests')
        .insert(payload)
        .select('*')
        .single();

      if (error) throw error;
      return data as DocRequest;
    },
    {
      onSuccess() {
        toast.success('Document request created');
        queryClient.invalidateQueries(["project_doc_requests", projectId]);
        queryClient.invalidateQueries(["new_items_count", projectId]);
      },
      onError(err) {
        toast.error('Create failed: ' + err.message);
      },
    }
  );
}

// --- Hook to update a document request ---
export function useUpdateDocRequest(projectId: string) {
  const toast = useToast();
  const queryClient = useQueryClient();

  return useMutation<DocRequest, Error, Partial<DocRequest> & { id: string }>(
    async ({ id, ...updates }) => {
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
    {
      onSuccess() {
        toast.success('Document request updated');
        queryClient.invalidateQueries(["project_doc_requests", projectId]);
      },
      onError(err) {
        toast.error('Update failed: ' + err.message);
      },
    }
  );
}

// --- Hook to delete a document request ---
export function useDeleteDocRequest(projectId: string) {
  const toast = useToast();
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>(
    async (id) => {
      const { error } = await supabase
        .from('project_doc_requests')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    {
      onSuccess() {
        toast.success('Document request deleted');
        queryClient.invalidateQueries(["project_doc_requests", projectId]);
        queryClient.invalidateQueries(["new_items_count", projectId]);
      },
      onError(err) {
        toast.error('Delete failed: ' + err.message);
      },
    }
  );
}
