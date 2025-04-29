
import React from 'react';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Plus, X, RefreshCw } from 'lucide-react';
import { WorkdayCode, Project, ProjectAssociations } from '@/utils/workdayCodeUtils';

interface WorkdayCodesTableProps {
  workdayCodes: WorkdayCode[];
  projectAssociations: ProjectAssociations;
  loading: boolean;
  userId: string | undefined;
  onRefresh: () => void;
  onEdit: (code: WorkdayCode) => void;
  onDelete: (code: WorkdayCode) => void;
  onAddProject: (codeId: string) => void;
  onRemoveProject: (codeId: string, projectId: string) => void;
}

const WorkdayCodesTable: React.FC<WorkdayCodesTableProps> = ({
  workdayCodes,
  projectAssociations,
  loading,
  userId,
  onRefresh,
  onEdit,
  onDelete,
  onAddProject,
  onRemoveProject
}) => {
  // Check if user is the creator of the code
  const isUserOwner = (code: WorkdayCode) => {
    return userId && userId === code.user_id;
  };

  return (
    <div className="border rounded-md p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-medium">Workday Codes</h3>
        <Button variant="outline" size="icon" onClick={onRefresh} title="Refresh">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      
      {loading ? (
        <div className="text-center py-4">Loading...</div>
      ) : workdayCodes.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground">No codes found</div>
      ) : (
        <div className="max-h-[400px] overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task</TableHead>
                <TableHead>Activity</TableHead>
                <TableHead>Associated Projects</TableHead>
                <TableHead className="w-[150px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workdayCodes.map((code) => (
                <TableRow key={code.id}>
                  <TableCell className="font-medium">{code.task}</TableCell>
                  <TableCell>{code.activity}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {projectAssociations[code.id]?.map(project => (
                        <Badge key={project.id} variant="secondary" className="flex items-center gap-1">
                          {project.project_number}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-4 w-4 p-0 ml-1" 
                            onClick={() => onRemoveProject(code.id, project.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-6 px-2"
                        onClick={() => onAddProject(code.id)}
                      >
                        <Plus className="h-3 w-3 mr-1" /> Add
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    {isUserOwner(code) && (
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => onEdit(code)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => onDelete(code)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default WorkdayCodesTable;
