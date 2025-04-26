import React from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { GanttTask } from '@/types/gantt';
import { useGanttTaskForm } from '@/hooks/useGanttTaskForm';
import { GanttTaskForm } from './GanttTaskForm';
import { GanttTaskDependencies } from './GanttTaskDependencies';
import { Button } from "@/components/ui/button";

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
  const { data: teamMembers } = useTeamMembers();
  const { 
    formState,
    setTitle,
    setDescription,
    setStartDate,
    setDurationDays,
    setStatus,
    setAssignedTo,
    setDependencies,
    setCalendarOpen,
    handleSubmit
  } = useGanttTaskForm({
    projectId,
    task,
    mode,
    onSuccess,
    onClose
  });

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
          <GanttTaskForm
            {...formState}
            teamMembers={teamMembers || []}
            onTitleChange={setTitle}
            onDescriptionChange={setDescription}
            onStartDateSelect={setStartDate}
            onDurationChange={(value) => setDurationDays(parseInt(value) || 1)}
            onStatusChange={setStatus}
            onAssignedToChange={setAssignedTo}
            setCalendarOpen={setCalendarOpen}
          />

          <GanttTaskDependencies
            availableTasks={[]}
            dependencies={formState.dependencies}
            selectedDependency={null}
            dependencyEndDate={null}
            onSelectedDependencyChange={() => {}}
            onAddDependency={() => {}}
            onRemoveDependency={() => {}}
          />

          <DialogFooter>
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={formState.isSubmitting}>
              {formState.isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Task' : 'Update Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default GanttTaskDialog;
