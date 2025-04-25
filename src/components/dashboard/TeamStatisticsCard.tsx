
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function TeamStatisticsCard() {
  const { data: teamStats, isLoading } = useQuery({
    queryKey: ["team_statistics"],
    queryFn: async () => {
      // Get total team members across all projects
      const { data: teamMembers, error: teamError } = await supabase
        .from("project_team_members")
        .select("id, project_id");

      if (teamError) throw teamError;

      // Get total projects
      const { data: projects, error: projectError } = await supabase
        .from("projects")
        .select("id");

      if (projectError) throw projectError;

      // Calculate team members per project
      const projectsWithMembers = teamMembers.reduce((acc, member) => {
        acc[member.project_id] = (acc[member.project_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Get projects with team members
      const projectsWithTeam = Object.keys(projectsWithMembers).length;

      return {
        totalTeamMembers: teamMembers.length,
        totalProjects: projects.length,
        projectsWithTeam,
        projectsWithoutTeam: projects.length - projectsWithTeam,
      };
    },
    refetchOnWindowFocus: false,
  });

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Team Overview</CardTitle>
        <CardDescription>Team distribution across projects</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Team Members</span>
              <span className="text-xl font-bold">{teamStats?.totalTeamMembers || 0}</span>
            </div>
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">Projects with Team</span>
                <span className="text-sm font-medium">{teamStats?.projectsWithTeam || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Projects without Team</span>
                <span className="text-sm font-medium">{teamStats?.projectsWithoutTeam || 0}</span>
              </div>
              <div className="mt-2 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                {teamStats?.totalProjects && teamStats.totalProjects > 0 ? (
                  <div 
                    className="bg-purple-500 h-full" 
                    style={{ 
                      width: `${(teamStats.projectsWithTeam / teamStats.totalProjects) * 100}%` 
                    }} 
                  />
                ) : null}
              </div>
              <div className="flex justify-between mt-1 text-xs">
                <span>0%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
