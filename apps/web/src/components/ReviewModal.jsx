import { useState } from "react";
import { Star, X } from "lucide-react";

export default function ReviewModal({ isOpen, onClose, onSubmit, orderDetails }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleStarClick = (value) => {
    setRating(value);
    setErrors({ ...errors, rating: null });
  };

  const handleStarHover = (value) => {
    setHoverRating(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    
    if (rating === 0) {
      newErrors.rating = "Please select a rating";
    }
    
    if (!reviewText.trim()) {
      newErrors.reviewText = "Please write a review";
    } else if (reviewText.trim().length < 10) {
      newErrors.reviewText = "Review must be at least 10 characters";
    } else if (reviewText.trim().length > 1000) {
      newErrors.reviewText = "Review must be less than 1000 characters";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onSubmit({ rating, review_text: reviewText.trim() });
      // Reset form
      setRating(0);
      setReviewText("");
      setErrors({});
    } catch (error) {
      setErrors({ submit: error.message || "Failed to submit review" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    const stars = [];
    const displayRating = hoverRating || rating;
    
    // Render 5 full stars, each clickable for both full and half values
    for (let i = 1; i <= 5; i++) {
      const fullValue = i;
      const halfValue = i - 0.5;
      const isFullFilled = displayRating >= fullValue;
      const isHalfFilled = displayRating >= halfValue && displayRating < fullValue;
      
      stars.push(
        <div key={i} className="relative inline-block">
          {/* Half star click area (left half) */}
          <button
            type="button"
            onClick={() => handleStarClick(halfValue)}
            onMouseEnter={() => handleStarHover(halfValue)}
            onMouseLeave={() => setHoverRating(0)}
            className="absolute left-0 top-0 w-4 h-8 z-10 focus:outline-none"
            aria-label={`${halfValue} stars`}
          />
          {/* Full star click area (right half) */}
          <button
            type="button"
            onClick={() => handleStarClick(fullValue)}
            onMouseEnter={() => handleStarHover(fullValue)}
            onMouseLeave={() => setHoverRating(0)}
            className="absolute right-0 top-0 w-4 h-8 z-10 focus:outline-none"
            aria-label={`${fullValue} stars`}
          />
          
          {/* Star visual */}
          <div className="relative w-8 h-8 pointer-events-none">
            {/* Background star (empty) */}
            <Star className="absolute w-8 h-8 text-slate-300" fill="currentColor" />
            
            {/* Filled portion */}
            {(isHalfFilled || isFullFilled) && (
              <div 
                className="absolute overflow-hidden" 
                style={{ width: isFullFilled ? '100%' : '50%' }}
              >
                <Star 
                  className="w-8 h-8 text-yellow-400 transition-all duration-150" 
                  fill="currentColor" 
                />
              </div>
            )}
          </div>
        </div>
      );
    }
    
    return stars;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Leave a Review</h2>
            <p className="text-sm text-slate-600 mt-1">
              Share your experience with this service
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Service Info */}
          {orderDetails && (
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-sm text-slate-600">Service</p>
              <p className="font-semibold text-slate-900">{orderDetails.service_title}</p>
              <p className="text-sm text-slate-600 mt-1">
                by {orderDetails.freelancer_name}
              </p>
            </div>
          )}

          {/* Star Rating */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Rating <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-1">
              {renderStars()}
              {rating > 0 && (
                <span className="ml-3 text-lg font-semibold text-slate-900">
                  {rating.toFixed(1)}
                </span>
              )}
            </div>
            {errors.rating && (
              <p className="mt-2 text-sm text-red-600">{errors.rating}</p>
            )}
          </div>

          {/* Review Text */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Your Review <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reviewText}
              onChange={(e) => {
                setReviewText(e.target.value);
                setErrors({ ...errors, reviewText: null });
              }}
              rows={6}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              placeholder="Tell others about your experience with this service..."
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-sm text-slate-500">
                {reviewText.length}/1000 characters
              </p>
              {errors.reviewText && (
                <p className="text-sm text-red-600">{errors.reviewText}</p>
              )}
            </div>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Review & Complete Order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
