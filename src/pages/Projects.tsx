import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { PlusCircle, LayoutGrid, LayoutList, Edit, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ProjectDialog from "@/components/ProjectDialog";
import ProjectCard from "@/components/ProjectCard";
import ProjectDetailsView from "@/components/ProjectDetailsView";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useParams, useNavigate } from "react-router-dom";
const Projects = () => {
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [filteredProjects, setFilteredProjects] = useState<any[]>([]);
  const {
    data: projects,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("projects").select("*").order("created_at", {
        ascending: false
      });
      if (error) throw error;
      return data;
    }
  });
  useEffect(() => {
    if (projects && projects.length > 0) {
      if (!searchQuery.trim()) {
        setFilteredProjects(projects);
        return;
      }
      const query = searchQuery.toLowerCase().trim();
      const filtered = projects.filter(project => project.project_number.toLowerCase().includes(query) || project.protocol_number.toLowerCase().includes(query) || project.protocol_title.toLowerCase().includes(query) || project.Sponsor.toLowerCase().includes(query) || project.status.toLowerCase().includes(query));
      setFilteredProjects(filtered);
    } else {
      setFilteredProjects([]);
    }
  }, [searchQuery, projects]);
  const handleDeleteProject = async (projectId: string) => {
    try {
      const {
        error
      } = await supabase.from("projects").delete().eq("id", projectId);
      if (error) {
        toast({
          title: "Error",
          description: "Failed to delete the project. Please try again.",
          variant: "destructive"
        });
        return;
      }
      toast({
        title: "Success",
        description: "Project deleted successfully."
      });
      refetch();
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting project:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    }
  };
  const openEditDialog = (project: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedProject(project);
    setIsProjectDialogOpen(true);
  };
  const openDeleteDialog = (project: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedProject(project);
    setIsDeleteDialogOpen(true);
  };
  const closeProjectDialog = () => {
    setSelectedProject(null);
    setIsProjectDialogOpen(false);
  };
  const handleProjectClick = (project: any) => {
    navigate(`/projects/${project.id}`);
  };
  if (id) {
    return <ProjectDetailsView />;
  }
  return <div className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Projects</h1>
        <div className="flex flex-wrap gap-3">
          <div className="relative w-64">
            <Input type="text" placeholder="Search projects..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
            <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
          </div>
          
          <div className="flex gap-2">
            <Button variant={viewMode === "table" ? "default" : "outline"} size="icon" onClick={() => setViewMode("table")} title="Table view">
              <LayoutList className="h-4 w-4" />
            </Button>
            <Button variant={viewMode === "card" ? "default" : "outline"} size="icon" onClick={() => setViewMode("card")} title="Card view" className="bg-blue-600 hover:bg-blue-500">
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
          
          <Button className="bg-blue-500 hover:bg-blue-600 text-white" onClick={() => setIsProjectDialogOpen(true)}>
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
          {isLoading ? <div className="flex justify-center p-4">Loading projects...</div> : filteredProjects && filteredProjects.length > 0 ? viewMode === "table" ? <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project Number</TableHead>
                    <TableHead>Protocol Number</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Sponsor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[120px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects.map(project => <TableRow key={project.id} className="cursor-pointer" onClick={() => handleProjectClick(project)}>
                      <TableCell>{project.project_number}</TableCell>
                      <TableCell>{project.protocol_number}</TableCell>
                      <TableCell className="max-w-xs truncate">{project.protocol_title}</TableCell>
                      <TableCell>{project.Sponsor}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${project.status === 'active' ? 'bg-green-100 text-green-800' : project.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : project.status === 'completed' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                          {project.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2" onClick={e => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" onClick={e => openEditDialog(project, e)} title="Edit project">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={e => openDeleteDialog(project, e)} title="Delete project">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>)}
                </TableBody>
              </Table> : <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                {filteredProjects.map(project => <div key={project.id} onClick={() => handleProjectClick(project)} className="cursor-pointer">
                    <ProjectCard project={project} onDelete={id => {
              openDeleteDialog(project);
              return false;
            }} onUpdate={() => refetch()} />
                  </div>)}
              </div> : <div className="text-center p-4">
              <p className="text-muted-foreground">
                {searchQuery ? "No projects match your search criteria" : "No projects found"}
              </p>
            </div>}
        </CardContent>
      </Card>

      <ProjectDialog open={isProjectDialogOpen} onClose={closeProjectDialog} onSuccess={() => {
      refetch();
      closeProjectDialog();
    }} project={selectedProject} />
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the project 
              "{selectedProject?.project_number} - {selectedProject?.protocol_title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => selectedProject && handleDeleteProject(selectedProject.id)} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>;
};
export default Projects;