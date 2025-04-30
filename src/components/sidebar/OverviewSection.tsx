
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel } from "@/components/ui/sidebar";
import { DashboardSection } from "./DashboardSection";

interface OverviewSectionProps {
  totalCount: number;
  onDashboardClick: () => void;
}

export const OverviewSection = ({
  totalCount,
  onDashboardClick
}: OverviewSectionProps) => {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>OVERVIEW</SidebarGroupLabel>
      <SidebarGroupContent>
        <DashboardSection totalCount={totalCount} onDashboardClick={onDashboardClick} />
      </SidebarGroupContent>
    </SidebarGroup>
  );
};
