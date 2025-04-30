
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

interface ExtraFeaturesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExtraFeaturesDialog({ open, onOpenChange }: ExtraFeaturesDialogProps) {
  const { toast } = useToast();
  const [selectedFeatures, setSelectedFeatures] = useState<{
    importantLinks: boolean;
    siteInitiationTracker: boolean;
    repository: boolean;
  }>(() => {
    // Load saved preferences from local storage or use defaults
    const savedFeatures = localStorage.getItem("extraFeatures");
    return savedFeatures ? JSON.parse(savedFeatures) : {
      importantLinks: false,
      siteInitiationTracker: false,
      repository: false,
    };
  });

  // Save preferences to local storage whenever they change
  useEffect(() => {
    localStorage.setItem("extraFeatures", JSON.stringify(selectedFeatures));
  }, [selectedFeatures]);

  const handleSave = () => {
    // Save changes
    localStorage.setItem("extraFeatures", JSON.stringify(selectedFeatures));
    
    toast({
      title: "Features updated",
      description: "Your selected features have been saved"
    });
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Extra Features</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
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
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
