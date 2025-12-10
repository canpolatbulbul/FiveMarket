import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { APICore } from "@/helpers/apiCore";
import { Star, Clock, User, Calendar, Award, ShoppingCart, ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";

export default function ServiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [packages, setPackages] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [freelancerStats, setFreelancerStats] = useState(null);
  const [portfolioImages, setPortfolioImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchServiceDetails();
  }, [id]);

  const fetchServiceDetails = async () => {
    setLoading(true);
    try {
      const api = new APICore();
      const response = await api.get(`/api/services/${id}`);
      console.log("🖼️ DEBUG - API Response:", {
        service_id: response.data.service?.service_id,
        portfolio_images: response.data.portfolio_images,
        portfolio_count: response.data.portfolio_images?.length || 0
      });
      setService(response.data.service);
      setPackages(response.data.packages);
      setReviews(response.data.reviews);
      setFreelancerStats(response.data.freelancer_stats);
      setPortfolioImages(response.data.portfolio_images || []);
      // Auto-select first package
      if (response.data.packages.length > 0) {
        setSelectedPackage(response.data.packages[0]);
      }
    } catch (error) {
      console.error("Failed to fetch service details:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRatingBreakdown = () => {
    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      breakdown[review.rating] = (breakdown[review.rating] || 0) + 1;
    });
    return breakdown;
  };

  const nextImage = () => {
    const imageCount = portfolioImages.length > 0 ? portfolioImages.length : 1;
    setCurrentImageIndex((prev) => (prev + 1) % imageCount);
  };

  const prevImage = () => {
    const imageCount = portfolioImages.length > 0 ? portfolioImages.length : 1;
    setCurrentImageIndex((prev) => (prev - 1 + imageCount) % imageCount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-purple-50 to-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-slate-200 rounded w-2/3" />
            <div className="h-64 bg-slate-200 rounded" />
            <div className="h-96 bg-slate-200 rounded" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-purple-50 to-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Service Not Found</h1>
          <button
            onClick={() => navigate("/browse")}
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            ← Back to Browse
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const ratingBreakdown = getRatingBreakdown();
  const totalReviews = reviews.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-purple-50 to-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
            <button onClick={() => navigate("/browse")} className="hover:text-indigo-600">
              Browse
            </button>
            <span>/</span>
            <span className="text-indigo-600">{service.category_name}</span>
          </div>
          
          <h1 className="text-4xl font-bold text-slate-900 mb-4">{service.title}</h1>
          
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                {service.freelancer_name[0]}
              </div>
              <span className="font-medium text-slate-700">{service.freelancer_name}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
              <span className="font-semibold text-slate-900">{service.rating}</span>
              <span className="text-slate-600">({service.reviews} reviews)</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Portfolio/Image Gallery Carousel */}
            <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="relative aspect-video bg-gradient-to-br from-slate-100 to-slate-200">
                {portfolioImages.length > 0 ? (
                  <>
                    {/* Actual Portfolio Images */}
                    <img
                      src={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${portfolioImages[currentImageIndex].url}`}
                      alt={`Portfolio image ${currentImageIndex + 1}`}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    
                    {/* Carousel Controls */}
                    {portfolioImages.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center transition-all"
                        >
                          <ChevronLeft className="h-6 w-6 text-slate-700" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center transition-all"
                        >
                          <ChevronRight className="h-6 w-6 text-slate-700" />
                        </button>

                        {/* Image Indicators */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                          {portfolioImages.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                              className={`h-2 rounded-full transition-all ${
                                index === currentImageIndex
                                  ? "w-8 bg-white"
                                  : "w-2 bg-white/50 hover:bg-white/75"
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  /* Placeholder when no images */
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <ImageIcon className="h-24 w-24 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-600 font-medium">No Portfolio Images</p>
                      <p className="text-sm text-slate-500">This service has no images yet</p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Service Description */}
            <section className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">About This Service</h2>
              <p className="text-slate-700 leading-relaxed whitespace-pre-line">{service.description}</p>
            </section>

            {/* Reviews Section */}
            <section className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Reviews ({totalReviews})</h2>
              
              {/* Rating Breakdown */}
              {totalReviews > 0 && (
                <div className="mb-8 pb-8 border-b border-slate-200">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-slate-900 mb-2">{service.rating}</div>
                      <div className="flex items-center justify-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-5 w-5 ${
                              star <= Math.round(parseFloat(service.rating))
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-slate-300"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-slate-600">{totalReviews} reviews</p>
                    </div>
                    
                    <div className="space-y-2">
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <div key={rating} className="flex items-center gap-3">
                          <span className="text-sm text-slate-600 w-8">{rating} ★</span>
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-yellow-400"
                              style={{
                                width: `${totalReviews > 0 ? (ratingBreakdown[rating] / totalReviews) * 100 : 0}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm text-slate-600 w-8">{ratingBreakdown[rating]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Individual Reviews */}
              <div className="space-y-6">
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <ReviewCard key={review.review_id} review={review} />
                  ))
                ) : (
                  <p className="text-center text-slate-600 py-8">No reviews yet</p>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Package Selection Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Select a Package</h3>
                
                <div className="space-y-3 mb-6">
                  {packages.map((pkg) => (
                    <PackageCard
                      key={pkg.package_id}
                      package={pkg}
                      isSelected={selectedPackage?.package_id === pkg.package_id}
                      onSelect={() => setSelectedPackage(pkg)}
                    />
                  ))}
                </div>

                {selectedPackage && (
                  <div className="pt-4 border-t border-slate-200">
                    <div className="mb-4">
                      <div className="flex items-baseline justify-between mb-2">
                        <span className="text-sm text-slate-600">Total</span>
                        <span className="text-3xl font-bold text-slate-900">${selectedPackage.price}</span>
                      </div>
                      <p className="text-sm text-slate-600 flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {selectedPackage.delivery_time} day{selectedPackage.delivery_time !== 1 ? 's' : ''} delivery
                      </p>
                    </div>
                    <button className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2">
                      <ShoppingCart className="h-5 w-5" />
                      Order Now
                    </button>
                  </div>
                )}
              </div>

              {/* Seller Profile Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-4">About the Seller</h3>
                
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-semibold">
                    {service.freelancer_name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{service.freelancer_name}</p>
                    <p className="text-sm text-slate-600">Freelancer</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      Overall Rating
                    </span>
                    <span className="font-semibold text-slate-900">{freelancerStats.overall_rating} ★</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      Completed Orders
                    </span>
                    <span className="font-semibold text-slate-900">{freelancerStats.completed_orders}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Member Since
                    </span>
                    <span className="font-semibold text-slate-900">
                      {new Date(freelancerStats.member_since).toLocaleDateString('en-US', { 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </span>
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

// Package Card Component - Compact version for sidebar
function PackageCard({ package: pkg, isSelected, onSelect }) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
        isSelected
          ? "border-indigo-600 bg-indigo-50"
          : "border-slate-200 hover:border-indigo-300"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-slate-900">{pkg.name}</h4>
        <span className="text-lg font-bold text-indigo-600">${pkg.price}</span>
      </div>
      <p className="text-xs text-slate-600 mb-2 line-clamp-2">{pkg.description}</p>
      <div className="flex items-center gap-1 text-xs text-slate-500">
        <Clock className="h-3 w-3" />
        {pkg.delivery_time} day{pkg.delivery_time !== 1 ? 's' : ''}
      </div>
    </button>
  );
}

// Review Card Component
function ReviewCard({ review }) {
  return (
    <div className="border-b border-slate-100 pb-6 last:border-0">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-semibold">
            {review.reviewer_name[0]}
          </div>
          <div>
            <p className="font-medium text-slate-900">{review.reviewer_name}</p>
            <p className="text-sm text-slate-600">
              {new Date(review.submit_time).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-4 w-4 ${
                star <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-300"
              }`}
            />
          ))}
        </div>
      </div>
      <p className="text-slate-700">{review.comment}</p>
    </div>
  );
}
