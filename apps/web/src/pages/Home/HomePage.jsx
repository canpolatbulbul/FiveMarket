import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import CategoryNav from "@/components/CategoryNav";
import Footer from "@/components/Footer";
import { ArrowRight, TrendingUp, Star, Briefcase, MessageSquare, ShoppingBag } from "lucide-react";
import { APICore } from "@/helpers/apiCore";

export default function HomePage() {
  const { user } = useAuth();
  const [featuredServices, setFeaturedServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedServices = async () => {
      try {
        const api = new APICore();
        // Fetch some services to display
        const response = await api.get("/api/services/featured");
        setFeaturedServices(response.data.services || []);
      } catch (error) {
        console.error("Failed to fetch services:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedServices();
  }, []);

  const isFreelancer = user?.roles?.includes("freelancer");

  const quickActions = isFreelancer
    ? [
        {
          title: "Create a New Service",
          description: "Start offering your skills to clients",
          icon: Briefcase,
          link: "/create-service",
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
          link: "/orders",
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
      <CategoryNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Welcome back, {user?.first_name}!
          </h1>
          <p className="text-lg text-slate-600">
            {isFreelancer
              ? "Ready to grow your freelance business?"
              : "Let's find the perfect service for your needs"}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Quick Actions</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.title}
                  to={action.link}
                  className="group relative overflow-hidden bg-white rounded-2xl p-6 border border-slate-200 hover:border-transparent hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-white shadow-lg`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-sm text-slate-600">{action.description}</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Featured Services */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">
              {isFreelancer ? "Trending Services" : "Recommended for You"}
            </h2>
            <Link
              to="/browse"
              className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-2 group"
            >
              View All
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse">
                  <div className="bg-slate-200 h-48 rounded-lg mb-4" />
                  <div className="bg-slate-200 h-4 rounded mb-2" />
                  <div className="bg-slate-200 h-4 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : featuredServices.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredServices.slice(0, 8).map((service) => (
                <Link
                  key={service.service_id}
                  to={`/service/${service.service_id}`}
                  className="group bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full"
                >
                  {/* Image/Thumbnail */}
                  <div className="relative h-40 bg-gradient-to-br from-blue-100 via-cyan-50 to-indigo-100 overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center text-5xl group-hover:scale-110 transition-transform duration-300">
                      {service.category_emoji || "💼"}
                    </div>
                    {/* Rating badge */}
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1 shadow-sm">
                      <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                      <span className="text-xs font-semibold text-slate-700">
                        {service.rating || "5.0"}
                      </span>
                      <span className="text-xs text-slate-500">
                        ({service.reviews || "0"})
                      </span>
                    </div>
                  </div>

                  {/* Content - flex-1 makes this grow to fill space */}
                  <div className="p-4 flex flex-col flex-1">
                    {/* Freelancer name */}
                    <p className="text-xs text-slate-500 mb-1">
                      {service.freelancer_name}
                    </p>

                    {/* Title - fixed height with line-clamp */}
                    <h3 className="font-semibold text-slate-900 mb-auto line-clamp-2 group-hover:text-indigo-600 transition-colors min-h-[2.75rem]">
                      {service.title}
                    </h3>

                    {/* Price section - always at bottom */}
                    <div className="flex items-center justify-between pt-4 mt-3 border-t border-slate-100">
                      <span className="text-xs text-slate-500 uppercase tracking-wide">Starting at</span>
                      <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        ${service.min_price || "50"}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
              <p className="text-slate-600">No services available at the moment.</p>
              <Link
                to="/browse"
                className="inline-block mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Browse all services →
              </Link>
            </div>
          )}
        </div>

        {/* Popular Categories */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Popular Categories</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={category.link}
                className="group bg-white rounded-xl p-6 border border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-300 flex items-center gap-4"
              >
                <div className="text-4xl">{category.emoji}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-slate-600">{category.count} services</p>
                </div>
                <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
