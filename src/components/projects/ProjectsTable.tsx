
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

interface ProjectsTableProps {
  projects: any[];
  onEdit: (project: any, e?: React.MouseEvent) => void;
  onDelete: (project: any, e?: React.MouseEvent) => void;
  onProjectClick: (project: any) => void;
  isProjectType?: "all" | "billable" | "non-billable";
}

const ProjectsTable = ({ 
  projects, 
  onEdit, 
  onDelete, 
  onProjectClick, 
  isProjectType = "all" 
}: ProjectsTableProps) => {
  const isBillableTab = isProjectType === "billable";
  const isNonBillableTab = isProjectType === "non-billable";
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Project ID</TableHead>
          {isProjectType === "all" && <TableHead>Type</TableHead>}
          {!isNonBillableTab && <TableHead>Sponsor</TableHead>}
          {!isNonBillableTab && <TableHead>Protocol Number</TableHead>}
          {!isNonBillableTab && <TableHead>Protocol Title</TableHead>}
          <TableHead>Description</TableHead>
          {isBillableTab && <TableHead>Role</TableHead>}
          <TableHead>Status</TableHead>
          <TableHead className="w-[120px] text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {projects.map(project => (
          <TableRow 
            key={project.id} 
            className="cursor-pointer" 
            onClick={() => onProjectClick(project)}
          >
            <TableCell>{project.project_number}</TableCell>
            
            {isProjectType === "all" && (
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${project.project_type === 'billable' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                  {project.project_type === 'billable' ? 'Billable' : 'Non-billable'}
                </span>
              </TableCell>
            )}
            
            {!isNonBillableTab && <TableCell>{project.Sponsor || '-'}</TableCell>}
            {!isNonBillableTab && <TableCell>{project.protocol_number || '-'}</TableCell>}
            {!isNonBillableTab && <TableCell className="max-w-xs truncate">{project.protocol_title || '-'}</TableCell>}
            
            <TableCell className="max-w-xs truncate">{project.description}</TableCell>
            
            {isBillableTab && <TableCell>{project.role || 'owner'}</TableCell>}
            
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
                <Button variant="ghost" size="icon" onClick={e => onEdit(project, e)} title="Edit project">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-red-500 hover:text-red-700 hover:bg-red-50" 
                  onClick={e => onDelete(project, e)} 
                  title="Delete project"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ProjectsTable;
