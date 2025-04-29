
import React from 'react';
import { Edit, Trash2, User, Shield } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { TeamMember } from "@/hooks/useTeamMembers";

interface TeamMembersCardViewProps {
  teamMembers: TeamMember[];
  projectId: string | null;
  onEdit: (member: TeamMember) => void;
  onDelete: (member: TeamMember) => void;
}

const TeamMembersCardView: React.FC<TeamMembersCardViewProps> = ({
  teamMembers,
  projectId,
  onEdit,
  onDelete,
}) => {
  const handleEdit = (e: React.MouseEvent, member: TeamMember) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit(member);
  };

  const handleDelete = (e: React.MouseEvent, member: TeamMember) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(member);
  };

  const renderMemberDetail = (
    icon: React.ReactNode,
    content: string | undefined,
    className?: string
  ) => {
    if (!content) return null;
    
    return (
      <p className={`flex items-center gap-2 ${className || ''}`}>
        {icon}
        <span className="truncate">{content}</span>
      </p>
    );
  };

  const getPermissionBadgeColor = (permission: string | undefined) => {
    switch (permission) {
      case 'owner':
        return 'bg-purple-50 text-purple-700';
      case 'admin':
        return 'bg-blue-50 text-blue-700';
      case 'edit':
        return 'bg-green-50 text-green-700';
      case 'read_only':
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  const getPermissionLabel = (permission: string | undefined) => {
    switch (permission) {
      case 'owner': return 'Owner';
      case 'admin': return 'Admin';
      case 'edit': return 'Can Edit';
      case 'read_only': default: return 'Read Only';
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {teamMembers.map((member) => (
        <Card 
          key={member.id} 
          className="overflow-hidden h-[280px] flex flex-col hover:shadow-md transition-shadow"
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-lg truncate">{`${member.full_name} ${member.last_name}`}</CardTitle>
            {member.role && (
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <User className="h-3 w-3" />
                {member.role}
              </p>
            )}
          </CardHeader>
          <CardContent className="pb-2 flex-grow">
            <div className="space-y-2 text-sm">
              {/* Show permission level badge */}
              {member.permission_level && (
                <div className="flex items-center gap-1 mb-2">
                  <Shield className="h-3 w-3 text-muted-foreground" />
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getPermissionBadgeColor(member.permission_level)}`}>
                    {getPermissionLabel(member.permission_level)}
                  </span>
                </div>
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
