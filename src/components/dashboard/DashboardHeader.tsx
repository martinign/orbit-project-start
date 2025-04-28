
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";

interface DashboardHeaderProps {
  onNewTasksClick?: () => void;
  isNewTasksFilterActive?: boolean;
}

export function DashboardHeader({ onNewTasksClick, isNewTasksFilterActive }: DashboardHeaderProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: userProfile } = useUserProfile(user?.id);

  const handleCreateProject = () => {
    navigate("/projects");
  };

  const displayName = userProfile?.displayName ? `Welcome, ${userProfile.displayName}!` : "Welcome!";

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>
      <div className="flex items-center gap-4 mt-2 md:mt-0">
        <span className="text-muted-foreground font-medium">{displayName}</span>
        <div className="flex gap-2">
          
        </div>
      </div>
    </div>
  );
}
