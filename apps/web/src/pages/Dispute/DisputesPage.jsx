import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { APICore } from "@/helpers/apiCore";
import { AlertTriangle, Clock, Package, Eye } from "lucide-react";
import { toast } from "sonner";

export default function DisputesPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [disputes, setDisputes] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    try {
      const api = new APICore();
      const response = await api.get("/api/disputes/user/me");
      setDisputes(response.data.disputes || []);
    } catch (error) {
      console.error("Error fetching disputes:", error);
      toast.error("Failed to load disputes");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "open":
        return "bg-red-100 text-red-700";
      case "under_review":
        return "bg-yellow-100 text-yellow-700";
      case "resolved":
        return "bg-green-100 text-green-700";
      case "rejected":
        return "bg-slate-100 text-slate-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const filteredDisputes = disputes.filter((dispute) => {
    if (filter === "all") return true;
    return dispute.status === filter;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-purple-50 to-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">My Disputes</h1>
          <p className="text-slate-600">View and manage your order disputes</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {["all", "open", "under_review", "resolved", "rejected"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                filter === status
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {status === "all" ? "All" : status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
            </button>
          ))}
        </div>

        {/* Disputes List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-slate-600">Loading disputes...</p>
          </div>
        ) : filteredDisputes.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <AlertTriangle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Disputes Found</h3>
            <p className="text-slate-600">
              {filter === "all"
                ? "You haven't opened any disputes yet"
                : `No ${filter.replace("_", " ")} disputes found`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDisputes.map((dispute) => (
              <div
                key={dispute.dispute_id}
                className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/disputes/${dispute.dispute_id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Package className="h-5 w-5 text-indigo-600" />
                      <h3 className="font-semibold text-slate-900">
                        {dispute.service_title} - {dispute.package_name}
                      </h3>
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-2">{dispute.description}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      dispute.status
                    )}`}
                  >
                    {dispute.status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-6 text-sm text-slate-500">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Opened {new Date(dispute.creation_time).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Order #{dispute.order_id}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="capitalize">{dispute.user_role}</span>
                    </div>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                    <Eye className="h-4 w-4" />
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
