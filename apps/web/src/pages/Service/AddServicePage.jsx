import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { APICore } from "@/helpers/apiCore";
import { 
  ChevronRight, 
  ChevronLeft, 
  Upload, 
  X, 
  Check,
  Image as ImageIcon,
  Plus,
  Trash2
} from "lucide-react";
import { toast } from "sonner";

export default function AddServicePage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category_ids: [],
    packages: [
      { name: "Basic", description: "", price: "", delivery_time: "" }
    ],
  });

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const categories = [
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

  const steps = [
    { name: "Service Details", description: "Basic information" },
    { name: "Packages", description: "Pricing tiers" },
    { name: "Portfolio", description: "Upload images" },
    { name: "Review", description: "Confirm & submit" },
  ];

  // Handle file upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (images.length + files.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    files.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max 5MB per image.`);
        return;
      }

      if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/)) {
        toast.error(`${file.name} is not a valid image type.`);
        return;
      }

      setImages((prev) => [...prev, file]);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Package management
  const addPackage = () => {
    if (formData.packages.length >= 3) {
      toast.error("Maximum 3 packages allowed");
      return;
    }
    setFormData({
      ...formData,
      packages: [
        ...formData.packages,
        { name: "", description: "", price: "", delivery_time: "" },
      ],
    });
  };

  const removePackage = (index) => {
    if (formData.packages.length === 1) {
      toast.error("At least one package is required");
      return;
    }
    setFormData({
      ...formData,
      packages: formData.packages.filter((_, i) => i !== index),
    });
  };

  const updatePackage = (index, field, value) => {
    const newPackages = [...formData.packages];
    newPackages[index][field] = value;
    setFormData({ ...formData, packages: newPackages });
  };

  // Category toggle
  const toggleCategory = (categoryId) => {
    setFormData({
      ...formData,
      category_ids: formData.category_ids.includes(categoryId)
        ? formData.category_ids.filter((id) => id !== categoryId)
        : [...formData.category_ids, categoryId],
    });
  };

  // Validation
  const validateStep = (step) => {
    switch (step) {
      case 0:
        if (!formData.title.trim()) {
          toast.error("Service title is required");
          return false;
        }
        if (formData.title.length < 5 || formData.title.length > 100) {
          toast.error("Title must be between 5 and 100 characters");
          return false;
        }
        if (!formData.description.trim()) {
          toast.error("Service description is required");
          return false;
        }
        if (formData.description.length < 20) {
          toast.error("Description must be at least 20 characters");
          return false;
        }
        if (formData.category_ids.length === 0) {
          toast.error("Select at least one category");
          return false;
        }
        return true;

      case 1:
        for (let i = 0; i < formData.packages.length; i++) {
          const pkg = formData.packages[i];
          if (!pkg.name.trim()) {
            toast.error(`Package ${i + 1}: Name is required`);
            return false;
          }
          if (!pkg.description.trim()) {
            toast.error(`Package ${i + 1}: Description is required`);
            return false;
          }
          if (!pkg.price || parseFloat(pkg.price) <= 0) {
            toast.error(`Package ${i + 1}: Valid price is required`);
            return false;
          }
          if (!pkg.delivery_time || parseInt(pkg.delivery_time) <= 0) {
            toast.error(`Package ${i + 1}: Valid delivery time is required`);
            return false;
          }
        }
        return true;

      case 2:
        // Images are optional
        return true;

      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    if (!validateStep(1)) return; // Validate packages again

    setLoading(true);
    try {
      const api = new APICore();
      const formDataToSend = new FormData();

      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("category_ids", JSON.stringify(formData.category_ids));
      formDataToSend.append("packages", JSON.stringify(formData.packages));

      images.forEach((image) => {
        formDataToSend.append("images", image);
      });

      const response = await api.post("/api/services", formDataToSend);

      toast.success("Service created successfully!");
      navigate(`/service/${response.data.service_id}`);
    } catch (error) {
      console.error("Error creating service:", error);
      toast.error(error.response?.data?.message || "Failed to create service");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-purple-50 to-white">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Create a New Service</h1>
          <p className="text-slate-600">Share your skills and start earning</p>
        </div>

        {/* Stepper */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                      index < currentStep
                        ? "bg-green-500 text-white"
                        : index === currentStep
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {index < currentStep ? <Check className="h-5 w-5" /> : index + 1}
                  </div>
                  <div className="mt-2 text-center">
                    <p className="text-sm font-medium text-slate-900">{step.name}</p>
                    <p className="text-xs text-slate-500">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-1 flex-1 mx-2 transition-all ${
                      index < currentStep ? "bg-green-500" : "bg-slate-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-xl border border-slate-200 p-8 mb-6">
          {/* Step 0: Service Details */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Service Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="I will create a professional logo design"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  maxLength={100}
                />
                <p className="text-xs text-slate-500 mt-1">{formData.title.length}/100 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your service in detail..."
                  rows={6}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  maxLength={5000}
                />
                <p className="text-xs text-slate-500 mt-1">{formData.description.length}/5000 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-3">
                  Categories * (Select at least one)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => toggleCategory(category.id)}
                      className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                        formData.category_ids.includes(category.id)
                          ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                          : "border-slate-200 hover:border-indigo-300 text-slate-700"
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Packages */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Package Tiers</h3>
                {formData.packages.length < 3 && (
                  <button
                    onClick={addPackage}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all"
                  >
                    <Plus className="h-4 w-4" />
                    Add Package
                  </button>
                )}
              </div>

              {formData.packages.map((pkg, index) => (
                <div key={index} className="border border-slate-200 rounded-lg p-6 relative">
                  {formData.packages.length > 1 && (
                    <button
                      onClick={() => removePackage(index)}
                      className="absolute top-4 right-4 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}

                  <h4 className="font-semibold text-slate-900 mb-4">Package {index + 1}</h4>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Package Name *
                      </label>
                      <input
                        type="text"
                        value={pkg.name}
                        onChange={(e) => updatePackage(index, "name", e.target.value)}
                        placeholder="Basic, Standard, Premium..."
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Price ($) *
                      </label>
                      <input
                        type="number"
                        value={pkg.price}
                        onChange={(e) => updatePackage(index, "price", e.target.value)}
                        placeholder="50"
                        min="1"
                        step="0.01"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Delivery Time (days) *
                      </label>
                      <input
                        type="number"
                        value={pkg.delivery_time}
                        onChange={(e) => updatePackage(index, "delivery_time", e.target.value)}
                        placeholder="3"
                        min="1"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Description *
                      </label>
                      <textarea
                        value={pkg.description}
                        onChange={(e) => updatePackage(index, "description", e.target.value)}
                        placeholder="What's included in this package?"
                        rows={3}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Step 2: Portfolio Images */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Portfolio Images</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Upload 1-5 images showcasing your work (optional)
                </p>
              </div>

              {/* Upload Zone */}
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-indigo-400 transition-all">
                <input
                  type="file"
                  id="image-upload"
                  multiple
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-700 font-medium mb-1">Click to upload images</p>
                  <p className="text-sm text-slate-500">
                    JPG, PNG, or WEBP (max 5MB each, up to 5 images)
                  </p>
                </label>
              </div>

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-40 object-cover rounded-lg border border-slate-200"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                        Image {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Review */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Review Your Service</h3>

              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-4">
                  <h4 className="font-medium text-slate-900 mb-2">Service Details</h4>
                  <p className="text-sm text-slate-600"><strong>Title:</strong> {formData.title}</p>
                  <p className="text-sm text-slate-600 mt-1"><strong>Description:</strong> {formData.description.substring(0, 150)}...</p>
                  <p className="text-sm text-slate-600 mt-1">
                    <strong>Categories:</strong> {formData.category_ids.map(id => categories.find(c => c.id === id)?.name).join(", ")}
                  </p>
                </div>

                <div className="border-b border-slate-200 pb-4">
                  <h4 className="font-medium text-slate-900 mb-2">Packages ({formData.packages.length})</h4>
                  {formData.packages.map((pkg, index) => (
                    <div key={index} className="text-sm text-slate-600 mt-2">
                      <strong>{pkg.name}:</strong> ${pkg.price} - {pkg.delivery_time} days
                    </div>
                  ))}
                </div>

                <div>
                  <h4 className="font-medium text-slate-900 mb-2">Portfolio Images ({images.length})</h4>
                  {images.length > 0 ? (
                    <div className="grid grid-cols-4 gap-2">
                      {imagePreviews.map((preview, index) => (
                        <img
                          key={index}
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-20 object-cover rounded border border-slate-200"
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">No images uploaded</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-6 py-3 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="h-5 w-5" />
            Previous
          </button>

          {currentStep < steps.length - 1 ? (
            <button
              onClick={nextStep}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all"
            >
              Next
              <ChevronRight className="h-5 w-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50 transition-all"
            >
              {loading ? "Creating..." : "Create Service"}
              <Check className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
