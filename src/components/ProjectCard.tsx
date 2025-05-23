
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import ProjectDialog from "@/components/ProjectDialog";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";

interface ProjectCardProps {
  project: {
    id: string;
    user_id: string;
    Sponsor: string | null;
    project_number: string;
    protocol_number: string | null;
    protocol_title: string | null;
    description: string | null;
    status: string;
    project_type?: string;
  };
  onDelete: (id: string) => void;
  onUpdate: () => void;
}

const ProjectCard = ({
  project,
  onDelete,
  onUpdate
}: ProjectCardProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditDialogOpen(true);
  };
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(project.id);
  };
  
  const handleCardClick = (e: React.MouseEvent) => {
    // Only navigate if we didn't click the dropdown menu or its items
    if (!(e.target as HTMLElement).closest('[data-dropdown-trigger="true"]') && 
        !(e.target as HTMLElement).closest('[data-dropdown-content="true"]')) {
      navigate(`/projects/${project.id}`);
    }
  };
  
  const handleEditSuccess = () => {
    queryClient.invalidateQueries({
      queryKey: ["recent_projects"]
    });
    queryClient.invalidateQueries({
      queryKey: ["projects"]
    });
    queryClient.invalidateQueries({
      queryKey: ["project", project.id]
    });
    onUpdate();
  };
  
  const isBillable = !project.project_type || project.project_type === 'billable';
  const isProjectOwner = user && user.id === project.user_id;

  // Content to display in the card
  const renderCardContent = () => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold truncate">{project.project_number}</h3>
      </div>
      {isBillable ? (
        <>
          {project.protocol_number && <p className="text-sm text-gray-600 truncate">Protocol #: {project.protocol_number}</p>}
          {project.Sponsor && <p className="text-sm text-gray-600 truncate">Sponsor: {project.Sponsor}</p>}
        </>
      ) : (
        <>
          {project.description && <p className="text-sm text-gray-600 truncate">{project.description}</p>}
        </>
      )}
    </div>
  );
  
  // Status and badge section
  const renderStatusAndBadges = () => (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        project.status === 'active' ? 'bg-green-100 text-green-800' : 
        project.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
        project.status === 'completed' ? 'bg-blue-100 text-blue-800' : 
        'bg-gray-100 text-gray-800'
      }`}>
        {project.status}
      </span>
      
      <Badge variant={isBillable ? "default" : "secondary"} className={isBillable ? "bg-blue-500" : "bg-gray-200 text-gray-700"}>
        {isBillable ? "Billable" : "Non-billable"}
      </Badge>
    </div>
  );
  
  // Content to display in the hover card
  const renderHoverCardContent = () => (
    <div className="space-y-2">
      <h4 className="font-semibold">Project ID:</h4>
      <p className="text-sm">{project.project_number}</p>
      
      {isBillable && project.Sponsor && (
        <>
          <h4 className="font-semibold">Sponsor:</h4>
          <p className="text-sm">{project.Sponsor}</p>
        </>
      )}
      
      {isBillable && project.protocol_number && (
        <>
          <h4 className="font-semibold">Protocol Number:</h4>
          <p className="text-sm">{project.protocol_number}</p>
        </>
      )}
      
      {isBillable && project.protocol_title && (
        <>
          <h4 className="font-semibold">Protocol Title:</h4>
          <p className="text-sm">{project.protocol_title}</p>
        </>
      )}
      
      {project.description && (
        <>
          <h4 className="font-semibold">Description:</h4>
          <p className="text-sm">{project.description}</p>
        </>
      )}
    </div>
  );

  return (
    <div className="relative">
      {/* Dropdown Menu - Only show for project owner */}
      {isProjectOwner && (
        <div className="absolute top-3 right-3 z-10" onClick={(e) => e.stopPropagation()}>
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
              <DropdownMenuItem className="cursor-pointer" onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* HoverCard Component - No longer contains the dropdown */}
      <HoverCard>
        <HoverCardTrigger asChild>
          <Card 
            className="h-[180px] w-full cursor-pointer hover:border-blue-300 transition-all duration-200" 
            onClick={handleCardClick}
          >
            <CardContent className="p-6 flex flex-col h-full justify-between">
              {renderCardContent()}
              {renderStatusAndBadges()}
            </CardContent>
          </Card>
        </HoverCardTrigger>
        <HoverCardContent className="w-80 p-4">
          {renderHoverCardContent()}
        </HoverCardContent>
      </HoverCard>

      {/* Project Edit Dialog */}
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
