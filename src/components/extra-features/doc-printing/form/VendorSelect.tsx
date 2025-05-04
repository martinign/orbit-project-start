
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { FormValues } from '../DocPrintingRequestForm';

interface VendorSelectProps {
  form: UseFormReturn<FormValues>;
  isSubmitting: boolean;
}

export const VendorSelect: React.FC<VendorSelectProps> = ({ form, isSubmitting }) => {
  return (
    <FormField
      control={form.control}
      name="doc_selected_vendor"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Selected Vendor</FormLabel>
          <Select 
            onValueChange={field.onChange} 
            value={field.value || undefined}
            disabled={isSubmitting}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select vendor" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="OPTION 1">OPTION 1</SelectItem>
              <SelectItem value="OPTION 2">OPTION 2</SelectItem>
              <SelectItem value="OPTION 3">OPTION 3</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
