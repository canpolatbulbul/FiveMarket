import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { APICore } from "@/helpers/apiCore";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  DollarSign,
  TrendingUp,
  Package,
  Star,
  ShoppingBag,
  Download,
  Plus,
  Edit2,
  Trash2,
  Pause,
  Play,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function FreelancerDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [services, setServices] = useState([]);
  const [orders, setOrders] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [showWithdrawalForm, setShowWithdrawalForm] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, serviceId: null, serviceName: "" });

  useEffect(() => {
    if (activeTab === "overview") {
      fetchDashboardStats();
    } else if (activeTab === "services") {
      fetchServices();
    } else if (activeTab === "sales") {
      fetchOrders();
    } else if (activeTab === "withdrawals") {
      fetchWithdrawals();
    }
  }, [activeTab]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const api = new APICore();
      const response = await api.get("/api/freelancer/dashboard");
      setStats(response.data.stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      setLoading(true);
      const api = new APICore();
      const response = await api.get("/api/services/my-services");
      setServices(response.data.services);
    } catch (error) {
      console.error("Error fetching services:", error);
      toast.error("Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const api = new APICore();
      const response = await api.get("/api/orders/freelancer");
      setOrders(response.data.orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const api = new APICore();
      const response = await api.get("/api/freelancer/withdrawals");
      setWithdrawals(response.data.withdrawals);
    } catch (error) {
      console.error("Error fetching withdrawals:", error);
      toast.error("Failed to load withdrawals");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleServiceStatus = async (serviceId, currentStatus) => {
    try {
      const api = new APICore();
      await api.patch(`/api/freelancer/services/${serviceId}/toggle-status`);
      toast.success(`Service ${currentStatus ? "paused" : "activated"} successfully`);
      fetchServices();
    } catch (error) {
      toast.error(error.message || "Failed to update service status");
    }
  };

  const handleDeleteService = async (serviceId) => {
    try {
      const api = new APICore();
      await api.delete(`/api/services/${serviceId}`);
      toast.success("Service deleted successfully");
      setServices(services.filter(s => s.service_id !== serviceId));
      setDeleteModal({ open: false, serviceId: null, serviceName: "" });
    } catch (error) {
      toast.error(error.message || "Failed to delete service");
    }
  };

  const openDeleteModal = (service) => {
    setDeleteModal({
      open: true,
      serviceId: service.service_id,
      serviceName: service.title
    });
  };

  const handleWithdrawalRequest = async (e) => {
    e.preventDefault();
    
    const amount = parseFloat(withdrawalAmount);
    if (isNaN(amount) || amount < 10) {
      toast.error("Minimum withdrawal amount is $10");
      return;
    }

    if (amount > stats.earnings.availableBalance) {
      toast.error("Insufficient balance");
      return;
    }

    try {
      const api = new APICore();
      await api.post("/api/freelancer/withdrawals", { amount });
      toast.success("Withdrawal request submitted successfully");
      setWithdrawalAmount("");
      setShowWithdrawalForm(false);
      fetchWithdrawals();
      fetchDashboardStats(); // Refresh balance
    } catch (error) {
      toast.error(error.message || "Failed to request withdrawal");
    }
  };

  const setTab = (tab) => {
    setSearchParams({ tab });
  };

  // Chart data for earnings
  const chartData = stats?.recentEarnings ? {
    labels: stats.recentEarnings.map(e => new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Earnings',
        data: stats.recentEarnings.map(e => e.earnings),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => `$${context.parsed.y.toFixed(2)}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `$${value}`,
        },
      },
    },
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: "bg-yellow-100 text-yellow-700", icon: Clock },
      in_progress: { color: "bg-blue-100 text-blue-700", icon: Clock },
      delivered: { color: "bg-purple-100 text-purple-700", icon: Package },
      completed: { color: "bg-green-100 text-green-700", icon: CheckCircle },
      disputed: { color: "bg-red-100 text-red-700", icon: AlertCircle },
      cancelled: { color: "bg-slate-100 text-slate-700", icon: XCircle },
    };

    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="h-3 w-3" />
        {status.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
      </span>
    );
  };

  const getWithdrawalStatusBadge = (status) => {
    const badges = {
      pending: { color: "bg-yellow-100 text-yellow-700", text: "Pending" },
      approved: { color: "bg-blue-100 text-blue-700", text: "Approved" },
      completed: { color: "bg-green-100 text-green-700", text: "Completed" },
      rejected: { color: "bg-red-100 text-red-700", text: "Rejected" },
    };

    const badge = badges[status] || badges.pending;

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  if (loading && !stats && !services.length && !orders.length && !withdrawals.length) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Freelancer Dashboard</h1>
          <p className="text-slate-600 mt-1">Manage your services, orders, and earnings</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200 mb-8">
          <div className="flex gap-8">
            {[
              { id: "overview", label: "Overview", icon: TrendingUp },
              { id: "services", label: "My Services", icon: Package },
              { id: "sales", label: "My Sales", icon: ShoppingBag },
              { id: "withdrawals", label: "Withdrawals", icon: DollarSign },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition-colors ${
                    activeTab === tab.id
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && stats && (
          <div className="space-y-6">
            {/* Earnings Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-slate-600">Total Earned</p>
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-slate-900">${stats.earnings.totalEarned.toFixed(2)}</p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-slate-600">Available Balance</p>
                  <DollarSign className="h-5 w-5 text-indigo-600" />
                </div>
                <p className="text-2xl font-bold text-slate-900">${stats.earnings.availableBalance.toFixed(2)}</p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-slate-600">Withdrawn</p>
                  <Download className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-slate-900">${stats.earnings.totalWithdrawn.toFixed(2)}</p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-slate-600">Pending</p>
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <p className="text-2xl font-bold text-slate-900">${stats.earnings.pendingWithdrawals.toFixed(2)}</p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-indigo-100 rounded-lg">
                    <Package className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Services</p>
                    <p className="text-2xl font-bold text-slate-900">{stats.services.active}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-500">
                  {stats.services.paused} paused · {stats.services.total} total
                </p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <ShoppingBag className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Orders</p>
                    <p className="text-2xl font-bold text-slate-900">{stats.orders.completed}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-500">
                  {stats.orders.active} active · {stats.orders.total} total
                </p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <Star className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Rating</p>
                    <p className="text-2xl font-bold text-slate-900">{stats.rating.average}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-500">{stats.rating.count} reviews</p>
              </div>
            </div>

            {/* Earnings Chart */}
            {chartData && (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Earnings (Last 30 Days)</h3>
                <div className="h-64">
                  <Line data={chartData} options={chartOptions} />
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link
                to="/services/add"
                className="bg-indigo-600 text-white rounded-xl p-6 hover:bg-indigo-700 transition-colors flex items-center justify-between"
              >
                <div>
                  <h3 className="text-lg font-bold mb-1">Create New Service</h3>
                  <p className="text-indigo-100 text-sm">Start offering a new service</p>
                </div>
                <Plus className="h-8 w-8" />
              </Link>

              <button
                onClick={() => {
                  setTab("withdrawals");
                  setShowWithdrawalForm(true);
                }}
                className="bg-green-600 text-white rounded-xl p-6 hover:bg-green-700 transition-colors flex items-center justify-between"
                disabled={stats.earnings.availableBalance < 10}
              >
                <div>
                  <h3 className="text-lg font-bold mb-1">Request Withdrawal</h3>
                  <p className="text-green-100 text-sm">
                    {stats.earnings.availableBalance >= 10
                      ? `$${stats.earnings.availableBalance.toFixed(2)} available`
                      : "Minimum $10 required"}
                  </p>
                </div>
                <Download className="h-8 w-8" />
              </button>
            </div>
          </div>
        )}

        {activeTab === "services" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-slate-600">{services.length} services</p>
              <Link
                to="/services/add"
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Service
              </Link>
            </div>

            {services.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                <Package className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No services yet</h3>
                <p className="text-slate-600 mb-4">Create your first service to start earning</p>
                <Link
                  to="/services/add"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Plus className="h-5 w-5" />
                  Create Service
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {services.map((service) => (
                  <div key={service.service_id} className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-slate-900">{service.title}</h3>
                          {service.is_active ? (
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                              Active
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
                              Paused
                            </span>
                          )}
                        </div>
                        <p className="text-slate-600 text-sm mb-4 line-clamp-2">{service.description}</p>
                        <div className="flex items-center gap-6 text-sm text-slate-600">
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            From ${service.starting_price}
                          </span>
                          <span className="flex items-center gap-1">
                            <Package className="h-4 w-4" />
                            {service.package_count} packages
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-400" fill="currentColor" />
                            {service.avg_rating} ({service.review_count})
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => handleToggleServiceStatus(service.service_id, service.is_active)}
                          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title={service.is_active ? "Pause service" : "Activate service"}
                        >
                          {service.is_active ? (
                            <Pause className="h-5 w-5" />
                          ) : (
                            <Play className="h-5 w-5" />
                          )}
                        </button>
                        <Link
                          to={`/services/edit/${service.service_id}`}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="h-5 w-5" />
                        </Link>
                        <button
                          onClick={() => openDeleteModal(service)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "sales" && (
          <div className="space-y-6">
            <p className="text-slate-600">{orders.length} orders</p>

            {orders.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                <ShoppingBag className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No orders yet</h3>
                <p className="text-slate-600">Your orders will appear here</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Order</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Service</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Client</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Amount</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {orders.map((order) => (
                        <tr key={order.order_id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 text-sm font-medium text-slate-900">#{order.order_id}</td>
                          <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">{order.service_title}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{order.client_name}</td>
                          <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                          <td className="px-6 py-4 text-sm font-semibold text-slate-900 text-right">
                            ${order.total_price}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Link
                              to={`/orders/${order.order_id}`}
                              className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                            >
                              View Details
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "withdrawals" && (
          <div className="space-y-6">
            {/* Withdrawal Form */}
            {showWithdrawalForm ? (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Request Withdrawal</h3>
                <form onSubmit={handleWithdrawalRequest} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Amount (USD)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="10"
                      value={withdrawalAmount}
                      onChange={(e) => setWithdrawalAmount(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Minimum $10"
                      required
                    />
                    {stats && (
                      <p className="text-sm text-slate-500 mt-1">
                        Available balance: ${stats.earnings.availableBalance.toFixed(2)}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                    >
                      Submit Request
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowWithdrawalForm(false);
                        setWithdrawalAmount("");
                      }}
                      className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <button
                onClick={() => setShowWithdrawalForm(true)}
                className="w-full bg-indigo-600 text-white rounded-xl p-4 hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="h-5 w-5" />
                Request New Withdrawal
              </button>
            )}

            {/* Withdrawals List */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-lg font-bold text-slate-900">Withdrawal History</h3>
              </div>
              {withdrawals.length === 0 ? (
                <div className="p-12 text-center">
                  <Download className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No withdrawals yet</h3>
                  <p className="text-slate-600">Your withdrawal requests will appear here</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Requested</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Processed</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {withdrawals.map((withdrawal) => (
                        <tr key={withdrawal.withdrawalId} className="hover:bg-slate-50">
                          <td className="px-6 py-4 text-sm font-medium text-slate-900">
                            #{withdrawal.withdrawalId}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                            ${withdrawal.amount.toFixed(2)}
                          </td>
                          <td className="px-6 py-4">{getWithdrawalStatusBadge(withdrawal.status)}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {new Date(withdrawal.requestedAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {withdrawal.processedAt
                              ? new Date(withdrawal.processedAt).toLocaleDateString()
                              : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Delete Service</h3>
            </div>
            <p className="text-slate-600 mb-6">
              Are you sure you want to delete <span className="font-semibold">"{deleteModal.serviceName}"</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal({ open: false, serviceId: null, serviceName: "" })}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteService(deleteModal.serviceId)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
