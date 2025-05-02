
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkdayTimeEntries, TimeEntry } from '@/hooks/useWorkdayTimeEntries';
import { useWorkdayCodeDetails } from '@/hooks/useWorkdayCodeDetails';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { CalendarIcon, Plus, Clock, Edit, Trash2, Filter, Search } from 'lucide-react';
import { getStatusBadge } from '@/utils/statusBadge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface WorkdayScheduleTabProps {
  projectId: string;
}

export const WorkdayScheduleTab: React.FC<WorkdayScheduleTabProps> = ({ projectId }) => {
  const { user } = useAuth();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isAddingTimeEntry, setIsAddingTimeEntry] = useState(false);
  const [isEditingTimeEntry, setIsEditingTimeEntry] = useState(false);
  const [currentTimeEntry, setCurrentTimeEntry] = useState<Partial<TimeEntry> | null>(null);
  const [hours, setHours] = useState<number | string>('');
  const [notes, setNotes] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');
  
  const { timeEntries, isLoading: timeEntriesLoading, addTimeEntry, updateTimeEntry, deleteTimeEntry } = useWorkdayTimeEntries(projectId);
  
  // Fetch tasks with workday codes for this project
  const { data: tasksWithWorkdayCodes, isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks_with_workday_codes', projectId],
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
        .eq('project_id', projectId)
        .not('workday_code_id', 'is', null);
      
      if (error) {
        console.error('Error fetching tasks with workday codes:', error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!projectId && !!user
  });

  // Filter tasks by status and search text
  const filteredTasks = React.useMemo(() => {
    if (!tasksWithWorkdayCodes) return [];
    
    return tasksWithWorkdayCodes.filter(task => {
      // Apply status filter
      const statusMatches = statusFilter === 'all' || task.status === statusFilter;
      
      // Apply search filter (case insensitive)
      const searchMatches = !searchFilter || 
        task.title.toLowerCase().includes(searchFilter.toLowerCase());
      
      return statusMatches && searchMatches;
    });
  }, [tasksWithWorkdayCodes, statusFilter, searchFilter]);
  
  // Extract unique statuses for filter
  const availableStatuses = React.useMemo(() => {
    if (!tasksWithWorkdayCodes) return [];
    
    const statuses = new Set<string>();
    tasksWithWorkdayCodes.forEach(task => statuses.add(task.status));
    return Array.from(statuses);
  }, [tasksWithWorkdayCodes]);
  
  const openAddTimeEntryDialog = (taskId: string) => {
    setSelectedTaskId(taskId);
    setHours('');
    setNotes('');
    setSelectedDate(new Date());
    setIsAddingTimeEntry(true);
  };
  
  const openEditTimeEntryDialog = (timeEntry: TimeEntry) => {
    setCurrentTimeEntry(timeEntry);
    setSelectedTaskId(timeEntry.task_id);
    setHours(timeEntry.hours);
    setNotes(timeEntry.notes || '');
    setSelectedDate(timeEntry.date ? new Date(timeEntry.date) : new Date());
    setIsEditingTimeEntry(true);
  };
  
  const handleAddTimeEntry = () => {
    if (!selectedTaskId || !selectedDate) return;
    
    const task = tasksWithWorkdayCodes?.find(t => t.id === selectedTaskId);
    if (!task) return;
    
    addTimeEntry({
      task_id: selectedTaskId,
      workday_code_id: task.workday_code_id,
      date: format(selectedDate, 'yyyy-MM-dd'),
      hours: Number(hours),
      notes: notes.trim() || undefined
    });
    
    setIsAddingTimeEntry(false);
    setSelectedTaskId(null);
    setHours('');
    setNotes('');
  };
  
  const handleUpdateTimeEntry = () => {
    if (!currentTimeEntry?.id || !selectedTaskId || !selectedDate) return;
    
    updateTimeEntry({
      id: currentTimeEntry.id,
      hours: Number(hours),
      date: format(selectedDate, 'yyyy-MM-dd'),
      notes: notes.trim() || null
    });
    
    setIsEditingTimeEntry(false);
    setCurrentTimeEntry(null);
  };
  
  // Group time entries by task
  const timeEntriesByTask = React.useMemo(() => {
    if (!timeEntries) return {};
    
    return timeEntries.reduce((acc, entry) => {
      if (!acc[entry.task_id]) {
        acc[entry.task_id] = [];
      }
      acc[entry.task_id].push(entry);
      return acc;
    }, {} as Record<string, TimeEntry[]>);
  }, [timeEntries]);
  
  // Calculate total hours per task
  const taskTotalHours = React.useMemo(() => {
    if (!timeEntries) return {};
    
    return timeEntries.reduce((acc, entry) => {
      if (!acc[entry.task_id]) {
        acc[entry.task_id] = 0;
      }
      acc[entry.task_id] += Number(entry.hours);
      return acc;
    }, {} as Record<string, number>);
  }, [timeEntries]);
  
  if (tasksLoading || timeEntriesLoading) {
    return <div className="flex items-center justify-center p-8">Loading workday schedule data...</div>;
  }
  
  if (!tasksWithWorkdayCodes || tasksWithWorkdayCodes.length === 0) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Workday Schedule</CardTitle>
            <CardDescription>
              No tasks with workday codes have been found for this project.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              To use this feature, assign workday codes to tasks in the Tasks tab.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Workday Schedule</CardTitle>
              <CardDescription>
                Track time spent on tasks with workday codes
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  className="pl-8 w-full sm:w-[200px]"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {availableStatuses.map(status => (
                      <SelectItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {filteredTasks.map((task) => (
              <TaskTimeEntryCard
                key={task.id}
                task={task}
                timeEntries={timeEntriesByTask[task.id] || []}
                totalHours={taskTotalHours[task.id] || 0}
                onAddEntry={() => openAddTimeEntryDialog(task.id)}
                onEditEntry={openEditTimeEntryDialog}
                onDeleteEntry={deleteTimeEntry}
              />
            ))}
            
            {filteredTasks.length === 0 && (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <Clock className="h-12 w-12 mb-2 opacity-20" />
                <p className="text-lg font-medium">No matching tasks found</p>
                <p className="text-sm text-muted-foreground">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Add Time Entry Dialog */}
      <Dialog open={isAddingTimeEntry} onOpenChange={setIsAddingTimeEntry}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Time Entry</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant="outline"
                    className="w-full justify-start text-left font-normal col-span-3"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="hours" className="text-right">
                Hours
              </Label>
              <Input
                id="hours"
                type="number"
                step="0.25"
                min="0.25"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingTimeEntry(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTimeEntry} className="bg-blue-500 hover:bg-blue-600 text-white">
              Add Time Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Time Entry Dialog */}
      <Dialog open={isEditingTimeEntry} onOpenChange={setIsEditingTimeEntry}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Time Entry</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-date" className="text-right">
                Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="edit-date"
                    variant="outline"
                    className="w-full justify-start text-left font-normal col-span-3"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-hours" className="text-right">
                Hours
              </Label>
              <Input
                id="edit-hours"
                type="number"
                step="0.25"
                min="0.25"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-notes" className="text-right">
                Notes
              </Label>
              <Textarea
                id="edit-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditingTimeEntry(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateTimeEntry} className="bg-blue-500 hover:bg-blue-600 text-white">
              Update Time Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface TaskTimeEntryCardProps {
  task: any;
  timeEntries: TimeEntry[];
  totalHours: number;
  onAddEntry: () => void;
  onEditEntry: (entry: TimeEntry) => void;
  onDeleteEntry: (id: string) => void;
}

const TaskTimeEntryCard: React.FC<TaskTimeEntryCardProps> = ({
  task,
  timeEntries,
  totalHours,
  onAddEntry,
  onEditEntry,
  onDeleteEntry
}) => {
  const { data: workdayCode } = useWorkdayCodeDetails(task.workday_code_id);
  const expectedHours = task.duration_days ? task.duration_days * 8 : 0; // Assuming 8 hours per day
  const progressPercentage = expectedHours > 0 ? Math.min((totalHours / expectedHours) * 100, 100) : 0;
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle>{task.title}</CardTitle>
              {getStatusBadge(task.status)}
            </div>
            <CardDescription className="mt-1">
              {workdayCode ? `${workdayCode.task} - ${workdayCode.activity}` : 'Loading workday code...'}
            </CardDescription>
          </div>
          <Button onClick={onAddEntry} className="bg-blue-500 hover:bg-blue-600 text-white">
            <Plus className="h-4 w-4 mr-2" /> Add Time
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Progress: {totalHours} / {expectedHours} hours</span>
              <span className="text-sm font-medium">{progressPercentage.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-500 h-2.5 rounded-full" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
          
          {timeEntries.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {timeEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(entry => (
                  <TableRow key={entry.id}>
                    <TableCell>{format(new Date(entry.date), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>{entry.hours}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{entry.notes || '-'}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => onEditEntry(entry)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onDeleteEntry(entry.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-center text-gray-500">
              <Clock className="h-12 w-12 mb-2 opacity-20" />
              <p>No time entries recorded yet</p>
              <p className="text-sm">Add your first time entry to start tracking your work</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Task duration: {task.duration_days || 0} days</p>
        </div>
        <div>
          <p className="font-medium">Total: {totalHours} hours</p>
        </div>
      </CardFooter>
    </Card>
  );
};

