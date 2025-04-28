import { Folder, LayoutDashboard, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useInvitationsCount } from "@/hooks/useInvitationsCount";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { SidebarMenuItems } from "./sidebar/SidebarMenuItems";
import { ProjectInvitationsSection } from "./sidebar/ProjectInvitationsSection";
import { TaskManagementSection } from "./sidebar/TaskManagementSection";
import ProjectDialog from "./ProjectDialog";
import TaskTemplateDialog from "./TaskTemplateDialog";
import TaskTemplatesListDialog from "./TaskTemplatesListDialog";
import InviteMembersDialog from "./team-members/InviteMembersDialog";
import PendingInvitationsDialog from "./team-members/PendingInvitationsDialog";
export function AppSidebar() {
  const {
    signOut
  } = useAuth();
  const queryClient = useQueryClient();
  const pendingInvitationsCount = useInvitationsCount();
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [isTaskTemplateDialogOpen, setIsTaskTemplateDialogOpen] = useState(false);
  const [isViewTemplatesDialogOpen, setIsViewTemplatesDialogOpen] = useState(false);
  const [isInviteMembersDialogOpen, setIsInviteMembersDialogOpen] = useState(false);
  const [isPendingInvitationsOpen, setIsPendingInvitationsOpen] = useState(false);
  const {
    data: newTasksCount
  } = useQuery({
    queryKey: ["new_tasks_count"],
    queryFn: async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const {
        count,
        error
      } = await supabase.from("project_tasks").select("id", {
        count: "exact"
      }).gte("created_at", yesterday.toISOString());
      if (error) throw error;
      return count || 0;
    }
  });
  const {
    data: recentProjects,
    refetch: refetchRecentProjects
  } = useQuery({
    queryKey: ["recent_projects"],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("projects").select("id, project_number, protocol_number, protocol_title, Sponsor, description, status, updated_at").order("updated_at", {
        ascending: false
      }).limit(5);
      if (error) throw error;
      return data || [];
    },
    staleTime: 1 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: true
  });
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return "text-green-500";
      case 'pending':
        return "text-yellow-500";
      case 'completed':
        return "text-blue-500";
      case 'cancelled':
        return "text-gray-500";
      default:
        return "text-gray-400";
    }
  };
  return <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center p-2">
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-blue-300">
            PXL Management Tool
          </h2>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>OVERVIEW</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link to="/dashboard">
                  <SidebarMenuButton tooltip="Dashboard" className="hover:bg-indigo-500/10 transition-colors duration-200">
                    <LayoutDashboard className="text-indigo-500" />
                    <span>Dashboard</span>
                    {newTasksCount > 0 && <Badge className="ml-auto bg-purple-500">
                        {newTasksCount} new
                      </Badge>}
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

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
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <ProjectInvitationsSection pendingInvitationsCount={pendingInvitationsCount} onInviteMembersClick={() => setIsInviteMembersDialogOpen(true)} onPendingInvitationsClick={() => setIsPendingInvitationsOpen(true)} />

        <TaskManagementSection onTaskTemplateClick={() => setIsTaskTemplateDialogOpen(true)} onViewTemplatesClick={() => setIsViewTemplatesDialogOpen(true)} />

        <SidebarGroup>
          <SidebarGroupLabel>RECENT PROJECTS</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenuItems recentProjects={recentProjects} getStatusColor={getStatusColor} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>     
      
      <SidebarFooter className="border-t border-sidebar-border text-align: justify">
        <div className="text-sm text-red-700 p-2 py-0">Please be careful with the data you add. I am not responsible for any content included. This is not an official app and is in the development phase.</div>     
        <Button variant="ghost" className="w-full justify-start text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors duration-200 mt-2" onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </SidebarFooter>

      <TaskTemplateDialog open={isTaskTemplateDialogOpen} onClose={() => setIsTaskTemplateDialogOpen(false)} onSuccess={() => {
      queryClient.invalidateQueries({
        queryKey: ["task_templates"]
      });
      setIsTaskTemplateDialogOpen(false);
    }} />

      <TaskTemplatesListDialog open={isViewTemplatesDialogOpen} onClose={() => setIsViewTemplatesDialogOpen(false)} />

      <ProjectDialog open={isProjectDialogOpen} onClose={() => setIsProjectDialogOpen(false)} onSuccess={() => {
      refetchRecentProjects();
      queryClient.invalidateQueries({
        queryKey: ["projects"]
      });
      setIsProjectDialogOpen(false);
    }} />

      <InviteMembersDialog open={isInviteMembersDialogOpen} onClose={() => setIsInviteMembersDialogOpen(false)} />

      <PendingInvitationsDialog open={isPendingInvitationsOpen} onClose={() => setIsPendingInvitationsOpen(false)} />
    </Sidebar>;
}