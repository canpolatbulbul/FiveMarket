import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { APICore } from "../../helpers/apiCore";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { Save, X, Loader2, Package as PackageIcon, DollarSign, Clock, Tag, Image as ImageIcon, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

export default function EditServicePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [service, setService] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });
  const [packages, setPackages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [portfolioImages, setPortfolioImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);

  useEffect(() => {
    fetchData();
  }, [id]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      imageUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imageUrls]);

  const fetchData = async () => {
    try {
      const api = new APICore();
      
      // Fetch service details
      const serviceResponse = await api.get(`/api/services/${id}`);
      const serviceData = serviceResponse.data.service;
      const packagesData = serviceResponse.data.packages || [];
      const imagesData = serviceResponse.data.portfolio_images || [];
      
      // Fetch all categories
      const categoriesResponse = await api.get("/api/categories");
      const allCategories = categoriesResponse.data.categories || [];
      
      setService(serviceData);
      setFormData({
        title: serviceData.title,
        description: serviceData.description,
      });
      setPackages(packagesData);
      setCategories(allCategories);
      setPortfolioImages(imagesData);
      
      // Set selected categories from service
      if (serviceData.category_ids) {
        setSelectedCategories(serviceData.category_ids);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load service");
      navigate("/my-services");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim() || formData.title.length < 5) {
      toast.error("Title must be at least 5 characters");
      return;
    }

    if (!formData.description.trim() || formData.description.length < 20) {
      toast.error("Description must be at least 20 characters");
      return;
    }

    if (selectedCategories.length === 0) {
      toast.error("Please select at least one category");
      return;
    }

    // Validate packages
    for (const pkg of packages) {
      if (!pkg.name || pkg.name.trim().length < 2) {
        toast.error(`Package name must be at least 2 characters`);
        return;
      }
      if (!pkg.price || pkg.price <= 0) {
        toast.error(`Package "${pkg.name}" must have a valid price`);
        return;
      }
      if (!pkg.delivery_time || pkg.delivery_time <= 0) {
        toast.error(`Package "${pkg.name}" must have a valid delivery time`);
        return;
      }
    }

    setSaving(true);
    try {
      const api = new APICore();
      
      // Update service details
      await api.patch(`/api/services/${id}`, {
        title: formData.title,
        description: formData.description,
        category_ids: selectedCategories,
        packages: packages.map(pkg => ({
          package_id: pkg.package_id,
          name: pkg.name,
          price: parseFloat(pkg.price),
          delivery_time: parseInt(pkg.delivery_time),
          description: pkg.description
        }))
      });

      // Upload new images if any
      if (newImages.length > 0) {
        const formData = new FormData();
        newImages.forEach(file => {
          formData.append('images', file);
        });
        await api.post(`/api/services/${id}/images`, formData);
      }

      toast.success("Service updated successfully!");
      navigate("/my-services");
    } catch (error) {
      console.error("Error updating service:", error);
      toast.error(error.message || "Failed to update service");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePackageChange = (index, field, value) => {
    setPackages(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value
      };
      return updated;
    });
  };

  const toggleCategory = (categoryId) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const handleImageDelete = async (imageId) => {
    try {
      const api = new APICore();
      await api.delete(`/api/services/${id}/images/${imageId}`);
      setPortfolioImages(prev => prev.filter(img => img.image_id !== imageId));
      toast.success("Image deleted");
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Failed to delete image");
    }
  };

  const handleNewImages = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + newImages.length + portfolioImages.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }
    
    // Create blob URLs and track them for cleanup
    const newUrls = files.map(file => URL.createObjectURL(file));
    setImageUrls(prev => [...prev, ...newUrls]);
    setNewImages(prev => [...prev, ...files]);
  };

  const removeNewImage = (index) => {
    // Revoke the blob URL for the removed image
    if (imageUrls[index]) {
      URL.revokeObjectURL(imageUrls[index]);
    }
    setImageUrls(prev => prev.filter((_, i) => i !== index));
    setNewImages(prev => prev.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading service...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Edit Service</h1>
          <p className="text-slate-600">Update your service details, pricing, categories, and images</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Service Details */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Service Details</h2>
            </div>
            <div className="p-6 space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-semibold text-slate-900 mb-2">
                  Service Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Professional Logo Design"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  required
                  minLength={5}
                  maxLength={100}
                />
                <p className="mt-1 text-xs text-slate-500">
                  {formData.title.length}/100 characters
                </p>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-slate-900 mb-2">
                  Service Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe what you offer, your experience, and what makes your service unique..."
                  rows={6}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
                  required
                  minLength={20}
                />
                <p className="mt-1 text-xs text-slate-500">
                  {formData.description.length} characters (minimum 20)
                </p>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Categories
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {categories.map((category) => (
                  <button
                    key={category.category_id}
                    type="button"
                    onClick={() => toggleCategory(category.category_id)}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      selectedCategories.includes(category.category_id)
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-semibold'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300'
                    }`}
                  >
                    {category.description}
                  </button>
                ))}
              </div>
              {selectedCategories.length === 0 && (
                <p className="mt-3 text-sm text-red-600">Please select at least one category</p>
              )}
            </div>
          </div>

          {/* Packages */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <PackageIcon className="h-5 w-5" />
                Packages
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {packages.map((pkg, index) => (
                <div key={pkg.package_id} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                  {/* Package Name */}
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Package Name *
                    </label>
                    <input
                      type="text"
                      value={pkg.name}
                      onChange={(e) => handlePackageChange(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                      placeholder="e.g., Basic, Standard, Premium"
                      required
                      minLength={2}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Price */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        <DollarSign className="h-4 w-4 inline mr-1" />
                        Price *
                      </label>
                      <input
                        type="number"
                        value={pkg.price}
                        onChange={(e) => handlePackageChange(index, 'price', e.target.value)}
                        min="1"
                        step="0.01"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                        required
                      />
                    </div>

                    {/* Delivery Time */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        <Clock className="h-4 w-4 inline mr-1" />
                        Delivery Time (days) *
                      </label>
                      <input
                        type="number"
                        value={pkg.delivery_time}
                        onChange={(e) => handlePackageChange(index, 'delivery_time', e.target.value)}
                        min="1"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                        required
                      />
                    </div>
                  </div>

                  {/* Package Description */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={pkg.description || ''}
                      onChange={(e) => handlePackageChange(index, 'description', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
                      placeholder="What's included in this package..."
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Portfolio Images */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Portfolio Images ({portfolioImages.length + newImages.length}/5)
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {/* Existing Images */}
              {portfolioImages.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-slate-700 mb-3">Current Images</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {portfolioImages.map((img) => (
                      <div key={img.image_id} className="relative group">
                        <img
                          src={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${img.url}`}
                          alt="Portfolio"
                          className="w-full h-32 object-cover rounded-lg border border-slate-200"
                        />
                        <button
                          type="button"
                          onClick={() => handleImageDelete(img.image_id)}
                          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Images Preview */}
              {newImages.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-slate-700 mb-3">New Images (will be uploaded on save)</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {newImages.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={imageUrls[index]}
                          alt="New"
                          className="w-full h-32 object-cover rounded-lg border border-slate-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload New Images */}
              {portfolioImages.length + newImages.length < 5 && (
                <div>
                  <label className="block">
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors cursor-pointer">
                      <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-600 mb-1">Click to upload new images</p>
                      <p className="text-xs text-slate-500">PNG, JPG, WEBP up to 5MB</p>
                    </div>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      multiple
                      onChange={handleNewImages}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-6 py-2.5 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-100 transition-colors"
              disabled={saving}
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
}
