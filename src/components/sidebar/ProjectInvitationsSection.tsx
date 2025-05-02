import { Bell, UserPlus, UserRound, Users, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
interface ProjectInvitationsSectionProps {
  memberInvitationsCount: number;
  onInviteMembersClick: () => void;
  onPendingInvitationsClick: () => void;
  onProjectInvitesClick: () => void;
}
export const ProjectInvitationsSection = ({
  memberInvitationsCount,
  onInviteMembersClick,
  onPendingInvitationsClick,
  onProjectInvitesClick
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
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Project Invites" className="hover:bg-purple-500/10 transition-colors duration-200" onClick={onProjectInvitesClick}>
              <Mail className="text-purple-500" />
              <span>Project Invites</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {memberInvitationsCount > 0 && <SidebarMenuItem>
              
            </SidebarMenuItem>}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>;
};