
import React, { useState } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import TaskTemplateList from './TaskTemplateList';
import TaskTemplateDialog from './TaskTemplateDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";

const TasksList: React.FC = () => {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: templates, isLoading, refetch } = useQuery({
    queryKey: ["task_templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("task_templates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const handleEdit = (template: any) => {
    setSelectedTemplate(template);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (template: any) => {
    setSelectedTemplate(template);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedTemplate) return;
    
    try {
      const { error } = await supabase
        .from("task_templates")
        .delete()
        .eq("id", selectedTemplate.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to delete the template. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Template deleted successfully.",
      });
      refetch();
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting template:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="text-center py-6">Loading templates...</div>;
  }

  if (!templates || templates.length === 0) {
    return <div className="text-center py-6">No templates found. Create your first template!</div>;
  }

  return (
    <div>
      <TaskTemplateList 
        templates={templates}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <TaskTemplateDialog 
        open={isEditDialogOpen} 
        onClose={() => setIsEditDialogOpen(false)}
        onSuccess={() => {
          refetch();
          setIsEditDialogOpen(false);
        }}
        template={selectedTemplate}
      />
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the template "{selectedTemplate?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TasksList;
