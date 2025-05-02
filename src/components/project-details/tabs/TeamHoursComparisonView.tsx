
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { useTeamAssignedHours } from '@/hooks/useTeamAssignedHours';
import { Badge } from '@/components/ui/badge';

interface TeamHoursComparisonViewProps {
  projectId: string;
}

export const TeamHoursComparisonView: React.FC<TeamHoursComparisonViewProps> = ({ projectId }) => {
  const { 
    teamAssignedHours, 
    isLoading,
    error 
  } = useTeamAssignedHours(projectId);

  if (isLoading) {
    return <div className="p-4">Loading team hours data...</div>;
  }
  
  if (error) {
    return <div className="p-4 text-red-500">Error loading team hours: {error.message}</div>;
  }

  // Calculate totals and get unique months for comparison
  let totalAssignedHours = 0;
  teamAssignedHours.forEach(entry => {
    totalAssignedHours += entry.assigned_hours || 0;
  });

  // Group by team member
  const teamMemberHours: Record<string, { name: string; hours: number; }> = {};
  teamAssignedHours.forEach(entry => {
    const fullName = `${entry.full_name} ${entry.last_name || ''}`.trim();
    
    if (!teamMemberHours[entry.user_id]) {
      teamMemberHours[entry.user_id] = {
        name: fullName,
        hours: 0
      };
    }
    
    teamMemberHours[entry.user_id].hours += entry.assigned_hours || 0;
  });

  // Convert to array for rendering
  const teamMembersList = Object.values(teamMemberHours).sort((a, b) => b.hours - a.hours);

  // Calculate workload percentage for each team member
  const getWorkloadStatus = (hours: number) => {
    if (hours < 20) return { text: 'Low', color: 'bg-green-500' };
    if (hours < 40) return { text: 'Medium', color: 'bg-yellow-500' };
    return { text: 'High', color: 'bg-red-500' };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Hours Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        {teamMembersList.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            No team hours data available
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Total Assigned Hours: {totalAssignedHours}</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Team Member</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead className="text-right">Workload</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamMembersList.map((member, idx) => {
                    const percentage = totalAssignedHours ? (member.hours / totalAssignedHours) * 100 : 0;
                    const workload = getWorkloadStatus(member.hours);
                    
                    return (
                      <TableRow key={idx}>
                        <TableCell>{member.name}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>{member.hours} hours</span>
                              <span>{percentage.toFixed(0)}%</span>
                            </div>
                            <Progress value={percentage} className="h-2" />
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge 
                            variant="outline" 
                            className={`${workload.color} text-white`}
                          >
                            {workload.text}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TeamHoursComparisonView;
