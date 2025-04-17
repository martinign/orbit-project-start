
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const Dashboard = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Project Management Dashboard</h1>
        <Button variant="outline" onClick={signOut}>Sign Out</Button>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Welcome, {user?.user_metadata?.full_name || user?.email}</h2>
        <p className="text-gray-600 mb-4">
          This is your project management dashboard. Your profile information:
        </p>
        <div className="space-y-2">
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Full Name:</strong> {user?.user_metadata?.full_name || 'Not provided'}</p>
          <p><strong>Location:</strong> {user?.user_metadata?.location || 'Not provided'}</p>
          <p><strong>Telephone:</strong> {user?.user_metadata?.telephone || 'Not provided'}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
