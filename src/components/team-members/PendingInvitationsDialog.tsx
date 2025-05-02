
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { InvitationItem } from "./InvitationItem";
import { usePendingInvitations } from "@/hooks/usePendingInvitations";
import { useState } from "react";

interface PendingInvitationsDialogProps {
  open: boolean;
  onClose: () => void;
}

export function PendingInvitationsDialog({ open, onClose }: PendingInvitationsDialogProps) {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { invitations, isLoading, acceptInvitation, rejectInvitation } = usePendingInvitations(open);
  
  const handleAccept = (invitationId: string) => {
    setProcessingId(invitationId);
    acceptInvitation.mutate(invitationId, {
      onSettled: () => setProcessingId(null)
    });
  };
  
  const handleReject = (invitationId: string) => {
    setProcessingId(invitationId);
    rejectInvitation.mutate(invitationId, {
      onSettled: () => setProcessingId(null)
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Pending Invitations</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
            </div>
          ) : !invitations || invitations.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No pending invitations</p>
          ) : (
            <div className="space-y-4">
              {invitations.map((invitation) => (
                <InvitationItem
                  key={invitation.member_invitation_id}
                  invitation={invitation}
                  onAccept={handleAccept}
                  onReject={handleReject}
                  isAccepting={acceptInvitation.isPending && processingId === invitation.member_invitation_id}
                  isRejecting={rejectInvitation.isPending && processingId === invitation.member_invitation_id}
                />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default PendingInvitationsDialog;
