
import { Bell, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";

interface ProjectInvitationsSectionProps {
  pendingInvitationsCount: number;
  onInviteMembersClick: () => void;
  onPendingInvitationsClick: () => void;
}

export const ProjectInvitationsSection = ({
  pendingInvitationsCount,
  onInviteMembersClick,
  onPendingInvitationsClick
}: ProjectInvitationsSectionProps) => {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>PROJECT INVITATIONS</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              tooltip="Invite Members" 
              className="hover:bg-purple-500/10 transition-colors duration-200 relative" 
              onClick={onInviteMembersClick}
            >
              <UserPlus className="text-purple-500" />
              <span>Invite Members</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {pendingInvitationsCount > 0 && (
            <SidebarMenuItem>
              <SidebarMenuButton 
                tooltip="Pending Invitations" 
                className="hover:bg-purple-500/10 transition-colors duration-200" 
                onClick={onPendingInvitationsClick}
              >
                <Bell className="text-purple-500" />
                <span>Invitations</span>
                <Badge variant="secondary" className="ml-auto bg-purple-100 text-purple-600 hover:bg-purple-100">
                  {pendingInvitationsCount}
                </Badge>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};
