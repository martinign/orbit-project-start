
import { LayoutDashboard } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";

interface DashboardSectionProps {
  totalCount: number;
  onDashboardClick: () => void;
}

export const DashboardSection = ({
  totalCount,
  onDashboardClick
}: DashboardSectionProps) => {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Link to="/dashboard">
          <SidebarMenuButton tooltip="Dashboard" className="hover:bg-indigo-500/10 transition-colors duration-200" onClick={onDashboardClick}>
            <LayoutDashboard className="text-indigo-500" />
            <span>Dashboard</span>
            {totalCount > 0 && <Badge className="ml-auto bg-purple-500">
              {totalCount} new
            </Badge>}
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};
