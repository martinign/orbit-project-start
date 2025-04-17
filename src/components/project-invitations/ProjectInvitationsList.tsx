
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LoaderIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProjectInvitationsListProps {
  projectId: string | null;
}

const ProjectInvitationsList = ({ projectId }: ProjectInvitationsListProps) => {
  const { toast } = useToast();

  const { data: invitations, isLoading } = useQuery({
    queryKey: ["project_invitations", projectId],
    queryFn: async () => {
      if (!projectId) return [];

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
            email
          )
        `)
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!projectId,
  });

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
        No pending invitations for this project
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
          <div>
            <div className="font-medium">
              {invitation.profiles?.full_name || "Unnamed User"}
            </div>
            <div className="text-sm text-muted-foreground">
              Permission Level: {invitation.permission_level}
            </div>
            <div className="text-sm text-muted-foreground">
              Status: {invitation.status}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProjectInvitationsList;
