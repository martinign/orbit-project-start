import React, { useState, useMemo, useEffect } from 'react';
import { format, addDays, differenceInDays, startOfMonth, endOfMonth, isWithinInterval, parseISO, differenceInHours } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar, Check, Clock, User, Search, Filter, CircleDashed, X, Timer, Plus } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import TaskDialog from './TaskDialog';

interface TaskStatusHistory {
  task_id: string;
  status: string;
  timestamp: string;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  due_date?: string;
  priority: string;
  user_id: string;  // Created by
  assigned_to?: string;  // Assigned to
  created_at: string;
  completion_time?: number; // Time in hours from created to completed
}

interface TeamMember {
  id: string;
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
        .eq('project_id', projectId);
        
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
      
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;

      const tasksWithCompletionTime = await Promise.all((data || []).map(async (task) => {
        let completionTime: number | undefined = undefined;

        if (task.status === 'completed') {
          const createdDate = parseISO(task.created_at);
          const completedDate = new Date();
          
          if (task.updated_at) {
            completionTime = differenceInHours(parseISO(task.updated_at), createdDate);
          }
        }

        return {
          ...task,
          completion_time: completionTime
        } as Task;
      }));

      return tasksWithCompletionTime;
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
    const now = new Date();
    let startDate, endDate;
    
    switch (timeRange) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - now.getDay());
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        break;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        endDate = new Date(now.getFullYear(), (quarter + 1) * 3, 0);
        break;
      case 'month':
      default:
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
    }
    
    const dates = [];
    const days = differenceInDays(endDate, startDate) + 1;
    
    for (let i = 0; i < days; i++) {
      dates.push(addDays(startDate, i));
    }
    
    return dates;
  }, [timeRange]);
  
  const filteredTasks = useMemo(() => {
    if (!tasks.length) return [];
    
    return tasks.filter(task => {
      if (!task.created_at) return false;
      
      return true;
    });
  }, [tasks, timeRange]);
  
  const renderTaskBar = (task: Task) => {
    if (!task.created_at) return null;
    
    const startDate = parseISO(task.created_at);
    const daysSinceCreation = differenceInDays(new Date(), startDate);
    
    const taskDayIndex = timelineDates.findIndex(date => 
      date.getFullYear() === startDate.getFullYear() &&
      date.getMonth() === startDate.getMonth() &&
      date.getDate() === startDate.getDate()
    );
    
    if (taskDayIndex === -1) return null;

    const getStatusColor = (status: string) => {
      switch (status.toLowerCase()) {
        case 'completed': return 'bg-green-500';
        case 'in progress': return 'bg-blue-500';
        case 'stucked': return 'bg-red-500';
        case 'pending': return 'bg-yellow-500';
        case 'not started':
        default: return 'bg-gray-500';
      }
    };

    const assignedTeamMember = teamMembers.find(member => member.user_id === task.assigned_to);
    const createdByTeamMember = teamMembers.find(member => member.user_id === task.user_id);

    return (
      <div key={task.id} className="flex min-h-[2.5rem] items-center border-b border-gray-100">
        <div className="w-64 flex-shrink-0 px-4 py-2 border-r border-gray-200">
          <div className="flex items-center space-x-2">
            <span className="font-medium truncate">{task.title}</span>
            <span className="text-xs text-gray-500">({daysSinceCreation}d)</span>
          </div>
        </div>
        
        <div 
          className="flex-1 grid relative" 
          style={{ gridTemplateColumns: `repeat(${timelineDates.length}, minmax(30px, 1fr))` }}
        >
          <div className="absolute w-full border-b border-dotted border-gray-300" style={{ top: '50%' }} />
          
          <HoverCard>
            <HoverCardTrigger>
              <div
                className={`h-6 rounded-md ${getStatusColor(task.status)}`}
                style={{ gridColumn: `${taskDayIndex + 1} / span 1` }}
              />
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="space-y-2">
                <h3 className="text-lg font-bold">{task.title}</h3>
                {task.description && (
                  <p className="text-sm text-gray-600">{task.description}</p>
                )}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <div className="font-medium">Status:</div>
                    <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
                  </div>
                  
                  <div>
                    <div className="font-medium">Priority:</div>
                    <span className="capitalize">{task.priority}</span>
                  </div>
                  
                  <div>
                    <div className="font-medium">Created by:</div>
                    <div className="flex items-center">
                      <User className="h-3 w-3 mr-1" />
                      <span>
                        {createdByTeamMember 
                          ? `${createdByTeamMember.full_name || ''} ${createdByTeamMember.last_name || ''}`.trim() 
                          : 'Unknown'}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="font-medium">Assigned to:</div>
                    <div className="flex items-center">
                      <User className="h-3 w-3 mr-1" />
                      <span>
                        {assignedTeamMember 
                          ? `${assignedTeamMember.full_name || ''} ${assignedTeamMember.last_name || ''}`.trim() 
                          : 'Unassigned'}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="font-medium">Created:</div>
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {format(parseISO(task.created_at), 'MMM dd, yyyy')}
                    </div>
                  </div>
                  
                  <div>
                    <div className="font-medium">Due:</div>
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {task.due_date 
                        ? format(parseISO(task.due_date), 'MMM dd, yyyy')
                        : 'No due date'
                      }
                    </div>
                  </div>

                  {task.status === 'completed' && task.completion_time !== undefined && (
                    <div className="col-span-2">
                      <div className="font-medium">Time to complete:</div>
                      <div className="flex items-center">
                        <Timer className="h-3 w-3 mr-1" />
                        {task.completion_time > 24 
                          ? `${Math.round(task.completion_time / 24)} days ${Math.round(task.completion_time % 24)} hours`
                          : `${Math.round(task.completion_time)} hours`
                        }
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
      </div>
    );
  };

  if (tasksLoading) {
    return <div className="flex justify-center items-center h-64">Loading timeline...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center">
          <Select value={timeRange} onValueChange={(value: 'week' | 'month' | 'quarter') => setTimeRange(value)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Time Range</SelectLabel>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="quarter">Quarter</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Status</SelectLabel>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="not started">Not Started</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="stucked">Stucked</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          
          <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Assignee" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Assignee</SelectLabel>
                <SelectItem value="all">All Members</SelectItem>
                {projectTeamMembers.map((member) => (
                  <SelectItem key={member.id} value={member.user_id}>
                    {`${member.full_name || ''} ${member.last_name || ''}`.trim() || 'Unknown'}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Priority</SelectLabel>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search tasks..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-10 w-10"
                onClick={() => setSearchQuery('')}
                title="Clear search"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Button 
            onClick={() => setIsTaskDialogOpen(true)}
            className="bg-blue-500 hover:bg-blue-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-4 items-center text-sm">
        <span className="font-medium">Status Legend:</span>
        <div className="flex items-center">
          <span className="inline-block w-3 h-3 mr-1 bg-gray-500 rounded-full"></span>
          <span>Not Started</span>
        </div>
        <div className="flex items-center">
          <span className="inline-block w-3 h-3 mr-1 bg-yellow-500 rounded-full"></span>
          <span>Pending</span>
        </div>
        <div className="flex items-center">
          <span className="inline-block w-3 h-3 mr-1 bg-blue-500 rounded-full"></span>
          <span>In Progress</span>
        </div>
        <div className="flex items-center">
          <span className="inline-block w-3 h-3 mr-1 bg-green-500 rounded-full"></span>
          <span>Completed</span>
        </div>
        <div className="flex items-center">
          <span className="inline-block w-3 h-3 mr-1 bg-red-500 rounded-full"></span>
          <span>Stucked</span>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-4">
          {tasks.length === 0 ? (
            <div className="text-center py-10">
              <CircleDashed className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No tasks found with the current filters.</p>
              {(statusFilter !== 'all' || assigneeFilter !== 'all' || priorityFilter !== 'all' || searchQuery) && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setStatusFilter('all');
                    setAssigneeFilter('all');
                    setPriorityFilter('all');
                    setSearchQuery('');
                  }}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <ScrollArea className="h-[calc(100vh-400px)]">
              <div className="min-w-[800px]">
                <div className="flex">
                  <div className="w-64 flex-shrink-0 px-4 py-2 border-r border-gray-200 bg-gray-50 font-medium">
                    Task Title
                  </div>
                  
                  <div 
                    className="flex-1 grid gap-0 border-b" 
                    style={{ gridTemplateColumns: `repeat(${timelineDates.length}, minmax(30px, 1fr))` }}
                  >
                    {timelineDates.map((date, index) => (
                      <div 
                        key={index} 
                        className={`text-center py-1 px-1 text-xs ${
                          date.getDate() === 1 || index === 0 ? 'font-bold' : ''
                        }`}
                      >
                        {date.getDate() === 1 || index === 0 
                          ? format(date, 'MMM d')
                          : format(date, 'd')}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="divide-y divide-gray-100">
                  {filteredTasks.map((task) => renderTaskBar(task))}
                </div>
              </div>
            </ScrollArea>
          )}
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
