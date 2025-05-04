
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, BookTemplate } from "lucide-react";
import { cn } from "@/lib/utils";
import { DialogFooter } from "@/components/ui/dialog";
import { TeamMember } from '@/hooks/useTeamMembers';
import { WorkdayCodeOption } from '@/utils/workdayCombinedUtils';

interface Project {
  id: string;
  project_number: string;
  Sponsor: string;
}

interface TaskFormProps {
  title: string;
  setTitle: (title: string) => void;
  description: string;
  setDescription: (description: string) => void;
  status: string;
  setStatus: (status: string) => void;
  priority: string;
  setPriority: (priority: string) => void;
  selectedProject?: string;
  setSelectedProject?: (projectId: string) => void;
  dueDate?: Date;
  setDueDate: (date: Date | undefined) => void;
  notes: string;
  setNotes: (notes: string) => void;
  assignedTo: string;
  setAssignedTo: (memberId: string) => void;
  selectedWorkdayCode: string;
  setSelectedWorkdayCode: (codeId: string) => void;
  teamMembers?: TeamMember[];
  projects?: Project[];
  workdayCodes?: WorkdayCodeOption[];
  hasFixedProject: boolean;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  onOpenTemplateDialog?: () => void;
  mode: 'create' | 'edit';
}

export const TaskForm: React.FC<TaskFormProps> = ({
  title,
  setTitle,
  description,
  setDescription,
  status,
  setStatus,
  priority,
  setPriority,
  selectedProject,
  setSelectedProject,
  dueDate,
  setDueDate,
  notes,
  setNotes,
  assignedTo,
  setAssignedTo,
  selectedWorkdayCode,
  setSelectedWorkdayCode,
  teamMembers = [],
  projects = [],
  workdayCodes = [],
  hasFixedProject,
  isSubmitting,
  onSubmit,
  onClose,
  onOpenTemplateDialog,
  mode,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="title">Title</Label>
          {mode === 'create' && onOpenTemplateDialog && (
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={onOpenTemplateDialog}
              className="flex items-center gap-1"
            >
              <BookTemplate className="h-4 w-4" />
              Use Template
            </Button>
          )}
        </div>
        <Input
          id="title"
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Task description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>

      {!hasFixedProject && setSelectedProject && (
        <div className="space-y-2">
          <Label htmlFor="project">Project</Label>
          <Select 
            value={selectedProject} 
            onValueChange={setSelectedProject} 
            required
          >
            <SelectTrigger id="project">
              <SelectValue placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.project_number} - {project.Sponsor}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger id="status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="not started">Not Started</SelectItem>
              <SelectItem value="in progress">In Progress</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="stucked">Stucked</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger id="priority">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="workdayCode">Workday Code (Optional)</Label>
        <Select value={selectedWorkdayCode} onValueChange={setSelectedWorkdayCode}>
          <SelectTrigger id="workdayCode">
            <SelectValue placeholder="Select a workday code" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {workdayCodes.map((code) => (
              <SelectItem key={code.id} value={code.id}>
                {code.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="assignedTo">Assigned To (Optional)</Label>
        <Select value={assignedTo} onValueChange={setAssignedTo}>
          <SelectTrigger id="assignedTo">
            <SelectValue placeholder="Select team member" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Not assigned</SelectItem>
            {teamMembers?.map((member) => (
              <SelectItem key={member.id} value={member.id}>
                {member.display_name || `${member.full_name}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dueDate">Due Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !dueDate && "text-muted-foreground"
              )}
              type="button"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dueDate ? format(dueDate, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 z-50" align="start">
            <Calendar
              mode="single"
              selected={dueDate}
              onSelect={setDueDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Additional notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="bg-blue-500 hover:bg-blue-600 text-white">
          {isSubmitting ? 'Saving...' : mode === 'edit' ? 'Save changes' : 'Create task'}
        </Button>
      </DialogFooter>
    </form>
  );
};
