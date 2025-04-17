
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ContactsList from "@/components/ContactsList";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface Project {
  id: string;
  project_number: string;
  Sponsor: string;
}

const Contacts = () => {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const { data: projects, isLoading: isLoadingProjects } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id, project_number, Sponsor")
        .order("project_number", { ascending: true });
      
      if (error) throw error;
      return data as Project[];
    },
  });

  const handleClearFilter = () => {
    setSelectedProjectId(null);
  };

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-6">Contacts</h1>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Contacts</CardTitle>
              <CardDescription>
                Manage your contacts and network connections
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={selectedProjectId || ""} onValueChange={setSelectedProjectId}>
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Filter by project" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingProjects ? (
                    <SelectItem value="loading" disabled>Loading projects...</SelectItem>
                  ) : projects && projects.length > 0 ? (
                    projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.project_number} - {project.Sponsor}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>No projects found</SelectItem>
                  )}
                </SelectContent>
              </Select>
              {selectedProjectId && (
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={handleClearFilter}
                  title="Clear filter"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ContactsList projectId={selectedProjectId} />
        </CardContent>
      </Card>
    </div>
  );
};

export default Contacts;
