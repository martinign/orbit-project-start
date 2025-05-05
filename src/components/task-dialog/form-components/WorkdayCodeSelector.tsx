
import React from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WorkdayCodeOption } from "@/utils/workdayCombinedUtils";

interface WorkdayCodeSelectorProps {
  selectedWorkdayCode: string;
  setSelectedWorkdayCode: (codeId: string) => void;
  workdayCodes: WorkdayCodeOption[];
}

const WorkdayCodeSelector = ({
  selectedWorkdayCode,
  setSelectedWorkdayCode,
  workdayCodes,
}: WorkdayCodeSelectorProps) => {
  return (
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
  );
};

export default WorkdayCodeSelector;
