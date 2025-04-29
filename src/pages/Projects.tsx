
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { PlusCircle, LayoutGrid, LayoutList, Edit, Trash2, Search, Filter } from "lucide-react";
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
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Combobox } from "@/components/ui/combobox";

const Projects = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { id } = useParams<{ id: string; }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract filterStatus from location state if available
  const locationState = location.state as { filterStatus?: string } | null;
  const initialStatusFilter = locationState?.filterStatus || "";
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [filteredProjects, setFilteredProjects] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "billable" | "non-billable">("all");
  const [statusFilter, setStatusFilter] = useState<string>(initialStatusFilter);
  
  // Clear location state after reading the filterStatus
  useEffect(() => {
    if (locationState?.filterStatus) {
      // Replace the current history entry to clear the state
      navigate(location.pathname, { replace: true });
    }
  }, [locationState, navigate, location.pathname]);
  
  const { data: projects, isLoading, refetch } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });
  
  // Filter projects based on search query, tab selection, and status filter
  useEffect(() => {
    if (projects && projects.length > 0) {
      let filtered = projects;

      // Filter by tab selection
      if (activeTab !== "all") {
        filtered = filtered.filter(project => project.project_type === activeTab);
      }

      // Filter by status if specified
      if (statusFilter) {
        filtered = filtered.filter(project => project.status === statusFilter);
      }

      // Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        filtered = filtered.filter(project => 
          project.project_number.toLowerCase().includes(query) || 
          (project.protocol_number && project.protocol_number.toLowerCase().includes(query)) || 
          (project.protocol_title && project.protocol_title.toLowerCase().includes(query)) || 
          (project.Sponsor && project.Sponsor.toLowerCase().includes(query)) || 
          project.status.toLowerCase().includes(query)
        );
      }
      
      setFilteredProjects(filtered);
    } else {
      setFilteredProjects([]);
    }
  }, [searchQuery, projects, activeTab, statusFilter]);
  
  // Reset status filter when changing tabs
  useEffect(() => {
    setStatusFilter("");
  }, [activeTab]);

  // Get unique status options from projects
  const getStatusOptions = () => {
    if (!projects) return [];
    
    // Get unique status values
    const statusSet = new Set<string>();
    projects.forEach(project => {
      if (activeTab === "all" || project.project_type === activeTab) {
        statusSet.add(project.status);
      }
    });
    
    // Convert to options array
    return Array.from(statusSet).map(status => ({
      value: status,
      label: status.charAt(0).toUpperCase() + status.slice(1)
    }));
  };

  // Display visual indicator of active status filter
  const renderStatusFilterIndicator = () => {
    if (!statusFilter) return null;
    
    return (
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm">Filtered by status:</span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          statusFilter === 'active' ? 'bg-green-100 text-green-800' : 
          statusFilter === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
          statusFilter === 'completed' ? 'bg-blue-100 text-blue-800' : 
          statusFilter === 'cancelled' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {statusFilter}
        </span>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setStatusFilter("")} 
          className="h-6 px-2 text-xs"
        >
          Clear
        </Button>
      </div>
    );
  };
  
  const handleDeleteProject = async (projectId: string) => {
    try {
      const { error } = await supabase.from("projects").delete().eq("id", projectId);
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

  // Render the status filter dropdown
  const renderStatusFilter = () => {
    const statusOptions = getStatusOptions();
    return (
      <div className="w-44">
        <Combobox
          options={[
            { value: "", label: "All Statuses" },
            ...statusOptions
          ]}
          value={statusFilter}
          onChange={setStatusFilter}
          placeholder="Filter by status"
          className="h-9"
        />
      </div>
    );
  };

  if (id) {
    return <ProjectDetailsView />;
  }

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Projects</h1>
        <div className="flex flex-wrap gap-3">
          <div className="relative w-64">
            <Input type="text" placeholder="Search projects..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
            <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
          </div>
          
          <div className="flex gap-2">
            <Button variant={viewMode === "table" ? "default" : "outline"} size="icon" onClick={() => setViewMode("table")} title="Table view" className={viewMode === "table" ? "bg-blue-500 text-white hover:bg-blue-600" : ""}>
              <LayoutList className="h-4 w-4" />
            </Button>
            <Button variant={viewMode === "card" ? "default" : "outline"} size="icon" onClick={() => setViewMode("card")} title="Card view" className={viewMode === "card" ? "bg-blue-500 text-white hover:bg-blue-600" : ""}>
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
          
          <Button className="bg-blue-500 hover:bg-blue-600 text-white" onClick={() => setIsProjectDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Project
          </Button>
        </div>
      </div>

      {statusFilter && renderStatusFilterIndicator()}

      <Tabs defaultValue="all" value={activeTab} onValueChange={value => setActiveTab(value as "all" | "billable" | "non-billable")}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Projects</TabsTrigger>
          <TabsTrigger value="billable">Billable</TabsTrigger>
          <TabsTrigger value="non-billable">Non-billable</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>All Projects</CardTitle>
                <CardDescription>
                  Manage your clinical trial projects
                </CardDescription>
              </div>
              {renderStatusFilter()}
            </CardHeader>
            <CardContent>
              {isLoading ? <div className="flex justify-center p-4">Loading projects...</div> : filteredProjects && filteredProjects.length > 0 ? viewMode === "table" ? <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Project ID</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Sponsor</TableHead>
                          <TableHead>Protocol Number</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="w-[120px] text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredProjects.map(project => <TableRow key={project.id} className="cursor-pointer" onClick={() => handleProjectClick(project)}>
                            <TableCell>{project.project_number}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${project.project_type === 'billable' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                {project.project_type === 'billable' ? 'Billable' : 'Non-billable'}
                              </span>
                            </TableCell>
                            <TableCell>{project.Sponsor || '-'}</TableCell>
                            <TableCell>{project.protocol_number || '-'}</TableCell>
                            <TableCell className="max-w-xs truncate">{project.protocol_title || '-'}</TableCell>
                            <TableCell className="max-w-xs truncate">{project.description}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                project.status === 'active' ? 'bg-green-100 text-green-800' : 
                                project.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                project.status === 'completed' ? 'bg-blue-100 text-blue-800' : 
                                project.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
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
                    {searchQuery ? "No projects match your search criteria" : statusFilter ? `No ${statusFilter} projects found` : "No projects found"}
                  </p>
                </div>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billable">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Billable Projects</CardTitle>
                <CardDescription>
                  Manage your billable clinical trial projects
                </CardDescription>
              </div>
              {renderStatusFilter()}
            </CardHeader>
            <CardContent>
              {isLoading ? <div className="flex justify-center p-4">Loading projects...</div> : filteredProjects && filteredProjects.length > 0 ? viewMode === "table" ? <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Project ID</TableHead>
                          <TableHead>Sponsor</TableHead>
                          <TableHead>Protocol Number</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="w-[120px] text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredProjects.map(project => <TableRow key={project.id} className="cursor-pointer" onClick={() => handleProjectClick(project)}>
                            <TableCell>{project.project_number}</TableCell>
                            <TableCell>{project.Sponsor || '-'}</TableCell>
                            <TableCell>{project.protocol_number || '-'}</TableCell>
                            <TableCell className="max-w-xs truncate">{project.protocol_title || '-'}</TableCell>
                            <TableCell className="max-w-xs truncate">{project.description}</TableCell>
                            <TableCell>{project.role || 'owner'}</TableCell>
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
                    {statusFilter ? `No ${statusFilter} billable projects found` : "No billable projects found"}
                  </p>
                </div>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="non-billable">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Non-billable Projects</CardTitle>
                <CardDescription>
                  Manage your non-billable projects
                </CardDescription>
              </div>
              {renderStatusFilter()}
            </CardHeader>
            <CardContent>
              {isLoading ? <div className="flex justify-center p-4">Loading projects...</div> : filteredProjects && filteredProjects.length > 0 ? viewMode === "table" ? <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Project ID</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="w-[120px] text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredProjects.map(project => <TableRow key={project.id} className="cursor-pointer" onClick={() => handleProjectClick(project)}>
                            <TableCell>{project.project_number}</TableCell>
                            <TableCell className="max-w-xs truncate">{project.description}</TableCell>
                            <TableCell>{project.role || 'owner'}</TableCell>
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
                    {statusFilter ? `No ${statusFilter} non-billable projects found` : "No non-billable projects found"}
                  </p>
                </div>}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
    </div>
  );
};

export default Projects;
