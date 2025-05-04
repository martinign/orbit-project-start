
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { FormValues } from '../DocPrintingRequestForm';

interface DocumentTitleProps {
  form: UseFormReturn<FormValues>;
  isSubmitting: boolean;
  docType: string;
}

export const DocumentTitle: React.FC<DocumentTitleProps> = ({ form, isSubmitting, docType }) => {
  return (
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
  );
};
