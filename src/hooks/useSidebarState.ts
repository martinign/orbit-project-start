
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";

export const useSidebarState = () => {
  const queryClient = useQueryClient();
  const location = useLocation();
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [isTaskTemplateDialogOpen, setIsTaskTemplateDialogOpen] = useState(false);
  const [isViewTemplatesDialogOpen, setIsViewTemplatesDialogOpen] = useState(false);
  const [isInviteMembersDialogOpen, setIsInviteMembersDialogOpen] = useState(false);
  const [isPendingInvitationsOpen, setIsPendingInvitationsOpen] = useState(false);
  const [isWorkdayCodeDialogOpen, setIsWorkdayCodeDialogOpen] = useState(false);
  const [isSurveyDialogOpen, setIsSurveyDialogOpen] = useState(false);

  // Subscribe to real-time task changes to update the new tasks badge
  useRealtimeSubscription({
    table: 'project_tasks',
    event: '*',
    onRecordChange: () => {
      queryClient.invalidateQueries({
        queryKey: ["new_tasks_count"]
      });
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
    }
  });

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

  return {
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
    newTasksCount,
    getStatusColor,
  };
};
