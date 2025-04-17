
import { useAuth } from "@/contexts/AuthContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Sidebar";
import { useLocation } from "react-router-dom";
import Projects from "./Projects";
import Contacts from "./Contacts";

const Dashboard = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Determine which component to render based on the current path
  const renderContent = () => {
    const path = location.pathname;
    
    if (path === "/contacts") {
      return <Contacts />;
    }
    
    // Default to Projects for /projects and /dashboard routes
    return <Projects />;
  };

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <SidebarProvider defaultOpen={true}>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <main className="flex-1 p-4 md:p-6">
            {renderContent()}
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default Dashboard;
