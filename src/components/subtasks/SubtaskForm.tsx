
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
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
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SubtaskFormProps {
  title: string;
  description: string;
  status: string;
  dueDate: Date | undefined;
  notes: string;
  assignedTo: string;
  isSubmitting: boolean;
  setTitle: (value: string) => void;
  setDescription: (value: string) => void;
  setStatus: (value: string) => void;
  setDueDate: (date: Date | undefined) => void;
  setNotes: (value: string) => void;
  setAssignedTo: (value: string) => void;
  teamMembers?: { id: string; full_name: string; last_name: string; }[];
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export const SubtaskForm: React.FC<SubtaskFormProps> = ({
  title,
  description,
  status,
  dueDate,
  notes,
  assignedTo,
  isSubmitting,
  setTitle,
  setDescription,
  setStatus,
  setDueDate,
  setNotes,
  setAssignedTo,
  teamMembers,
  onSubmit,
  onClose,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          placeholder="Subtask title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Subtask description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>

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
            <SelectItem value="cancelled">Cancelled</SelectItem>
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
                {`${member.full_name} ${member.last_name}`}
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
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dueDate ? format(dueDate, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
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

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Subtask'}
        </Button>
      </div>
    </form>
  );
};
