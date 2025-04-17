
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface ProjectDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const ProjectDialog = ({ open, onClose, onSuccess }: ProjectDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    project_number: "",
    protocol_number: "",
    protocol_title: "",
    Sponsor: "",
    description: "",
    status: "active",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleStatusChange = (value: string) => {
    setFormData({ ...formData, status: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a project",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      const { error } = await supabase.from("projects").insert({
        ...formData,
        user_id: user.id,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Project created successfully",
      });
      
      setFormData({
        project_number: "",
        protocol_number: "",
        protocol_title: "",
        Sponsor: "",
        description: "",
        status: "active",
      });
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create project",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Fill out the form below to create a new clinical trial project.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="project_number">Project Number</Label>
                <Input
                  id="project_number"
                  name="project_number"
                  value={formData.project_number}
                  onChange={handleChange}
                  placeholder="PX-001"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="protocol_number">Protocol Number</Label>
                <Input
                  id="protocol_number"
                  name="protocol_number"
                  value={formData.protocol_number}
                  onChange={handleChange}
                  placeholder="PROTO-123"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="protocol_title">Protocol Title</Label>
              <Input
                id="protocol_title"
                name="protocol_title"
                value={formData.protocol_title}
                onChange={handleChange}
                placeholder="Study of..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="Sponsor">Sponsor</Label>
              <Input
                id="Sponsor"
                name="Sponsor"
                value={formData.Sponsor}
                onChange={handleChange}
                placeholder="Sponsor Company"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Detailed project description..."
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <ToggleGroup
                type="single"
                value={formData.status}
                onValueChange={handleStatusChange}
                className="justify-stretch w-full"
              >
                <ToggleGroupItem 
                  value="active" 
                  className="flex-1 bg-white data-[state=on]:bg-green-100 data-[state=on]:text-green-800 border border-gray-300"
                >
                  Active
                </ToggleGroupItem>
                <ToggleGroupItem 
                  value="pending" 
                  className="flex-1 bg-white data-[state=on]:bg-yellow-100 data-[state=on]:text-yellow-800 border border-gray-300"
                >
                  Pending
                </ToggleGroupItem>
                <ToggleGroupItem 
                  value="completed" 
                  className="flex-1 bg-white data-[state=on]:bg-blue-100 data-[state=on]:text-blue-800 border border-gray-300"
                >
                  Completed
                </ToggleGroupItem>
                <ToggleGroupItem 
                  value="inactive" 
                  className="flex-1 bg-white data-[state=on]:bg-gray-100 data-[state=on]:text-gray-800 border border-gray-300"
                >
                  Inactive
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-blue-500 hover:bg-blue-600 text-white"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectDialog;
