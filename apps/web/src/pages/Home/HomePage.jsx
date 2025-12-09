import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <>
    <Navbar />
    <div className="min-h-scree n flex items-center justify-center bg-gradient-to-br from-white via-purple-50/30 to-indigo-50/50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome to FiveMarket</h1>
        <p className="text-gray-600 mb-8">
          Hello, {user?.first_name} {user?.last_name}!
        </p>
        <p className="text-sm text-slate-500">
          Your marketplace for freelance services
        </p>
      </div>
    </div>
    </>
  );
}
