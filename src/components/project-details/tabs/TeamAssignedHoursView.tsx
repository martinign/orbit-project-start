
import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { useTeamAssignedHours, TeamAssignedHour } from '@/hooks/useTeamAssignedHours';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, Trash2, Plus } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface TeamAssignedHoursViewProps {
  projectId: string;
}

export const TeamAssignedHoursView: React.FC<TeamAssignedHoursViewProps> = ({ projectId }) => {
  const { user } = useAuth();
  const [isAddingHours, setIsAddingHours] = useState(false);
  const [isEditingHours, setIsEditingHours] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'yyyy-MM'));
  const [selectedTeamMemberId, setSelectedTeamMemberId] = useState<string>('');
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [assignedHours, setAssignedHours] = useState<number | string>('');
  const [currentEntry, setCurrentEntry] = useState<TeamAssignedHour | null>(null);
  
  const {
    teamAssignedHours,
    isLoading,
    addTeamAssignedHours,
    updateTeamAssignedHours,
    deleteTeamAssignedHours,
    formatMonthForInput,
    totalsByUser,
    totalsByMonth
  } = useTeamAssignedHours(projectId);
  
  const { data: teamMembers, isLoading: teamMembersLoading } = useTeamMembers(projectId);
  
  // Fetch tasks with workday codes for this project
  const { data: projectTasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['project_tasks', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      
      const { data, error } = await supabase
        .from('project_tasks')
        .select(`
          id,
          title,
          duration_days,
          workday_code_id,
          status
        `)
        .eq('project_id', projectId);
      
      if (error) {
        console.error('Error fetching project tasks:', error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!projectId && !!user
  });
  
  const openAddHoursDialog = () => {
    setSelectedTeamMemberId('');
    setSelectedTaskId('');
    setAssignedHours('');
    setSelectedMonth(formatMonthForInput());
    setIsAddingHours(true);
  };
  
  const openEditHoursDialog = (entry: TeamAssignedHour) => {
    setCurrentEntry(entry);
    setSelectedTeamMemberId(entry.user_id);
    setSelectedTaskId(entry.task_id || '');
    setAssignedHours(entry.assigned_hours);
    setSelectedMonth(entry.month.substring(0, 7)); // YYYY-MM format
    setIsEditingHours(true);
  };
  
  const handleAddHours = () => {
    if (!selectedTeamMemberId || !selectedMonth) return;
    
    addTeamAssignedHours({
      project_id: projectId,
      user_id: selectedTeamMemberId,
      task_id: selectedTaskId || null,
      assigned_hours: Number(assignedHours),
      month: `${selectedMonth}-01`, // First day of month for consistency
    });
    
    setIsAddingHours(false);
  };
  
  const handleUpdateHours = () => {
    if (!currentEntry?.id || !selectedTeamMemberId || !selectedMonth) return;
    
    updateTeamAssignedHours({
      id: currentEntry.id,
      user_id: selectedTeamMemberId,
      task_id: selectedTaskId || null,
      assigned_hours: Number(assignedHours),
      month: `${selectedMonth}-01`, // First day of month for consistency
    });
    
    setIsEditingHours(false);
    setCurrentEntry(null);
  };
  
  // Group entries by month
  const entriesByMonth = React.useMemo(() => {
    const months: Record<string, TeamAssignedHour[]> = {};
    
    teamAssignedHours.forEach(entry => {
      const monthKey = entry.month.substring(0, 7); // YYYY-MM format
      if (!months[monthKey]) {
        months[monthKey] = [];
      }
      months[monthKey].push(entry);
    });
    
    // Sort months in descending order
    return Object.entries(months)
      .sort(([a], [b]) => b.localeCompare(a))
      .reduce((acc, [month, entries]) => {
        acc[month] = entries;
        return acc;
      }, {} as Record<string, TeamAssignedHour[]>);
  }, [teamAssignedHours]);
  
  if (isLoading || teamMembersLoading || tasksLoading) {
    return <div className="flex items-center justify-center p-8">Loading team assigned hours data...</div>;
  }
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Team Assigned Hours</h2>
        <Button onClick={openAddHoursDialog} className="bg-blue-500 hover:bg-blue-600 text-white">
          <Plus className="h-4 w-4 mr-2" /> Assign Hours
        </Button>
      </div>
      
      {Object.entries(entriesByMonth).length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center p-6 text-center text-gray-500">
              <p>No hours assigned yet</p>
              <p className="text-sm">Start by assigning hours to team members</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        Object.entries(entriesByMonth).map(([month, entries]) => (
          <Card key={month} className="mb-6">
            <CardHeader>
              <CardTitle>{format(parseISO(`${month}-01`), 'MMMM yyyy')}</CardTitle>
              <CardDescription>
                Total assigned hours for this month: {totalsByMonth[month] || 0}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Team Member</TableHead>
                    <TableHead>Task</TableHead>
                    <TableHead>Assigned Hours</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map(entry => (
                    <TableRow key={entry.id}>
                      <TableCell>{entry.user_profile?.full_name || 'Unknown'}</TableCell>
                      <TableCell>{entry.task?.title || 'Project-level'}</TableCell>
                      <TableCell>{entry.assigned_hours}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => openEditHoursDialog(entry)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteTeamAssignedHours(entry.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))
      )}
      
      {/* Add Hours Dialog */}
      <Dialog open={isAddingHours} onOpenChange={setIsAddingHours}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Hours to Team Member</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="team-member" className="text-right">
                Team Member
              </Label>
              <Select
                value={selectedTeamMemberId}
                onValueChange={setSelectedTeamMemberId}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers?.map(member => (
                    <SelectItem key={member.id} value={member.user_id}>
                      {member.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="task" className="text-right">
                Task (Optional)
              </Label>
              <Select
                value={selectedTaskId}
                onValueChange={setSelectedTaskId}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Project-level (No specific task)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Project-level (No specific task)</SelectItem>
                  {projectTasks?.map(task => (
                    <SelectItem key={task.id} value={task.id}>
                      {task.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="month" className="text-right">
                Month
              </Label>
              <Input
                id="month"
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="assigned-hours" className="text-right">
                Assigned Hours
              </Label>
              <Input
                id="assigned-hours"
                type="number"
                step="0.5"
                min="0.5"
                value={assignedHours}
                onChange={(e) => setAssignedHours(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingHours(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddHours} className="bg-blue-500 hover:bg-blue-600 text-white">
              Assign Hours
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Hours Dialog */}
      <Dialog open={isEditingHours} onOpenChange={setIsEditingHours}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Assigned Hours</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-team-member" className="text-right">
                Team Member
              </Label>
              <Select
                value={selectedTeamMemberId}
                onValueChange={setSelectedTeamMemberId}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers?.map(member => (
                    <SelectItem key={member.id} value={member.user_id}>
                      {member.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-task" className="text-right">
                Task (Optional)
              </Label>
              <Select
                value={selectedTaskId}
                onValueChange={setSelectedTaskId}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Project-level (No specific task)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Project-level (No specific task)</SelectItem>
                  {projectTasks?.map(task => (
                    <SelectItem key={task.id} value={task.id}>
                      {task.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-month" className="text-right">
                Month
              </Label>
              <Input
                id="edit-month"
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-assigned-hours" className="text-right">
                Assigned Hours
              </Label>
              <Input
                id="edit-assigned-hours"
                type="number"
                step="0.5"
                min="0.5"
                value={assignedHours}
                onChange={(e) => setAssignedHours(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditingHours(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateHours} className="bg-blue-500 hover:bg-blue-600 text-white">
              Update Hours
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
