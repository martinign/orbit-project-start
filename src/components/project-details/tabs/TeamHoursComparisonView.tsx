
import React, { useState } from 'react';
import { format } from 'date-fns';
import { useTeamAssignedHours } from '@/hooks/useTeamAssignedHours';
import { useTeamHoursComparison, VarianceBadgeProps } from '@/hooks/useTeamHoursComparison';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, AlertTriangle, CheckCircle, Calendar } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface TeamHoursComparisonViewProps {
  projectId: string;
}

export const TeamHoursComparisonView: React.FC<TeamHoursComparisonViewProps> = ({ projectId }) => {
  const [searchFilter, setSearchFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState<string>(format(new Date(), 'yyyy-MM'));
  
  const { teamMembers, isLoading: teamMembersLoading } = useTeamMembers(projectId);
  const { isLoading: assignedHoursLoading, formatMonthForInput } = useTeamAssignedHours(projectId);
  
  const {
    teamHoursComparison,
    isLoading: comparisonLoading,
    getVarianceColor,
    getVarianceBadge,
    summaryStats,
    availableMonths
  } = useTeamHoursComparison(projectId, monthFilter);
  
  const isLoading = teamMembersLoading || assignedHoursLoading || comparisonLoading;

  // Helper to render badge using properties returned from the hook
  const renderBadge = (badgeProps: VarianceBadgeProps) => (
    <Badge variant={badgeProps.variant} className={badgeProps.className}>
      {badgeProps.children}
    </Badge>
  );
  
  // Filter team members by search text
  const filteredTeamHours = React.useMemo(() => {
    if (!teamHoursComparison) return [];
    
    return teamHoursComparison.filter(item => 
      !searchFilter || 
      item.memberName.toLowerCase().includes(searchFilter.toLowerCase())
    );
  }, [teamHoursComparison, searchFilter]);

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading team hours comparison data...</div>;
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Team Hours Comparison</CardTitle>
              <CardDescription>
                Compare assigned hours with actual worked hours
              </CardDescription>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Select
                  value={monthFilter}
                  onValueChange={setMonthFilter}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableMonths.map(month => (
                      <SelectItem key={month} value={month}>
                        {format(new Date(month + '-01'), 'MMMM yyyy')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search team members..."
                  className="pl-8 w-full"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Assigned Hours</p>
                    <h3 className="text-2xl font-bold">{summaryStats.totalAssigned}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Worked Hours</p>
                    <h3 className="text-2xl font-bold">{summaryStats.totalWorked}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Variance</p>
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl font-bold">{summaryStats.totalVariance}</h3>
                      {summaryStats.totalVariance !== 0 && (
                        <Badge variant={summaryStats.totalVariance < 0 ? "destructive" : "outline"}>
                          {summaryStats.totalVariance > 0 ? "+" : ""}{summaryStats.totalVariance}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {summaryStats.totalVariance !== 0 && (
                    <div>
                      {summaryStats.totalVariance < 0 ? (
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                      ) : (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Team Member</TableHead>
                <TableHead className="text-right">Assigned Hours</TableHead>
                <TableHead className="text-right">Worked Hours</TableHead>
                <TableHead className="text-right">Variance</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTeamHours.length > 0 ? (
                filteredTeamHours.map((item) => (
                  <TableRow key={item.userId}>
                    <TableCell className="font-medium">{item.memberName}</TableCell>
                    <TableCell className="text-right">{item.assignedHours}</TableCell>
                    <TableCell className="text-right">{item.workedHours}</TableCell>
                    <TableCell className="text-right">
                      <span className={`font-medium ${getVarianceColor(item.variance)}`}>
                        {item.variance > 0 ? "+" : ""}{item.variance}
                      </span>
                    </TableCell>
                    <TableCell>
                      {renderBadge(getVarianceBadge(item.variance))}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <p>No team hours data found</p>
                      <p className="text-sm">Try changing the filters or add team assigned hours</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => setMonthFilter(formatMonthForInput())}
            disabled={monthFilter === formatMonthForInput()}
          >
            Reset to Current Month
          </Button>
          
          <Button
            variant="outline"
            onClick={() => window.location.hash = 'team-assigned-hours'}
            className="ml-2"
          >
            View Detailed Team Assignments
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
