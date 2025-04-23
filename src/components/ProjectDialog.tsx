import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Switch } from "@/components/ui/switch";
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
    protocol_number: string;
    protocol_title: string;
    Sponsor: string;
    description?: string | null;
    status: string;
  };
}

const formSchema = z.object({
  project_number: z.string().min(1, "Project number is required"),
  protocol_number: z.string().min(1, "Protocol number is required"),
  protocol_title: z.string().min(1, "Protocol title is required"),
  Sponsor: z.string().min(1, "Sponsor is required"),
  description: z.string().optional(),
  status: z.string().min(1, "Status is required")
});

const ProjectDialog = ({ open, onClose, onSuccess, project }: ProjectDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
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
      status: "active"
    }
  });
  
  useEffect(() => {
    if (project && open) {
      form.reset({
        project_number: project.project_number,
        protocol_number: project.protocol_number,
        protocol_title: project.protocol_title,
        Sponsor: project.Sponsor,
        description: project.description || "",
        status: project.status
      });
      setMinimalMode(false);
    } else if (!project && open) {
      form.reset({
        project_number: "",
        protocol_number: "",
        protocol_title: "",
        Sponsor: "",
        description: "",
        status: "active"
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
      if (isEditing && project) {
        const { error } = await supabase
          .from("projects")
          .update({
            project_number: values.project_number,
            protocol_number: values.protocol_number,
            protocol_title: values.protocol_title,
            Sponsor: values.Sponsor,
            description: values.description,
            status: values.status,
            updated_at: new Date().toISOString()
          })
          .eq("id", project.id);
          
        if (error) throw error;
        
        queryClient.invalidateQueries({ queryKey: ["recent_projects"] });
        queryClient.invalidateQueries({ queryKey: ["projects"] });
        queryClient.invalidateQueries({ queryKey: ["project", project.id] });
        
        toast({
          title: "Success",
          description: "Project updated successfully",
        });
      } else {
        const saveValues = minimalMode
          ? {
              project_number: values.project_number,
              protocol_number: "-",
              protocol_title: "-",
              Sponsor: "-",
              description: values.description,
              status: values.status,
              user_id: user.id,
            }
          : {
              project_number: values.project_number,
              protocol_number: values.protocol_number,
              protocol_title: values.protocol_title,
              Sponsor: values.Sponsor,
              description: values.description,
              status: values.status,
              user_id: user.id,
            };

        if (minimalMode) {
          saveValues.protocol_title = values.project_number;
        }

        const { error } = await supabase
          .from("projects")
          .insert(saveValues);
          
        if (error) throw error;
        
        queryClient.invalidateQueries({ queryKey: ["recent_projects"] });
        queryClient.invalidateQueries({ queryKey: ["projects"] });
        
        toast({
          title: "Success",
          description: "Project created successfully",
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
return (
  <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
    <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center justify-between">
          {isEditing ? "Edit Project" : minimalMode ? "Create New Project" : "Create New Project"}
          {!isEditing && (
            <div className="flex items-center gap-3">
              <span className="text-xs font-normal text-muted-foreground mr-1">
                {minimalMode ? "Minimal" : "Full"} view
              </span>
              <Switch
                checked={minimalMode}
                onCheckedChange={setMinimalMode}
                className="data-[state=checked]:bg-blue-500"
                id="toggle-mode"
              >
                {minimalMode ? (
                  <span className="inline-flex items-center ml-1">
                    <span className="sr-only">Switch to full form</span>
                    <ToggleRight className="h-4 w-4" />
                  </span>
                ) : (
                  <span className="inline-flex items-center ml-1">
                    <span className="sr-only">Switch to minimal form</span>
                    <ToggleLeft className="h-4 w-4" />
                  </span>
                )}
              </Switch>
              <button
                type="button"
                onClick={onClose}
                className="ml-2" // Added margin-left to the close button
              >
                Close
              </button>
            </div>
          )}
        </DialogTitle>
      </DialogHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="project_number"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>
                    {minimalMode ? "Project Title" : "Project Number"}
                  </FormLabel>
                  <FormControl>
                    {minimalMode
                      ? (
                        <Textarea
                          placeholder="Enter project title"
                          className="min-h-[70px]"
                          {...field}
                          value={field.value}
                        />
                      ) : (
                        <Input
                          placeholder="Enter project number"
                          {...field}
                        />
                      )
                    }
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {!minimalMode && (
              <>
                <FormField
                  control={form.control}
                  name="protocol_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Protocol Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter protocol number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="Sponsor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sponsor</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter sponsor name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="protocol_title"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Protocol Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter protocol title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </div>
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Enter project description"
                    className="min-h-[100px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <FormControl>
                  <ToggleGroup
                    type="single"
                    value={field.value}
                    onValueChange={(value) => {
                      if (value) field.onChange(value);
                    }}
                    className="justify-start w-full flex"
                  >
                    <ToggleGroupItem 
                      value="active" 
                      className={`flex-1 ${field.value === 'active' ? 'bg-green-100 text-green-800' : ''}`}
                    >
                      Active
                    </ToggleGroupItem>
                    <ToggleGroupItem 
                      value="pending" 
                      className={`flex-1 ${field.value === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}`}
                    >
                      Pending
                    </ToggleGroupItem>
                    <ToggleGroupItem 
                      value="completed" 
                      className={`flex-1 ${field.value === 'completed' ? 'bg-blue-100 text-blue-800' : ''}`}
                    >
                      Completed
                    </ToggleGroupItem>
                    <ToggleGroupItem 
                      value="cancelled" 
                      className={`flex-1 ${field.value === 'cancelled' ? 'bg-gray-100 text-gray-800' : ''}`}
                    >
                      Cancelled
                    </ToggleGroupItem>
                  </ToggleGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
  </Dialog>
);


export default ProjectDialog;
