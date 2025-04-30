import { LogOut } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useInvitationsCount } from "@/hooks/useInvitationsCount";
import { useTotalNewItemsCount } from "@/hooks/useTotalNewItemsCount";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarHeader 
} from "@/components/ui/sidebar";
import { ProjectInvitationsSection } from "./sidebar/ProjectInvitationsSection";
import { TaskManagementSection } from "./sidebar/TaskManagementSection";
import { SidebarMenuItems } from "./sidebar/SidebarMenuItems";
import { ProjectsSection } from "./sidebar/ProjectsSection";
import { OverviewSection } from "./sidebar/OverviewSection";
import { SurveySection } from "./sidebar/SurveySection";
import { ExtraFeaturesSection } from "./sidebar/ExtraFeaturesSection";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";
import { useSurveyAvailability } from "@/hooks/useSurveyAvailability";
import ProjectDialog from "./ProjectDialog";
import TaskTemplateDialog from "./TaskTemplateDialog";
import TaskTemplatesListDialog from "./TaskTemplatesListDialog";
import InviteMembersDialog from "./team-members/InviteMembersDialog";
import PendingInvitationsDialog from "./team-members/PendingInvitationsDialog";
import WorkdayCodeDialog from "./WorkdayCodeDialog";
import SurveyDialog from "./SurveyDialog";
import ExtraFeaturesDialog from "./ExtraFeaturesDialog";

export function AppSidebar() {
  const { signOut } = useAuth();
  const queryClient = useQueryClient();
  const pendingInvitationsCount = useInvitationsCount();
  const { totalCount, hideBadge, showBadgeIfNewItems } = useTotalNewItemsCount();
  const location = useLocation();
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [isTaskTemplateDialogOpen, setIsTaskTemplateDialogOpen] = useState(false);
  const [isViewTemplatesDialogOpen, setIsViewTemplatesDialogOpen] = useState(false);
  const [isInviteMembersDialogOpen, setIsInviteMembersDialogOpen] = useState(false);
  const [isPendingInvitationsOpen, setIsPendingInvitationsOpen] = useState(false);
  const [isWorkdayCodeDialogOpen, setIsWorkdayCodeDialogOpen] = useState(false);
  const [isSurveyDialogOpen, setIsSurveyDialogOpen] = useState(false);
  const [isExtraFeaturesDialogOpen, setIsExtraFeaturesDialogOpen] = useState(false);
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

  const handleExtraFeaturesClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsExtraFeaturesDialogOpen(true);
  };

  const handleSurveySuccess = () => {
    // Invalidate the survey availability query to update the UI
    queryClient.invalidateQueries({ queryKey: ["survey_availability"] });
  };

  const { data: newTasksCount } = useQuery({
    queryKey: ["new_tasks_count"],
    queryFn: async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const { count, error } = await supabase
        .from("project_tasks")
        .select("id", { count: "exact", head: true })
        .gte("created_at", yesterday.toISOString());
      if (error) throw error;
      return count || 0;
    }
  });

  const { data: recentProjects, refetch: refetchRecentProjects } = useQuery({
    queryKey: ["recent_projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id, project_number, protocol_number, protocol_title, Sponsor, description, status, project_type, updated_at")
        .order("updated_at", { ascending: false })
        .limit(5);
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

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center p-2">
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-blue-300">
            PXL Management Tool
          </h2>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <OverviewSection 
          totalCount={totalCount} 
          onDashboardClick={handleDashboardClick} 
        />
        
        <ExtraFeaturesSection onExtraFeaturesClick={handleExtraFeaturesClick} />
        
        <ProjectsSection onWorkdayCodesClick={handleWorkdayCodesClick} />

        <ProjectInvitationsSection 
          pendingInvitationsCount={pendingInvitationsCount} 
          onInviteMembersClick={() => setIsInviteMembersDialogOpen(true)} 
          onPendingInvitationsClick={() => setIsPendingInvitationsOpen(true)} 
        />

        <TaskManagementSection 
          onTaskTemplateClick={() => setIsTaskTemplateDialogOpen(true)} 
          onViewTemplatesClick={() => setIsViewTemplatesDialogOpen(true)} 
        />

        <div className="sidebar-group">
          <div className="sidebar-group-label">RECENT PROJECTS</div>
          <div className="sidebar-group-content">
            <SidebarMenuItems recentProjects={recentProjects} getStatusColor={getStatusColor} />
          </div>
        </div>
      </SidebarContent>
      
      <SurveySection 
        canSubmitSurvey={canSubmitSurvey}
        loadingSurveyAvailability={loadingSurveyAvailability}
        onSurveyClick={() => setIsSurveyDialogOpen(true)}
      />
      
      <SidebarFooter className="border-t border-sidebar-border text-align: justify">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors duration-200 mt-2" 
          onClick={signOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </SidebarFooter>

      <TaskTemplateDialog 
        open={isTaskTemplateDialogOpen} 
        onClose={() => setIsTaskTemplateDialogOpen(false)} 
        onSuccess={() => {
          queryClient.invalidateQueries({
            queryKey: ["task_templates"]
          });
          setIsTaskTemplateDialogOpen(false);
        }} 
      />

      <TaskTemplatesListDialog 
        open={isViewTemplatesDialogOpen} 
        onClose={() => setIsViewTemplatesDialogOpen(false)} 
      />

      <ProjectDialog 
        open={isProjectDialogOpen} 
        onClose={() => setIsProjectDialogOpen(false)} 
        onSuccess={() => {
          refetchRecentProjects();
          queryClient.invalidateQueries({
            queryKey: ["projects"]
          });
          setIsProjectDialogOpen(false);
        }} 
      />

      <InviteMembersDialog 
        open={isInviteMembersDialogOpen} 
        onClose={() => setIsInviteMembersDialogOpen(false)} 
      />

      <PendingInvitationsDialog 
        open={isPendingInvitationsOpen} 
        onClose={() => setIsPendingInvitationsOpen(false)} 
      />

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

      <ExtraFeaturesDialog 
        open={isExtraFeaturesDialogOpen} 
        onOpenChange={setIsExtraFeaturesDialogOpen} 
      />
    </Sidebar>
  );
}
