
import { Folder, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem 
} from "@/components/ui/sidebar";

interface ProjectsSectionProps {
  onWorkdayCodesClick: (e: React.MouseEvent) => void;
}

export const ProjectsSection = ({ onWorkdayCodesClick }: ProjectsSectionProps) => {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>PROJECTS</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link to="/projects">
              <SidebarMenuButton tooltip="Projects" className="hover:bg-blue-500/10 transition-colors duration-200">
                <Folder className="text-blue-500" />
                <span>Projects</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton 
              tooltip="Workday Codes" 
              className="hover:bg-blue-500/10 transition-colors duration-200"
              onClick={onWorkdayCodesClick}
            >
              <Clock className="text-blue-500" />
              <span>Workday Codes</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};
