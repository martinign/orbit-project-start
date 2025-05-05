
import React from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TeamMember } from "@/hooks/useTeamMembers";

interface AssigneeSelectorProps {
  assignedTo: string;
  setAssignedTo: (memberId: string) => void;
  teamMembers?: TeamMember[];
}

const AssigneeSelector = ({
  assignedTo,
  setAssignedTo,
  teamMembers = [],
}: AssigneeSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="assignedTo">Assigned To (Optional)</Label>
      <Select value={assignedTo} onValueChange={setAssignedTo}>
        <SelectTrigger id="assignedTo">
          <SelectValue placeholder="Select team member" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Not assigned</SelectItem>
          {teamMembers.map((member) => (
            <SelectItem key={member.id} value={member.id}>
              {member.display_name || `${member.full_name}`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default AssigneeSelector;
