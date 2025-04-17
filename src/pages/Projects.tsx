
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { PlusCircle, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Projects = () => {
  const { user } = useAuth();
  const [filterType, setFilterType] = useState<string | null>(null);

  // Fetch projects from Supabase
  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Projects</h1>
        <div className="flex flex-wrap gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Filter by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setFilterType("project_number")}>
                Project Number
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterType("sponsor")}>
                Sponsor
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button className="bg-blue-500 hover:bg-blue-600 text-white">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Project
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Projects</CardTitle>
          <CardDescription>
            Manage your clinical trial projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-4">Loading projects...</div>
          ) : projects && projects.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Number</TableHead>
                  <TableHead>Protocol Number</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Sponsor</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell>{project.project_number}</TableCell>
                    <TableCell>{project.protocol_number}</TableCell>
                    <TableCell className="max-w-xs truncate">{project.protocol_title}</TableCell>
                    <TableCell>{project.Sponsor}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        project.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {project.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center p-4">
              <p className="text-muted-foreground">No projects found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Projects;
