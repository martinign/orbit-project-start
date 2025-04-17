
import React, { useState } from 'react';
import { Edit, Trash2, Search } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import TaskTemplateDialog from "@/components/TaskTemplateDialog";
import TaskTemplateList from "@/components/TaskTemplateList";

interface TaskTemplatesListDialogProps {
  open: boolean;
  onClose: () => void;
}

const TaskTemplatesListDialog: React.FC<TaskTemplatesListDialogProps> = ({ 
  open, 
  onClose 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: templates, isLoading, refetch } = useQuery({
    queryKey: ["task_templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("task_templates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      const { error } = await supabase
        .from("task_templates")
        .delete()
        .eq("id", templateId);

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
    } catch (error: any) {
      console.error("Error deleting template:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredTemplates = templates?.filter(template => 
    template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (template.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Task Templates</DialogTitle>
          <DialogDescription>
            View and manage your task templates
          </DialogDescription>
        </DialogHeader>
        
        <div className="w-full mb-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div className="relative w-64">
              <Input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
            </div>
            
            <Button 
              className="bg-blue-500 hover:bg-blue-600 text-white"
              onClick={() => {
                setSelectedTemplate(null);
                setIsEditDialogOpen(true);
              }}
            >
              Create Template
            </Button>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center p-4">Loading templates...</div>
          ) : filteredTemplates && filteredTemplates.length > 0 ? (
            <TaskTemplateList 
              templates={filteredTemplates}
              onEdit={(template) => {
                setSelectedTemplate(template);
                setIsEditDialogOpen(true);
              }}
              onDelete={(template) => {
                setSelectedTemplate(template);
                setIsDeleteDialogOpen(true);
              }}
            />
          ) : (
            <div className="text-center p-4">
              <p className="text-muted-foreground">
                {searchQuery ? "No templates match your search criteria" : "No templates found"}
              </p>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
      
      {/* Edit Template Dialog */}
      <TaskTemplateDialog 
        open={isEditDialogOpen} 
        onClose={() => {
          setIsEditDialogOpen(false);
          setSelectedTemplate(null);
        }}
        onSuccess={() => {
          refetch();
          setIsEditDialogOpen(false);
          setSelectedTemplate(null);
        }}
        template={selectedTemplate}
      />
      
      {/* Delete Template Confirmation */}
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
              onClick={() => selectedTemplate && handleDeleteTemplate(selectedTemplate.id)}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};

export default TaskTemplatesListDialog;
