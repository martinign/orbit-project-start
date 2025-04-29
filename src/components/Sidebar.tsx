
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTotalNewItemsCount } from "@/hooks/useTotalNewItemsCount";
import { useInvitationsCount } from "@/hooks/useInvitationsCount";
import { useSurveyAvailability } from "@/hooks/useSurveyAvailability";
import { useSidebarState } from "@/hooks/useSidebarState";
import { Sidebar } from "@/components/ui/sidebar";

import { OverviewSection } from "./sidebar/OverviewSection";
import { ProjectsSection } from "./sidebar/ProjectsSection";
import { ProjectInvitationsSection } from "./sidebar/ProjectInvitationsSection";
import { TaskManagementSection } from "./sidebar/TaskManagementSection";
import { RecentProjectsSection } from "./sidebar/RecentProjectsSection";
import { SurveyButton } from "./sidebar/SurveyButton";
import { FooterSection } from "./sidebar/FooterSection";

// Import dialogs
import ProjectDialog from "./ProjectDialog";
import TaskTemplateDialog from "./TaskTemplateDialog";
import TaskTemplatesListDialog from "./TaskTemplatesListDialog";
import InviteMembersDialog from "./team-members/InviteMembersDialog";
import PendingInvitationsDialog from "./team-members/PendingInvitationsDialog";
import WorkdayCodeDialog from "./WorkdayCodeDialog";
import SurveyDialog from "./SurveyDialog";

export function AppSidebar() {
  const { signOut } = useAuth();
  const queryClient = useQueryClient();
  const { 
    totalCount, 
    hideBadge, 
    showBadgeIfNewItems 
  } = useTotalNewItemsCount();
  const pendingInvitationsCount = useInvitationsCount();
  const { 
    canSubmitSurvey, 
    nextAvailableDate, 
    loading: loadingSurveyAvailability 
  } = useSurveyAvailability();
  
  const {
    location,
    isProjectDialogOpen,
    setIsProjectDialogOpen,
    isTaskTemplateDialogOpen,
    setIsTaskTemplateDialogOpen,
    isViewTemplatesDialogOpen,
    setIsViewTemplatesDialogOpen,
    isInviteMembersDialogOpen,
    setIsInviteMembersDialogOpen,
    isPendingInvitationsOpen,
    setIsPendingInvitationsOpen,
    isWorkdayCodeDialogOpen,
    setIsWorkdayCodeDialogOpen,
    isSurveyDialogOpen,
    setIsSurveyDialogOpen,
    handleWorkdayCodesClick,
    handleSurveySuccess,
    getStatusColor,
  } = useSidebarState();

  const handleDashboardClick = () => {
    if (location.pathname === "/dashboard") {
      hideBadge();
    }
  };

  return <Sidebar>
      <OverviewSection 
        totalCount={totalCount} 
        onDashboardClick={handleDashboardClick} 
      />
      
      <ProjectsSection 
        onWorkdayCodesClick={handleWorkdayCodesClick} 
      />
      
      <ProjectInvitationsSection 
        pendingInvitationsCount={pendingInvitationsCount} 
        onInviteMembersClick={() => setIsInviteMembersDialogOpen(true)} 
        onPendingInvitationsClick={() => setIsPendingInvitationsOpen(true)} 
      />
      
      <TaskManagementSection 
        onTaskTemplateClick={() => setIsTaskTemplateDialogOpen(true)} 
        onViewTemplatesClick={() => setIsViewTemplatesDialogOpen(true)} 
      />
      
      <RecentProjectsSection 
        getStatusColor={getStatusColor} 
      />
      
      <SurveyButton 
        canSubmitSurvey={canSubmitSurvey}
        loadingSurveyAvailability={loadingSurveyAvailability}
        nextAvailableDate={nextAvailableDate}
        onOpenSurvey={() => setIsSurveyDialogOpen(true)}
      />
      
      <FooterSection onSignOut={signOut} />

      {/* Dialogs */}
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
          queryClient.invalidateQueries({
            queryKey: ["recent_projects", "projects"]
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
    </Sidebar>;
}
