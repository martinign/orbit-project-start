
import { useAuth } from "@/contexts/AuthContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Sidebar";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <SidebarProvider defaultOpen={true}>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <main className="flex-1 p-4">
            {/* Empty main content area */}
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default Dashboard;
