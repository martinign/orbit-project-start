
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

interface ExtraFeaturesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId?: string; // Optional projectId when used from project details view
}

export function ExtraFeaturesDialog({ open, onOpenChange, projectId }: ExtraFeaturesDialogProps) {
  const { toast } = useToast();
  const { features, setFeatures } = useExtraFeatures();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedFeatures, setSelectedFeatures] = useState({
    importantLinks: features.importantLinks,
    siteInitiationTracker: features.siteInitiationTracker,
    repository: features.repository,
    docPrinting: features.docPrinting,
    billOfMaterials: features.billOfMaterials || false,
    designSheet: features.designSheet || false,
  });

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
    }
  }, [open, features]);

  const createBOMTask = async () => {
    if (!projectId || !user) return;
    
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
    // Check if bill of materials was newly enabled
    if (selectedFeatures.billOfMaterials && !features.billOfMaterials && projectId) {
      await createBOMTask();
    }
    
    // Save changes
    setFeatures(selectedFeatures);
    localStorage.setItem("extraFeatures", JSON.stringify(selectedFeatures));
    
    // Dispatch a storage event to notify other components
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'extraFeatures',
      newValue: JSON.stringify(selectedFeatures)
    }));
    
    toast({
      title: "Features updated",
      description: "Your selected features have been saved"
    });
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Extra Features</DialogTitle>
        </DialogHeader>
        
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
              <Label htmlFor="importantLinks" className="cursor-pointer font-medium">Important Links</Label>
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
              <Label htmlFor="siteInitiationTracker" className="cursor-pointer font-medium">Site Initiation Tracker</Label>
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
              <Label htmlFor="repository" className="cursor-pointer font-medium">Repository</Label>
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
              <Label htmlFor="docPrinting" className="cursor-pointer font-medium">Doc Printing</Label>
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
              <Label htmlFor="billOfMaterials" className="cursor-pointer font-medium">TP34-Bill of Materials</Label>
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
              <Label htmlFor="designSheet" className="cursor-pointer font-medium">Design Sheet</Label>
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
