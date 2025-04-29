
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useInvitationsCount = () => {
  const { data: count = 0, refetch } = useQuery({
    queryKey: ["pending_invitations_count"],
    queryFn: async () => {
      try {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) return 0;

        // Explicitly requesting count only and using head:true to optimize query
        const { count, error } = await supabase
          .from("project_invitations")
          .select("*", { count: "exact", head: true })
          .eq("invitee_id", user.user.id)
          .eq("status", "pending");

        if (error) {
          console.error("Error fetching invitations count:", error);
          return 0;
        }

        return count || 0;
      } catch (error) {
        console.error("Error in invitations count query:", error);
        return 0;
      }
    },
  });

  useEffect(() => {
    // Set up realtime subscription to refresh count when invitations change
    const channel = supabase
      .channel("invitations_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "project_invitations",
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  return count;
};
