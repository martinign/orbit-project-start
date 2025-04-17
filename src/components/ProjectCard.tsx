
import React, { useState } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import ProjectDialog from "@/components/ProjectDialog";
import { useQueryClient } from "@tanstack/react-query";

interface ProjectCardProps {
  project: {
    id: string;
    Sponsor: string;
    project_number: string;
    protocol_number: string;
    protocol_title: string;
    description: string | null;
    status: string;
  };
  onDelete: (id: string) => void;
  onUpdate: () => void;
}

const ProjectCard = ({ project, onDelete, onUpdate }: ProjectCardProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation(); // Stop event from propagating up
    setIsEditDialogOpen(true);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Stop event from propagating up
    onDelete(project.id);
  };

  const handleEditSuccess = () => {
    // Invalidate all relevant queries when a project is updated
    queryClient.invalidateQueries({ queryKey: ["recent_projects"] });
    queryClient.invalidateQueries({ queryKey: ["projects"] });
    queryClient.invalidateQueries({ queryKey: ["project", project.id] });
    onUpdate();
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // If the click is from the dropdown or its contents, don't do anything
    if ((e.target as HTMLElement).closest('[data-dropdown-trigger]') || 
        (e.target as HTMLElement).closest('[data-dropdown-content]')) {
      return;
    }
  };

  return (
    <div className="relative">
      <HoverCard>
        <HoverCardTrigger asChild>
          <Card 
            className="h-[180px] w-full cursor-pointer hover:border-blue-300 transition-all duration-200"
            onClick={handleCardClick}
          >
            <CardContent className="p-6 flex flex-col h-full justify-between">
              <div className="absolute top-3 right-3">
                <DropdownMenu>
                  <DropdownMenuTrigger 
                    className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                    data-dropdown-trigger="true"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="h-5 w-5 text-gray-500" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="end"
                    data-dropdown-content="true"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DropdownMenuItem 
                      className="cursor-pointer" 
                      onClick={handleEdit}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="cursor-pointer text-red-600 focus:text-red-600" 
                      onClick={handleDelete}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold truncate">{project.Sponsor}</h3>
                <p className="text-sm text-gray-600 truncate">Project #: {project.project_number}</p>
                <p className="text-sm text-gray-600 truncate">Protocol #: {project.protocol_number}</p>
              </div>
              <div className="mt-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  project.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : project.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : project.status === 'completed'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {project.status}
                </span>
              </div>
            </CardContent>
          </Card>
        </HoverCardTrigger>
        <HoverCardContent className="w-80 p-4">
          <div className="space-y-2">
            <h4 className="font-semibold">Protocol Title:</h4>
            <p className="text-sm">{project.protocol_title}</p>
            {project.description && (
              <>
                <h4 className="font-semibold">Description:</h4>
                <p className="text-sm">{project.description}</p>
              </>
            )}
          </div>
        </HoverCardContent>
      </HoverCard>

      <ProjectDialog 
        open={isEditDialogOpen} 
        onClose={() => setIsEditDialogOpen(false)}
        onSuccess={handleEditSuccess}
        project={project}
      />
    </div>
  );
};

export default ProjectCard;
