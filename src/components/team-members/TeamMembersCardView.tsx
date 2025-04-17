
import React from 'react';
import { Edit, Trash2, Building, MapPin, User, Mail, Phone } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";

interface TeamMembersCardViewProps {
  teamMembers: any[];
  projectId: string | null;
  onEdit: (member: any) => void;
  onDelete: (member: any) => void;
}

const TeamMembersCardView: React.FC<TeamMembersCardViewProps> = ({
  teamMembers,
  projectId,
  onEdit,
  onDelete,
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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {teamMembers.map((member) => (
        <Card key={member.id} className="overflow-hidden h-[280px] flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg truncate">{member.full_name}</CardTitle>
            {member.role && (
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <User className="h-3 w-3" />
                {member.role}
              </p>
            )}
          </CardHeader>
          <CardContent className="pb-2 flex-grow">
            <div className="space-y-2 text-sm">
              {member.email && (
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{member.email}</span>
                </p>
              )}
              
              {member.phone && (
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  {member.phone}
                </p>
              )}
              
              {member.organization && (
                <p className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  {member.organization}
                </p>
              )}
              
              {member.location && (
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  {member.location}
                </p>
              )}
              
              {/* Only show project badge if not filtered by project */}
              {!projectId && member.projects && (
                <p className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full inline-block mt-1">
                  {member.projects.project_number} - {member.projects.Sponsor}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="border-t p-2 mt-auto">
            <div className="flex gap-1 ml-auto">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => handleEdit(e, member)}
                aria-label="Edit team member"
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={(e) => handleDelete(e, member)}
                aria-label="Delete team member"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default TeamMembersCardView;
