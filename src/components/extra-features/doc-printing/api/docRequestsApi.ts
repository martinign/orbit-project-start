
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Define types
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
  profiles?: any; // To accommodate the join with profiles table
}

export type NewDocRequest = Omit<DocRequest, 'id' | 'created_at' | 'updated_at' | 'user_id'>;

// Fetch document requests for a project
export const fetchDocRequests = async (projectId: string) => {
  const { data: requests, error } = await supabase
    .from('project_doc_requests')
    .select('*, profiles!doc_assigned_to(full_name)')
    .eq('doc_project_id', projectId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching document requests:', error);
    toast.error('Failed to load document requests');
    throw error;
  }

  return requests as unknown as DocRequest[];
};

// Create a new document request
export const createDocRequest = async (request: NewDocRequest) => {
  const { user } = useAuth();
  
  if (!user) {
    const error = new Error('User not authenticated');
    toast.error('You must be logged in to create requests');
    throw error;
  }

  // Only include doc_process_number_range if doc_type is SLB
  const requestData = {
    ...request,
    user_id: user.id,
    // If it's not an SLB type document, set process number range to null
    doc_process_number_range: request.doc_type === 'SLB' ? request.doc_process_number_range : null
  };

  const { data, error } = await supabase
    .from('project_doc_requests')
    .insert(requestData)
    .select('*')
    .single();

  if (error) {
    console.error('Error creating document request:', error);
    toast.error('Failed to create request');
    throw error;
  }

  toast.success('Document request created successfully');
  return data as DocRequest;
};

// Update an existing document request
export const updateDocRequest = async (id: string, updates: Partial<DocRequest>) => {
  // Only include doc_process_number_range in the update if doc_type is SLB
  const updateData = { ...updates };
  
  // If doc type is being changed and not to SLB, remove process number range
  if (updates.doc_type && updates.doc_type !== 'SLB') {
    updateData.doc_process_number_range = null;
  }

  const { data, error } = await supabase
    .from('project_doc_requests')
    .update(updateData)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    console.error('Error updating document request:', error);
    toast.error('Failed to update request');
    throw error;
  }

  toast.success('Document request updated successfully');
  return data as DocRequest;
};

// Delete a document request
export const deleteDocRequest = async (id: string) => {
  const { error } = await supabase
    .from('project_doc_requests')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting document request:', error);
    toast.error('Failed to delete request');
    throw error;
  }

  toast.success('Document request deleted successfully');
  return true;
};

// Update document request status
export const updateDocRequestStatus = async (id: string, status: DocStatus) => {
  return updateDocRequest(id, { doc_status: status });
};
