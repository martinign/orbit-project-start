
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel } from "@/components/ui/sidebar";
import { SidebarMenuItems } from "./SidebarMenuItems";

interface RecentProjectsSectionProps {
  getStatusColor: (status: string) => string;
}

export const RecentProjectsSection = ({ getStatusColor }: RecentProjectsSectionProps) => {
  const {
    data: recentProjects,
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

  return (
    <SidebarGroup>
      <SidebarGroupLabel>RECENT PROJECTS</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenuItems recentProjects={recentProjects} getStatusColor={getStatusColor} />
      </SidebarGroupContent>
    </SidebarGroup>
  );
};
