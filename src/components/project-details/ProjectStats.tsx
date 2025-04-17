
import { Users, UserRound, ListTodo } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface ProjectStatsProps {
  contactsCount: number;
  teamMembersCount: number;
  tasksStats: {
    total: number;
    completed: number;
    inProgress: number;
  };
}

const ProjectStats = ({ contactsCount, teamMembersCount, tasksStats }: ProjectStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Contacts</p>
              <p className="text-2xl font-bold">{contactsCount}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Team Members</p>
              <p className="text-2xl font-bold">{teamMembersCount}</p>
            </div>
            <UserRound className="h-8 w-8 text-purple-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Tasks</p>
              <p className="text-2xl font-bold">{tasksStats.total}</p>
              <div className="flex gap-2 mt-1 text-xs">
                <span className="text-green-600">
                  {tasksStats.completed} Completed
                </span>
                <span className="text-blue-600">
                  {tasksStats.inProgress} In Progress
                </span>
              </div>
            </div>
            <ListTodo className="h-8 w-8 text-green-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectStats;
