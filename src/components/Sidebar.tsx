
import { Folder, LayoutDashboard, LogOut, Clock, ClipboardCheck, FileText, Link } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";
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
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";
import { useTotalNewItemsCount } from "@/hooks/useTotalNewItemsCount";
import { useLocation } from "react-router-dom";
import WorkdayCodeDialog from "./WorkdayCodeDialog";
import SurveyDialog from "./SurveyDialog";
import { useSurveyAvailability } from "@/hooks/useSurveyAvailability";
import { format } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function AppSidebar() {
  const {
    signOut
  } = useAuth();
  const queryClient = useQueryClient();
  const pendingInvitationsCount = useInvitationsCount();
  const {
    totalCount,
    hideBadge,
    showBadgeIfNewItems
  } = useTotalNewItemsCount();
  const location = useLocation();
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [isTaskTemplateDialogOpen, setIsTaskTemplateDialogOpen] = useState(false);
  const [isViewTemplatesDialogOpen, setIsViewTemplatesDialogOpen] = useState(false);
  const [isInviteMembersDialogOpen, setIsInviteMembersDialogOpen] = useState(false);
  const [isPendingInvitationsOpen, setIsPendingInvitationsOpen] = useState(false);
  const [isWorkdayCodeDialogOpen, setIsWorkdayCodeDialogOpen] = useState(false);
  const [isSurveyDialogOpen, setIsSurveyDialogOpen] = useState(false);
  const { canSubmitSurvey, loading: loadingSurveyAvailability } = useSurveyAvailability();

  // Subscribe to real-time task changes to update the new tasks badge
  useRealtimeSubscription({
    table: 'project_tasks',
    event: '*',
    onRecordChange: () => {
      queryClient.invalidateQueries({
        queryKey: ["new_tasks_count"]
      });
      showBadgeIfNewItems();
    }
  });

  // Subscribe to real-time event changes to update the new events badge
  useRealtimeSubscription({
    table: 'project_events',
    event: '*',
    onRecordChange: () => {
      queryClient.invalidateQueries({
        queryKey: ["new_events_count"]
      });
      showBadgeIfNewItems();
    }
  });

  const handleDashboardClick = () => {
    if (location.pathname === "/dashboard") {
      hideBadge();
    }
  };

  const handleWorkdayCodesClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsWorkdayCodeDialogOpen(true);
  };

  const handleSurveySuccess = () => {
    // Invalidate the survey availability query to update the UI
    queryClient.invalidateQueries({ queryKey: ["survey_availability"] });
  };

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
      } = await supabase.from("projects").select("id, project_number, protocol_number, protocol_title, Sponsor, description, status, project_type, updated_at").order("updated_at", {
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
                <RouterLink to="/dashboard">
                  <SidebarMenuButton tooltip="Dashboard" className="hover:bg-indigo-500/10 transition-colors duration-200" onClick={handleDashboardClick}>
                    <LayoutDashboard className="text-indigo-500" />
                    <span>Dashboard</span>
                    {totalCount > 0 && <Badge className="ml-auto bg-purple-500">
                        {totalCount} new
                      </Badge>}
                  </SidebarMenuButton>
                </RouterLink>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Popover>
                  <PopoverTrigger asChild>
                    <SidebarMenuButton
                      tooltip="Extra Features"
                      className="hover:bg-indigo-500/10 transition-colors duration-200"
                    >
                      <span>Extra Features</span>
                    </SidebarMenuButton>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-0">
                    <div className="rounded-md border border-gray-200 bg-white shadow-sm">
                      <div className="flex flex-col">
                        <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100">
                          <FileText className="h-4 w-4" />
                          <span>Site Initiation Tracker</span>
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100">
                          <Link className="h-4 w-4" />
                          <span>Important Links</span>
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100">
                          <Folder className="h-4 w-4" />
                          <span>Repository</span>
                        </button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>PROJECTS</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <RouterLink to="/projects">
                  <SidebarMenuButton tooltip="Projects" className="hover:bg-blue-500/10 transition-colors duration-200">
                    <Folder className="text-blue-500" />
                    <span>Projects</span>
                  </SidebarMenuButton>
                </RouterLink>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  tooltip="Workday Codes" 
                  className="hover:bg-blue-500/10 transition-colors duration-200"
                  onClick={handleWorkdayCodesClick}
                >
                  <Clock className="text-blue-500" />
                  <span>Workday Codes</span>
                </SidebarMenuButton>
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
      
      {/* Survey section - Moved to bottom, just before footer */}
      <SidebarGroup className="mt-auto">
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <SidebarMenuButton 
                        tooltip="Survey" 
                        className={`hover:bg-blue-500/10 transition-colors duration-200 ${!canSubmitSurvey ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => canSubmitSurvey && setIsSurveyDialogOpen(true)}
                        disabled={!canSubmitSurvey || loadingSurveyAvailability}
                      >
                        <ClipboardCheck className={`${canSubmitSurvey ? 'text-blue-500' : 'text-gray-400'}`} />
                        <span>SURVEY</span>
                      </SidebarMenuButton>
                    </div>
                  </TooltipTrigger>
                  {!canSubmitSurvey && (
                    <TooltipContent>
                      <p>You've already submitted a survey. Thank you for your feedback!</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
      
      <SidebarFooter className="border-t border-sidebar-border text-align: justify">
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

      <WorkdayCodeDialog 
        open={isWorkdayCodeDialogOpen} 
        onClose={() => setIsWorkdayCodeDialogOpen(false)} 
        onSuccess={() => {
          queryClient.invalidateQueries({
            queryKey: ["workday_codes"]
          });
          setIsWorkdayCodeDialogOpen(false);
        }} 
      />

      <SurveyDialog 
        open={isSurveyDialogOpen}
        onOpenChange={setIsSurveyDialogOpen}
        onSuccess={handleSurveySuccess}
      />
    </Sidebar>;
}
