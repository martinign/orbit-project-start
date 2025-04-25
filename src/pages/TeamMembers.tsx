
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  LayoutGrid, 
  LayoutList, 
  Plus, 
  Search, 
  UserRound 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import TeamMembersList from "@/components/TeamMembersList";
import TeamMemberForm from "@/components/TeamMemberForm";
import { useToast } from "@/hooks/use-toast";

const TeamMembers = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [isCreateTeamMemberOpen, setIsCreateTeamMemberOpen] = useState(false);

  const { data: projects, isLoading: isLoadingProjects } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id, project_number, Sponsor")
        .order("project_number", { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-foreground">Team Members</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search team members..."
              className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "table" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("table")}
              title="Table view"
              className={viewMode === "table" ? "bg-purple-500 text-white hover:bg-purple-600" : ""}
            >
              <LayoutList className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "card" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("card")}
              title="Card view"
              className={viewMode === "card" ? "bg-purple-500 text-white hover:bg-purple-600" : ""}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>

          <Button 
            onClick={() => setIsCreateTeamMemberOpen(true)}
            className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white"
          >
            <Plus className="h-4 w-4" />
            Add Team Member
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Team Members</CardTitle>
          <CardDescription>
            Manage your team members across projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <Select 
              value={selectedProjectId || "all"} 
              onValueChange={(value) => setSelectedProjectId(value === "all" ? null : value)}
            >
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Filter by project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {isLoadingProjects ? (
                  <SelectItem value="loading">
                    Loading projects...
                  </SelectItem>
                ) : projects && projects.length > 0 ? (
                  projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.project_number} - {project.Sponsor}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-projects">
                    No projects found
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            
            {selectedProjectId && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedProjectId(null)}
                className="border-purple-500 text-purple-500 hover:bg-purple-50"
              >
                Clear Filter
              </Button>
            )}
          </div>

          <TeamMembersList 
            projectId={selectedProjectId} 
            searchQuery={searchQuery} 
            viewMode={viewMode} 
          />
        </CardContent>
      </Card>

      <Dialog open={isCreateTeamMemberOpen} onOpenChange={setIsCreateTeamMemberOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
            <DialogDescription>
              Add a new team member to your project
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <TeamMemberForm 
              projectId={selectedProjectId || undefined}
              onSuccess={() => {
                setIsCreateTeamMemberOpen(false);
                // Invalidate the query to refresh the data
                queryClient.invalidateQueries({ queryKey: ["team_members"] });
                toast({
                  title: "Team Member Added",
                  description: "The team member has been successfully added to the project.",
                });
              }} 
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeamMembers;
