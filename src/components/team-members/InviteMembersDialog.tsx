import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ProjectSelector } from "@/components/team-members/ProjectSelector";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, UserRound } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";

interface InviteMembersDialogProps {
  open: boolean;
  onClose: () => void;
}

interface Profile {
  id: string;
  full_name: string | null;
  last_name: string | null;
  created_at: string;
  avatar_url?: string | null;
}

interface SelectedProfile {
  id: string;
  permission: "owner" | "admin" | "edit" | "read_only";
}

const InviteMembersDialog = ({ open, onClose }: InviteMembersDialogProps) => {
  const [projectId, setProjectId] = useState("");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfiles, setSelectedProfiles] = useState<Record<string, SelectedProfile>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (open) {
      fetchProfiles();
    }
  }, [open]);

  const fetchProfiles = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*");
      
      if (error) throw error;
      
      // Filter out the current user
      const filteredProfiles = data?.filter(profile => profile.id !== user?.id) || [];
      
      setProfiles(filteredProfiles);
    } catch (error: any) {
      console.error("Error fetching profiles:", error);
      toast({
        title: "Error",
        description: "Failed to fetch user profiles.",
        variant: "destructive",
      });
      setProfiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileToggle = (profileId: string) => {
    setSelectedProfiles(prev => {
      if (prev[profileId]) {
        const { [profileId]: removed, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        [profileId]: { id: profileId, permission: "read_only" }
      };
    });
  };

  const handlePermissionChange = (profileId: string, permission: "owner" | "admin" | "edit" | "read_only") => {
    setSelectedProfiles(prev => ({
      ...prev,
      [profileId]: { ...prev[profileId], permission }
    }));
  };

  const handleInvite = async () => {
    if (!projectId) {
      toast({
        title: "Error",
        description: "Please select a project",
        variant: "destructive",
      });
      return;
    }

    const selectedProfileIds = Object.values(selectedProfiles);
    
    if (selectedProfileIds.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one user",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");

      const invitations = selectedProfileIds.map(profile => ({
        project_id: projectId,
        inviter_id: user.user.id,
        invitee_id: profile.id,
        permission_level: profile.permission,
        status: 'pending'
      }));

      const { error } = await supabase
        .from('project_invitations')
        .insert(invitations);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Invitations sent to ${selectedProfileIds.length} users`,
      });
      
      onClose();
    } catch (error: any) {
      console.error('Error sending invitations:', error);
      toast({
        title: "Error",
        description: "Failed to send invitations. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getInitials = (name: string | null): string => {
    if (!name) return "?";
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Filter profiles based on search query
  const filteredProfiles = profiles.filter(profile => {
    const fullName = `${profile.full_name || ''} ${profile.last_name || ''}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  return (
  <Dialog open={open} onOpenChange={onClose}>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Invite Members</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Project</label>
          <ProjectSelector 
            selectedProject={projectId} 
            onProjectChange={setProjectId} 
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Users</label>
          <div className="relative mb-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search users..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {isLoading ? (
            <div className="py-4 text-center text-sm text-gray-500">Loading users...</div>
          ) : filteredProfiles.length > 0 ? (
            <div className="max-h-60 overflow-y-auto space-y-2 border rounded-md p-2">
              {filteredProfiles
                .sort((a, b) => {
                  const nameA = `${a.full_name} ${a.last_name}`.toLowerCase();
                  const nameB = `${b.full_name} ${b.last_name}`.toLowerCase();
                  return nameA.localeCompare(nameB);
                })
                .map((profile) => (
                  <div 
                    key={profile.id} 
                    className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-md"
                  >
                    <Checkbox 
                      id={`profile-${profile.id}`} 
                      checked={!!selectedProfiles[profile.id]}
                      onCheckedChange={() => handleProfileToggle(profile.id)}
                    />
                    <label 
                      htmlFor={`profile-${profile.id}`} 
                      className="flex items-center cursor-pointer flex-1 gap-2"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-purple-100 text-purple-600">
                          {getInitials(`${profile.full_name} ${profile.last_name}`)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {profile.full_name && profile.last_name ? `${profile.full_name} ${profile.last_name}` : 'Unnamed User'}
                        </span>
                      </div>
                    </label>
  
                    {selectedProfiles[profile.id] && (
                      <Select
                        value={selectedProfiles[profile.id].permission}
                        onValueChange={(value: "owner" | "admin" | "edit" | "read_only") => 
                          handlePermissionChange(profile.id, value)
                        }
                      >
                        <SelectTrigger className="w-[130px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="owner">Owner</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="edit">Can Edit</SelectItem>
                          <SelectItem value="read_only">Read Only</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                ))}
            </div>
          ) : (
            <div className="py-4 text-center text-sm text-gray-500">
              {searchQuery ? "No users found matching your search." : "No users found in the profiles table."}
            </div>
          )}
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose} className="mt-2 sm:mt-0">Cancel</Button>
        <Button 
          onClick={handleInvite}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          Invite
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
  );
};

export default InviteMembersDialog;
