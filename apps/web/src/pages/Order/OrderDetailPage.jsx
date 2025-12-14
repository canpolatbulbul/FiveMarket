import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { APICore } from "@/helpers/apiCore";
import {
  Clock,
  Package,
  User,
  DollarSign,
  Calendar,
  FileText,
  CreditCard,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  PlayCircle,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      const api = new APICore();
      const response = await api.get(`/api/orders/${id}`);
      setOrder(response.data.order);
      setUserRole(response.data.userRole);
    } catch (error) {
      console.error("Error fetching order details:", error);
      toast.error(error.message || "Failed to load order details");
      // Redirect back if unauthorized or not found
      if (error.response?.status === 403 || error.response?.status === 404) {
        setTimeout(() => navigate(-1), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      in_progress: "bg-blue-100 text-blue-800 border-blue-200",
      delivered: "bg-purple-100 text-purple-800 border-purple-200",
      revision_requested: "bg-orange-100 text-orange-800 border-orange-200",
      completed: "bg-green-100 text-green-800 border-green-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
      disputed: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: "Pending",
      in_progress: "In Progress",
      delivered: "Delivered",
      revision_requested: "Revision Requested",
      completed: "Completed",
      cancelled: "Cancelled",
      disputed: "Disputed",
    };
    return labels[status] || status;
  };

  const handleStartOrder = async () => {
    try {
      const api = new APICore();
      await api.patch(`/api/orders/${id}/status`, { status: "in_progress" });
      toast.success("Order started successfully!");
      // Refresh order details
      fetchOrderDetails();
    } catch (error) {
      console.error("Error starting order:", error);
      toast.error(error.message || "Failed to start order");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-purple-50 to-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading order details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-purple-50 to-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Order Not Found</h2>
            <p className="text-slate-600">The order you're looking for doesn't exist or you don't have access to it.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-purple-50 to-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          Back
        </button>

        {/* Header */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Order #{order.order_id}
              </h1>
              <p className="text-slate-600">{order.service_title}</p>
            </div>
            <div className="flex items-center gap-3">
              {order.conversation_id && (
                <button
                  onClick={() => navigate(`/messages/${order.conversation_id}`)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  View Messages
                </button>
              )}
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(
                  order.status
                )}`}
              >
                {getStatusLabel(order.status)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-xs text-slate-500">Total Price</p>
                <p className="text-lg font-bold text-slate-900">${order.total_price}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-indigo-600" />
              <div>
                <p className="text-xs text-slate-500">Due Date</p>
                <p className="text-sm font-semibold text-slate-900">
                  {new Date(order.due_time).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-xs text-slate-500">Package</p>
                <p className="text-sm font-semibold text-slate-900">{order.package_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-xs text-slate-500">Revisions</p>
                <p className="text-sm font-semibold text-slate-900">
                  {order.revisions_used}/{order.revisions_allowed}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Details */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-indigo-600" />
                <h2 className="text-xl font-bold text-slate-900">Project Details</h2>
              </div>
              <p className="text-slate-700 whitespace-pre-wrap">{order.project_details}</p>
            </div>

            {/* Add-ons */}
            {order.addons && order.addons.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Package className="h-5 w-5 text-indigo-600" />
                  <h2 className="text-xl font-bold text-slate-900">Add-ons</h2>
                </div>
                <div className="space-y-3">
                  {order.addons.map((addon, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                    >
                      <div>
                        <p className="font-semibold text-slate-900">{addon.name}</p>
                        {addon.description && (
                          <p className="text-sm text-slate-600">{addon.description}</p>
                        )}
                        <p className="text-xs text-slate-500 mt-1">
                          Quantity: {addon.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900">${addon.price}</p>
                        {addon.delivery_days !== 0 && (
                          <p className="text-xs text-slate-500">
                            {addon.delivery_days > 0 ? "+" : ""}
                            {addon.delivery_days} days
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payment Information */}
            {order.transactions && order.transactions.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="h-5 w-5 text-indigo-600" />
                  <h2 className="text-xl font-bold text-slate-900">Payment Information</h2>
                </div>
                {order.transactions.map((transaction, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-semibold text-slate-900">
                          {transaction.payment_method === "card" ? "Card" : transaction.payment_method}
                          {transaction.card_last4 && ` •••• ${transaction.card_last4}`}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(transaction.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">${transaction.amount}</p>
                      <p className="text-xs text-green-600 capitalize">{transaction.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Client/Freelancer Info */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <User className="h-5 w-5 text-indigo-600" />
                <h2 className="text-xl font-bold text-slate-900">
                  {userRole === "client" ? "Freelancer" : "Client"}
                </h2>
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-slate-900">
                  {userRole === "client"
                    ? `${order.freelancer_first_name} ${order.freelancer_last_name}`
                    : `${order.client_first_name} ${order.client_last_name}`}
                </p>
                <p className="text-sm text-slate-600">
                  {userRole === "client" ? order.freelancer_email : order.client_email}
                </p>
              </div>
            </div>

            {/* Freelancer Actions */}
            {userRole === "freelancer" && order.status === "pending" && (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Actions</h2>
                <button
                  onClick={handleStartOrder}
                  className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                >
                  <PlayCircle className="h-5 w-5" />
                  Start Order
                </button>
              </div>
            )}

            {/* Order Timeline */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-indigo-600" />
                <h2 className="text-xl font-bold text-slate-900">Timeline</h2>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-green-600 mt-2"></div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Order Placed</p>
                    <p className="text-xs text-slate-500">
                      {new Date(order.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className={`h-2 w-2 rounded-full mt-2 ${
                    order.status !== "pending" ? "bg-green-600" : "bg-slate-300"
                  }`}></div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">In Progress</p>
                    <p className="text-xs text-slate-500">
                      {order.status !== "pending" ? "Started" : "Waiting to start"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className={`h-2 w-2 rounded-full mt-2 ${
                    ["delivered", "completed"].includes(order.status) ? "bg-green-600" : "bg-slate-300"
                  }`}></div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Delivered</p>
                    <p className="text-xs text-slate-500">
                      Due {new Date(order.due_time).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
