
import React, { useState } from "react";
import { Link, FileText, File } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface ExtraFeaturesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ExtraFeaturesDialog: React.FC<ExtraFeaturesDialogProps> = ({ open, onOpenChange }) => {
  const [selectedFeatures, setSelectedFeatures] = useState({
    importantLinks: false,
    siteInitiationTracker: false,
    standardOperatingProcedure: false
  });

  const handleFeatureChange = (feature: keyof typeof selectedFeatures) => {
    setSelectedFeatures(prev => ({
      ...prev,
      [feature]: !prev[feature]
    }));
  };

  const handleSave = () => {
    // Here you would typically save the selection to your database
    // For now, we'll just show a toast notification
    toast.success("Feature preferences saved successfully");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Extra Features</DialogTitle>
          <DialogDescription>
            Select which additional features you want to enable for your project management experience.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div className="flex items-start space-x-3 space-y-0">
            <Checkbox 
              id="important-links" 
              checked={selectedFeatures.importantLinks}
              onCheckedChange={() => handleFeatureChange('importantLinks')}
            />
            <div className="space-y-1 leading-none">
              <div className="flex items-center">
                <Link className="h-4 w-4 mr-2 text-blue-500" />
                <Label htmlFor="important-links">Important Links</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Access quick links to important resources and websites.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 space-y-0">
            <Checkbox 
              id="site-initiation" 
              checked={selectedFeatures.siteInitiationTracker}
              onCheckedChange={() => handleFeatureChange('siteInitiationTracker')}
            />
            <div className="space-y-1 leading-none">
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-2 text-green-500" />
                <Label htmlFor="site-initiation">Site Initiation Tracker</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Track and manage site initiation progress and documentation.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 space-y-0">
            <Checkbox 
              id="sop" 
              checked={selectedFeatures.standardOperatingProcedure}
              onCheckedChange={() => handleFeatureChange('standardOperatingProcedure')}
            />
            <div className="space-y-1 leading-none">
              <div className="flex items-center">
                <File className="h-4 w-4 mr-2 text-purple-500" />
                <Label htmlFor="sop">Standard Operating Procedure (SOP)</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Access and manage standard operating procedures and protocols.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save preferences</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExtraFeaturesDialog;
