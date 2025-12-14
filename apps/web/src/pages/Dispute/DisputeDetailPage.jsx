import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { APICore } from "@/helpers/apiCore";
import { 
  AlertTriangle, 
  Clock, 
  Package, 
  User, 
  DollarSign,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Eye
} from "lucide-react";
import { toast } from "sonner";

export default function DisputeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dispute, setDispute] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetchDisputeDetails();
    setIsAdmin(user?.clearance >= 3);
  }, [id, user]);

  const fetchDisputeDetails = async () => {
    try {
      const api = new APICore();
      const response = await api.get(`/api/disputes/${id}`);
      setDispute(response.data.dispute);
    } catch (error) {
      console.error("Error fetching dispute details:", error);
      toast.error("Failed to load dispute details");
      navigate("/disputes");
    } finally {
      setLoading(false);
    }
  };



  const handleUpdateStatus = async (newStatus) => {
    try {
      const api = new APICore();
      await api.patch(`/api/disputes/${id}/status`, { status: newStatus });
      toast.success(`Dispute ${newStatus.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())} successfully!`);
      fetchDisputeDetails();
    } catch (error) {
      console.error("Error updating dispute status:", error);
      toast.error(error.message || "Failed to update dispute status");
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-purple-50 to-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-slate-600">Loading dispute details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!dispute) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-purple-50 to-white">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Back Button */}
        <button
          onClick={() => navigate("/disputes")}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Disputes
        </button>

        {/* Header */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Dispute #{dispute.dispute_id}
              </h1>
              <p className="text-slate-600">
                Opened on {new Date(dispute.creation_time).toLocaleDateString()}
              </p>
            </div>
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(
                dispute.status
              )}`}
            >
              {dispute.status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
            </span>
          </div>
        </div>

        {/* Dispute Description */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h2 className="text-xl font-bold text-slate-900">Issue Description</h2>
          </div>
          <p className="text-slate-700 whitespace-pre-wrap">{dispute.description}</p>
        </div>

        {/* Order Information */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Package className="h-5 w-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-900">Order Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-slate-500 mb-1">Service</p>
              <p className="font-semibold text-slate-900">{dispute.service_title}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Package</p>
              <p className="font-semibold text-slate-900">{dispute.package_name}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Order ID</p>
              <p className="font-semibold text-slate-900">#{dispute.order_id}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Order Status</p>
              <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">
                {dispute.order_status}
              </span>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Total Price</p>
              <p className="font-semibold text-slate-900">${dispute.total_price}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Placed On</p>
              <p className="font-semibold text-slate-900">
                {new Date(dispute.placed_time).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <button
              onClick={() => navigate(`/orders/${dispute.order_id}`)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Eye className="h-4 w-4" />
              View Full Order Details
            </button>
          </div>
        </div>

        {/* Parties Involved */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-5 w-5 text-purple-600" />
            <h2 className="text-xl font-bold text-slate-900">Parties Involved</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-500 mb-2">Client</p>
              <p className="font-semibold text-slate-900">
                {dispute.client_first_name} {dispute.client_last_name}
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-500 mb-2">Freelancer</p>
              <p className="font-semibold text-slate-900">
                {dispute.freelancer_first_name} {dispute.freelancer_last_name}
              </p>
            </div>
          </div>
        </div>

        {/* Admin Actions */}
        {isAdmin && (dispute.status === "open" || dispute.status === "under_review") && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Admin Actions</h2>
            
            <div className="space-y-3">
              {dispute.status === "open" && (
                <button
                  onClick={() => handleUpdateStatus("under_review")}
                  className="w-full px-4 py-3 bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Clock className="h-5 w-5" />
                  Mark as Under Review
                </button>
              )}
              
              <button
                onClick={() => handleUpdateStatus("resolved")}
                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle className="h-5 w-5" />
                Resolve Dispute (Release Payment)
              </button>
              
              <button
                onClick={() => handleUpdateStatus("rejected")}
                className="w-full px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <XCircle className="h-5 w-5" />
                Reject Dispute (Refund Client)
              </button>
            </div>

            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Resolving will release payment to freelancer and mark order as delivered. 
                Rejecting will initiate refund to client and mark order as cancelled.
              </p>
            </div>
          </div>
        )}

        {/* Status Message for Non-Admins */}
        {!isAdmin && (dispute.status === "open" || dispute.status === "under_review") && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <Clock className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">
                  {dispute.status === "open" ? "Dispute Submitted" : "Under Review"}
                </h3>
                <p className="text-blue-800">
                  {dispute.status === "open"
                    ? "Your dispute has been submitted and is awaiting admin review."
                    : "An administrator is currently reviewing your dispute. You will be notified once a decision is made."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Resolution Message */}
        {(dispute.status === "resolved" || dispute.status === "rejected") && (
          <div className={`border rounded-xl p-6 ${
            dispute.status === "resolved" 
              ? "bg-green-50 border-green-200" 
              : "bg-red-50 border-red-200"
          }`}>
            <div className="flex items-start gap-3">
              {dispute.status === "resolved" ? (
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
              ) : (
                <XCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
              )}
              <div>
                <h3 className={`font-semibold mb-1 ${
                  dispute.status === "resolved" ? "text-green-900" : "text-red-900"
                }`}>
                  Dispute {dispute.status === "resolved" ? "Resolved" : "Rejected"}
                </h3>
                <p className={dispute.status === "resolved" ? "text-green-800" : "text-red-800"}>
                  {dispute.status === "resolved"
                    ? "The dispute has been resolved in favor of the freelancer. Payment has been released."
                    : "The dispute has been rejected. A refund has been initiated for the client."}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
