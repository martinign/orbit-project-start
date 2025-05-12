
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  DialogFooter,
} from '@/components/ui/dialog';

// Define schema for link form validation
const linkFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  url: z.string().url("Please enter a valid URL").min(1, "URL is required"),
  description: z.string().optional(),
});

export type LinkFormValues = z.infer<typeof linkFormSchema>;

interface ImportantLinkFormProps {
  defaultValues?: LinkFormValues;
  onSubmit: (values: LinkFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const ImportantLinkForm: React.FC<ImportantLinkFormProps> = ({ 
  defaultValues = { title: '', url: '', description: '' },
  onSubmit,
  onCancel,
  isSubmitting = false
}) => {
  const form = useForm<LinkFormValues>({
    resolver: zodResolver(linkFormSchema),
    defaultValues,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter link title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL</FormLabel>
              <FormControl>
                <Input 
                  placeholder="https://example.com" 
                  {...field} 
                  // Ensure URL has proper format
                  onChange={(e) => {
                    let value = e.target.value;
                    // Add https:// if needed when user starts typing
                    if (value && value.trim() !== '' && !value.match(/^https?:\/\//)) {
                      if (!value.match(/^www\./)) {
                        if (value.includes(".")) {
                          value = "https://www." + value;
                        }
                      } else {
                        value = "https://" + value;
                      }
                    }
                    field.onChange(value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter a brief description"
                  className="resize-none" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="bg-blue-500 hover:bg-blue-600 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : defaultValues.title ? 'Save Changes' : 'Add Link'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};
