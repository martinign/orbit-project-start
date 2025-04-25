
import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface TeamMembersTableProps {
  teamMembers: any[];
  projectId: string | null;
  onEdit: (member: any) => void;
  onDelete: (member: any) => void;
}

const TeamMembersTable: React.FC<TeamMembersTableProps> = ({
  teamMembers,
  projectId,
  onEdit,
  onDelete
}) => {
  const handleEdit = (e: React.MouseEvent, member: any) => {
    e.stopPropagation();
    onEdit(member);
  };

  const handleDelete = (e: React.MouseEvent, member: any) => {
    e.stopPropagation();
    onDelete(member);
  };

  return (
    <div className="rounded-md border">
      <ScrollArea className="h-[400px]">
        <Table>
          <TableHeader>
            <TableRow className="sticky top-0 z-20 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <TableHead className="h-11 px-4 text-left align-middle font-medium text-muted-foreground">First Name</TableHead>
              <TableHead className="h-11 px-4 text-left align-middle font-medium text-muted-foreground">Last Name</TableHead>
              <TableHead className="h-11 px-4 text-left align-middle font-medium text-muted-foreground">Role</TableHead>
              <TableHead className="h-11 px-4 text-left align-middle font-medium text-muted-foreground">Location</TableHead>
              {!projectId && <TableHead className="h-11 px-4 text-left align-middle font-medium text-muted-foreground">Project</TableHead>}
              <TableHead className="h-11 px-4 text-right align-middle font-medium text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teamMembers.map(member => (
              <TableRow key={member.id}>
                <TableCell className="font-medium">{member.full_name}</TableCell>
                <TableCell className="font-medium">{member.last_name}</TableCell>
                <TableCell>{member.role || '-'}</TableCell>
                <TableCell>{member.location || '-'}</TableCell>
                {!projectId && <TableCell>{member.projects ? `${member.projects.project_number} - ${member.projects.Sponsor}` : '-'}</TableCell>}
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={e => handleEdit(e, member)} aria-label="Edit team member">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={e => handleDelete(e, member)} aria-label="Delete team member">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};

export default TeamMembersTable;
