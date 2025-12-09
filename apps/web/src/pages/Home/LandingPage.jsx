import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Star, Shield, Clock, CreditCard, TrendingUp, Code, Palette, Video, Megaphone, PenTool, Music, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function LandingPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const popularServices = [
    { name: "Logo Design", icon: Palette, color: "from-pink-500 to-rose-500" },
    { name: "Web Development", icon: Code, color: "from-blue-500 to-cyan-500" },
    { name: "Video Editing", icon: Video, color: "from-purple-500 to-indigo-500" },
    { name: "Digital Marketing", icon: Megaphone, color: "from-green-500 to-emerald-500" },
    { name: "Content Writing", icon: PenTool, color: "from-orange-500 to-amber-500" },
    { name: "Music Production", icon: Music, color: "from-red-500 to-pink-500" },
  ];

  const categories = [
    { name: "Graphics & Design", services: "2,500+", emoji: "🎨", gradient: "from-pink-500/10 to-rose-500/10" },
    { name: "Digital Marketing", services: "1,800+", emoji: "📱", gradient: "from-blue-500/10 to-cyan-500/10" },
    { name: "Writing & Translation", services: "1,200+", emoji: "✍️", gradient: "from-purple-500/10 to-indigo-500/10" },
    { name: "Video & Animation", services: "900+", emoji: "🎬", gradient: "from-green-500/10 to-emerald-500/10" },
    { name: "Programming & Tech", services: "3,100+", emoji: "💻", gradient: "from-orange-500/10 to-amber-500/10" },
    { name: "Music & Audio", services: "600+", emoji: "🎵", gradient: "from-red-500/10 to-pink-500/10" },
  ];

  const benefits = [
    {
      icon: CreditCard,
      title: "Transparent Pricing",
      description: "Clear, upfront pricing with no hidden fees. Pay only for what you need.",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: Clock,
      title: "Fast Delivery",
      description: "Get your projects completed quickly by talented professionals worldwide.",
      gradient: "from-purple-500 to-indigo-500",
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description: "Your money is protected. Funds are released only when you approve the work.",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: TrendingUp,
      title: "24/7 Support",
      description: "Our dedicated support team is always here to help you succeed.",
      gradient: "from-orange-500 to-amber-500",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section - Refined gradient */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-100/40 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-purple-100/40 via-transparent to-transparent" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 leading-tight tracking-tight">
              Find the perfect{" "}
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  freelance talent
                </span>
                <span className="absolute bottom-2 left-0 right-0 h-3 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 -z-0 blur-sm" />
              </span>
              <br />
              for your business
            </h1>
            <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              Connect with world-class freelancers and bring your ideas to life. Quality work, delivered on time.
            </p>

            {/* Search Bar - More refined */}
            <form onSubmit={handleSearch} className="max-w-3xl mx-auto mb-10">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-40 transition duration-300" />
                <div className="relative flex items-center bg-white rounded-full shadow-xl border border-slate-200">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for any service..."
                    className="flex-1 pl-8 pr-4 py-5 rounded-l-full outline-none text-lg text-slate-900 placeholder:text-slate-400"
                  />
                  <button
                    type="submit"
                    className="my-2 mx-2 px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center gap-2 shadow-lg"
                  >
                    <Search className="h-5 w-5" />
                    <span className="hidden sm:inline">Search</span>
                  </button>
                </div>
              </div>
            </form>

            {/* Popular Services - Refined pills */}
            <div className="flex flex-wrap justify-center items-center gap-3 mb-16">
              <span className="text-sm text-slate-500 font-medium">Popular:</span>
              {popularServices.slice(0, 4).map((service) => (
                <Link
                  key={service.name}
                  to={`/search?q=${encodeURIComponent(service.name)}`}
                  className="group px-5 py-2.5 bg-white/80 backdrop-blur-sm rounded-full text-slate-700 hover:text-indigo-600 border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all duration-200 text-sm font-medium"
                >
                  {service.name}
                </Link>
              ))}
            </div>

            {/* Trusted By - More subtle */}
            <div className="pt-8 border-t border-slate-200/50">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-6">Trusted by leading companies</p>
              <div className="flex flex-wrap justify-center items-center gap-12 opacity-40">
                {["Google", "Netflix", "Meta", "PayPal", "Microsoft"].map((company) => (
                  <div key={company} className="text-xl font-semibold text-slate-600 flex items-center">
                    {company}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Services Grid - Cleaner design */}
      <section className="py-24 bg-gradient-to-b from-indigo-50/20 via-purple-50/10 to-white relative">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50/30 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Popular services
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Explore our most in-demand categories
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {popularServices.map((service) => {
              const Icon = service.icon;
              return (
                <Link
                  key={service.name}
                  to={`/search?q=${encodeURIComponent(service.name)}`}
                  className="group relative overflow-hidden rounded-2xl aspect-square bg-white border border-slate-200 hover:border-transparent hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  <div className="relative h-full flex flex-col items-center justify-center p-6 text-slate-700 group-hover:text-white transition-colors duration-300">
                    <Icon className="h-12 w-12 mb-4" strokeWidth={1.5} />
                    <p className="text-sm font-semibold text-center">{service.name}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section - More sophisticated */}
      <section className="py-24 bg-gradient-to-b from-white via-slate-50/50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Why choose FiveMarket?
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Everything you need to succeed, all in one platform
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div key={benefit.title} className="group relative">
                  <div className="relative bg-white rounded-2xl p-8 border border-slate-200 hover:border-transparent hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center">
                    <div className={`flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${benefit.gradient} text-white mb-6 shadow-lg`}>
                      <Icon className="h-6 w-6" strokeWidth={2} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">{benefit.title}</h3>
                    <p className="text-slate-600 leading-relaxed">{benefit.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories Section - Refined cards */}
      <section className="py-24 bg-gradient-to-b from-white via-purple-50/10 to-indigo-50/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Explore the marketplace
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Browse thousands of services across all categories
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link
                key={category.name}
                to="/browse"
                className="group relative overflow-hidden rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-xl transition-all duration-300"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <div className="relative p-8">
                  <div className="text-5xl mb-4">{category.emoji}</div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{category.name}</h3>
                  <p className="text-slate-600 mb-4">{category.services} services</p>
                  <div className="flex items-center text-indigo-600 font-medium group-hover:translate-x-1 transition-transform duration-300">
                    Explore <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - More elegant */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent" />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Ready to get started?
          </h2>
          <p className="text-xl text-indigo-100 mb-10 max-w-2xl mx-auto">
            Join thousands of businesses and freelancers already using FiveMarket
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/auth/register"
              className="group px-8 py-4 bg-white text-indigo-600 rounded-xl font-semibold hover:shadow-2xl transition-all duration-200 text-lg flex items-center justify-center gap-2"
            >
              Get Started Free
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/browse"
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-semibold hover:bg-white hover:text-indigo-600 transition-all duration-200 text-lg"
            >
              Browse Services
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section - More refined */}
      <section className="py-20 bg-gradient-to-b from-indigo-50/30 via-purple-50/20 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                10K+
              </div>
              <p className="text-slate-600 font-medium">Active Freelancers</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                50K+
              </div>
              <p className="text-slate-600 font-medium">Projects Completed</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                <div className="flex items-center justify-center gap-2">
                  <span>4.9</span>
                  <Star className="h-10 w-10 text-yellow-400 fill-yellow-400" />
                </div>
              </div>
              <p className="text-slate-600 font-medium">Average Rating</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                24/7
              </div>
              <p className="text-slate-600 font-medium">Customer Support</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
