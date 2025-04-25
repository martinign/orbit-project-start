
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="text-center max-w-2xl mx-auto p-6">
        <h1 className="text-4xl font-bold mb-4">Project Management Tool</h1>
        <p className="text-xl text-gray-600 mb-8">
          Streamline your projects, collaborate with your team, and boost productivity.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            onClick={() => navigate("/auth")}
            className="w-full sm:w-auto"
          >
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
