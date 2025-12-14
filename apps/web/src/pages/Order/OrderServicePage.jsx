import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { APICore } from "@/helpers/apiCore";
import { Package, Plus, Minus, ShoppingCart, Clock, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function OrderServicePage() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Service data
  const [service, setService] = useState(null);
  const [packages, setPackages] = useState([]);
  const [addons, setAddons] = useState([]);
  
  // Order form
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedAddons, setSelectedAddons] = useState({}); // { addon_id: quantity }
  const [projectDetails, setProjectDetails] = useState("");
  
  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState("input"); // input, processing, success, summary
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVC, setCardCVC] = useState("");
  const [createdOrder, setCreatedOrder] = useState(null);

  useEffect(() => {
    fetchServiceDetails();
  }, [serviceId]);

  const fetchServiceDetails = async () => {
    try {
      const api = new APICore();
      const response = await api.get(`/api/services/${serviceId}`);
      
      setService(response.data);
      setPackages(response.data.packages || []);
      
      // Fetch add-ons for this service
      const addonsResponse = await api.get(`/api/services/${serviceId}/addons`);
      setAddons(addonsResponse.data.addons || []);
      
      // Auto-select first package
      if (response.data.packages && response.data.packages.length > 0) {
        setSelectedPackage(response.data.packages[0]);
      }
    } catch (error) {
      console.error("Error fetching service:", error);
      toast.error("Failed to load service details");
      navigate("/browse");
    } finally {
      setLoading(false);
    }
  };

  const toggleAddon = (addonId) => {
    setSelectedAddons(prev => {
      const newAddons = { ...prev };
      if (newAddons[addonId]) {
        delete newAddons[addonId];
      } else {
        newAddons[addonId] = 1;
      }
      return newAddons;
    });
  };

  const updateAddonQuantity = (addonId, delta) => {
    setSelectedAddons(prev => {
      const newAddons = { ...prev };
      const newQuantity = (newAddons[addonId] || 0) + delta;
      
      if (newQuantity <= 0) {
        delete newAddons[addonId];
      } else {
        newAddons[addonId] = newQuantity;
      }
      
      return newAddons;
    });
  };

  const calculateTotal = () => {
    if (!selectedPackage) return 0;
    
    let total = parseFloat(selectedPackage.price);
    
    // Add addon prices
    Object.entries(selectedAddons).forEach(([addonId, quantity]) => {
      // Ensure both are numbers for comparison
      const numericAddonId = parseInt(addonId);
      const addon = addons.find(a => parseInt(a.addon_id) === numericAddonId);
      
      if (addon) {
        const addonPrice = parseFloat(addon.price) * quantity;
        total += addonPrice;
      }
    });
    
    return total.toFixed(2);
  };

  const calculateDeliveryTime = () => {
    if (!selectedPackage) return 0;
    
    let days = parseInt(selectedPackage.delivery_time);
    
    // Add addon delivery impacts
    Object.entries(selectedAddons).forEach(([addonId, quantity]) => {
      const numericAddonId = parseInt(addonId);
      const addon = addons.find(a => parseInt(a.addon_id) === numericAddonId);
      
      if (addon) {
        const impact = parseInt(addon.delivery_days) * quantity;
        days += impact;
      }
    });
    
    return Math.max(1, days); // Minimum 1 day
  };

  const handleInitiateOrder = () => {
    if (!selectedPackage) {
      toast.error("Please select a package");
      return;
    }

    if (!projectDetails.trim()) {
      toast.error("Please provide project details");
      return;
    }

    // Show payment modal
    setShowPaymentModal(true);
    setPaymentStep("input");
  };

  const handleProcessPayment = async () => {
    // Validate card inputs
    if (!cardNumber || cardNumber.length < 16) {
      toast.error("Please enter a valid card number");
      return;
    }
    if (!cardExpiry || cardExpiry.length < 5) {
      toast.error("Please enter a valid expiry date");
      return;
    }
    if (!cardCVC || cardCVC.length < 3) {
      toast.error("Please enter a valid CVC");
      return;
    }

    // Show processing state
    setPaymentStep("processing");

    // Simulate payment processing (1 second)
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create the order
    try {
      const api = new APICore();
      const response = await api.post("/api/orders", {
        package_id: selectedPackage.package_id,
        project_details: projectDetails,
        addon_selections: Object.entries(selectedAddons).map(([addon_id, quantity]) => ({
          addon_id: parseInt(addon_id),
          quantity
        })),
        // Mock payment info (for transaction record)
        payment_method: "card",
        card_last4: cardNumber.slice(-4)
      });

      setCreatedOrder(response.data);
      setPaymentStep("success");
      
      // Auto-advance to summary after 2 seconds
      setTimeout(() => {
        setPaymentStep("summary");
      }, 2000);
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error(error.response?.data?.message || "Failed to create order");
      setPaymentStep("input");
    }
  };

  const handleCloseModal = () => {
    if (createdOrder) {
      // Navigate to browse or orders page
      navigate("/browse");
      toast.success("Order placed successfully!");
    }
    setShowPaymentModal(false);
    setPaymentStep("input");
    setCardNumber("");
    setCardExpiry("");
    setCardCVC("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-purple-50 to-white">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading service...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!service) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-purple-50 to-white">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{service.title}</h1>
          <p className="text-slate-600">{service.description}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Package Selection & Add-ons */}
          <div className="lg:col-span-2 space-y-6">
            {/* Package Selection */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Package className="h-5 w-5 text-indigo-600" />
                Select a Package
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                {packages.map((pkg) => (
                  <div
                    key={pkg.package_id}
                    onClick={() => setSelectedPackage(pkg)}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      selectedPackage?.package_id === pkg.package_id
                        ? "border-indigo-600 bg-indigo-50"
                        : "border-slate-200 hover:border-indigo-300"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-slate-900">{pkg.name}</h3>
                      <span className="text-lg font-bold text-indigo-600">${pkg.price}</span>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">{pkg.description}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {pkg.delivery_time} days
                      </span>
                      <span className="flex items-center gap-1">
                        <RefreshCw className="h-3 w-3" />
                        {pkg.revisions_allowed} revisions
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add-ons */}
            {addons.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">
                  Optional Add-ons
                </h2>

                <div className="space-y-3">
                  {addons.map((addon) => (
                    <div
                      key={addon.addon_id}
                      className={`border rounded-lg p-4 transition-all ${
                        selectedAddons[addon.addon_id]
                          ? "border-indigo-600 bg-indigo-50"
                          : "border-slate-200"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <input
                              type="checkbox"
                              checked={!!selectedAddons[addon.addon_id]}
                              onChange={() => toggleAddon(addon.addon_id)}
                              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                            />
                            <h3 className="font-medium text-slate-900">{addon.name}</h3>
                            <span className="text-sm font-semibold text-indigo-600">
                              +${addon.price}
                            </span>
                          </div>
                          {addon.description && (
                            <p className="text-sm text-slate-600 ml-6">{addon.description}</p>
                          )}
                          {addon.delivery_days !== 0 && (
                            <p className="text-xs text-slate-500 ml-6 mt-1">
                              {addon.delivery_days > 0 ? '+' : ''}{addon.delivery_days} days
                            </p>
                          )}
                        </div>

                        {selectedAddons[addon.addon_id] && (
                          <div className="flex items-center gap-2 ml-4">
                            <button
                              onClick={() => updateAddonQuantity(addon.addon_id, -1)}
                              className="w-6 h-6 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-6 text-center font-medium">
                              {selectedAddons[addon.addon_id]}
                            </span>
                            <button
                              onClick={() => updateAddonQuantity(addon.addon_id, 1)}
                              className="w-6 h-6 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Project Details */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                Project Details
              </h2>
              <textarea
                value={projectDetails}
                onChange={(e) => setProjectDetails(e.target.value)}
                placeholder="Describe your project requirements, goals, and any specific details the freelancer should know..."
                rows={6}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <p className="text-sm text-slate-500 mt-2">
                Be as detailed as possible to help the freelancer understand your needs
              </p>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-slate-200 p-6 sticky top-4">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Order Summary</h2>

              <div className="space-y-3 mb-4">
                {selectedPackage && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">{selectedPackage.name} Package</span>
                    <span className="font-medium">${selectedPackage.price}</span>
                  </div>
                )}

                {Object.entries(selectedAddons).map(([addonId, quantity]) => {
                  const addon = addons.find(a => a.addon_id === parseInt(addonId));
                  if (!addon) return null;
                  return (
                    <div key={addonId} className="flex justify-between text-sm">
                      <span className="text-slate-600">
                        {addon.name} x{quantity}
                      </span>
                      <span className="font-medium">
                        ${(parseFloat(addon.price) * quantity).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-slate-200 pt-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-slate-900">Total</span>
                  <span className="text-2xl font-bold text-indigo-600">${calculateTotal()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Clock className="h-4 w-4" />
                  <span>Delivery in {calculateDeliveryTime()} days</span>
                </div>
              </div>

              <button
                onClick={handleInitiateOrder}
                disabled={submitting || !selectedPackage || !projectDetails.trim()}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingCart className="h-5 w-5" />
                {submitting ? "Processing..." : "Place Order"}
              </button>

              <p className="text-xs text-slate-500 text-center mt-3">
                You'll be able to communicate with the freelancer after placing the order
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 relative">
            {/* Payment Input Step */}
            {paymentStep === "input" && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Payment Details</h2>
                  <p className="text-slate-600">Total: ${calculateTotal()}</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, '');
                          if (value.length >= 2) {
                            value = value.slice(0, 2) + '/' + value.slice(2, 4);
                          }
                          setCardExpiry(value.slice(0, 5));
                        }}
                        placeholder="MM/YY"
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        CVC
                      </label>
                      <input
                        type="text"
                        value={cardCVC}
                        onChange={(e) => setCardCVC(e.target.value.replace(/\D/g, '').slice(0, 3))}
                        placeholder="123"
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleProcessPayment}
                    className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                  >
                    Pay ${calculateTotal()}
                  </button>
                </div>
              </div>
            )}

            {/* Processing Step */}
            {paymentStep === "processing" && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Processing Payment...</h3>
                <p className="text-slate-600">Please wait while we process your payment</p>
              </div>
            )}

            {/* Success Step */}
            {paymentStep === "success" && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Payment Successful!</h3>
                <p className="text-slate-600">Your order has been placed</p>
              </div>
            )}

            {/* Order Summary Step */}
            {paymentStep === "summary" && createdOrder && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Order Placed!</h2>
                  <p className="text-slate-600">Order #{createdOrder.order_id}</p>
                </div>

                <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Total Paid</span>
                    <span className="font-semibold text-slate-900">${createdOrder.total_price}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Delivery</span>
                    <span className="font-semibold text-slate-900">
                      {new Date(createdOrder.due_time).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCloseModal}
                  className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                >
                  Continue
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
