
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import ProjectsTable from "./ProjectsTable";
import ProjectsCardGrid from "./ProjectsCardGrid";
import { PaginationControls } from "@/components/ui/pagination-controls";

interface ProjectsContentProps {
  title: string;
  description: string;
  isLoading: boolean;
  projects: any[];
  viewMode: "table" | "card";
  onEdit: (project: any, e?: React.MouseEvent) => void;
  onDelete: (project: any, e?: React.MouseEvent) => void;
  onProjectClick: (project: any) => void;
  onUpdate: () => void;
  searchQuery: string;
  statusFilter: string;
  projectType?: "all" | "billable" | "non-billable";
  // Add pagination props
  pagination?: {
    currentPage: number;
    totalPages: number;
    setPage: (page: number) => void;
  };
}

const ProjectsContent = ({
  title,
  description,
  isLoading,
  projects,
  viewMode,
  onEdit,
  onDelete,
  onProjectClick,
  onUpdate,
  searchQuery,
  statusFilter,
  projectType = "all",
  pagination
}: ProjectsContentProps) => {
  const getEmptyStateMessage = () => {
    if (searchQuery) return "No projects match your search criteria";
    if (statusFilter) return `No ${statusFilter} projects found`;
    if (projectType === "billable") return "No billable projects found";
    if (projectType === "non-billable") return "No non-billable projects found";
    return "No projects found";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-4">Loading projects...</div>
        ) : projects && projects.length > 0 ? (
          viewMode === "table" ? (
            <ProjectsTable 
              projects={projects}
              onEdit={onEdit}
              onDelete={onDelete}
              onProjectClick={onProjectClick}
              isProjectType={projectType}
            />
          ) : (
            <ProjectsCardGrid
              projects={projects}
              onDelete={id => {
                const project = projects.find(p => p.id === id);
                if (project) onDelete(project);
                return false;
              }}
              onUpdate={onUpdate}
              onProjectClick={onProjectClick}
            />
          )
        ) : (
          <div className="text-center p-4">
            <p className="text-muted-foreground">
              {getEmptyStateMessage()}
            </p>
          </div>
        )}
      </CardContent>
      
      {pagination && !isLoading && projects && projects.length > 0 && (
        <CardFooter className="flex justify-center border-t pt-4">
          <PaginationControls
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={pagination.setPage}
          />
        </CardFooter>
      )}
    </Card>
  );
};

export default ProjectsContent;
