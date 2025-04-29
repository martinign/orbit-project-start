
import React from 'react';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Project } from '@/utils/workdayCodeUtils';

interface AddProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: Project[];
  onAddProject: (projectId: string) => void;
}

const AddProjectDialog: React.FC<AddProjectDialogProps> = ({ 
  open, 
  onOpenChange, 
  projects, 
  onAddProject 
}) => {
  const form = useForm<{ projectId: string }>({
    defaultValues: {
      projectId: ""
    }
  });

  const handleSubmit = () => {
    const projectId = form.getValues().projectId;
    if (projectId) {
      onAddProject(projectId);
    }
  };

  // Function to format project display text based on project type
  const formatProjectDisplay = (project: Project): string => {
    if (project.project_type === 'billable') {
      return `${project.project_number} - ${project.Sponsor || ''}`;
    } else {
      return project.protocol_title || project.project_number;
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Associate with Project</AlertDialogTitle>
          <AlertDialogDescription>
            Select a project to associate with this workday code.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Form {...form}>
          <form className="py-4">
            <FormField
              control={form.control}
              name="projectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project</FormLabel>
                  <Select 
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a project" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {formatProjectDisplay(project)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => form.reset({ projectId: "" })}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleSubmit}>
            Associate
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AddProjectDialog;
