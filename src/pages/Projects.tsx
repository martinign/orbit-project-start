
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProjectDialog from "@/components/ProjectDialog";
import ProjectDetailsView from "@/components/ProjectDetailsView";
import { useProjects } from "@/hooks/useProjects";
import ProjectsHeader from "@/components/projects/ProjectsHeader";
import StatusFilterIndicator from "@/components/projects/StatusFilterIndicator";
import ProjectsTabContent from "@/components/projects/ProjectsTabContent";
import DeleteProjectDialog from "@/components/projects/DeleteProjectDialog";

const Projects = () => {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Extract filterStatus from location state if available
  const locationState = location.state as { filterStatus?: string } | null;
  const initialStatusFilter = locationState?.filterStatus || "";
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { 
    filteredProjects,
    isLoading,
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    activeTab,
    setActiveTab,
    statusFilter,
    setStatusFilter,
    handleDeleteProject,
    refetch
  } = useProjects();
  
  // Set initial status filter from location state
  useEffect(() => {
    if (initialStatusFilter) {
      setStatusFilter(initialStatusFilter);
    }
  }, [initialStatusFilter]);

  // Clear location state after reading the filterStatus
  useEffect(() => {
    if (locationState?.filterStatus) {
      // Replace the current history entry to clear the state
      navigate(location.pathname, { replace: true });
    }
  }, [locationState, navigate, location.pathname]);

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

  const confirmDeleteProject = () => {
    if (selectedProject) {
      handleDeleteProject(selectedProject.id);
      setIsDeleteDialogOpen(false);
    }
  };

  if (id) {
    return <ProjectDetailsView />;
  }

  return (
    <div className="w-full">
      <ProjectsHeader 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        viewMode={viewMode}
        setViewMode={setViewMode}
        openProjectDialog={() => setIsProjectDialogOpen(true)}
      />

      {statusFilter && (
        <StatusFilterIndicator 
          statusFilter={statusFilter} 
          onClearFilter={() => setStatusFilter("")} 
        />
      )}

      <Tabs 
        defaultValue="all" 
        value={activeTab} 
        onValueChange={(value) => setActiveTab(value as "all" | "billable" | "non-billable")}
      >
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Projects</TabsTrigger>
          <TabsTrigger value="billable">Billable</TabsTrigger>
          <TabsTrigger value="non-billable">Non-billable</TabsTrigger>
        </TabsList>

        <ProjectsTabContent
          value="all"
          title="All Projects"
          description="Manage your clinical trial projects"
          isLoading={isLoading}
          projects={filteredProjects}
          viewMode={viewMode}
          onEdit={openEditDialog}
          onDelete={openDeleteDialog}
          onProjectClick={handleProjectClick}
          onUpdate={refetch}
          searchQuery={searchQuery}
          statusFilter={statusFilter}
        />

        <ProjectsTabContent
          value="billable"
          title="Billable Projects"
          description="Manage your billable clinical trial projects"
          isLoading={isLoading}
          projects={filteredProjects}
          viewMode={viewMode}
          onEdit={openEditDialog}
          onDelete={openDeleteDialog}
          onProjectClick={handleProjectClick}
          onUpdate={refetch}
          searchQuery={searchQuery}
          statusFilter={statusFilter}
        />

        <ProjectsTabContent
          value="non-billable"
          title="Non-billable Projects"
          description="Manage your non-billable projects"
          isLoading={isLoading}
          projects={filteredProjects}
          viewMode={viewMode}
          onEdit={openEditDialog}
          onDelete={openDeleteDialog}
          onProjectClick={handleProjectClick}
          onUpdate={refetch}
          searchQuery={searchQuery}
          statusFilter={statusFilter}
        />
      </Tabs>

      <ProjectDialog 
        open={isProjectDialogOpen} 
        onClose={closeProjectDialog} 
        onSuccess={() => {
          refetch();
          closeProjectDialog();
        }} 
        project={selectedProject} 
      />
      
      <DeleteProjectDialog 
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onDelete={confirmDeleteProject}
        project={selectedProject}
      />
    </div>
  );
};

export default Projects;
