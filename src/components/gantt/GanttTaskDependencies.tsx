
import React from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from 'date-fns';

interface GanttTaskDependenciesProps {
  availableTasks: any[];
  dependencies: string[];
  selectedDependency: string | null;
  dependencyEndDate: Date | null;
  onSelectedDependencyChange: (value: string | null) => void;
  onAddDependency: () => void;
  onRemoveDependency: (depId: string) => void;
}

export const GanttTaskDependencies: React.FC<GanttTaskDependenciesProps> = ({
  availableTasks,
  dependencies,
  selectedDependency,
  dependencyEndDate,
  onSelectedDependencyChange,
  onAddDependency,
  onRemoveDependency
}) => {
  return (
    <div className="space-y-2">
      <Label>Dependencies</Label>
      <div className="flex gap-2 mb-2">
        <Select value={selectedDependency || "none"} onValueChange={onSelectedDependencyChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a task" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
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
          onClick={onAddDependency}
          disabled={!selectedDependency || selectedDependency === "none"}
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
                    onClick={() => onRemoveDependency(depId)}
                  >
                    Remove
                  </Button>
                </li>
              );
            })}
          </ul>
          {dependencyEndDate && (
            <p className="text-sm text-muted-foreground mt-2">
              Latest dependency end date: {format(dependencyEndDate, "MMM dd, yyyy")}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
