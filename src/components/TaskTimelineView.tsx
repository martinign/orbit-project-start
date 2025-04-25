import React, { useState, useMemo } from 'react';
import { addDays, parseISO, startOfDay, max, min, differenceInHours } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import TaskDialog from './TaskDialog';
import { TimelineFilters } from './task-timeline/TimelineFilters';
import { TimelineLegend } from './task-timeline/TimelineLegend';
import { Timeline } from './task-timeline/Timeline';

export interface TaskStatusHistory {
  task_id: string;
  status: string;
  timestamp: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  due_date?: string;
  priority: string;
  user_id: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  completion_time?: number;
}

export interface TeamMember {
  id?: string;
  user_id: string;
  full_name: string;
  last_name?: string;
}

interface TimelineProps {
  projectId: string | undefined;
}

const TaskTimelineView: React.FC<TimelineProps> = ({ projectId }) => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('month');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks_timeline', projectId, timeRange, statusFilter, assigneeFilter, priorityFilter, searchQuery],
    queryFn: async () => {
      if (!projectId) return [];

      let query = supabase
        .from('project_tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (assigneeFilter !== 'all') {
        query = query.eq('assigned_to', assigneeFilter);
      }

      if (priorityFilter !== 'all') {
        query = query.eq('priority', priorityFilter);
      }

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      const { data: tasksData, error } = await query;
      if (error) throw error;

      return (tasksData || []).map(task => ({
        ...task,
        completion_time: task.status === 'completed' && task.updated_at
          ? differenceInHours(parseISO(task.updated_at), parseISO(task.created_at))
          : undefined
      }));
    },
    enabled: !!projectId,
  });

  const { data: teamMembers = [] } = useQuery({
    queryKey: ['project_team_members', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const { data, error } = await supabase
        .from('project_team_members')
        .select('user_id, full_name, last_name')
        .eq('project_id', projectId);
      if (error) throw error;
      return data;
    },
    enabled: !!projectId,
  });

  const timelineDates = useMemo(() => {
    if (!tasks.length) return [];

    const today = startOfDay(new Date());

    const rangeDays = {
      week: 7,
      month: 30,
      quarter: 90,
    }[timeRange];

    const taskStartDates = tasks.map(task => startOfDay(parseISO(task.created_at)));

    const earliestTaskDate = min(taskStartDates);
    const startDate = startOfDay(min([earliestTaskDate, addDays(today, -rangeDays + 1)]));
    const endDate = startOfDay(max([today, ...taskStartDates]));

    const dates: Date[] = [];
    let currentDate = startDate;

    while (currentDate <= endDate) {
      dates.push(startOfDay(currentDate));
      currentDate = addDays(currentDate, 1);
    }

    return dates;
  }, [tasks, timeRange]);

  // ✅ ESTA ES LA VARIABLE QUE FALTABA
  const filteredTasks = useMemo(() => {
    if (!tasks.length) return [];
    return tasks.filter(task => task.created_at);
  }, [tasks]);

  if (tasksLoading) {
    return <div className="flex justify-center items-center h-64">Loading timeline...</div>;
  }

  const handleClearFilters = () => {
    setStatusFilter('all');
    setAssigneeFilter('all');
    setPriorityFilter('all');
    setSearchQuery('');
  };

  const hasFilters =
    statusFilter !== 'all' ||
    assigneeFilter !== 'all' ||
    priorityFilter !== 'all' ||
    searchQuery !== '';

  return (
    <div className="space-y-4">
      <TimelineFilters
        timeRange={timeRange}
        statusFilter={statusFilter}
        assigneeFilter={assigneeFilter}
        priorityFilter={priorityFilter}
        searchQuery={searchQuery}
        teamMembers={teamMembers}
        onTimeRangeChange={setTimeRange}
        onStatusFilterChange={setStatusFilter}
        onAssigneeFilterChange={setAssigneeFilter}
        onPriorityFilterChange={setPriorityFilter}
        onSearchQueryChange={setSearchQuery}
        onCreateTask={() => setIsTaskDialogOpen(true)}
      />

      <TimelineLegend />

      <Card>
        <CardContent className="p-4">
          <Timeline
            tasks={filteredTasks}
            timelineDates={timelineDates}
            teamMembers={teamMembers}
            hasFilters={hasFilters}
            onClearFilters={handleClearFilters}
          />
        </CardContent>
      </Card>

      <TaskDialog
        open={isTaskDialogOpen}
        onClose={() => setIsTaskDialogOpen(false)}
        mode="create"
        projectId={projectId}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['tasks_timeline'] });
          setIsTaskDialogOpen(false);
        }}
      />
    </div>
  );
};

export default TaskTimelineView;
