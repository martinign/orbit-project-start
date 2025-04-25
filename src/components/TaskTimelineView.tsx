
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
import { Calendar, Check, Clock, User, Search, Filter, CircleDashed, X, Timer } from 'lucide-react';
import { useProjectInvitations } from '@/hooks/useProjectInvitations';

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
  const queryClient = useQueryClient();

  // Query to fetch tasks
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

      // Calculate completion time for each task
      const tasksWithCompletionTime = await Promise.all((data || []).map(async (task) => {
        let completionTime: number | undefined = undefined;

        // For completed tasks, we calculate the completion time
        if (task.status === 'completed') {
          // Get task history (this is simulated since we don't have actual history data yet)
          const createdDate = parseISO(task.created_at);
          const completedDate = new Date(); // Default to now if we don't know
          
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

  // Get project team members (both direct members and those from invitations)
  const { data: projectTeamMembers = [], isLoading: teamMembersLoading } = useQuery({
    queryKey: ['project_team_members', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      
      const { data: directMembers, error: directError } = await supabase
        .from('project_team_members')
        .select('user_id, full_name, last_name, id')
        .eq('project_id', projectId);
        
      if (directError) throw directError;
      
      // Get project invitations
      const { data: projectInvitations } = await supabase
        .from("project_invitations")
        .select(`
          id,
          status,
          inviter:inviter_id(id, full_name, last_name),
          invitee:invitee_id(id, full_name, last_name)
        `)
        .eq('project_id', projectId)
        .eq('status', 'accepted');
      
      // Combine direct members with invited members
      const allMembers: TeamMember[] = [
        ...(directMembers || []).map((member) => ({
          id: member.id,
          user_id: member.user_id,
          full_name: member.full_name || '',
          last_name: member.last_name || ''
        }))
      ];
      
      // Add invited members (if they exist)
      if (projectInvitations) {
        // Add project invitees
        projectInvitations.forEach((inv: any) => {
          if (inv.invitee && inv.status === 'accepted') {
            const existingMember = allMembers.find(m => m.user_id === inv.invitee.id);
            if (!existingMember && inv.invitee.id) {
              allMembers.push({
                id: inv.id,
                user_id: inv.invitee.id,
                full_name: inv.invitee.full_name || '',
                last_name: inv.invitee.last_name || ''
              });
            }
          }
          
          // Add project inviters
          if (inv.inviter) {
            const existingMember = allMembers.find(m => m.user_id === inv.inviter.id);
            if (!existingMember && inv.inviter.id) {
              allMembers.push({
                id: inv.id + '_inviter',
                user_id: inv.inviter.id,
                full_name: inv.inviter.full_name || '',
                last_name: inv.inviter.last_name || ''
              });
            }
          }
        });
      }
      
      return allMembers;
    },
    enabled: !!projectId,
  });

  // Generate timeline dates based on selected range
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
  
  // Get filtered tasks
  const filteredTasks = useMemo(() => {
    if (!tasks.length) return [];
    
    return tasks.filter(task => {
      if (!task.created_at) return false;
      
      // Additional filtering can be added here if needed
      return true;
    });
  }, [tasks, timeRange]);
  
  // Task rendering helper
  const renderTaskBar = (task: Task) => {
    const startDate = parseISO(task.created_at);
    const endDate = task.due_date ? parseISO(task.due_date) : new Date();
    
    // Calculate task position and width
    const taskStartDay = Math.max(0, differenceInDays(startDate, timelineDates[0]));
    const taskDuration = Math.max(1, differenceInDays(endDate, startDate) + 1);
    const taskWidth = Math.min(taskDuration, timelineDates.length - taskStartDay);
    
    // Skip tasks that don't fall within the current timeline view
    if (taskStartDay >= timelineDates.length || taskStartDay + taskWidth <= 0) {
      return null;
    }
    
    const getStatusColor = (status: string) => {
      switch (status.toLowerCase()) {
        case 'completed':
          return 'bg-green-500';
        case 'in progress':
          return 'bg-blue-500';
        case 'stucked':
          return 'bg-red-500';
        case 'pending':
          return 'bg-yellow-500';
        case 'not started':
        default:
          return 'bg-gray-500';
      }
    };

    const barStyle = {
      gridColumn: `${taskStartDay + 1} / span ${taskWidth}`,
    };
    
    // Task creator
    const TaskCreator = () => {
      const { data: creator } = useUserProfile(task.user_id);
      return <span>{creator?.displayName || 'Unknown'}</span>;
    };
    
    // Task assignee
    const TaskAssignee = () => {
      const { data: assignee } = useUserProfile(task.assigned_to);
      return <span>{assignee?.displayName || 'Unassigned'}</span>;
    };
    
    return (
      <div key={task.id} className="relative h-8 mt-1 mb-1">
        <HoverCard>
          <HoverCardTrigger asChild>
            <div
              className={`absolute h-6 rounded-md cursor-pointer ${getStatusColor(task.status)} text-white text-xs flex items-center px-2 truncate`}
              style={barStyle}
            >
              {task.title}
            </div>
          </HoverCardTrigger>
          <HoverCardContent className="w-80 p-4">
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
                    <TaskCreator />
                  </div>
                </div>
                
                <div>
                  <div className="font-medium">Assigned to:</div>
                  <div className="flex items-center">
                    <User className="h-3 w-3 mr-1" />
                    <TaskAssignee />
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
    );
  };

  if (tasksLoading || teamMembersLoading) {
    return <div className="flex justify-center items-center h-64">Loading timeline...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
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
      </div>
      
      {/* Status Legend */}
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
      
      {/* Timeline */}
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
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Timeline header with dates */}
                <div 
                  className="grid gap-0 border-b" 
                  style={{ 
                    gridTemplateColumns: `repeat(${timelineDates.length}, minmax(30px, 1fr))` 
                  }}
                >
                  {timelineDates.map((date, index) => (
                    <div 
                      key={index} 
                      className={`text-center py-1 px-1 text-xs ${date.getDate() === 1 || index === 0 ? 'font-bold' : ''}`}
                    >
                      {date.getDate() === 1 || index === 0 
                        ? format(date, 'MMM d')
                        : format(date, 'd')}
                    </div>
                  ))}
                </div>
                
                {/* Task rows with horizontal dotted lines */}
                <div className="space-y-0">
                  {filteredTasks.map((task, taskIndex) => (
                    <div 
                      key={task.id}
                      className={`grid border-b border-gray-100 ${
                        taskIndex % 2 === 0 ? 'bg-gray-50' : ''
                      }`}
                      style={{ 
                        gridTemplateColumns: `repeat(${timelineDates.length}, minmax(30px, 1fr))` 
                      }}
                    >
                      {/* Add horizontal dotted line */}
                      <div 
                        className="absolute w-full border-b border-dotted border-gray-300" 
                        style={{ left: 0, height: '1px', top: '50%' }}
                      />
                      {/* Render the task bar */}
                      {renderTaskBar(task)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskTimelineView;
