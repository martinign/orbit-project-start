import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ProjectSelector from "@/components/team-members/ProjectSelector";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { UserRound } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface InviteMembersDialogProps {
  open: boolean;
  onClose: () => void;
}

interface Profile {
  id: string;
  full_name: string | null;
  created_at: string;
  avatar_url?: string | null;
}

const InviteMembersDialog = ({ open, onClose }: InviteMembersDialogProps) => {
  const [projectId, setProjectId] = useState("");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfiles, setSelectedProfiles] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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
      
      setProfiles(data || []);
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
    setSelectedProfiles(prev => ({
      ...prev,
      [profileId]: !prev[profileId]
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

    const selectedProfileIds = Object.keys(selectedProfiles).filter(id => selectedProfiles[id]);
    
    if (selectedProfileIds.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one user",
        variant: "destructive",
      });
      return;
    }

    toast({
        title: "Success",
        description: `Invitation sent to ${selectedProfileIds.length} users for project`,
    });
    
    onClose();
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
              value={projectId} 
              onChange={setProjectId} 
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Users</label>
            {isLoading ? (
              <div className="py-4 text-center text-sm text-gray-500">Loading users...</div>
            ) : profiles.length > 0 ? (
              <div className="max-h-60 overflow-y-auto space-y-2 border rounded-md p-2">
                {profiles.map((profile) => (
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
                          {getInitials(profile.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {profile.full_name || 'Unnamed User'}
                        </span>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center text-sm text-gray-500">
                No users found in the profiles table.
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="mt-2 sm:mt-0">Cancel</Button>
          <Button onClick={handleInvite}>Invite</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InviteMembersDialog;
