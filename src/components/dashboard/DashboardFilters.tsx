import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CalendarIcon, Filter, RefreshCcw } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
interface DashboardFiltersProps {
  onFilterChange: (filters: {
    projectId?: string;
    startDate?: Date;
    endDate?: Date;
    status?: string;
  }) => void;
}
export function DashboardFilters({
  onFilterChange
}: DashboardFiltersProps) {
  const [projectId, setProjectId] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined
  });
  const [status, setStatus] = useState<string>("all");
  const {
    toast
  } = useToast();
  const {
    data: projects
  } = useQuery({
    queryKey: ["project_filter_options"],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("projects").select("id, project_number, Sponsor").order("updated_at", {
        ascending: false
      });
      if (error) throw error;
      return data || [];
    }
  });
  const handleReset = () => {
    setProjectId("all");
    setDateRange({
      from: undefined,
      to: undefined
    });
    setStatus("all");
    onFilterChange({});
    toast({
      title: "Filters Reset",
      description: "All filters have been cleared"
    });
  };
  const applyFilters = () => {
    const filters = {
      projectId: projectId !== "all" ? projectId : undefined,
      startDate: dateRange?.from,
      endDate: dateRange?.to,
      status: status !== "all" ? status : undefined
    };
    onFilterChange(filters);
    toast({
      title: "Filters Applied",
      description: `Applied filters to dashboard data`
    });
  };
  return <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="grid gap-1.5 w-full md:w-1/4">
          <Label htmlFor="project-filter">Project</Label>
          <Select value={projectId} onValueChange={value => setProjectId(value)}>
            <SelectTrigger id="project-filter">
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {(projects || []).map(project => <SelectItem key={project.id} value={project.id}>
                  {project.project_number} - {project.Sponsor}
                </SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1.5 w-full md:w-1/4">
          <Label>Date Range</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? dateRange.to ? <>
                      {format(dateRange.from, "PPP")} - {format(dateRange.to, "PPP")}
                    </> : format(dateRange.from, "PPP") : <span>Pick a date range</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="range" selected={dateRange} onSelect={setDateRange} initialFocus className={cn("p-3 pointer-events-auto")} />
            </PopoverContent>
          </Popover>
        </div>

        <div className="grid gap-1.5 w-full md:w-1/4">
          <Label htmlFor="status-filter">Task Status</Label>
          <Select value={status} onValueChange={value => setStatus(value)}>
            <SelectTrigger id="status-filter">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2 w-full md:w-1/4">
          <Button onClick={applyFilters} className="w-full" variant="secondary">
            <Filter className="mr-2 h-4 w-4" /> Apply Filters
          </Button>
          <Button onClick={handleReset} variant="outline" className="px-3">
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>;
}