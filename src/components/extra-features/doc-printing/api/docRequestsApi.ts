
import { supabase } from "@/integrations/supabase/client";
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
}

export type NewDocRequest = Omit<DocRequest, 'id' | 'created_at' | 'updated_at' | 'user_id'>;

// Fetch document requests for a project
export const fetchDocRequests = async (projectId: string) => {
  // Explicitly specify the table name for each column to avoid ambiguity
  const { data: requests, error } = await supabase
    .from('project_doc_requests')
    .select('*')
    .eq('doc_project_id', projectId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching document requests:', error);
    toast.error('Failed to load document requests');
    throw error;
  }

  console.log("Fetched document requests:", requests);
  return requests as unknown as DocRequest[];
};

// Create a new document request
export const createDocRequest = async (request: NewDocRequest) => {
  console.log("Creating document request with data:", request);
  
  try {
    // Get the current user's ID from the session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.error("No authenticated user found");
      const error = new Error('User not authenticated');
      toast.error('You must be logged in to create requests');
      throw error;
    }

    const userId = session.user.id;
    console.log("Current user ID:", userId);
    
    // Only include doc_process_number_range if doc_type is SLB
    const requestData = {
      ...request,
      user_id: userId,
      // If it's not an SLB type document, set process number range to null
      doc_process_number_range: request.doc_type === 'SLB' ? request.doc_process_number_range : null
    };

    console.log("Sending data to Supabase:", requestData);

    const { data, error } = await supabase
      .from('project_doc_requests')
      .insert(requestData)
      .select('*')
      .single();

    if (error) {
      console.error('Error creating document request:', error);
      toast.error('Failed to create request: ' + error.message);
      throw error;
    }

    console.log("Document request created successfully:", data);
    return data as DocRequest;
  } catch (error: any) {
    console.error("Error in createDocRequest:", error);
    toast.error('Error: ' + (error.message || 'Failed to create request'));
    throw error;
  }
};

// Update an existing document request
export const updateDocRequest = async (id: string, updates: Partial<DocRequest>) => {
  try {
    console.log("Updating document request:", id, updates);
    
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
      toast.error('Failed to update request: ' + error.message);
      throw error;
    }

    console.log("Document request updated successfully:", data);
    return data as DocRequest;
  } catch (error: any) {
    console.error("Error in updateDocRequest:", error);
    toast.error('Error: ' + (error.message || 'Failed to update request'));
    throw error;
  }
};

// Delete a document request
export const deleteDocRequest = async (id: string) => {
  try {
    console.log("Deleting document request:", id);
    
    const { error } = await supabase
      .from('project_doc_requests')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting document request:', error);
      toast.error('Failed to delete request: ' + error.message);
      throw error;
    }

    console.log("Document request deleted successfully");
    return true;
  } catch (error: any) {
    console.error("Error in deleteDocRequest:", error);
    toast.error('Error: ' + (error.message || 'Failed to delete request'));
    throw error;
  }
};

// Update document request status
export const updateDocRequestStatus = async (id: string, status: DocStatus) => {
  return updateDocRequest(id, { doc_status: status });
};
