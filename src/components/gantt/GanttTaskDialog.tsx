import React, { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Calendar, Clock, FileText, Users, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Select, SelectValue, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/select';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { columnsConfig } from '../tasks/columns-config';

interface GanttTaskDialogProps {
  projectId: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  task?: GanttTask;
  mode?: 'create' | 'edit';
}

const GanttTaskDialog: React.FC<GanttTaskDialogProps> = ({
  projectId,
  open,
  onClose,
  onSuccess,
  task,
  mode = 'create'
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [durationDays, setDurationDays] = useState<number>(1);
  const [status, setStatus] = useState('not started');
  const [assignedTo, setAssignedTo] = useState<string | null>(null);
  const [dependencies, setDependencies] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [availableTasks, setAvailableTasks] = useState<any[]>([]);
  const [selectedDependency, setSelectedDependency] = useState<string | null>(null);
  const { teamMembers } = useTeamMembers(projectId);

  useEffect(() => {
    if (task && mode === 'edit') {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setStatus(task.status || 'not started');
      setAssignedTo(task.assigned_to || null);
      
      if (task.start_date) {
        setStartDate(new Date(task.start_date));
      }
      
      setDurationDays(task.duration_days || 1);
      
      if (task.dependencies) {
        setDependencies(Array.isArray(task.dependencies) ? task.dependencies : []);
      }
    } else {
      setTitle('');
      setDescription('');
      setStartDate(null);
      setDurationDays(1);
      setStatus('not started');
      setAssignedTo(null);
      setDependencies([]);
    }
  }, [task, mode, open]);

  useEffect(() => {
    const fetchAvailableTasks = async () => {
      if (!projectId || !open) return;
      
      try {
        const { data, error } = await supabase
          .from('project_tasks')
          .select('id, title')
          .eq('project_id', projectId)
          .eq('is_gantt_task', true)
          .order('title', { ascending: true });
        
        if (error) throw error;
        
        const filteredTasks = data?.filter(t => 
          t.id !== task?.id && !dependencies.includes(t.id)
        ) || [];
        
        setAvailableTasks(filteredTasks);
      } catch (error) {
        console.error('Error fetching available tasks:', error);
      }
    };

    fetchAvailableTasks();
  }, [projectId, open, task?.id, dependencies]);

  const handleAddDependency = () => {
    if (selectedDependency && !dependencies.includes(selectedDependency)) {
      setDependencies([...dependencies, selectedDependency]);
      setSelectedDependency(null);
    }
  };

  const handleRemoveDependency = (depId: string) => {
    setDependencies(dependencies.filter(id => id !== depId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === 'create') {
        const { data: taskResult, error: taskError } = await supabase
          .from('project_tasks')
          .insert({
            title,
            description,
            status,
            project_id: projectId,
            assigned_to: assignedTo,
            is_gantt_task: true,
            user_id: (await supabase.auth.getUser()).data.user?.id
          })
          .select('id')
          .single();

        if (taskError) throw taskError;

        const { error: ganttError } = await supabase
          .from('gantt_tasks')
          .insert({
            task_id: taskResult.id,
            start_date: startDate.toISOString(),
            duration_days: durationDays,
            dependencies
          });

        if (ganttError) throw ganttError;
      } else if (task?.id) {
        const { error: taskError } = await supabase
          .from('project_tasks')
          .update({
            title,
            description,
            status,
            assigned_to: assignedTo
          })
          .eq('id', task.id);

        if (taskError) throw taskError;

        const { error: ganttError } = await supabase
          .from('gantt_tasks')
          .update({
            start_date: startDate.toISOString(),
            duration_days: durationDays,
            dependencies
          })
          .eq('task_id', task.id);

        if (ganttError) throw ganttError;
      }

      queryClient.invalidateQueries({ queryKey: ['gantt_tasks', projectId] });
      
      toast({
        title: "Success",
        description: mode === 'create' ? "Gantt task created successfully" : "Gantt task updated successfully",
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving gantt task:', error);
      toast({
        title: "Error",
        description: "Failed to save the gantt task",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Create New Gantt Task' : 'Edit Gantt Task'}</DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Add a new task to the Gantt chart timeline' 
              : 'Update the existing Gantt task details'
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title <span className="text-red-500">*</span></Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date <span className="text-red-500">*</span></Label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    id="start-date"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "MMM dd, yyyy") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={startDate || undefined}
                    onSelect={(date) => {
                      setStartDate(date);
                      setCalendarOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (Days) <span className="text-red-500">*</span></Label>
              <Input
                id="duration"
                type="number"
                min="1"
                value={durationDays}
                onChange={(e) => setDurationDays(parseInt(e.target.value) || 1)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="status" className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {columnsConfig.map((column) => (
                    <SelectItem key={column.id} value={column.status}>
                      {column.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="assigned-to">Assigned To</Label>
              <Select value={assignedTo || ""} onValueChange={setAssignedTo}>
                <SelectTrigger id="assigned-to" className="w-full">
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Unassigned</SelectItem>
                  {teamMembers?.map((member) => (
                    <SelectItem key={member.user_id} value={member.user_id}>
                      {`${member.full_name || ''} ${member.last_name || ''}`.trim()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Dependencies</Label>
            <div className="flex gap-2 mb-2">
              <Select value={selectedDependency || ""} onValueChange={setSelectedDependency}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a task" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {availableTasks.map((task) => (
                    <SelectItem key={task.id} value={task.id}>
                      {task.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                type="button" 
                variant="outline"
                onClick={handleAddDependency}
                disabled={!selectedDependency}
              >
                Add
              </Button>
            </div>

            {dependencies.length > 0 && (
              <div className="border rounded-md p-2">
                <p className="text-sm text-muted-foreground mb-2">Dependencies:</p>
                <ul className="space-y-1">
                  {dependencies.map(depId => {
                    const depTask = availableTasks.find(t => t.id === depId) || 
                                    { id: depId, title: 'Unknown Task' };
                    return (
                      <li key={depId} className="flex justify-between items-center text-sm">
                        <span className="flex items-center">
                          <ArrowRight className="h-3 w-3 mr-1" />
                          {depTask.title}
                        </span>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 px-2 text-red-500"
                          onClick={() => handleRemoveDependency(depId)}
                        >
                          Remove
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Task' : 'Update Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default GanttTaskDialog;
