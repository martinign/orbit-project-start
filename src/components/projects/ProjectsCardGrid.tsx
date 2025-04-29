
import ProjectCard from "@/components/ProjectCard";

interface ProjectsCardGridProps {
  projects: any[];
  onDelete: (id: string) => void;
  onUpdate: () => void;
  onProjectClick: (project: any) => void;
}

const ProjectsCardGrid = ({ 
  projects, 
  onDelete, 
  onUpdate, 
  onProjectClick 
}: ProjectsCardGridProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
      {projects.map(project => (
        <div 
          key={project.id} 
          onClick={() => onProjectClick(project)} 
          className="cursor-pointer"
        >
          <ProjectCard 
            project={project} 
            onDelete={(id) => {
              onDelete(id);
              return false;
            }} 
            onUpdate={onUpdate}
          />
        </div>
      ))}
    </div>
  );
};

export default ProjectsCardGrid;
