
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface TeamMemberFormProps {
  projectId: string;
  teamMember?: any;
  onSuccess: () => void;
}

const TeamMemberForm = ({ projectId, teamMember, onSuccess }: TeamMemberFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    full_name: teamMember?.full_name || "",
    role: teamMember?.role || "",
    location: teamMember?.location || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!formData.full_name.trim()) {
        toast({
          title: "Error",
          description: "Name is required",
          variant: "destructive",
        });
        return;
      }

      const user = await supabase.auth.getUser();
      
      if (!user.data.user) {
        toast({
          title: "Error",
          description: "You must be logged in to add team members",
          variant: "destructive",
        });
        return;
      }

      const userData = {
        project_id: projectId,
        full_name: formData.full_name,
        role: formData.role || null,
        location: formData.location || null,
        user_id: user.data.user.id,
      };

      if (teamMember) {
        // Update existing team member
        const { error } = await supabase
          .from("project_team_members")
          .update({
            full_name: formData.full_name,
            role: formData.role || null,
            location: formData.location || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", teamMember.id);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Team member updated successfully",
        });
      } else {
        // Create new team member
        const { error } = await supabase
          .from("project_team_members")
          .insert(userData);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Team member added successfully",
        });
      }

      onSuccess();
    } catch (error: any) {
      console.error("Error saving team member:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save team member",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="full_name">Full Name *</Label>
        <Input
          id="full_name"
          name="full_name"
          value={formData.full_name}
          onChange={handleChange}
          placeholder="Enter full name"
          className="mt-1"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="role">Role</Label>
        <Input
          id="role"
          name="role"
          value={formData.role}
          onChange={handleChange}
          placeholder="E.g., Project Manager"
          className="mt-1"
        />
      </div>
      
      <div>
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="E.g., New York"
          className="mt-1"
        />
      </div>
      
      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onSuccess}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-purple-500 hover:bg-purple-600"
        >
          {isSubmitting ? "Saving..." : teamMember ? "Update" : "Add Team Member"}
        </Button>
      </div>
    </form>
  );
};

export default TeamMemberForm;
