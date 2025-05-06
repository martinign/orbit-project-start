
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { FormValues } from '../DocPrintingRequestForm';

interface AmountFieldProps {
  form: UseFormReturn<FormValues>;
  isSubmitting: boolean;
}

export const AmountField: React.FC<AmountFieldProps> = ({ form, isSubmitting }) => {
  return (
    <FormField
      control={form.control}
      name="doc_amount"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Amount</FormLabel>
          <FormControl>
            <Input 
              type="number" 
              min={1}
              step={1}
              placeholder="Number of copies" 
              {...field}
              // Convert string to number for form submission
              onChange={e => field.onChange(parseInt(e.target.value) || 1)}
              value={field.value}
              disabled={isSubmitting}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
