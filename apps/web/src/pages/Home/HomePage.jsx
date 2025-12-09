import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import Dashboard from "@/components/Dashboard.jsx";
import { canActAsClient, canActAsFreelancer, Roles } from "@/helpers/roles.js";

export default function HomePage() {
  const { user } = useAuth();

  const isClient = canActAsClient(user);
  const isFreelancer = canActAsFreelancer(user);
  const isAdmin = user?.roles?.includes(Roles.ADMIN) || user?.clearance >= 3;
  
  // Role-based greeting message
  const getGreetingMessage = () => {
    if (isAdmin) {
      return "Welcome to the admin dashboard";
    }
    if (isFreelancer && isClient) {
      return "Your marketplace for finding and offering services";
    }
    if (isFreelancer) {
      return "Manage your services and grow your business";
    }
    return "Your marketplace for finding and offering services";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50/30 to-indigo-50/50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <span className="text-3xl font-bold text-white">F</span>
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              FiveMarket
            </span>
          </div>
          <h1 className="text-5xl font-bold text-slate-900 mb-3">
            Welcome back, {user?.first_name || "there"}!
          </h1>
          <p className="text-xl text-slate-600">
            {getGreetingMessage()}
          </p>
        </div>

        {/* Dashboard Panel */}
        <div className="max-w-5xl mx-auto">
          <Dashboard />
        </div>

        {/* Main Actions */}
        <div className="max-w-5xl mx-auto mt-12">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/auth/logout">
              <Button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-base font-semibold shadow-lg hover:shadow-xl transition-all">
                <LogOut className="h-5 w-5 mr-2" />
                Logout
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
