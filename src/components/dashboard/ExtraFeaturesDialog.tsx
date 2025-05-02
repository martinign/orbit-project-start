
import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useExtraFeatures } from "@/hooks/useExtraFeatures";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { ComboboxOption, Combobox } from "@/components/ui/combobox";
import { useProjectsForSelector } from "@/hooks/useProjectsForSelector";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExtraFeaturesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId?: string; // Optional projectId when used from project details view
}

export function ExtraFeaturesDialog({ open, onOpenChange, projectId }: ExtraFeaturesDialogProps) {
  const { toast } = useToast();
  const { features, setFeatures, saveProjectFeatures } = useExtraFeatures(projectId);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { projects = [], isLoading: projectsLoading } = useProjectsForSelector();
  const [selectedFeatures, setSelectedFeatures] = useState({
    importantLinks: features.importantLinks,
    siteInitiationTracker: features.siteInitiationTracker,
    repository: features.repository,
    docPrinting: features.docPrinting,
    billOfMaterials: features.billOfMaterials || false,
    designSheet: features.designSheet || false,
  });
  const [selectedProjects, setSelectedProjects] = useState<string[]>(projectId ? [projectId] : []);
  const [inputValue, setInputValue] = useState("");
  const [open2, setOpen2] = useState(false);

  // Sync with actual features when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedFeatures({
        importantLinks: features.importantLinks,
        siteInitiationTracker: features.siteInitiationTracker,
        repository: features.repository,
        docPrinting: features.docPrinting,
        billOfMaterials: features.billOfMaterials || false,
        designSheet: features.designSheet || false,
      });
      
      // Initialize selected projects
      if (projectId) {
        setSelectedProjects([projectId]);
      }
    }
  }, [open, features, projectId]);

  const createBOMTask = async (projectId: string) => {
    if (!user) return;
    
    try {
      // Check if Bill of Materials task already exists
      const { data: existingTask, error: checkError } = await supabase
        .from('project_tasks')
        .select('id')
        .eq('project_id', projectId)
        .eq('title', 'TP34-Bill of Materials')
        .limit(1);

      if (checkError) throw checkError;

      // Only create task if it doesn't exist yet
      if (!existingTask || existingTask.length === 0) {
        const { error } = await supabase
          .from('project_tasks')
          .insert({
            title: 'TP34-Bill of Materials',
            description: 'Setup and maintain the bill of materials for this project.',
            status: 'not started',
            priority: 'medium',
            project_id: projectId,
            user_id: user.id,
          });

        if (error) throw error;
        
        // Invalidate tasks query to refresh task list
        queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      }
    } catch (error) {
      console.error('Error creating BOM task:', error);
    }
  };

  const handleSave = async () => {
    try {
      // If specific projects are selected, save features to those projects
      if (selectedProjects.length > 0) {
        // Check if bill of materials was newly enabled and create task if needed
        if (selectedFeatures.billOfMaterials && !features.billOfMaterials) {
          for (const projectId of selectedProjects) {
            await createBOMTask(projectId);
          }
        }
        
        // Save to database
        await saveProjectFeatures(selectedProjects, selectedFeatures);
        
        // If current project is in selection, update local state
        if (!projectId || selectedProjects.includes(projectId)) {
          setFeatures(selectedFeatures);
        }
        
        toast({
          title: "Project features updated",
          description: `Features updated for ${selectedProjects.length} project(s)`
        });
      } else {
        // If no projects selected, save to localStorage (legacy behavior)
        setFeatures(selectedFeatures);
        
        toast({
          title: "Features updated",
          description: "Your selected features have been saved as default settings"
        });
      }
      
      // Dispatch a storage event to notify other components
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'extraFeatures',
        newValue: JSON.stringify(selectedFeatures)
      }));
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving features:', error);
      toast({
        title: "Error saving features",
        description: "An error occurred while saving features",
        variant: "destructive"
      });
    }
  };

  const handleRemoveProject = (projectId: string) => {
    setSelectedProjects(prev => prev.filter(id => id !== projectId));
  };

  const handleSelectProject = (projectId: string) => {
    if (!selectedProjects.includes(projectId)) {
      setSelectedProjects(prev => [...prev, projectId]);
    }
    setOpen2(false);
    setInputValue("");
  };

  const getProjectLabel = (projectId: string) => {
    const project = projects.find(p => p.value === projectId);
    return project ? project.label : projectId;
  };

  // Filter available projects to exclude already selected ones
  const availableProjects = projects.filter(p => !selectedProjects.includes(p.value));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Extra Features</DialogTitle>
        </DialogHeader>
        
        <div className="mb-4">
          <Label className="text-sm font-medium mb-2 block">Select Projects</Label>
          <div className="flex items-center mb-2">
            <div className="relative w-full">
              <Combobox
                options={availableProjects}
                value=""
                onChange={handleSelectProject}
                placeholder="Select projects..."
                emptyMessage="No projects found"
                className="w-full"
                isLoading={projectsLoading}
                onDropdownOpenChange={setOpen2}
              />
            </div>
          </div>
          
          {/* Selected projects */}
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedProjects.map(projectId => (
              <div 
                key={projectId}
                className="flex items-center gap-1 px-2 py-1 rounded-md bg-secondary text-sm"
              >
                <span className="truncate max-w-[200px]">{getProjectLabel(projectId)}</span>
                <button 
                  onClick={() => handleRemoveProject(projectId)} 
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {selectedProjects.length === 0 && (
              <span className="text-sm text-muted-foreground">
                No projects selected. Features will be saved as global defaults.
              </span>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 py-4">
          {/* First Column */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="importantLinks" 
                checked={selectedFeatures.importantLinks}
                onCheckedChange={(checked) => 
                  setSelectedFeatures(prev => ({
                    ...prev, 
                    importantLinks: checked === true
                  }))
                }
              />
              <Label htmlFor="importantLinks" className="cursor-pointer">Important Links</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="siteInitiationTracker" 
                checked={selectedFeatures.siteInitiationTracker}
                onCheckedChange={(checked) => 
                  setSelectedFeatures(prev => ({
                    ...prev, 
                    siteInitiationTracker: checked === true
                  }))
                }
              />
              <Label htmlFor="siteInitiationTracker" className="cursor-pointer">Site Initiation Tracker</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="repository" 
                checked={selectedFeatures.repository}
                onCheckedChange={(checked) => 
                  setSelectedFeatures(prev => ({
                    ...prev, 
                    repository: checked === true
                  }))
                }
              />
              <Label htmlFor="repository" className="cursor-pointer">Repository</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="docPrinting" 
                checked={selectedFeatures.docPrinting}
                onCheckedChange={(checked) => 
                  setSelectedFeatures(prev => ({
                    ...prev, 
                    docPrinting: checked === true
                  }))
                }
              />
              <Label htmlFor="docPrinting" className="cursor-pointer">Doc Printing</Label>
            </div>
          </div>
          
          {/* Second Column */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="billOfMaterials" 
                checked={selectedFeatures.billOfMaterials}
                onCheckedChange={(checked) => 
                  setSelectedFeatures(prev => ({
                    ...prev, 
                    billOfMaterials: checked === true
                  }))
                }
              />
              <Label htmlFor="billOfMaterials" className="cursor-pointer">TP34-Bill of Materials</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="designSheet" 
                checked={selectedFeatures.designSheet}
                onCheckedChange={(checked) => 
                  setSelectedFeatures(prev => ({
                    ...prev, 
                    designSheet: checked === true
                  }))
                }
              />
              <Label htmlFor="designSheet" className="cursor-pointer">Design Sheet</Label>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-blue-500 hover:bg-blue-600 text-white">
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
