
import { Circle, Folder, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";

interface RecentProject {
  id: string;
  project_number: string;
  Sponsor: string;
  status: string;
}

interface SidebarMenuItemsProps {
  recentProjects: RecentProject[] | undefined;
  getStatusColor: (status: string) => string;
}

export const SidebarMenuItems = ({ recentProjects, getStatusColor }: SidebarMenuItemsProps) => {
  return (
    <SidebarMenu>
      {recentProjects && recentProjects.length > 0 ? (
        recentProjects.map(project => (
          <SidebarMenuItem key={project.id}>
            <Link to={`/projects/${project.id}`}>
              <SidebarMenuButton tooltip={`${project.project_number} - ${project.Sponsor}`} className="hover:bg-blue-500/10 transition-colors duration-200">
                <Circle className={`h-3 w-3 ${getStatusColor(project.status)}`} />
                <span className="truncate max-w-[150px]">
                  {project.project_number} - {project.Sponsor}
                </span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        ))
      ) : (
        <SidebarMenuItem>
          <SidebarMenuButton className="text-gray-400 cursor-default">
            <span>No recent projects</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      )}
    </SidebarMenu>
  );
};
