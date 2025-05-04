
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { FormValues } from '../DocPrintingRequestForm';

interface RequestTypeSelectProps {
  form: UseFormReturn<FormValues>;
  isSubmitting: boolean;
}

export const RequestTypeSelect: React.FC<RequestTypeSelectProps> = ({ form, isSubmitting }) => {
  return (
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
  );
};
