
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

// Import the new components
import TaskTemplatesTab from '@/components/templates/TaskTemplatesTab';
import SopTemplatesTab from '@/components/templates/SopTemplatesTab';
import TemplateSearch from '@/components/templates/TemplateSearch';
import { TaskTemplate, SOPTemplate } from '@/components/templates/types';
import TaskTemplateDialog from "@/components/TaskTemplateDialog";

interface TaskTemplatesListDialogProps {
  open: boolean;
  onClose: () => void;
  selectionMode?: boolean;
  onTemplateSelect?: (template: TaskTemplate | SOPTemplate, templateType: 'task' | 'sop') => void;
}

const TaskTemplatesListDialog: React.FC<TaskTemplatesListDialogProps> = ({ 
  open, 
  onClose,
  selectionMode = false,
  onTemplateSelect
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplate | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'my-templates' | 'standard-sops'>('my-templates');

  // Query for user-created task templates
  const { 
    data: templates, 
    isLoading: isLoadingTemplates, 
    refetch: refetchTemplates 
  } = useQuery({
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

  // Query for company standard SOP templates
  const {
    data: sopTemplates,
    isLoading: isLoadingSops,
  } = useQuery({
    queryKey: ["sop_templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pxl_sop_templates")
        .select("id, title, sop_id, sop_link")
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
      refetchTemplates();
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

  const handleTemplateSelection = (template: TaskTemplate | SOPTemplate, templateType: 'task' | 'sop') => {
    if (selectionMode && onTemplateSelect) {
      console.log(`${templateType} template selected:`, template);
      onTemplateSelect(template, templateType);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {selectionMode ? "Select Task Template" : "Task Templates"}
          </DialogTitle>
          <DialogDescription>
            {selectionMode 
              ? "Choose a template to use for your task" 
              : "View and manage your task templates"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="w-full mb-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <TemplateSearch 
              searchQuery={searchQuery} 
              setSearchQuery={setSearchQuery} 
            />
            
            {!selectionMode && activeTab === 'my-templates' && (
              <Button 
                className="bg-blue-500 hover:bg-blue-600 text-white"
                onClick={() => {
                  setSelectedTemplate(null);
                  setIsEditDialogOpen(true);
                }}
              >
                Create Template
              </Button>
            )}
          </div>
          
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'my-templates' | 'standard-sops')}>
            <TabsList className="mb-4">
              <TabsTrigger value="my-templates">My Templates</TabsTrigger>
              <TabsTrigger value="standard-sops">Standard SOPs</TabsTrigger>
            </TabsList>
            
            <TabsContent value="my-templates">
              <TaskTemplatesTab
                templates={templates}
                isLoading={isLoadingTemplates}
                searchQuery={searchQuery}
                selectionMode={selectionMode}
                onTemplateSelect={(template, type) => handleTemplateSelection(template, type)}
                onEdit={(template) => {
                  setSelectedTemplate(template);
                  setIsEditDialogOpen(true);
                }}
                onDelete={(template) => {
                  setSelectedTemplate(template);
                  setIsDeleteDialogOpen(true);
                }}
              />
            </TabsContent>
            
            <TabsContent value="standard-sops">
              <SopTemplatesTab
                templates={sopTemplates}
                isLoading={isLoadingSops}
                searchQuery={searchQuery}
                selectionMode={selectionMode}
                onTemplateSelect={(template, type) => handleTemplateSelection(template, type)}
              />
            </TabsContent>
          </Tabs>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {selectionMode ? "Cancel" : "Close"}
          </Button>
        </DialogFooter>
      </DialogContent>
      
      {/* Edit Template Dialog */}
      {!selectionMode && (
        <TaskTemplateDialog 
          open={isEditDialogOpen} 
          onClose={() => {
            setIsEditDialogOpen(false);
            setSelectedTemplate(null);
          }}
          onSuccess={() => {
            refetchTemplates();
            setIsEditDialogOpen(false);
            setSelectedTemplate(null);
          }}
          template={selectedTemplate}
        />
      )}
      
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
