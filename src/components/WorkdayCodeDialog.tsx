
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Edit, Trash2, Plus, X } from 'lucide-react';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';

const codeSchema = z.object({
  task: z.string().min(1, { message: "Task is required" }),
  activity: z.string().min(1, { message: "Activity is required" }),
  projectId: z.string().optional()
});

type CodeFormData = z.infer<typeof codeSchema>;

interface WorkdayCode {
  id: string;
  task: string;
  activity: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  projects?: { id: string; project_number: string }[];
}

interface Project {
  id: string;
  project_number: string;
  protocol_title: string | null;
}

interface WorkdayCodeDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  code?: any;
}

const WorkdayCodeDialog: React.FC<WorkdayCodeDialogProps> = ({ 
  open, 
  onClose, 
  onSuccess, 
  code 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [workdayCodes, setWorkdayCodes] = useState<WorkdayCode[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [codeToDelete, setCodeToDelete] = useState<WorkdayCode | null>(null);
  const [projectAssociations, setProjectAssociations] = useState<{[key: string]: Project[]}>({});
  const [selectedCodeId, setSelectedCodeId] = useState<string | null>(null);
  const [addProjectDialogOpen, setAddProjectDialogOpen] = useState(false);
  
  const form = useForm<CodeFormData>({
    resolver: zodResolver(codeSchema),
    defaultValues: code ? {
      task: code.task,
      activity: code.activity,
      projectId: ""
    } : { task: '', activity: '', projectId: "" }
  });

  const isEditing = !!code;

  // Subscribe to real-time changes in workday_codes and project_workday_codes tables
  useRealtimeSubscription({
    table: 'workday_codes' as any,
    event: '*',
    onRecordChange: () => {
      fetchWorkdayCodes();
    }
  });
  
  useRealtimeSubscription({
    table: 'project_workday_codes' as any,
    event: '*',
    onRecordChange: () => {
      fetchWorkdayCodes();
    }
  });

  // Fetch projects
  const fetchProjects = async () => {
    try {
      setProjectsLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('id, project_number, protocol_title')
        .order('project_number', { ascending: true });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast({
        title: "Error",
        description: "Failed to load projects",
        variant: "destructive",
      });
    } finally {
      setProjectsLoading(false);
    }
  };

  // Fetch project associations for workday codes
  const fetchProjectAssociations = async () => {
    try {
      const { data, error } = await supabase
        .from('project_workday_codes')
        .select('workday_code_id, project_id, projects:project_id(id, project_number)');

      if (error) throw error;

      // Group projects by workday code ID
      const associations: {[key: string]: Project[]} = {};
      data?.forEach((item: any) => {
        if (!associations[item.workday_code_id]) {
          associations[item.workday_code_id] = [];
        }
        if (item.projects) {
          associations[item.workday_code_id].push(item.projects);
        }
      });

      setProjectAssociations(associations);
    } catch (error) {
      console.error("Error fetching project associations:", error);
    }
  };

  // Fetch all workday codes
  const fetchWorkdayCodes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('workday_codes')
        .select('*')
        .order('task', { ascending: true });

      if (error) throw error;
      setWorkdayCodes(data || []);
      
      // Fetch project associations
      await fetchProjectAssociations();
    } catch (error) {
      console.error("Error fetching workday codes:", error);
      toast({
        title: "Error",
        description: "Failed to load workday codes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch when dialog opens
  useEffect(() => {
    if (open) {
      fetchWorkdayCodes();
      fetchProjects();
    }
  }, [open]);

  const onSubmit = async (data: CodeFormData) => {
    try {
      if (isEditing) {
        const { error } = await supabase
          .from('workday_codes')
          .update({
            task: data.task,
            activity: data.activity,
            updated_at: new Date().toISOString()
          })
          .eq('id', code.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Workday code updated successfully",
        });
        
        // If a project is selected, associate it with the workday code
        if (data.projectId) {
          await associateProjectWithCode(code.id, data.projectId);
        }
      } else {
        const { data: insertedData, error } = await supabase
          .from('workday_codes')
          .insert({
            task: data.task,
            activity: data.activity,
            user_id: user?.id,
          })
          .select();

        if (error) throw error;

        toast({
          title: "Success",
          description: "Workday code created successfully",
        });
        
        // If a project is selected, associate it with the new workday code
        if (insertedData && insertedData[0] && data.projectId) {
          await associateProjectWithCode(insertedData[0].id, data.projectId);
        }
      }
      
      // Reset form but don't close dialog
      form.reset({ task: '', activity: '', projectId: "" });
      
      if (isEditing) {
        onSuccess(); // Only close on editing, not on create
      }
      
      // Refresh the data
      fetchWorkdayCodes();
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: error.code === "23505" 
          ? "This task and activity combination already exists" 
          : (isEditing ? "Failed to update the code" : "Failed to create the code"),
        variant: "destructive",
      });
    }
  };

  const associateProjectWithCode = async (codeId: string, projectId: string) => {
    try {
      const { error } = await supabase
        .from('project_workday_codes')
        .insert({
          project_id: projectId,
          workday_code_id: codeId,
          user_id: user?.id,
        });

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Info",
            description: "This project is already associated with this code",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Success",
          description: "Project associated with workday code",
        });
      }
    } catch (error) {
      console.error("Error associating project with code:", error);
      toast({
        title: "Error",
        description: "Failed to associate project with workday code",
        variant: "destructive",
      });
    }
  };

  const removeProjectAssociation = async (codeId: string, projectId: string) => {
    try {
      const { error } = await supabase
        .from('project_workday_codes')
        .delete()
        .match({
          workday_code_id: codeId,
          project_id: projectId
        });

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Project association removed",
      });
      
      // Update the local state
      const newAssociations = { ...projectAssociations };
      if (newAssociations[codeId]) {
        newAssociations[codeId] = newAssociations[codeId].filter(
          project => project.id !== projectId
        );
        setProjectAssociations(newAssociations);
      }
    } catch (error) {
      console.error("Error removing project association:", error);
      toast({
        title: "Error",
        description: "Failed to remove project association",
        variant: "destructive",
      });
    }
  };

  const handleRefresh = () => {
    fetchWorkdayCodes();
    fetchProjects();
  };
  
  const handleEdit = (codeToEdit: WorkdayCode) => {
    // Set form values and trigger edit mode
    form.reset({
      task: codeToEdit.task,
      activity: codeToEdit.activity,
      projectId: ""
    });
    onSuccess(); // Close this dialog
    // Re-open with the code to edit
    setTimeout(() => {
      onClose();
      onSuccess();
    }, 100);
  };
  
  const confirmDelete = (codeToDelete: WorkdayCode) => {
    setCodeToDelete(codeToDelete);
    setDeleteDialogOpen(true);
  };
  
  const handleDelete = async () => {
    if (!codeToDelete) return;
    
    try {
      // First delete all project associations
      const { error: associationError } = await supabase
        .from('project_workday_codes')
        .delete()
        .eq('workday_code_id', codeToDelete.id);
        
      if (associationError) throw associationError;
      
      // Then delete the code itself
      const { error } = await supabase
        .from('workday_codes')
        .delete()
        .eq('id', codeToDelete.id);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Workday code deleted successfully",
      });
      
      fetchWorkdayCodes();
    } catch (error: any) {
      console.error("Error deleting code:", error);
      toast({
        title: "Error",
        description: "Failed to delete the code",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setCodeToDelete(null);
    }
  };

  // Check if user is the creator of the code
  const isUserOwner = (code: WorkdayCode) => {
    return user && user.id === code.user_id;
  };

  const openAddProjectDialog = (codeId: string) => {
    setSelectedCodeId(codeId);
    setAddProjectDialogOpen(true);
  };

  const handleAddProject = async () => {
    if (!selectedCodeId || !form.getValues().projectId) return;
    
    await associateProjectWithCode(selectedCodeId, form.getValues().projectId);
    form.setValue('projectId', '');
    setAddProjectDialogOpen(false);
    fetchWorkdayCodes();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Workday Code' : 'Create New Workday Code'}</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6">
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
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a project" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
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
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit">
                  {isEditing ? 'Update Code' : 'Create Code'}
                </Button>
              </div>
            </form>
          </Form>

          <div className="border rounded-md p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium">Workday Codes</h3>
              <Button variant="outline" size="icon" onClick={handleRefresh} title="Refresh">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            
            {loading ? (
              <div className="text-center py-4">Loading...</div>
            ) : workdayCodes.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">No codes found</div>
            ) : (
              <div className="max-h-[400px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task</TableHead>
                      <TableHead>Activity</TableHead>
                      <TableHead>Associated Projects</TableHead>
                      <TableHead className="w-[150px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workdayCodes.map((code) => (
                      <TableRow key={code.id}>
                        <TableCell className="font-medium">{code.task}</TableCell>
                        <TableCell>{code.activity}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {projectAssociations[code.id]?.map(project => (
                              <Badge key={project.id} variant="secondary" className="flex items-center gap-1">
                                {project.project_number}
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-4 w-4 p-0 ml-1" 
                                  onClick={() => removeProjectAssociation(code.id, project.id)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </Badge>
                            ))}
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-6 px-2"
                              onClick={() => openAddProjectDialog(code.id)}
                            >
                              <Plus className="h-3 w-3 mr-1" /> Add
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          {isUserOwner(code) && (
                            <div className="flex space-x-1">
                              <Button variant="ghost" size="icon" onClick={() => handleEdit(code)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => confirmDelete(code)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this workday code and all project associations. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Add Project Dialog */}
      <AlertDialog open={addProjectDialogOpen} onOpenChange={setAddProjectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Associate with Project</AlertDialogTitle>
            <AlertDialogDescription>
              Select a project to associate with this workday code.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
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
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => form.setValue('projectId', '')}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleAddProject} disabled={!form.getValues().projectId}>
              Associate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};

export default WorkdayCodeDialog;
