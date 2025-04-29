
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleLeft, ToggleRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface ProjectDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  project?: {
    id: string;
    project_number: string;
    protocol_number: string | null;
    protocol_title: string | null;
    Sponsor: string | null;
    description?: string | null;
    status: string;
    project_type?: string;
    role?: string;
  };
}

const formSchema = z.object({
  project_number: z.string().min(1, "Project number is required"),
  protocol_number: z.string().optional(),
  protocol_title: z.string().optional(),
  Sponsor: z.string().optional(),
  description: z.string().optional(),
  status: z.string().min(1, "Status is required"),
  project_type: z.string().default("billable"),
  role: z.string().default("owner")
});

const ProjectDialog = ({
  open,
  onClose,
  onSuccess,
  project
}: ProjectDialogProps) => {
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!project;
  const [minimalMode, setMinimalMode] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      project_number: "",
      protocol_number: "",
      protocol_title: "",
      Sponsor: "",
      description: "",
      status: "active",
      project_type: "billable",
      role: "owner"
    }
  });

  useEffect(() => {
    if (project && open) {
      form.reset({
        project_number: project.project_number,
        protocol_number: project.protocol_number || "",
        protocol_title: project.protocol_title || "",
        Sponsor: project.Sponsor || "",
        description: project.description || "",
        status: project.status,
        project_type: project.project_type || "billable",
        role: project.role || "owner"
      });
      setMinimalMode(project.project_type === "non-billable");
    } else if (!project && open) {
      form.reset({
        project_number: "",
        protocol_number: "",
        protocol_title: "",
        Sponsor: "",
        description: "",
        status: "active",
        project_type: "billable",
        role: "owner"
      });
      setMinimalMode(false);
    }
  }, [project, open, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to create or update a project",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Set project_type based on minimalMode toggle
      values.project_type = minimalMode ? "non-billable" : "billable";
      
      // When creating a new project, always set role to "owner"
      if (!isEditing) {
        values.role = "owner";
      }
      
      if (isEditing && project) {
        const {
          error
        } = await supabase.from("projects").update({
          project_number: values.project_number,
          protocol_number: minimalMode ? null : values.protocol_number,
          protocol_title: minimalMode ? null : values.protocol_title,
          Sponsor: minimalMode ? null : values.Sponsor,
          description: values.description,
          status: values.status,
          project_type: values.project_type,
          role: values.role,
          updated_at: new Date().toISOString()
        }).eq("id", project.id);
        
        if (error) throw error;
        
        queryClient.invalidateQueries({
          queryKey: ["recent_projects"]
        });
        queryClient.invalidateQueries({
          queryKey: ["projects"]
        });
        queryClient.invalidateQueries({
          queryKey: ["project", project.id]
        });
        toast({
          title: "Success",
          description: "Project updated successfully"
        });
      } else {
        const saveValues = {
          project_number: values.project_number,
          protocol_number: minimalMode ? null : values.protocol_number,
          protocol_title: minimalMode ? null : values.protocol_title,
          Sponsor: minimalMode ? null : values.Sponsor,
          description: values.description,
          status: values.status,
          project_type: values.project_type,
          role: "owner", // Always set to owner for new projects
          user_id: user.id
        };

        const {
          error
        } = await supabase.from("projects").insert(saveValues);
        
        if (error) throw error;
        
        queryClient.invalidateQueries({
          queryKey: ["recent_projects"]
        });
        queryClient.invalidateQueries({
          queryKey: ["projects"]
        });
        toast({
          title: "Success",
          description: "Project created successfully"
        });
      }
      
      onSuccess();
      onClose();
      form.reset();
    } catch (error) {
      console.error("Error saving project:", error);
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? "update" : "create"} project. Please try again.`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleChange = (checked: boolean) => {
    setMinimalMode(checked);
    // When toggling, update the project_type in the form
    form.setValue("project_type", checked ? "non-billable" : "billable");
  };

  return <Dialog open={open} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {isEditing ? "Edit Project" : minimalMode ? "Create New Project" : "Create New Project"}
            {!isEditing && <div className="flex items-center gap-3 px-[25px]">
                <span className="text-xs font-normal text-muted-foreground mr-1">
                  {minimalMode ? "Non-Billable" : "Billable"} view
                </span>
                <Switch 
                  checked={minimalMode} 
                  onCheckedChange={handleToggleChange} 
                  className="data-[state=checked]:bg-blue-500" 
                  id="toggle-mode"
                >
                  {minimalMode ? <span className="inline-flex items-center ml-1">
                      <span className="sr-only">Switch to Billable</span>
                      <ToggleRight className="h-4 w-4" />
                    </span> : <span className="inline-flex items-center ml-1">
                      <span className="sr-only">Switch to Non-Billable</span>
                      <ToggleLeft className="h-4 w-4" />
                    </span>}
                </Switch>
              </div>}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="project_number" render={({
              field
            }) => <FormItem className="md:col-span-2">
                    <FormLabel>
                      {minimalMode ? "Project Title" : "Project Number"}
                    </FormLabel>
                    <FormControl>
                      {minimalMode ? <Textarea placeholder="Enter project title" className="min-h-[70px]" {...field} value={field.value} /> : <Input placeholder="Enter project number" {...field} />}
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />
              
              {!minimalMode && <>
                  <FormField control={form.control} name="protocol_number" render={({
                field
              }) => <FormItem>
                        <FormLabel>Protocol Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter protocol number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />

                  <FormField control={form.control} name="Sponsor" render={({
                field
              }) => <FormItem>
                        <FormLabel>Sponsor</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter sponsor name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />
                  
                  <FormField control={form.control} name="protocol_title" render={({
                field
              }) => <FormItem className="md:col-span-2">
                        <FormLabel>Protocol Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter protocol title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />
                </>}
            </div>
            
            <FormField control={form.control} name="description" render={({
            field
          }) => <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter project description" className="min-h-[100px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Only show role select when editing an existing project */}
              {isEditing && (
                <FormField control={form.control} name="role" render={({
                field
              }) => <FormItem>
                      <FormLabel>Role</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="owner">Owner</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="contributor">Contributor</SelectItem>
                            <SelectItem value="viewer">Viewer</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />
              )}
            
              <FormField control={form.control} name="status" render={({
              field
            }) => <FormItem className={isEditing ? "" : "md:col-span-2"}>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <ToggleGroup type="single" value={field.value} onValueChange={value => {
                  if (value) field.onChange(value);
                }} className="justify-start w-full flex">
                        <ToggleGroupItem value="active" className={`flex-1 ${field.value === 'active' ? 'bg-green-100 text-green-800' : ''}`}>
                          Active
                        </ToggleGroupItem>
                        <ToggleGroupItem value="pending" className={`flex-1 ${field.value === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}`}>
                          Pending
                        </ToggleGroupItem>
                        <ToggleGroupItem value="completed" className={`flex-1 ${field.value === 'completed' ? 'bg-blue-100 text-blue-800' : ''}`}>
                          Completed
                        </ToggleGroupItem>
                        <ToggleGroupItem value="cancelled" className={`flex-1 ${field.value === 'cancelled' ? 'bg-gray-100 text-gray-800' : ''}`}>
                          Cancelled
                        </ToggleGroupItem>
                      </ToggleGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-500 hover:bg-blue-600" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : isEditing ? "Update Project" : "Create Project"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>;
};
export default ProjectDialog;
