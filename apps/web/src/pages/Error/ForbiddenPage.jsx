import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export default function ForbiddenPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-purple-50 to-white flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full text-center">
          <div className="mb-8">
            <ShieldAlert className="h-24 w-24 text-red-500 mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-slate-900 mb-4">
              Access Denied
            </h1>
            <p className="text-lg text-slate-600 mb-2">
              You don't have permission to access this page.
            </p>
            <p className="text-sm text-slate-500">
              This page requires specific permissions that your account doesn't have.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate(-1)}
              className="w-full px-6 py-3 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="h-5 w-5" />
              Go Back
            </button>
            <button
              onClick={() => navigate("/")}
              className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
