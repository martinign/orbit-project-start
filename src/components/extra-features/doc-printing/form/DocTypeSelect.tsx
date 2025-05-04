
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { FormValues } from '../DocPrintingRequestForm';

interface DocTypeSelectProps {
  form: UseFormReturn<FormValues>;
  isSubmitting: boolean;
}

export const DocTypeSelect: React.FC<DocTypeSelectProps> = ({ form, isSubmitting }) => {
  return (
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
  );
};
