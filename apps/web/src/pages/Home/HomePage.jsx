import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import CategoryNav from "@/components/CategoryNav";
import Footer from "@/components/Footer";
import { ArrowRight, TrendingUp, Star, Briefcase, MessageSquare, ShoppingBag, AlertCircle, Users, Shield, Package } from "lucide-react";
import { APICore } from "@/helpers/apiCore";

export default function HomePage() {
  const { user } = useAuth();
  const [featuredServices, setFeaturedServices] = useState([]);
  const [adminStats, setAdminStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const api = new APICore();
        
        if (user?.roles?.includes("admin")) {
          // Fetch comprehensive admin dashboard stats
          const response = await api.get("/api/admin/dashboard/stats");
          setAdminStats(response.data.stats);
        } else {
          // Fetch featured services for regular users
          const response = await api.get("/api/services/featured");
          setFeaturedServices(response.data.services || []);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const isFreelancer = user?.roles?.includes("freelancer");
  const isAdmin = user?.roles?.includes("admin");

  const quickActions = isAdmin
    ? [
        {
          title: "All Disputes",
          description: "Review and resolve user disputes",
          icon: AlertCircle,
          link: "/admin/disputes",
          color: "from-red-500 to-orange-600",
        },
        {
          title: "All Orders",
          description: "Monitor platform transactions",
          icon: ShoppingBag,
          link: "/admin/orders",
          color: "from-blue-500 to-cyan-600",
        },
        {
          title: "User Management",
          description: "Manage users and permissions",
          icon: Users,
          link: "/admin/users",
          color: "from-purple-500 to-pink-600",
        },
      ]
    : isFreelancer
    ? [
        {
          title: "My Sales",
          description: "View and manage your orders",
          icon: Briefcase,
          link: "/my-sales",
          color: "from-indigo-500 to-purple-600",
        },
        {
          title: "Manage Services",
          description: "Edit and optimize your listings",
          icon: ShoppingBag,
          link: "/my-services",
          color: "from-blue-500 to-cyan-600",
        },
        {
          title: "Check Messages",
          description: "Respond to client inquiries",
          icon: MessageSquare,
          link: "/messages",
          color: "from-green-500 to-emerald-600",
        },
      ]
    : [
        {
          title: "Browse Services",
          description: "Find the perfect freelancer for your project",
          icon: TrendingUp,
          link: "/browse",
          color: "from-indigo-500 to-purple-600",
        },
        {
          title: "View Orders",
          description: "Track your active projects",
          icon: ShoppingBag,
          link: "/my-orders",
          color: "from-blue-500 to-cyan-600",
        },
        {
          title: "Messages",
          description: "Chat with your freelancers",
          icon: MessageSquare,
          link: "/messages",
          color: "from-green-500 to-emerald-600",
        },
      ];

  const categories = [
    { name: "Graphics & Design", count: "2,500+", emoji: "🎨", link: "/browse?category=1" },
    { name: "Digital Marketing", count: "1,800+", emoji: "📱", link: "/browse?category=2" },
    { name: "Writing & Translation", count: "1,200+", emoji: "✍️", link: "/browse?category=3" },
    { name: "Video & Animation", count: "900+", emoji: "🎬", link: "/browse?category=4" },
    { name: "Programming & Tech", count: "3,100+", emoji: "💻", link: "/browse?category=5" },
    { name: "Music & Audio", count: "600+", emoji: "🎵", link: "/browse?category=6" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-purple-50 to-white">
      <Navbar />
      {!isAdmin && <CategoryNav />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Admin Dashboard */}
        {isAdmin ? (
          <>
            {/* Welcome Header */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-10 w-10 text-purple-600" />
                <h1 className="text-4xl font-bold text-slate-900">Admin Dashboard</h1>
              </div>
              <p className="text-lg text-slate-600">
                Welcome back, {user?.first_name}! Here's what's happening on the platform.
              </p>
            </div>

            {/* Stats Grid */}
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <p className="mt-4 text-slate-600">Loading dashboard...</p>
              </div>
            ) : adminStats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                    <span className="text-2xl font-bold text-slate-900">{adminStats.totals?.users || 0}</span>
                  </div>
                  <h3 className="text-sm font-medium text-slate-600">Total Users</h3>
                  <p className="text-xs text-slate-500 mt-1">+{adminStats.userGrowth?.newUsersThisMonth || 0} this month</p>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Package className="h-6 w-6 text-blue-600" />
                    </div>
                    <span className="text-2xl font-bold text-slate-900">{adminStats.totals?.orders || 0}</span>
                  </div>
                  <h3 className="text-sm font-medium text-slate-600">Total Orders</h3>
                  <p className="text-xs text-slate-500 mt-1">${adminStats.revenue?.completedRevenue?.toFixed(2) || 0} completed</p>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-red-100 rounded-lg">
                      <AlertCircle className="h-6 w-6 text-red-600" />
                    </div>
                    <span className="text-2xl font-bold text-slate-900">{adminStats.totals?.activeDisputes || 0}</span>
                  </div>
                  <h3 className="text-sm font-medium text-slate-600">Active Disputes</h3>
                  <Link to="/admin/disputes" className="text-sm text-indigo-600 hover:text-indigo-700 mt-2 inline-flex items-center gap-1">
                    Review <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <ShoppingBag className="h-6 w-6 text-green-600" />
                    </div>
                    <span className="text-2xl font-bold text-slate-900">${adminStats.revenue?.pendingRevenue?.toFixed(2) || 0}</span>
                  </div>
                  <h3 className="text-sm font-medium text-slate-600">Pending Revenue</h3>
                  <p className="text-xs text-slate-500 mt-1">{adminStats.revenue?.totalTransactions || 0} transactions</p>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {quickActions.map((action, index) => (
                  <Link
                    key={index}
                    to={action.link}
                    className="group bg-white rounded-xl border border-slate-200 p-6 hover:shadow-xl transition-all duration-200"
                  >
                    <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${action.color} mb-4`}>
                      <action.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-slate-600 text-sm mb-4">{action.description}</p>
                    <div className="flex items-center text-indigo-600 font-medium group-hover:gap-2 transition-all">
                      Access <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Statistics Sections */}
            {!loading && adminStats && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                {/* Top Earners */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-4">🏆 Top Earners</h3>
                  <div className="space-y-3">
                    {adminStats.topEarners?.length > 0 ? (
                      adminStats.topEarners.map((earner, index) => (
                        <div key={earner.userID} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-bold text-sm">
                              #{index + 1}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{earner.name}</p>
                              <p className="text-xs text-slate-500">{earner.totalOrders} orders</p>
                            </div>
                          </div>
                          <span className="font-bold text-green-600">${earner.totalEarned.toFixed(2)}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-500 text-center py-4">No earnings data yet</p>
                    )}
                  </div>
                </div>

                {/* Popular Categories */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-4">📊 Popular Categories</h3>
                  <div className="space-y-3">
                    {adminStats.popularCategories?.length > 0 ? (
                      adminStats.popularCategories.map((category) => (
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
              </div>
            )}

            {/* Recent Activity */}
            {!loading && adminStats && adminStats.recentActivity?.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-6 mb-12">
                <h3 className="text-xl font-bold text-slate-900 mb-4">⚡ Recent Activity</h3>
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
                      {adminStats.recentActivity.map((activity) => (
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
          </>
        ) : (
          <>
            {/* Regular User View */}
            {/* Hero Section */}
            {!user && (
              <div className="text-center mb-16">
                <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
                  Find the perfect
                  <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"> freelance </span>
                  services for your business
                </h1>
                <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
                  Work with talented freelancers from around the world. Get your projects done faster and better.
                </p>
                <div className="flex gap-4 justify-center">
                  <Link
                    to="/register"
                    className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center gap-2"
                  >
                    Get Started <ArrowRight className="h-5 w-5" />
                  </Link>
                  <Link
                    to="/browse"
                    className="px-8 py-4 bg-white text-slate-700 rounded-xl font-semibold border-2 border-slate-200 hover:border-indigo-600 hover:text-indigo-600 transition-all duration-200"
                  >
                    Browse Services
                  </Link>
                </div>
              </div>
            )}

            {/* Quick Actions for logged-in users */}
            {user && (
              <div className="mb-16">
                <h2 className="text-3xl font-bold text-slate-900 mb-2">
                  Welcome back, {user.first_name}! 👋
                </h2>
                <p className="text-slate-600 mb-8">Here's what you can do today</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {quickActions.map((action, index) => (
                    <Link
                      key={index}
                      to={action.link}
                      className="group bg-white rounded-xl border border-slate-200 p-6 hover:shadow-xl transition-all duration-200"
                    >
                      <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${action.color} mb-4`}>
                        <action.icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-slate-600 text-sm mb-4">{action.description}</p>
                      <div className="flex items-center text-indigo-600 font-medium group-hover:gap-2 transition-all">
                        Go <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Categories */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-slate-900 mb-8">Popular Categories</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {categories.map((category, index) => (
                  <Link
                    key={index}
                    to={category.link}
                    className="bg-white rounded-xl border border-slate-200 p-6 text-center hover:shadow-lg hover:border-indigo-600 transition-all duration-200 group"
                  >
                    <div className="text-4xl mb-3">{category.emoji}</div>
                    <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm text-slate-500">{category.count}</p>
                  </Link>
                ))}
              </div>
            </div>

            {/* Featured Services */}
            {!loading && featuredServices.length > 0 && (
              <div className="mb-16">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold text-slate-900">Popular Services</h2>
                  <Link
                    to="/browse"
                    className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-2"
                  >
                    View All <ArrowRight className="h-5 w-5" />
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {featuredServices.slice(0, 4).map((service) => {
                    // Map category IDs to placeholder images
                    const categoryPlaceholders = {
                      1: '/placeholders/graphics_design.png',      // Graphics & Design
                      2: '/placeholders/digital_marketing.png',   // Digital Marketing
                      3: '/placeholders/writing_content.png',     // Writing & Translation
                      4: '/placeholders/video_animation.png',     // Video & Animation
                      5: '/placeholders/programming_tech.png',    // Programming & Tech
                      6: '/placeholders/music_audio.png',         // Music & Audio
                    };
                    
                    const imageUrl = service.portfolio_image 
                      ? `http://localhost:5001${service.portfolio_image}`
                      : categoryPlaceholders[service.category_id] || '/placeholders/graphics_design.png';
                    
                    return (
                      <Link
                        key={service.service_id}
                        to={`/service/${service.service_id}`}
                        className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-200 group"
                      >
                        <div className="aspect-video overflow-hidden">
                          <img 
                            src={imageUrl} 
                            alt={service.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
                            {service.title}
                          </h3>
                          <p className="text-sm text-slate-600 mb-3 line-clamp-2">{service.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-500">Starting at</span>
                            <span className="font-bold text-slate-900">${service.starting_price}</span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
