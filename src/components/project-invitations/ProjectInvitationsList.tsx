
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LoaderIcon, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface ProjectInvitationsListProps {
  projectId: string | null;
}

interface InvitationProfile {
  full_name?: string | null;
  last_name?: string | null;
  email?: string | null;
}

interface Invitation {
  id: string;
  invitee_id: string;
  permission_level: "owner" | "admin" | "edit" | "read_only";
  status: string;
  created_at: string;
  profiles?: InvitationProfile | null;
}

const ProjectInvitationsList = ({ projectId }: ProjectInvitationsListProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: invitations, isLoading } = useQuery({
    queryKey: ["project_invitations", projectId],
    queryFn: async () => {
      if (!projectId) return [];

      try {
        const { data, error } = await supabase
          .from("project_invitations")
          .select(`
            id,
            invitee_id,
            permission_level,
            status,
            created_at,
            profiles:invitee_id (
              full_name,
              last_name,
              email
            )
          `)
          .eq("project_id", projectId)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching project invitations list:", error);
          throw error;
        }
        
        return data as Invitation[];
      } catch (error) {
        console.error("Error in project invitations list query:", error);
        return [];
      }
    },
    enabled: !!projectId,
  });

  const updatePermission = useMutation({
    mutationFn: async ({ id, permission_level }: { id: string; permission_level: "owner" | "admin" | "edit" | "read_only" }) => {
      const { error } = await supabase
        .from("project_invitations")
        .update({ permission_level })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project_invitations", projectId] });
      toast({
        title: "Success",
        description: "Permission level updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update permission level",
        variant: "destructive",
      });
      console.error("Error updating permission:", error);
    },
  });

  const handlePermissionChange = (invitationId: string, newPermission: "owner" | "admin" | "edit" | "read_only") => {
    updatePermission.mutate({ id: invitationId, permission_level: newPermission });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "warning"; // Changed from "secondary" to "warning"
      case "accepted":
        return "success"; // Using success variant now that we've added it
      case "rejected":
        return "destructive";
      default:
        return "secondary";
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoaderIcon className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!invitations || invitations.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No invitations for this project
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {invitations.map((invitation) => (
        <div
          key={invitation.id}
          className="flex items-center justify-between p-4 border rounded-lg"
        >
          <div className="space-y-2">
            <div className="font-medium">
              {invitation.profiles?`${invitation.profiles.full_name || ''} ${invitation.profiles.last_name || ''}`.trim() : "Unnamed User"}
            </div>
            <div className="text-sm text-muted-foreground">
              {invitation.profiles?.email}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={getStatusBadgeVariant(invitation.status)}>
                {invitation.status}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <Select
                value={invitation.permission_level}
                onValueChange={(value: "owner" | "admin" | "edit" | "read_only") => 
                  handlePermissionChange(invitation.id, value)
                }
                disabled={invitation.status !== "pending"}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="edit">Can Edit</SelectItem>
                  <SelectItem value="read_only">View Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ProjectInvitationsList;
