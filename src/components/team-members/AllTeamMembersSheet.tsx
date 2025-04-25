
import React from 'react';
import { TeamMember } from '@/hooks/useTeamMembers';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { PaginatedTable } from '@/components/common/PaginatedTable';
import TeamMembersTable from './TeamMembersTable';

interface AllTeamMembersSheetProps {
  isOpen: boolean;
  onClose: () => void;
  teamMembers: TeamMember[];
  projectId: string | null;
  onEdit: (member: TeamMember) => void;
  onDelete: (member: TeamMember) => void;
}

export function AllTeamMembersSheet({
  isOpen,
  onClose,
  teamMembers,
  projectId,
  onEdit,
  onDelete
}: AllTeamMembersSheetProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-[900px]">
        <SheetHeader>
          <SheetTitle>All Team Members ({teamMembers.length})</SheetTitle>
        </SheetHeader>
        
        <div className="mt-6">
          <PaginatedTable
            data={teamMembers}
            pageSize={10}
            renderTable={(paginatedMembers) => (
              <TeamMembersTable
                teamMembers={paginatedMembers}
                projectId={projectId}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            )}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
