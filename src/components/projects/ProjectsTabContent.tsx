
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
  pagination?: {
    currentPage: number;
    totalPages: number;
    goToPage: (page: number) => void;
  };
  showAll?: boolean;
  setShowAll?: (value: boolean) => void;
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
  pagination,
  showAll,
  setShowAll
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
        showAll={showAll}
        setShowAll={setShowAll}
      />
    </TabsContent>
  );
};

export default ProjectsTabContent;
