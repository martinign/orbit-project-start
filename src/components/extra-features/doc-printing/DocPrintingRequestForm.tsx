
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form } from '@/components/ui/form';
import { DocRequest, DocType, DocRequestType, NewDocRequest } from './api/docRequestsApi';
import { useTeamMembers } from '@/hooks/useTeamMembers';

// Import refactored form components
import { DocTypeSelect } from './form/DocTypeSelect';
import { RequestTypeSelect } from './form/RequestTypeSelect';
import { DocumentTitle } from './form/DocumentTitle';
import { SlbFields } from './form/SlbFields';
import { DeliveryAndAssignment } from './form/DeliveryAndAssignment';
import { VendorSelect } from './form/VendorSelect';
import { DocumentDescription } from './form/DocumentDescription';
import { DueDatePicker } from './form/DueDatePicker';
import { CommentsField } from './form/CommentsField';
import { FormActions } from './form/FormActions';
import { AmountField } from './form/AmountField';
import { FileUploadField } from './form/FileUploadField';
import { supabase } from '@/integrations/supabase/client';
import { createStorageFilePath } from '@/utils/file-utils';

// Define the form schema with Zod
const formSchema = z.object({
  doc_type: z.enum(['SLB', 'general']),
  doc_request_type: z.enum(['printing', 'proposal']),
  doc_title: z.string().min(1, 'Title is required'),
  doc_version: z.string().optional(),
  doc_delivery_address: z.string().optional().nullable(),
  doc_description: z.string().optional().nullable(),
  doc_assigned_to: z.string().optional().nullable(),
  doc_due_date: z.date().optional().nullable(),
  doc_comments: z.string().optional().nullable(),
  doc_process_number_range: z.string().optional().nullable(),
  doc_selected_vendor: z.string().optional().nullable(),
  doc_amount: z.number().int().min(1, 'Amount must be at least 1').default(1),
  doc_file: z.any().optional().nullable(),
  doc_file_name: z.string().optional().nullable(),
  doc_file_type: z.string().optional().nullable(),
  doc_file_size: z.number().optional().nullable()
});

export type FormValues = z.infer<typeof formSchema>;

interface DocPrintingRequestFormProps {
  initialData?: Partial<DocRequest>;
  projectId: string;
  onSubmit: (data: NewDocRequest) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const DocPrintingRequestForm: React.FC<DocPrintingRequestFormProps> = ({
  initialData,
  projectId,
  onSubmit,
  onCancel,
  isSubmitting
}) => {
  const { data: teamMembers, isLoading: isLoadingTeamMembers } = useTeamMembers(projectId);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      doc_type: (initialData?.doc_type as DocType) || 'general',
      doc_request_type: (initialData?.doc_request_type as DocRequestType) || 'printing',
      doc_title: initialData?.doc_title || '',
      doc_version: initialData?.doc_version || '',
      doc_delivery_address: initialData?.doc_delivery_address || null,
      doc_description: initialData?.doc_description || null,
      doc_assigned_to: initialData?.doc_assigned_to || null,
      doc_due_date: initialData?.doc_due_date ? new Date(initialData.doc_due_date) : null,
      doc_comments: initialData?.doc_comments || null,
      doc_process_number_range: initialData?.doc_process_number_range || null,
      doc_selected_vendor: initialData?.doc_selected_vendor || null,
      doc_amount: initialData?.doc_amount || 1,
      doc_file: null,
      doc_file_name: initialData?.doc_file_name || null,
      doc_file_type: initialData?.doc_file_type || null,
      doc_file_size: initialData?.doc_file_size || null
    }
  });

  // Watch the document type to conditionally show fields
  const docType = form.watch('doc_type');

  const handleSubmit = async (values: FormValues) => {
    try {
      let filePath = initialData?.doc_file_path;
      
      // Handle file upload if there's a new file
      if (values.doc_file instanceof File) {
        const { data: sessionData } = await supabase.auth.getSession();
        const userId = sessionData.session?.user.id;
        
        if (!userId) {
          console.error("User not authenticated");
          return;
        }

        // Create a storage path for the file
        filePath = createStorageFilePath(userId, values.doc_file.name);
        
        // Upload the file to storage
        const { error: uploadError } = await supabase.storage
          .from('doc-files')
          .upload(filePath, values.doc_file);
          
        if (uploadError) {
          console.error("Error uploading file:", uploadError);
          return;
        }
      }

      // Ensure all required properties are included for NewDocRequest
      const docRequestData: NewDocRequest = {
        doc_type: values.doc_type,
        doc_request_type: values.doc_request_type,
        doc_title: values.doc_title,
        doc_version: values.doc_version || null,
        doc_delivery_address: values.doc_delivery_address || null,
        doc_description: values.doc_description || null,
        doc_assigned_to: values.doc_assigned_to || null,
        doc_project_id: projectId,
        doc_status: initialData?.doc_status || 'pending',
        // Convert date object to string if it exists
        doc_due_date: values.doc_due_date ? values.doc_due_date.toISOString() : null,
        doc_comments: values.doc_comments || null,
        // Only include process number range if doc_type is SLB
        doc_process_number_range: values.doc_type === 'SLB' ? values.doc_process_number_range || null : null,
        // Add selected vendor
        doc_selected_vendor: values.doc_selected_vendor || null,
        // Add amount field
        doc_amount: values.doc_amount,
        // Add file information
        doc_file_path: filePath || null,
        doc_file_name: values.doc_file_name || null,
        doc_file_type: values.doc_file_type || null,
        doc_file_size: values.doc_file_size || null
      };
      
      onSubmit(docRequestData);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <DocTypeSelect form={form} isSubmitting={isSubmitting} />
          <RequestTypeSelect form={form} isSubmitting={isSubmitting} />
        </div>

        <DocumentTitle form={form} isSubmitting={isSubmitting} docType={docType} />

        {docType === 'SLB' && (
          <SlbFields form={form} isSubmitting={isSubmitting} />
        )}

        <DeliveryAndAssignment 
          form={form} 
          isSubmitting={isSubmitting} 
          teamMembers={teamMembers} 
          isLoadingTeamMembers={isLoadingTeamMembers} 
        />

        <VendorSelect form={form} isSubmitting={isSubmitting} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AmountField form={form} isSubmitting={isSubmitting} />
          <DueDatePicker form={form} isSubmitting={isSubmitting} />
        </div>

        {docType === 'general' && (
          <DocumentDescription form={form} isSubmitting={isSubmitting} />
        )}

        <FileUploadField form={form} isSubmitting={isSubmitting} />

        <CommentsField form={form} isSubmitting={isSubmitting} />

        <FormActions 
          onCancel={onCancel} 
          isSubmitting={isSubmitting} 
          isEdit={!!initialData} 
        />
      </form>
    </Form>
  );
};
