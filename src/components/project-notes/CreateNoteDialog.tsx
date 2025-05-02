
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().optional(),
});

type CreateNoteDialogProps = {
  open: boolean;
  onClose: () => void;
  onSave: (data: { title: string; content: string }) => void;
  initialData?: {
    title: string;
    content: string;
  };
};

const CreateNoteDialog = ({
  open,
  onClose,
  onSave,
  initialData = { title: '', content: '' },
}: CreateNoteDialogProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData.title,
      content: initialData.content,
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset({
        title: initialData.title,
        content: initialData.content,
      });
    }
  }, [open, initialData, form]);

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    onSave({
      title: data.title,
      content: data.content || '',
    });
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Note</DialogTitle>
          <DialogDescription>
            Add a new note to this project
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
                      placeholder="Write your note here..."
                      rows={8}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button variant="outline" onClick={onClose} type="button">
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-blue-500 hover:bg-blue-600"
                disabled={!form.formState.isValid}
              >
                Create Note
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateNoteDialog;
