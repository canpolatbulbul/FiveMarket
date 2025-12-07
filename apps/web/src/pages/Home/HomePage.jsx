import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-purple-50/30 to-indigo-50/50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome to FiveMarket</h1>
        <p className="text-gray-600 mb-8">
          Hello, {user?.first_name} {user?.last_name}!
        </p>
        <Link to="/auth/logout">
          <Button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2">
            Logout
          </Button>
        </Link>
      </div>
    </div>
  );
}
