import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { APICore } from "@/helpers/apiCore";
import { Search, SlidersHorizontal, Star, Clock, Calendar } from "lucide-react";

export default function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);

  // Get params from URL
  const query = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const minPrice = searchParams.get("min") || "";
  const maxPrice = searchParams.get("max") || "";
  const rating = searchParams.get("rating") || "";
  const delivery = searchParams.get("delivery") || "";
  const sort = searchParams.get("sort") || "popular";
  const page = searchParams.get("page") || "1";

  // Debounced fetch - wait 500ms after last param change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchServices();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchParams]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const api = new APICore();
      const params = new URLSearchParams();
      
      if (query) params.append("q", query);
      if (category) params.append("category", category);
      if (minPrice) params.append("min", minPrice);
      if (maxPrice) params.append("max", maxPrice);
      if (rating) params.append("rating", rating);
      if (delivery) params.append("delivery", delivery);
      if (sort) params.append("sort", sort);
      params.append("page", page);
      params.append("limit", "20");

      const response = await api.get(`/api/services/search?${params.toString()}`);
      setServices(response.data.services || []);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Failed to fetch services:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateParams = (updates) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    // Reset to page 1 when filters change
    if (!updates.page) {
      newParams.set("page", "1");
    }
    setSearchParams(newParams);
  };

  const categories = [
    { id: "", name: "All Categories" },
    { id: "1", name: "Graphics & Design" },
    { id: "2", name: "Digital Marketing" },
    { id: "3", name: "Writing & Translation" },
    { id: "4", name: "Video & Animation" },
    { id: "5", name: "Programming & Tech" },
    { id: "6", name: "Music & Audio" },
    { id: "7", name: "Business" },
    { id: "8", name: "AI Services" },
    { id: "9", name: "Photography" },
    { id: "10", name: "Lifestyle" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-purple-50 to-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {query ? `Search results for "${query}"` : "Browse Services"}
          </h1>
          {pagination && (
            <p className="text-slate-600">
              {pagination.total} services found
            </p>
          )}
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <aside className="w-64 flex-shrink-0 hidden lg:block">
            <div className="sticky top-24 space-y-6 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2">
              {/* Category Filter */}
              <div className="bg-white rounded-xl p-4 border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Category
                </h3>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => updateParams({ category: cat.id })}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        category === cat.id
                          ? "bg-indigo-100 text-indigo-700 font-medium"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="bg-white rounded-xl p-4 border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-3">Price Range</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-600 mb-1 block">Min ($)</label>
                    <input
                      type="number"
                      value={minPrice}
                      onChange={(e) => updateParams({ min: e.target.value })}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600 mb-1 block">Max ($)</label>
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => updateParams({ max: e.target.value })}
                      placeholder="1000"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Rating Filter */}
              <div className="bg-white rounded-xl p-4 border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-3">Minimum Rating</h3>
                <div className="space-y-2">
                  {[4.5, 4, 3.5, 3].map((r) => (
                    <button
                      key={r}
                      onClick={() => updateParams({ rating: rating === r.toString() ? "" : r.toString() })}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                        rating === r.toString()
                          ? "bg-indigo-100 text-indigo-700 font-medium"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      {r}+ stars
                    </button>
                  ))}
                </div>
              </div>

              {/* Delivery Time Filter */}
              <div className="bg-white rounded-xl p-4 border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-3">Delivery Time</h3>
                <div className="space-y-2">
                  {[
                    { days: 1, label: "Express (1 day)" },
                    { days: 3, label: "Up to 3 days" },
                    { days: 7, label: "Up to 7 days" },
                    { days: 14, label: "Up to 14 days" },
                  ].map((option) => (
                    <button
                      key={option.days}
                      onClick={() => updateParams({ delivery: searchParams.get("delivery") === option.days.toString() ? "" : option.days.toString() })}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                        searchParams.get("delivery") === option.days.toString()
                          ? "bg-indigo-100 text-indigo-700 font-medium"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <Clock className="h-4 w-4" />
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Sort Bar */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 mb-6 flex items-center justify-between">
              <span className="text-sm text-slate-600">
                {pagination && `Page ${pagination.page} of ${pagination.totalPages}`}
              </span>
              <select
                value={sort}
                onChange={(e) => updateParams({ sort: e.target.value })}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium"
              >
                <option value="popular">Most Popular</option>
                <option value="newest">Newest</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            {/* Services Grid */}
            {loading ? (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse">
                    <div className="bg-slate-200 h-48 rounded-lg mb-4" />
                    <div className="bg-slate-200 h-4 rounded mb-2" />
                    <div className="bg-slate-200 h-4 rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : services.length > 0 ? (
              <>
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {services.map((service) => (
                    <ServiceCard key={service.service_id} service={service} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="mt-8 flex justify-center gap-2">
                    <button
                      onClick={() => updateParams({ page: (parseInt(page) - 1).toString() })}
                      disabled={!pagination.hasPrev}
                      className="px-4 py-2 border border-slate-300 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                    >
                      Previous
                    </button>
                    
                    {(() => {
                      const totalPages = pagination.totalPages;
                      const currentPage = parseInt(page);
                      let startPage = Math.max(1, currentPage - 2);
                      let endPage = Math.min(totalPages, currentPage + 2);
                      // Adjust if we are near the start or end
                      if (endPage - startPage < 4) {
                        if (startPage === 1) {
                          endPage = Math.min(totalPages, startPage + 4);
                        } else if (endPage === totalPages) {
                          startPage = Math.max(1, endPage - 4);
                        }
                      }
                      const pageNumbers = [];
                      for (let i = startPage; i <= endPage; i++) {
                        pageNumbers.push(i);
                      }
                      return pageNumbers.map((pageNum) => (
                        <button
                          key={pageNum}
                          onClick={() => updateParams({ page: pageNum.toString() })}
                          className={`px-4 py-2 rounded-lg font-medium ${
                            currentPage === pageNum
                              ? "bg-indigo-600 text-white"
                              : "border border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      ));
                    })()}

                    <button
                      onClick={() => updateParams({ page: (parseInt(page) + 1).toString() })}
                      disabled={!pagination.hasNext}
                      className="px-4 py-2 border border-slate-300 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                <p className="text-slate-600 mb-4">No services found matching your criteria.</p>
                <button
                  onClick={() => setSearchParams({})}
                  className="text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

// ServiceCard Component
function ServiceCard({ service }) {
  return (
    <Link
      to={`/service/${service.service_id}`}
      className="group bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full"
    >
      {/* Image/Thumbnail */}
      <div className="relative h-48 bg-gradient-to-br from-blue-100 via-cyan-50 to-indigo-100 overflow-hidden">
        {service.portfolio_image ? (
          <img
            src={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${service.portfolio_image}`}
            alt={service.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-5xl group-hover:scale-110 transition-transform duration-300">
            {service.category_name?.[0] || "💼"}
          </div>
        )}
        {/* Rating badge */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1 shadow-sm">
          <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
          <span className="text-xs font-semibold text-slate-700">
            {service.rating}
          </span>
          <span className="text-xs text-slate-500">
            ({service.reviews})
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Category */}
        <p className="text-xs text-indigo-600 font-medium mb-1">
          {service.category_name}
        </p>

        {/* Freelancer name */}
        <p className="text-xs text-slate-500 mb-2">
          by {service.freelancer_name}
        </p>

        {/* Title */}
        <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors min-h-[2.75rem]">
          {service.title}
        </h3>

        {/* Meta info - delivery time and posted date */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {service.min_delivery} day{service.min_delivery !== 1 ? 's' : ''}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {new Date(service.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
        </div>

        {/* Price section */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <span className="text-xs text-slate-500 uppercase tracking-wide">Starting at</span>
          <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            ${service.min_price}
          </span>
        </div>
      </div>
    </Link>
  );
}
