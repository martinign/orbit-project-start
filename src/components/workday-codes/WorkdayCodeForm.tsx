
import React from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Project } from '@/utils/workdayCodeUtils';

const codeSchema = z.object({
  task: z.string().min(1, { message: "Task is required" }),
  activity: z.string().min(1, { message: "Activity is required" }),
  projectId: z.string().optional()
});

export type CodeFormData = z.infer<typeof codeSchema>;

interface WorkdayCodeFormProps {
  defaultValues?: CodeFormData;
  projects: Project[];
  isEditing: boolean;
  onSubmit: (data: CodeFormData) => void;
  onCancel: () => void;
  projectsLoading?: boolean;
}

const WorkdayCodeForm: React.FC<WorkdayCodeFormProps> = ({ 
  defaultValues = { task: '', activity: '', projectId: "" }, 
  projects, 
  isEditing,
  onSubmit,
  onCancel,
  projectsLoading = false
}) => {
  const form = useForm<CodeFormData>({
    resolver: zodResolver(codeSchema),
    defaultValues
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="task"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Task</FormLabel>
                <FormControl>
                  <Input placeholder="Enter task name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="activity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Activity</FormLabel>
                <FormControl>
                  <Input placeholder="Enter activity name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="projectId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Associated Project (Optional)</FormLabel>
                <Select 
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={projectsLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.project_number} {project.protocol_title ? `- ${project.protocol_title}` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {isEditing ? 'Update Code' : 'Create Code'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default WorkdayCodeForm;
