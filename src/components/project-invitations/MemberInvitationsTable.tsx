
import React, { useState } from 'react';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { MemberInvitation, useMemberInvitations } from '@/hooks/useMemberInvitations';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow } from 'date-fns';
import { Loader2, UserMinus, AlertTriangle } from 'lucide-react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useQueryClient } from '@tanstack/react-query';

interface MemberInvitationsTableProps {
  projectId: string;
}

const MemberInvitationsTable: React.FC<MemberInvitationsTableProps> = ({ projectId }) => {
  const { data: invitations, isLoading, refetch, error } = useMemberInvitations(projectId);
  const [updatingInvitationId, setUpdatingInvitationId] = useState<string | null>(null);
  const [removingInvitationId, setRemovingInvitationId] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const queryClient = useQueryClient();

  const handleRoleChange = async (invitationId: string, newRole: string) => {
    try {
      setUpdatingInvitationId(invitationId);
      
      const { error } = await supabase
        .from('member_invitations')
        .update({ member_role: newRole })
        .eq('member_invitation_id', invitationId);

      if (error) throw error;
      
      toast.success("Role updated successfully");
      refetch();
      
      // Update team member's role if invitation is accepted
      const invitation = invitations?.find(inv => inv.member_invitation_id === invitationId);
      if (invitation && invitation.invitation_status === 'accepted') {
        const { error: updateError } = await supabase
          .from('project_team_members')
          .update({ role: newRole })
          .eq('project_id', projectId)
          .eq('user_id', invitation.invitation_recipient_id);
          
        if (updateError) {
          console.error("Error updating team member role:", updateError);
          toast.error("Updated invitation but failed to update team member role");
        } else {
          // Invalidate team members query to refresh data
          queryClient.invalidateQueries({ queryKey: ['team_members', projectId] });
        }
      }
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Failed to update role");
    } finally {
      setUpdatingInvitationId(null);
    }
  };

  const handleRemoveMember = async (invitationId: string) => {
    try {
      setIsRemoving(true);
      setRemovingInvitationId(invitationId);
      
      // Get the invitation details to find the user_id
      const invitation = invitations?.find(inv => inv.member_invitation_id === invitationId);
      if (!invitation) {
        throw new Error("Invitation not found");
      }
      
      // First, remove the user from the project_team_members table
      if (invitation.invitation_status === 'accepted') {
        const { error: teamMemberError } = await supabase
          .from('project_team_members')
          .delete()
          .eq('project_id', projectId)
          .eq('user_id', invitation.invitation_recipient_id);
          
        if (teamMemberError) throw teamMemberError;
      }
      
      // Then, update the invitation status to 'revoked'
      const { error: invitationError } = await supabase
        .from('member_invitations')
        .update({ invitation_status: 'revoked' })
        .eq('member_invitation_id', invitationId);
        
      if (invitationError) throw invitationError;
      
      toast.success("Team member removed successfully");
      
      // Refetch invitations and invalidate team members query
      await Promise.all([
        refetch(),
        queryClient.invalidateQueries({ queryKey: ['team_members', projectId] }),
        queryClient.invalidateQueries({ queryKey: ['project_team_members', projectId] })
      ]);
    } catch (error: any) {
      console.error("Error removing team member:", error);
      toast.error(error.message || "Failed to remove team member");
    } finally {
      setIsRemoving(false);
      setRemovingInvitationId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Badge className="bg-green-500">Accepted</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'revoked':
        return <Badge variant="outline" className="border-red-500 text-red-500">Revoked</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (error) {
    return <div className="text-center py-4 text-red-500">Error loading invitations: {error.message}</div>;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading invitations...</span>
      </div>
    );
  }

  if (!invitations || invitations.length === 0) {
    return <div className="text-center py-4 text-muted-foreground">No invitations found for this project.</div>;
  }

  return (
    <ScrollArea className="h-[400px] w-full border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Recipient</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Invited</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invitations.map((invitation: MemberInvitation) => (
            <TableRow key={invitation.member_invitation_id}>
              <TableCell className="font-medium">
                {invitation.recipient_full_name} {invitation.recipient_last_name}
              </TableCell>
              <TableCell>
                {getStatusBadge(invitation.invitation_status)}
              </TableCell>
              <TableCell>
                {/* Enable role dropdown for both pending AND accepted invitations */}
                {(invitation.invitation_status === 'pending' || invitation.invitation_status === 'accepted') ? (
                  <Select
                    defaultValue={invitation.member_role}
                    disabled={updatingInvitationId === invitation.member_invitation_id}
                    onValueChange={(value) => handleRoleChange(invitation.member_invitation_id, value)}
                  >
                    <SelectTrigger className="w-28">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="owner">Owner</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <span className="capitalize">{invitation.member_role}</span>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {invitation.invitation_created_at ? 
                  formatDistanceToNow(new Date(invitation.invitation_created_at), { addSuffix: true }) : 
                  'Unknown date'}
              </TableCell>
              <TableCell>
                {invitation.invitation_status === 'accepted' && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                        disabled={isRemoving}
                      >
                        {removingInvitationId === invitation.member_invitation_id && isRemoving ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <UserMinus className="h-4 w-4 mr-1" />
                        )}
                        Remove
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-red-500" /> Remove Team Member
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to remove <strong>{invitation.recipient_full_name}</strong> from this project? 
                          This will revoke their access to the project and all associated data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleRemoveMember(invitation.member_invitation_id)}
                          className="bg-red-500 hover:bg-red-600"
                          disabled={isRemoving}
                        >
                          {isRemoving && removingInvitationId === invitation.member_invitation_id ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : null}
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
};

export default MemberInvitationsTable;
