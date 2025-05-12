
import { LayoutDashboard, Package, Puzzle, StickyNote } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
interface OverviewSectionProps {
  totalCount: number;
  onDashboardClick: () => void;
  onExtraFeaturesClick: (e: React.MouseEvent) => void;
}
export const OverviewSection = ({
  totalCount,
  onDashboardClick,
  onExtraFeaturesClick
}: OverviewSectionProps) => {
  return <SidebarGroup>
      <SidebarGroupLabel>OVERVIEW</SidebarGroupLabel>
      <SidebarGroupContent>
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
          <SidebarMenuItem>
            <Link to="/sticky-notes">
              <SidebarMenuButton tooltip="Sticky Notes" className="hover:bg-indigo-500/10 transition-colors duration-200">
                <StickyNote className="text-indigo-500" />
                <span>Sticky Notes</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>;
};
