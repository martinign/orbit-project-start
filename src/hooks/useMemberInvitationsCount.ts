
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useMemberInvitationsCount = () => {
  const { data: count = 0, refetch } = useQuery({
    queryKey: ["pending_member_invitations_count"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return 0;

      // Log the current user ID for debugging
      console.log("Fetching invitation count for user:", user.user.id);

      const { count, error } = await supabase
        .from("member_invitations")
        .select("*", { count: "exact", head: true })
        .eq("invitation_recipient_id", user.user.id)
        .eq("invitation_status", "pending");

      if (error) {
        console.error("Error fetching member invitations count:", error);
        return 0;
      }

      return count || 0;
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel("member_invitations_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "member_invitations",
        },
        () => {
          console.log("Member invitations changed, refetching count");
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
