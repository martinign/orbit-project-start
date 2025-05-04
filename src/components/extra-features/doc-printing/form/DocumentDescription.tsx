
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import { FormValues } from '../DocPrintingRequestForm';

interface DocumentDescriptionProps {
  form: UseFormReturn<FormValues>;
  isSubmitting: boolean;
}

export const DocumentDescription: React.FC<DocumentDescriptionProps> = ({ form, isSubmitting }) => {
  return (
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
  );
};
