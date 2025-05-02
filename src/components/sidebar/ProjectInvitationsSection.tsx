
import { Bell, UserPlus, UserRound, Users, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";

interface ProjectInvitationsSectionProps {
  memberInvitationsCount: number;
  onInviteMembersClick: () => void;
  onPendingInvitationsClick: () => void;
  onProjectInvitesClick: () => void;
  isProjectOwner?: boolean;
  activeTab?: string;
}

export const ProjectInvitationsSection = ({
  memberInvitationsCount,
  onInviteMembersClick,
  onPendingInvitationsClick,
  onProjectInvitesClick,
  isProjectOwner = false,
  activeTab
}: ProjectInvitationsSectionProps) => {
  return <SidebarGroup>
      <SidebarGroupLabel>PROJECT INVITATIONS</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link to="/contacts">
              
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link to="/team-members">
              
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            
          </SidebarMenuItem>
          {isProjectOwner && (
            <SidebarMenuItem>
              <SidebarMenuButton 
                tooltip="Project Invites" 
                className={`hover:bg-purple-500/10 transition-colors duration-200 ${activeTab === 'invites' ? 'bg-purple-500/10 text-purple-600' : ''}`} 
                onClick={onProjectInvitesClick}
              >
                <Mail className={`${activeTab === 'invites' ? 'text-purple-600' : 'text-purple-500'}`} />
                <span>Project Invites</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Pending Invitations" className="hover:bg-purple-500/10 transition-colors duration-200" onClick={onPendingInvitationsClick}>
              <UserPlus className="text-purple-500" />
              <span>Pending Invitations</span>
              {memberInvitationsCount > 0 && (
                <Badge className="ml-auto bg-purple-500">{memberInvitationsCount}</Badge>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
          {memberInvitationsCount > 0 && <SidebarMenuItem>
              
            </SidebarMenuItem>}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>;
};
