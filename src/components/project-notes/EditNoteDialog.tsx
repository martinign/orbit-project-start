
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import FileUploadField from './FileUploadField';

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().optional(),
  file: z.any().optional(),
  file_name: z.string().optional(),
  file_type: z.string().optional(), 
  file_size: z.number().optional().nullable(),
});

type EditNoteDialogProps = {
  open: boolean;
  onClose: () => void;
  onUpdate: (data?: { file?: File | null }) => void;
  title: string;
  setTitle: (title: string) => void;
  content: string;
  setContent: (content: string) => void;
  fileDetails?: {
    fileName?: string;
    filePath?: string;
    fileType?: string;
    fileSize?: number | null;
  };
};

const EditNoteDialog = ({
  open,
  onClose,
  onUpdate,
  title,
  setTitle,
  content,
  setContent,
  fileDetails
}: EditNoteDialogProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title,
      content: content || '',
      file: null,
      file_name: fileDetails?.fileName || '',
      file_type: fileDetails?.fileType || '',
      file_size: fileDetails?.fileSize || null,
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset({
        title,
        content: content || '',
        file: null,
        file_name: fileDetails?.fileName || '',
        file_type: fileDetails?.fileType || '',
        file_size: fileDetails?.fileSize || null,
      });
    }
  }, [open, title, content, fileDetails, form]);

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    setTitle(data.title);
    setContent(data.content || '');
    onUpdate({ file: data.file });
  };

  const isSubmitting = form.formState.isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Note</DialogTitle>
          <DialogDescription>
            Update this project note
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Note title"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Note content"
                      rows={8}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FileUploadField 
              form={form} 
              name="file" 
              isSubmitting={isSubmitting}
              defaultFileName={fileDetails?.fileName}
              defaultFileType={fileDetails?.fileType}
            />
            
            <DialogFooter>
              <Button variant="outline" onClick={onClose} type="button">
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-blue-500 hover:bg-blue-600 text-white"
                disabled={!form.formState.isValid || isSubmitting}
              >
                {isSubmitting ? 'Updating...' : 'Update Note'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditNoteDialog;
