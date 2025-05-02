
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Plus, X, RefreshCw, Search } from 'lucide-react';
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
  // Add search filter state
  const [searchFilter, setSearchFilter] = useState<string>('');
  
  // Check if user is the creator of the code
  const isUserOwner = (code: WorkdayCode) => {
    return userId && userId === code.user_id;
  };

  // Filter workday codes based on search text
  const filteredWorkdayCodes = workdayCodes.filter(code => {
    if (!searchFilter) return true;
    
    const searchTerm = searchFilter.toLowerCase();
    return (
      code.task.toLowerCase().includes(searchTerm) ||
      code.activity.toLowerCase().includes(searchTerm)
    );
  });

  return (
    <div className="border rounded-md p-4">
      <div className="flex flex-col gap-3 mb-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Workday Codes</h3>
          <Button variant="outline" size="icon" onClick={onRefresh} title="Refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Add search filter input */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks or activities..."
            className="pl-8 w-full"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
          />
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-4">Loading...</div>
      ) : filteredWorkdayCodes.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground">
          {workdayCodes.length === 0 ? "No codes found" : "No codes match your search"}
        </div>
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
              {filteredWorkdayCodes.map((code) => (
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
