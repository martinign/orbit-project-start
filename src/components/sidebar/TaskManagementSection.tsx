
import { Eye, FileText } from "lucide-react";
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";

interface TaskManagementSectionProps {
  onTaskTemplateClick: () => void;
  onViewTemplatesClick: () => void;
}

export const TaskManagementSection = ({
  onTaskTemplateClick,
  onViewTemplatesClick
}: TaskManagementSectionProps) => {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>TASK MANAGEMENT</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              tooltip="Task Templates" 
              className="hover:bg-green-500/10 transition-colors duration-200" 
              onClick={onTaskTemplateClick}
            >
              <FileText className="text-green-500" />
              <span>Task Templates</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton 
              tooltip="View Templates" 
              className="hover:bg-green-500/10 transition-colors duration-200" 
              onClick={onViewTemplatesClick}
            >
              <Eye className="text-green-500" />
              <span>View Templates</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};
