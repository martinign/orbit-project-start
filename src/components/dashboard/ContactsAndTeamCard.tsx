
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, Contact } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ContactsAndTeamFilters {
  projectId?: string;
  status?: string;
  priority?: string;
}

interface ContactsAndTeamCardProps {
  filters?: ContactsAndTeamFilters;
}

export function ContactsAndTeamCard({ filters = {} }: ContactsAndTeamCardProps) {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["contacts_team_stats", filters],
    queryFn: async () => {
      // Query for team members
      let teamMembersQuery = supabase
        .from("project_team_members")
        .select("id", { count: "exact" });

      // Query for contacts
      let contactsQuery = supabase
        .from("project_contacts")
        .select("id", { count: "exact" });

      // Apply project filter if provided
      if (filters.projectId && filters.projectId !== "all") {
        teamMembersQuery = teamMembersQuery.eq("project_id", filters.projectId);
        contactsQuery = contactsQuery.eq("project_id", filters.projectId);
      }

      const [teamMembersResult, contactsResult] = await Promise.all([
        teamMembersQuery,
        contactsQuery
      ]);

      if (teamMembersResult.error || contactsResult.error) {
        throw new Error("Failed to fetch contacts and team statistics");
      }

      return {
        teamMembers: teamMembersResult.data?.length || 0,
        contacts: contactsResult.data?.length || 0
      };
    },
    refetchOnWindowFocus: false,
  });

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Contacts & Team</CardTitle>
        <CardDescription>Project contacts and team members</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                <span className="text-sm font-medium">Team Members</span>
              </div>
              <span className="text-xl font-bold">{stats?.teamMembers || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Contact className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium">Contacts</span>
              </div>
              <span className="text-xl font-bold">{stats?.contacts || 0}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
