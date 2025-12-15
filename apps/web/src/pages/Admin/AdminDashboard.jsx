import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { APICore } from "@/helpers/apiCore";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  TrendingUp,
  Users,
  Package,
  ShoppingBag,
  AlertCircle,
  DollarSign,
  Star,
  BarChart3,
  Activity,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const api = new APICore();
      const response = await api.get("/api/admin/dashboard/stats");
      setStats(response.data.stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const setTab = (tab) => {
    setSearchParams({ tab });
  };

  if (loading) {
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
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-600 mt-1">Platform analytics and management</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200 mb-8">
          <div className="flex gap-8">
            {[
              { id: "overview", label: "Overview", icon: TrendingUp },
              { id: "analytics", label: "Analytics", icon: BarChart3 },
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
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-slate-600">Total Users</p>
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-slate-900">{stats.totals?.users || 0}</p>
                <p className="text-xs text-slate-500 mt-1">+{stats.userGrowth?.newUsersThisMonth || 0} this month</p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-slate-600">Total Orders</p>
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-slate-900">{stats.totals?.orders || 0}</p>
                <p className="text-xs text-slate-500 mt-1">${stats.revenue?.completedRevenue?.toFixed(2) || 0} completed</p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-slate-600">Active Disputes</p>
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <p className="text-2xl font-bold text-slate-900">{stats.totals?.activeDisputes || 0}</p>
                <Link to="/admin/disputes" className="text-xs text-indigo-600 hover:text-indigo-700 mt-1 inline-block">
                  Review →
                </Link>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-slate-600">Pending Revenue</p>
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-slate-900">${stats.revenue?.pendingRevenue?.toFixed(2) || 0}</p>
                <p className="text-xs text-slate-500 mt-1">{stats.revenue?.totalTransactions || 0} transactions</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link
                  to="/admin/disputes"
                  className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-all"
                >
                  <div className="p-3 bg-red-100 rounded-lg inline-flex mb-4">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Manage Disputes</h3>
                  <p className="text-sm text-slate-600">Review and resolve user disputes</p>
                </Link>

                <Link
                  to="/admin/orders"
                  className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-all"
                >
                  <div className="p-3 bg-blue-100 rounded-lg inline-flex mb-4">
                    <ShoppingBag className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">View All Orders</h3>
                  <p className="text-sm text-slate-600">Monitor platform transactions</p>
                </Link>

                <Link
                  to="/admin/users"
                  className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-all"
                >
                  <div className="p-3 bg-purple-100 rounded-lg inline-flex mb-4">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Manage Users</h3>
                  <p className="text-sm text-slate-600">User management and permissions</p>
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            {stats.recentActivity?.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Order</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Service</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Client → Freelancer</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {stats.recentActivity.map((activity) => (
                        <tr key={activity.orderId} className="hover:bg-slate-50">
                          <td className="px-4 py-3 text-sm font-medium text-slate-900">#{activity.orderId}</td>
                          <td className="px-4 py-3 text-sm text-slate-600 max-w-xs truncate">{activity.serviceTitle}</td>
                          <td className="px-4 py-3 text-sm text-slate-600">
                            {activity.clientName} → {activity.freelancerName}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              activity.status === 'completed' ? 'bg-green-100 text-green-700' :
                              activity.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                              activity.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-slate-100 text-slate-700'
                            }`}>
                              {activity.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm font-bold text-slate-900 text-right">${activity.totalPrice.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "analytics" && stats && (
          <div className="space-y-6">
            {/* Top Earners */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-4">🏆 Top Earners</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Rank</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Freelancer</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Member Since</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Total Earned</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">Orders</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">Rating</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {stats.topEarners?.length > 0 ? (
                      stats.topEarners.map((earner, index) => (
                        <tr key={earner.userID} className="hover:bg-slate-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-bold text-sm">
                              #{index + 1}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-semibold text-slate-900">{earner.name}</p>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600">
                            {earner.memberSince ? new Date(earner.memberSince).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            }) : 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="font-bold text-green-600">${earner.totalEarned.toFixed(2)}</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                              {earner.totalOrders}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {earner.reviewCount && earner.reviewCount > 0 ? (
                              <div className="flex items-center justify-center gap-1">
                                <Star className="h-4 w-4 text-yellow-400" fill="currentColor" />
                                <span className="font-semibold text-slate-900">{earner.avgRating}</span>
                                <span className="text-xs text-slate-500">({earner.reviewCount})</span>
                              </div>
                            ) : (
                              <span className="text-slate-400 text-sm">No reviews</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-4 py-8 text-center text-slate-500">
                          No earnings data yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Popular Categories and Top Rated Services */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Popular Categories */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-4">📊 Popular Categories</h3>
                <div className="space-y-3">
                  {stats.popularCategories?.length > 0 ? (
                    stats.popularCategories.map((category) => (
                      <div key={category.categoryId} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-semibold text-slate-900">{category.name}</p>
                          <p className="text-xs text-slate-500">{category.orderCount} orders</p>
                        </div>
                        <span className="font-bold text-indigo-600">${category.totalRevenue.toFixed(2)}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 text-center py-4">No category data yet</p>
                  )}
                </div>
              </div>

              {/* Top Rated Services */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-4">⭐ Top Rated Services</h3>
                <div className="space-y-3">
                  {stats.topRatedServices?.length > 0 ? (
                    stats.topRatedServices.map((service, index) => (
                      <div key={service.serviceId} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 text-yellow-600 font-bold text-sm">
                            #{index + 1}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{service.title}</p>
                            <p className="text-xs text-slate-500">by {service.freelancerName}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-400" fill="currentColor" />
                            <span className="font-bold text-yellow-600">{service.avgRating}</span>
                          </div>
                          <p className="text-xs text-slate-500">{service.reviewCount} reviews</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 text-center py-4">No reviews yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
