import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { APICore } from "@/helpers/apiCore";
import { Package, Clock, User, Filter, Eye, DollarSign } from "lucide-react";
import { toast } from "sonner";

export default function AdminOrdersPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      const api = new APICore();
      const params = statusFilter === "all" ? "" : `?status=${statusFilter}`;
      const response = await api.get(`/api/orders/admin/all${params}`);
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
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

  const statusCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === "pending").length,
    in_progress: orders.filter(o => o.status === "in_progress").length,
    delivered: orders.filter(o => o.status === "delivered").length,
    completed: orders.filter(o => o.status === "completed").length,
    disputed: orders.filter(o => o.status === "disputed").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-purple-50 to-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">All Orders</h1>
          <p className="text-slate-600">Monitor all platform transactions</p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2">
          <Filter className="h-5 w-5 text-slate-400 flex-shrink-0" />
          {[
            { key: "all", label: "All" },
            { key: "pending", label: "Pending" },
            { key: "in_progress", label: "In Progress" },
            { key: "delivered", label: "Delivered" },
            { key: "completed", label: "Completed" },
            { key: "disputed", label: "Disputed" },
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

        {/* Orders List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-slate-600">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <Package className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Orders Found</h3>
            <p className="text-slate-600">
              {statusFilter === "all"
                ? "No orders in the system yet"
                : `No ${getStatusLabel(statusFilter).toLowerCase()} orders found`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.order_id}
                className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/orders/${order.order_id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Package className="h-5 w-5 text-indigo-600" />
                      <h3 className="font-semibold text-slate-900">
                        {order.service_title} - {order.package_name}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-6 text-sm text-slate-500">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Order #{order.order_id}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>
                        {order.client_first_name} {order.client_last_name} → {order.freelancer_first_name} {order.freelancer_last_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-medium">${order.total_price}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Placed {new Date(order.placed_time).toLocaleDateString()}</span>
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
