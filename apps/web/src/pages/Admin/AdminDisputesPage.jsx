import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { APICore } from "@/helpers/apiCore";
import { AlertTriangle, Clock, Package, Eye, Filter } from "lucide-react";
import { toast } from "sonner";

export default function AdminDisputesPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [disputes, setDisputes] = useState([]);
  const [statusFilter, setStatusFilter] = useState("unresolved");

  useEffect(() => {
    fetchDisputes();
  }, [statusFilter]);

  const fetchDisputes = async () => {
    try {
      const api = new APICore();
      // For "unresolved" and "all", fetch all disputes and filter on frontend
      // For specific statuses, filter on backend
      const params = (statusFilter === "all" || statusFilter === "unresolved") 
        ? "" 
        : `?status=${statusFilter}`;
      const response = await api.get(`/api/disputes/admin/all${params}`);
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
        return "bg-red-100 text-red-700 border-red-200";
      case "under_review":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "resolved":
        return "bg-green-100 text-green-700 border-green-200";
      case "rejected":
        return "bg-slate-100 text-slate-700 border-slate-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const filteredDisputes = statusFilter === "unresolved"
    ? disputes.filter(d => d.status === "open" || d.status === "under_review")
    : statusFilter === "all"
    ? disputes
    : disputes;

  const statusCounts = {
    unresolved: disputes.filter(d => d.status === "open" || d.status === "under_review").length,
    all: disputes.length,
    open: disputes.filter(d => d.status === "open").length,
    under_review: disputes.filter(d => d.status === "under_review").length,
    resolved: disputes.filter(d => d.status === "resolved").length,
    rejected: disputes.filter(d => d.status === "rejected").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-purple-50 to-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">All Disputes</h1>
          <p className="text-slate-600">Review and resolve platform disputes</p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2">
          <Filter className="h-5 w-5 text-slate-400 flex-shrink-0" />
          {[
            { key: "unresolved", label: "Unresolved" },
            { key: "all", label: "All" },
            { key: "open", label: "Open" },
            { key: "under_review", label: "Under Review" },
            { key: "resolved", label: "Resolved" },
            { key: "rejected", label: "Rejected" },
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setStatusFilter(filter.key)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                statusFilter === filter.key
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              {filter.label}
              {statusCounts[filter.key] > 0 && (
                <span className="ml-2 text-sm opacity-75">
                  ({statusCounts[filter.key]})
                </span>
              )}
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
              {statusFilter === "unresolved"
                ? "No unresolved disputes at the moment"
                : `No ${statusFilter} disputes found`}
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
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          dispute.status
                        )}`}
                      >
                        {dispute.status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-2 mb-3">{dispute.description}</p>
                  </div>
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
                      <span className="font-medium">${dispute.total_price}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>
                        {dispute.client_first_name} {dispute.client_last_name} vs{" "}
                        {dispute.freelancer_first_name} {dispute.freelancer_last_name}
                      </span>
                    </div>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                    <Eye className="h-4 w-4" />
                    Review
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
