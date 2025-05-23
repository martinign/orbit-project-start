
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { UserCog, Briefcase } from "lucide-react";
import { ProjectSelector } from "./team-members/ProjectSelector";
import FormField from "./team-members/FormField";
import FormActions from "./team-members/FormActions";

interface TeamMemberFormProps {
  projectId?: string;
  teamMember?: any;
  onSuccess: () => void;
}

const TeamMemberForm = ({ projectId: initialProjectId, teamMember, onSuccess }: TeamMemberFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    project_id: teamMember?.project_id || initialProjectId || "",
    full_name: teamMember?.full_name || "",
    last_name: teamMember?.last_name || "",
    role: teamMember?.role || "",
    job_title: teamMember?.job_title || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Convert job_title to uppercase
    if (name === 'job_title') {
      setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleProjectChange = (value: string) => {
    setFormData(prev => ({ ...prev, project_id: value }));
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
        setIsSubmitting(false);
        return;
      }

      if (!formData.project_id) {
        toast({
          title: "Error",
          description: "Project selection is required",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const user = await supabase.auth.getUser();
      
      if (!user.data.user) {
        toast({
          title: "Error",
          description: "You must be logged in to add team members",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const userData = {
        project_id: formData.project_id,
        full_name: formData.full_name,
        last_name: formData.last_name || null,
        role: formData.role || null,
        job_title: formData.job_title || null,
        user_id: user.data.user.id,
      };

      if (teamMember) {
        // Update existing team member
        const { error } = await supabase
          .from("project_team_members")
          .update({
            project_id: formData.project_id,
            full_name: formData.full_name,
            last_name: formData.last_name || null,
            role: formData.role || null,
            job_title: formData.job_title || null,
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
        <Label htmlFor="project_id">Project *</Label>
        <ProjectSelector
          selectedProject={formData.project_id}
          onProjectChange={handleProjectChange}
          disabled={(!!initialProjectId && !teamMember)}
          required
        />
      </div>
      
      <FormField
        id="full_name"
        name="full_name"
        label="First Name"
        value={formData.full_name}
        onChange={handleChange}
        placeholder="Enter first name"
        required
      />

      <FormField
        id="last_name"
        name="last_name"
        label="Last Name"
        value={formData.last_name}
        onChange={handleChange}
        placeholder="Enter last name"
      />
      
      <FormField
        id="job_title"
        name="job_title"
        label="Job Title"
        value={formData.job_title}
        onChange={handleChange}
        placeholder="E.g., PROJECT MANAGER, CLINICAL RESEARCH ASSOCIATE"
        hint="Enter the team member's job title"
        icon={Briefcase}
        className="uppercase"
      />
      
      <FormField
        id="role"
        name="role"
        label="Role in Project"
        value={formData.role}
        onChange={handleChange}
        placeholder="E.g., Project Manager, Developer"
        hint="Enter the team member's role in the project"
        icon={UserCog}
      />
      
      <FormActions 
        onCancel={onSuccess}
        isSubmitting={isSubmitting}
        isEditMode={!!teamMember}
        buttonClassName="bg-blue-500 hover:bg-blue-600 text-white"
      />
    </form>
  );
};

export default TeamMemberForm;
