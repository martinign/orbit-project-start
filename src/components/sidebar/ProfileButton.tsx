import { UserRound } from "lucide-react";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
interface ProfileButtonProps {
  onClick: () => void;
}
export const ProfileButton = ({
  onClick
}: ProfileButtonProps) => {
  return <SidebarMenu>
      <SidebarMenuItem className="my-[5px]">
        <SidebarMenuButton tooltip="Profile" className="hover:bg-blue-500/10 transition-colors duration-200" onClick={onClick}>
          <UserRound className="text-blue-500" />
          <span>PROFILE</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>;
};