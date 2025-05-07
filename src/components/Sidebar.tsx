
import { LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useInvitationsCount } from "@/hooks/useInvitationsCount";
import { Button } from "@/components/ui/button";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarGroup, 
  SidebarHeader, 
  SidebarGroupLabel, 
  SidebarGroupContent 
} from "@/components/ui/sidebar";
import { SidebarMenuItems } from "./sidebar/SidebarMenuItems";
import { ProjectInvitationsSection } from "./sidebar/ProjectInvitationsSection";
import { TaskManagementSection } from "./sidebar/TaskManagementSection";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";
import { useTotalNewItemsCount } from "@/hooks/useTotalNewItemsCount";
import { useLocation } from "react-router-dom";
import { useSurveyAvailability } from "@/hooks/useSurveyAvailability";
import { useMemberInvitationsCount } from "@/hooks/useMemberInvitationsCount";
import { useSidebarDialogs } from "./sidebar/SidebarDialogs";
import { OverviewSection } from "./sidebar/OverviewSection";
import { ProjectsSection } from "./sidebar/ProjectsSection";
import { SurveyButton } from "./sidebar/SurveyButton";
import { ProfileButton } from "./sidebar/ProfileButton";

export function AppSidebar() {
  const { signOut } = useAuth();
  const queryClient = useQueryClient();
  const memberInvitationsCount = useMemberInvitationsCount();
  const { totalCount, hideBadge, showBadgeIfNewItems } = useTotalNewItemsCount();
  const location = useLocation();
  const { canSubmitSurvey, loading: loadingSurveyAvailability } = useSurveyAvailability();

  const {
    setIsInviteMembersDialogOpen,
    setIsPendingInvitationsOpen,
    setIsProjectInvitesOpen,
    setIsTaskTemplateDialogOpen,
    setIsViewTemplatesDialogOpen,
    setIsWorkdayCodeDialogOpen,
    setIsSurveyDialogOpen,
    setIsExtraFeaturesDialogOpen,
    setIsProfileDialogOpen,
    setSelectedProjectId,
    dialogs
  } = useSidebarDialogs();

  // Subscribe to real-time task changes to update the new tasks badge
  useRealtimeSubscription({
    table: 'project_tasks',
    event: '*',
    onRecordChange: () => {
      queryClient.invalidateQueries({ queryKey: ["new_tasks_count"] });
      showBadgeIfNewItems();
    }
  });

  // Subscribe to real-time event changes to update the new events badge
  useRealtimeSubscription({
    table: 'project_events',
    event: '*',
    onRecordChange: () => {
      queryClient.invalidateQueries({ queryKey: ["new_events_count"] });
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
    // Extract project ID from URL if on a project page
    const projectIdMatch = location.pathname.match(/\/projects\/([^/]+)/);
    const currentProjectId = projectIdMatch ? projectIdMatch[1] : "";
    
    // Set the selected project ID before opening the dialog
    setSelectedProjectId(currentProjectId);
    setIsExtraFeaturesDialogOpen(true);
  };

  const handleSurveyClick = () => {
    canSubmitSurvey && setIsSurveyDialogOpen(true);
  };

  const handleProfileClick = () => {
    setIsProfileDialogOpen(true);
  };

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
      case 'active': return "text-green-500";
      case 'pending': return "text-yellow-500";
      case 'completed': return "text-blue-500";
      case 'cancelled': return "text-gray-500";
      default: return "text-gray-400";
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
          onExtraFeaturesClick={handleExtraFeaturesClick}
        />

        <ProjectsSection onWorkdayCodesClick={handleWorkdayCodesClick} />

        <ProjectInvitationsSection 
          memberInvitationsCount={memberInvitationsCount} 
          onInviteMembersClick={() => setIsInviteMembersDialogOpen(true)} 
          onPendingInvitationsClick={() => setIsPendingInvitationsOpen(true)}
          onProjectInvitesClick={() => setIsProjectInvitesOpen(true)}
        />

        <TaskManagementSection 
          onTaskTemplateClick={() => setIsTaskTemplateDialogOpen(true)} 
          onViewTemplatesClick={() => setIsViewTemplatesDialogOpen(true)} 
        />

        <SidebarGroup>
          <SidebarGroupLabel>RECENT PROJECTS</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenuItems recentProjects={recentProjects} getStatusColor={getStatusColor} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      {/* Profile and Survey section - Just before footer */}
      <SidebarGroup className="mt-auto">
        <SidebarGroupContent>
          <ProfileButton onClick={handleProfileClick} />
          <SurveyButton 
            canSubmitSurvey={canSubmitSurvey} 
            loadingSurveyAvailability={loadingSurveyAvailability} 
            onSurveyClick={handleSurveyClick} 
          />
        </SidebarGroupContent>
      </SidebarGroup>
      
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

      {/* All dialog components */}
      {dialogs}
    </Sidebar>
  );
}
