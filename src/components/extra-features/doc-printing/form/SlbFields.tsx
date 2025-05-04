
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { FormValues } from '../DocPrintingRequestForm';

interface SlbFieldsProps {
  form: UseFormReturn<FormValues>;
  isSubmitting: boolean;
}

export const SlbFields: React.FC<SlbFieldsProps> = ({ form, isSubmitting }) => {
  return (
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
  );
};
