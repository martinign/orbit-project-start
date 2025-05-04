
import { TabsContent } from "@/components/ui/tabs";
import ProjectsContent from "./ProjectsContent";

interface ProjectsTabContentProps {
  value: string;
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
  // Add pagination props
  pagination?: {
    currentPage: number;
    totalPages: number;
    setPage: (page: number) => void;
  };
}

const ProjectsTabContent = ({
  value,
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
  pagination
}: ProjectsTabContentProps) => {
  return (
    <TabsContent value={value}>
      <ProjectsContent
        title={title}
        description={description}
        isLoading={isLoading}
        projects={projects}
        viewMode={viewMode}
        onEdit={onEdit}
        onDelete={onDelete}
        onProjectClick={onProjectClick}
        onUpdate={onUpdate}
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        projectType={value as "all" | "billable" | "non-billable"}
        pagination={pagination}
      />
    </TabsContent>
  );
};

export default ProjectsTabContent;
