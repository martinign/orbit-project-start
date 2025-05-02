
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import TaskTemplateDialog from "@/components/TaskTemplateDialog";
import TaskTemplatesListDialog from "@/components/TaskTemplatesListDialog";
import ProjectDialog from "@/components/ProjectDialog";
import InviteMembersDialog from "@/components/team-members/InviteMembersDialog";
import PendingInvitationsDialog from "@/components/team-members/PendingInvitationsDialog";
import ProjectInvitesDialog from "@/components/team-members/ProjectInvitesDialog";
import WorkdayCodeDialog from "@/components/WorkdayCodeDialog";
import SurveyDialog from "@/components/SurveyDialog";
import { ExtraFeaturesDialog } from "@/components/dashboard/ExtraFeaturesDialog";

export const useSidebarDialogs = () => {
  const queryClient = useQueryClient();
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [isTaskTemplateDialogOpen, setIsTaskTemplateDialogOpen] = useState(false);
  const [isViewTemplatesDialogOpen, setIsViewTemplatesDialogOpen] = useState(false);
  const [isInviteMembersDialogOpen, setIsInviteMembersDialogOpen] = useState(false);
  const [isPendingInvitationsOpen, setIsPendingInvitationsOpen] = useState(false);
  const [isProjectInvitesOpen, setIsProjectInvitesOpen] = useState(false);
  const [isWorkdayCodeDialogOpen, setIsWorkdayCodeDialogOpen] = useState(false);
  const [isSurveyDialogOpen, setIsSurveyDialogOpen] = useState(false);
  const [isExtraFeaturesDialogOpen, setIsExtraFeaturesDialogOpen] = useState(false);
  // Added a state for holding the selected project ID when opening from sidebar
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  const handleSurveySuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["survey_availability"] });
  };

  return {
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
    isProjectInvitesOpen,
    setIsProjectInvitesOpen,
    isWorkdayCodeDialogOpen,
    setIsWorkdayCodeDialogOpen,
    isSurveyDialogOpen,
    setIsSurveyDialogOpen,
    isExtraFeaturesDialogOpen,
    setIsExtraFeaturesDialogOpen,
    selectedProjectId,
    setSelectedProjectId,
    dialogs: (
      <>
        <TaskTemplateDialog 
          open={isTaskTemplateDialogOpen} 
          onClose={() => setIsTaskTemplateDialogOpen(false)} 
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["task_templates"] });
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
            queryClient.invalidateQueries({ queryKey: ["recent_projects"] });
            queryClient.invalidateQueries({ queryKey: ["projects"] });
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
        
        <ProjectInvitesDialog 
          open={isProjectInvitesOpen} 
          onClose={() => setIsProjectInvitesOpen(false)} 
        />

        <WorkdayCodeDialog 
          open={isWorkdayCodeDialogOpen} 
          onClose={() => setIsWorkdayCodeDialogOpen(false)} 
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["workday_codes"] });
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
          projectId={selectedProjectId || "default"}  
        />
      </>
    ),
  };
};
