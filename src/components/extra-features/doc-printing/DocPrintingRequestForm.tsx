
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { DocRequest, DocType, DocRequestType, NewDocRequest } from './api/docRequestsApi';

// Define the form schema with Zod
const formSchema = z.object({
  doc_type: z.enum(['SLB', 'general']),
  doc_request_type: z.enum(['printing', 'proposal']),
  doc_title: z.string().min(1, 'Title is required'),
  doc_version: z.string().optional(),
  doc_delivery_address: z.string().optional(),
  doc_description: z.string().optional(),
  doc_assigned_to: z.string().optional().nullable(),
  doc_due_date: z.date().optional().nullable(),
  doc_comments: z.string().optional(),
  doc_process_number_range: z.string().optional(),
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
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      doc_type: (initialData?.doc_type as DocType) || 'general',
      doc_request_type: (initialData?.doc_request_type as DocRequestType) || 'printing',
      doc_title: initialData?.doc_title || '',
      doc_version: initialData?.doc_version || '',
      doc_delivery_address: initialData?.doc_delivery_address || '',
      doc_description: initialData?.doc_description || '',
      doc_assigned_to: initialData?.doc_assigned_to || null,
      doc_due_date: initialData?.doc_due_date ? new Date(initialData.doc_due_date) : null,
      doc_comments: initialData?.doc_comments || '',
      doc_process_number_range: initialData?.doc_process_number_range || '',
    }
  });

  // Watch the document type to conditionally show fields
  const docType = form.watch('doc_type');

  const handleSubmit = (values: FormValues) => {
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
    };
    
    onSubmit(docRequestData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="doc_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Document Type</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="SLB">Subject Laboratory Booklet</SelectItem>
                    <SelectItem value="general">General Document</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="doc_request_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Request Type</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select request type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="printing">Printing</SelectItem>
                    <SelectItem value="proposal">Proposal</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="doc_title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {docType === 'SLB' ? 'SLB Name' : 'Document Title'}
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder={docType === 'SLB' ? 'Enter SLB name' : 'Enter document title'} 
                  {...field} 
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {docType === 'SLB' && (
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="doc_version"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SLB Version</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter SLB version" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="doc_process_number_range"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Process Number Range</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 1-100" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        <FormField
          control={form.control}
          name="doc_delivery_address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Delivery Address</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value || ''}
                disabled={isSubmitting}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select delivery address" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="EUDC">EUDC</SelectItem>
                  <SelectItem value="NADC">NADC</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {docType === 'general' && (
          <FormField
            control={form.control}
            name="doc_description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Document Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Enter document description" 
                    className="min-h-24" 
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="doc_due_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Due Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                      disabled={isSubmitting}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value || undefined}
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="doc_comments"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comments</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Add any additional comments" 
                  className="min-h-24" 
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : initialData ? 'Update Request' : 'Create Request'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
