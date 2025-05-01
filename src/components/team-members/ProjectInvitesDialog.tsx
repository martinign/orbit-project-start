
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LoaderIcon } from "lucide-react";

interface ProjectInvitesDialogProps {
  open: boolean;
  onClose: () => void;
}

interface Profile {
  id: string;
  full_name: string | null;
  last_name: string | null;
}

interface Project {
  id: string;
  project_number: string;
  Sponsor?: string;
}

export const ProjectInvitesDialog = ({ open, onClose }: ProjectInvitesDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  
  // Reset state when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setSelectedProject("");
      setSearchQuery("");
      setSelectedUsers([]);
    }
  }, [open]);

  // Fetch all projects for the current user
  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ["user_projects"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const { data, error } = await supabase
        .from("projects")
        .select("id, project_number, Sponsor")
        .eq("user_id", user.user.id)
        .order("project_number");

      if (error) throw error;
      return data as Project[];
    },
    enabled: open,
  });

  // Fetch all profiles except current user
  const { data: profiles, isLoading: profilesLoading } = useQuery({
    queryKey: ["invite_profiles"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, last_name")
        .neq("id", user.user.id)
        .order("full_name");

      if (error) throw error;
      return data as Profile[];
    },
    enabled: open,
  });

  // Filter profiles based on search query
  const filteredProfiles = profiles?.filter(profile => {
    const searchTerm = searchQuery.toLowerCase();
    const fullName = `${profile.full_name || ''} ${profile.last_name || ''}`.toLowerCase();
    return fullName.includes(searchTerm);
  });

  const handleUserSelect = (userId: string) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleInvite = async () => {
    if (!selectedProject) {
      toast({
        title: "Project Required",
        description: "Please select a project to invite users to.",
        variant: "destructive",
      });
      return;
    }

    if (selectedUsers.length === 0) {
      toast({
        title: "No Users Selected",
        description: "Please select at least one user to invite.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");

      // Create project invitations for each selected user
      const invitations = selectedUsers.map(userId => ({
        project_id: selectedProject,
        inviter_id: user.user.id,
        invitee_id: userId,
        status: "pending",
        permission_level: "read_only",
      }));

      const { error } = await supabase
        .from("project_invitations")
        .insert(invitations);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Invitations sent to ${selectedUsers.length} user(s).`,
      });

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["project_invitations"] });
      
      // Close dialog and reset state
      onClose();
      
    } catch (error: any) {
      console.error("Error sending invitations:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send invitations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Generate initials for avatar
  const getInitials = (profile: Profile) => {
    const firstName = profile.full_name || '';
    const lastName = profile.last_name || '';
    
    const firstInitial = firstName.charAt(0).toUpperCase();
    const lastInitial = lastName.charAt(0).toUpperCase();
    
    return firstInitial + (lastInitial || '');
  };

  // Generate random pastel color based on user id
  const getAvatarColor = (userId: string) => {
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Generate pastel color
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 80%)`;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Members</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <h3 className="mb-2 text-sm font-medium">Select Project</h3>
            <Select 
              value={selectedProject} 
              onValueChange={setSelectedProject}
              disabled={projectsLoading || projects?.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a project *" />
              </SelectTrigger>
              <SelectContent>
                {projectsLoading ? (
                  <div className="flex items-center justify-center p-2">
                    <LoaderIcon className="h-4 w-4 animate-spin mr-2" />
                    Loading...
                  </div>
                ) : projects?.length === 0 ? (
                  <div className="p-2 text-center text-sm text-muted-foreground">
                    No projects found
                  </div>
                ) : (
                  projects?.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.project_number} {project.Sponsor ? `- ${project.Sponsor}` : ''}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-medium">Select Users</h3>
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-2"
            />
            
            <div className="border rounded-md max-h-60 overflow-y-auto">
              {profilesLoading ? (
                <div className="flex items-center justify-center p-4">
                  <LoaderIcon className="h-4 w-4 animate-spin mr-2" />
                  Loading users...
                </div>
              ) : filteredProfiles?.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No users found
                </div>
              ) : (
                <div className="p-1">
                  {filteredProfiles?.map((profile) => (
                    <div 
                      key={profile.id} 
                      className="flex items-center p-2 hover:bg-slate-100 rounded-sm"
                    >
                      <Checkbox
                        checked={selectedUsers.includes(profile.id)}
                        onCheckedChange={() => handleUserSelect(profile.id)}
                        id={`user-${profile.id}`}
                        className="mr-2"
                      />
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center mr-2" 
                        style={{ backgroundColor: getAvatarColor(profile.id) }}
                      >
                        <span className="text-xs font-medium">{getInitials(profile)}</span>
                      </div>
                      <label 
                        htmlFor={`user-${profile.id}`} 
                        className="text-sm cursor-pointer flex-grow"
                      >
                        {profile.full_name} {profile.last_name}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleInvite} 
              disabled={loading || selectedUsers.length === 0 || !selectedProject}
            >
              {loading && <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />}
              Invite
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectInvitesDialog;
