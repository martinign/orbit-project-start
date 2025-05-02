
import React from 'react';
import { useProjectTeamMembers } from '@/hooks/useProjectTeamMembers';
import { useTeamAssignedHours } from '@/hooks/useTeamAssignedHours';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';

interface TeamHoursComparisonViewProps {
  projectId: string;
}

interface TeamMember {
  id: string;
  full_name: string;
  last_name: string;
  role?: string;
  permission_level?: string;
}

export const TeamHoursComparisonView: React.FC<TeamHoursComparisonViewProps> = ({ projectId }) => {
  const { data: teamMembers, isLoading: teamMembersLoading } = useProjectTeamMembers(projectId);
  const { assignedHours, isLoading: hoursLoading } = useTeamAssignedHours(projectId);
  
  const isLoading = teamMembersLoading || hoursLoading;
  
  const renderHoursStatus = (hours: number) => {
    if (hours < 20) {
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Low</Badge>;
    } else if (hours < 40) {
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Medium</Badge>;
    } else {
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">High</Badge>;
    }
  };
  
  if (isLoading) {
    return <div className="p-8">Loading team hours data...</div>;
  }
  
  if (!teamMembers || teamMembers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Team Hours</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No team members found for this project.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Hours Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Team Member</TableHead>
              <TableHead>Assigned Hours</TableHead>
              <TableHead>Workload Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teamMembers.map((member) => (
              <TableRow key={member.id}>
                <TableCell>{member.full_name}</TableCell>
                <TableCell>{assignedHours[member.id] || 0}</TableCell>
                <TableCell>{renderHoursStatus(assignedHours[member.id] || 0)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
