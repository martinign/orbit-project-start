
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface UserProfile {
  id: string;
  full_name: string | null;
  last_name: string | null;
  displayName?: string;
}

export const useUserProfile = (userId?: string | null) => {
  return useQuery({
    queryKey: ["user_profile", userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, last_name")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching user profile:", error);
        // Return a default value instead of throwing
        return { 
          id: userId, 
          full_name: "", 
          last_name: "",
          displayName: "Unknown User" 
        };
      }
      
      // If no data found, return default profile
      if (!data) {
        return {
          id: userId,
          full_name: "",
          last_name: "",
          displayName: "Unknown User"
        };
      }
      
      // Add a displayName property that combines full_name and last_name
      return {
        ...data,
        displayName: `${data.full_name || ''} ${data.last_name || ''}`.trim() || 'Unknown User'
      };
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};
