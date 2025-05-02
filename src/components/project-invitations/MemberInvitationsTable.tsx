
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
import { MemberInvitation, useMemberInvitations } from '@/hooks/useMemberInvitations';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow } from 'date-fns';

interface MemberInvitationsTableProps {
  projectId: string;
}

const MemberInvitationsTable: React.FC<MemberInvitationsTableProps> = ({ projectId }) => {
  const { data: invitations, isLoading, refetch } = useMemberInvitations(projectId);
  const [updatingInvitationId, setUpdatingInvitationId] = useState<string | null>(null);

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
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Failed to update role");
    } finally {
      setUpdatingInvitationId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Badge className="bg-green-500">Accepted</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatName = (profile: { full_name: string | null, last_name: string | null }) => {
    if (!profile) return 'Unknown User';
    return profile.full_name || 'Unknown User';
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading invitations...</div>;
  }

  if (!invitations || invitations.length === 0) {
    return <div className="text-center py-4 text-muted-foreground">No invitations found.</div>;
  }

  return (
    <ScrollArea className="h-[400px] w-full border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Recipient</TableHead>
            <TableHead>Sent By</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Invited</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invitations.map((invitation: MemberInvitation) => (
            <TableRow key={invitation.member_invitation_id}>
              <TableCell className="font-medium">
                {formatName(invitation.invitation_recipient)}
              </TableCell>
              <TableCell>
                {formatName(invitation.invitation_sender)}
              </TableCell>
              <TableCell>
                {getStatusBadge(invitation.invitation_status)}
              </TableCell>
              <TableCell>
                {invitation.invitation_status === 'pending' ? (
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
};

export default MemberInvitationsTable;
