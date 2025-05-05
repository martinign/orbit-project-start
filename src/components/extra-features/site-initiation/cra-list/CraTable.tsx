
import React from 'react';
import { Mail, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CRAData } from '@/hooks/cra-list/types';
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from 'date-fns';

interface CraTableProps {
  craList: CRAData[];
  hasAdminAccess: boolean;
  onEdit: (cra: CRAData) => void;
  onDelete: (cra: CRAData) => void;
  onToggleStatus: (cra: CRAData) => void;
}

export const CraTable: React.FC<CraTableProps> = ({
  craList,
  hasAdminAccess,
  onEdit,
  onDelete,
  onToggleStatus
}) => {
  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Full Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Site</TableHead>
            <TableHead>Country</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Status</TableHead>
            {hasAdminAccess && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {craList.map((cra) => (
            <TableRow key={cra.id}>
              <TableCell className="font-medium">
                {cra.full_name}
                {cra.user_reference && (
                  <span className="text-xs text-muted-foreground ml-2">
                    ({cra.user_reference})
                  </span>
                )}
              </TableCell>
              <TableCell>{cra.study_team_role || '-'}</TableCell>
              <TableCell>{cra.study_site || '-'}</TableCell>
              <TableCell>{cra.study_country || '-'}</TableCell>
              <TableCell>
                {cra.email ? (
                  <div className="flex items-center space-x-1">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{cra.email}</span>
                  </div>
                ) : (
                  '-'
                )}
              </TableCell>
              <TableCell>
                <Badge
                  className={`${
                    cra.status === 'active'
                      ? 'bg-green-100 text-green-800 hover:bg-green-100'
                      : 'bg-red-100 text-red-800 hover:bg-red-100'
                  }`}
                >
                  {cra.status || 'Unknown'}
                </Badge>
              </TableCell>
              {hasAdminAccess && (
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onToggleStatus(cra)}
                          >
                            {cra.status === 'active' ? (
                              <ToggleRight className="h-4 w-4 text-green-500" />
                            ) : (
                              <ToggleLeft className="h-4 w-4 text-red-500" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {cra.status === 'active'
                            ? 'Set as Inactive'
                            : 'Set as Active'}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(cra)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit CRA</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(cra)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete CRA</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
