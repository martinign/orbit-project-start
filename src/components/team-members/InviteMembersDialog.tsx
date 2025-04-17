
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ProjectSelector from "@/components/team-members/ProjectSelector";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { UserRound } from "lucide-react";

interface InviteMembersDialogProps {
  open: boolean;
  onClose: () => void;
}

interface User {
  id: string;
  email: string;
  created_at: string;
}

const InviteMembersDialog = ({ open, onClose }: InviteMembersDialogProps) => {
  const [projectId, setProjectId] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchUsers();
    }
  }, [open]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.admin.listUsers();
      if (error) throw error;
      
      if (data) {
        setUsers(data.users.map(user => ({
          id: user.id,
          email: user.email || 'No email',
          created_at: user.created_at
        })));
      }
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to fetch users. You might not have admin rights.",
        variant: "destructive",
      });
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserToggle = (userId: string) => {
    setSelectedUsers(prev => ({
      ...prev,
      [userId]: !prev[userId]
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

    const selectedUserIds = Object.keys(selectedUsers).filter(id => selectedUsers[id]);
    
    if (selectedUserIds.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one user",
        variant: "destructive",
      });
      return;
    }

    // For demonstration purposes - in a real app, you'd implement the actual invitation logic
    toast({
        title: "Success",
        description: `Invitation sent to ${selectedUserIds.length} users for project`,
    });
    
    onClose();
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
            ) : users.length > 0 ? (
              <div className="max-h-60 overflow-y-auto space-y-2 border rounded-md p-2">
                {users.map((user) => (
                  <div 
                    key={user.id} 
                    className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-md"
                  >
                    <Checkbox 
                      id={`user-${user.id}`} 
                      checked={!!selectedUsers[user.id]}
                      onCheckedChange={() => handleUserToggle(user.id)}
                    />
                    <label 
                      htmlFor={`user-${user.id}`} 
                      className="flex items-center cursor-pointer flex-1"
                    >
                      <UserRound className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-sm">{user.email}</span>
                    </label>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center text-sm text-gray-500">
                No users found or you don't have admin rights.
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
