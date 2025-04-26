
import React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { columnsConfig } from '../tasks/columns-config';
import { cn } from "@/lib/utils";

interface GanttTaskFormProps {
  title: string;
  description: string;
  startDate: Date | null;
  durationDays: number;
  status: string;
  assignedTo: string | null;
  dependencies: string[];
  dependencyEndDate: Date | null;
  teamMembers: any[];
  calendarOpen: boolean;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onStartDateSelect: (date: Date | null) => void;
  onDurationChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onAssignedToChange: (value: string) => void;
  setCalendarOpen: (open: boolean) => void;
}

export const GanttTaskForm: React.FC<GanttTaskFormProps> = ({
  title,
  description,
  startDate,
  durationDays,
  status,
  assignedTo,
  dependencies,
  dependencyEndDate,
  teamMembers,
  calendarOpen,
  onTitleChange,
  onDescriptionChange,
  onStartDateSelect,
  onDurationChange,
  onStatusChange,
  onAssignedToChange,
  setCalendarOpen,
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Task Title <span className="text-red-500">*</span></Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Enter task title"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Enter task description"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start-date">
            Start Date {!dependencies.length && <span className="text-red-500">*</span>}
          </Label>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !startDate && "text-muted-foreground",
                  dependencies.length && "opacity-50"
                )}
                disabled={dependencies.length > 0}
                id="start-date"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "MMM dd, yyyy") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto z-50" align="start">
              <Calendar
                mode="single"
                selected={startDate || undefined}
                onSelect={(date) => {
                  onStartDateSelect(date);
                  setCalendarOpen(false);
                }}
                initialFocus
                className="pointer-events-auto rounded-md border"
              />
            </PopoverContent>
          </Popover>
          {dependencies.length > 0 && dependencyEndDate && (
            <p className="text-sm text-muted-foreground">
              Start date will be set to {format(dependencyEndDate, "MMM dd, yyyy")} based on dependencies
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="duration">Duration (Days) <span className="text-red-500">*</span></Label>
          <Input
            id="duration"
            type="number"
            min="1"
            value={durationDays}
            onChange={(e) => onDurationChange(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={status} onValueChange={onStatusChange}>
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
          <Select value={assignedTo || "unassigned"} onValueChange={onAssignedToChange}>
            <SelectTrigger id="assigned-to" className="w-full">
              <SelectValue placeholder="Select team member" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {teamMembers?.map((member) => (
                <SelectItem key={member.id} value={member.id}>
                  {`${member.full_name || ''} ${member.last_name || ''}`.trim()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
