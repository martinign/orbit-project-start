
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import { FormValues } from '../DocPrintingRequestForm';

interface CommentsFieldProps {
  form: UseFormReturn<FormValues>;
  isSubmitting: boolean;
}

export const CommentsField: React.FC<CommentsFieldProps> = ({ form, isSubmitting }) => {
  return (
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
  );
};
