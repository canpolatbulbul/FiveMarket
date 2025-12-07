import { useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Shield, Star, Sparkles, Zap, Users, Eye, EyeOff, Check, X } from "lucide-react"
import useRegister from "@/hooks/auth/useRegister"

export default function RegisterPage() {
  const { user, register: register, error: registerError, isLoading: registerLoading } = useRegister()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  })

  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const getPasswordStrength = (password) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (password.length >= 12) strength++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[^a-zA-Z0-9]/.test(password)) strength++
    return strength
  }

  const getPasswordStrengthLabel = (strength) => {
    if (strength === 0) return { label: "Too weak", color: "text-red-500" }
    if (strength <= 2) return { label: "Weak", color: "text-orange-500" }
    if (strength <= 3) return { label: "Medium", color: "text-yellow-500" }
    if (strength <= 4) return { label: "Strong", color: "text-green-500" }
    return { label: "Very strong", color: "text-emerald-500" }
  }

  const passwordStrength = getPasswordStrength(formData.password)
  const passwordStrengthInfo = getPasswordStrengthLabel(passwordStrength)

  const validateField = (name, value) => {
    switch (name) {
      case "first_name":
        return value.trim().length < 2 ? "First name must be at least 2 characters" : ""
      case "last_name":
        return value.trim().length < 2 ? "Last name must be at least 2 characters" : ""
      case "email":
        return !validateEmail(value) ? "Please enter a valid email address" : ""
      case "password":
        return value.length < 8 ? "Password must be at least 8 characters" : ""
      case "confirmPassword":
        return value !== formData.password ? "Passwords do not match" : ""
      case "agreeToTerms":
        return !value ? "You must agree to the terms and conditions" : ""
      default:
        return ""
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    const fieldValue = type === "checkbox" ? checked : value

    setFormData((prev) => ({ ...prev, [name]: fieldValue }))

    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, fieldValue) }))
    }

    // Special handling for password fields - validate confirmPassword when password changes
    if (name === "password" && touched.confirmPassword && formData.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: fieldValue !== formData.confirmPassword ? "Passwords do not match" : "",
      }))
    }
    
    // Only validate confirmPassword if password field has content
    if (name === "confirmPassword" && formData.password) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: validateField("confirmPassword", fieldValue),
      }))
    }
  }

  const handleBlur = (e) => {
    const { name, value, type, checked } = e.target
    const fieldValue = type === "checkbox" ? checked : value

    setTouched((prev) => ({ ...prev, [name]: true }))
    setErrors((prev) => ({ ...prev, [name]: validateField(name, fieldValue) }))
  }

  const isFormValid = () => {
    return (
      formData.first_name.trim().length >= 2 &&
      formData.last_name.trim().length >= 2 &&
      validateEmail(formData.email) &&
      formData.password.length >= 8 &&
      formData.password === formData.confirmPassword &&
      formData.agreeToTerms
    )
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const newTouched = {
      first_name: true,
      last_name: true,
      email: true,
      password: true,
      confirmPassword: true,
      agreeToTerms: true,
    }
    setTouched(newTouched)

    const newErrors = {
      first_name: validateField("first_name", formData.first_name),
      last_name: validateField("last_name", formData.last_name),
      email: validateField("email", formData.email),
      password: validateField("password", formData.password),
      confirmPassword: validateField("confirmPassword", formData.confirmPassword),
      agreeToTerms: validateField("agreeToTerms", formData.agreeToTerms),
    }
    setErrors(newErrors)

    if (Object.values(newErrors).every((error) => !error)) {
      try {
        await register({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          password: formData.password,
        })
        // Success! User is now logged in and redirected
      } catch (err) {
        // Error is handled by the hook
      }
    }
  }

  if(user){
    return <Navigate to="/home" replace/>;
  }
  
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-white via-purple-50/30 to-indigo-50/50">
      {/* Form Section */}
      <div className="w-full lg:w-1/2 lg:fixed lg:left-0 lg:top-0 lg:h-screen flex items-start justify-center p-4 lg:p-8 lg:pt-16 relative lg:overflow-y-auto">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, rgb(99 102 241) 1px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <div className="w-full max-w-md relative z-10">
          {/* Colorful logo with gradient */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <span className="text-2xl font-bold text-white">F</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                FiveMarket
              </span>
            </div>
            <h1 className="text-2xl font-semibold text-slate-900 mb-1 text-balance">Create your account</h1>
            <p className="text-sm text-slate-600">Join FiveMarket and start hiring today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Error Alert */}
            {registerError && (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600 flex items-center gap-2">
                  <X className="h-4 w-4" />
                  {registerError}
                </p>
              </div>
            )}

            {/* First Name */}
            <div>
              <label htmlFor="first_name" className="block text-sm font-semibold text-slate-900 mb-1">
                First Name
              </label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-4 py-2.5 rounded-lg border-2 transition-all duration-200 focus:outline-none ${
                  errors.first_name && touched.first_name
                    ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                    : "border-slate-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                }`}
                placeholder="John"
                aria-invalid={errors.first_name && touched.first_name ? "true" : "false"}
                aria-describedby={errors.first_name && touched.first_name ? "first_name-error" : undefined}
              />
              {errors.first_name && touched.first_name && (
                <p id="first_name-error" className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <X className="h-4 w-4" />
                  {errors.first_name}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="last_name" className="block text-sm font-semibold text-slate-900 mb-1">
                Last Name
              </label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-4 py-2.5 rounded-lg border-2 transition-all duration-200 focus:outline-none ${
                  errors.last_name && touched.last_name
                    ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                    : "border-slate-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                }`}
                placeholder="Doe"
                aria-invalid={errors.last_name && touched.last_name ? "true" : "false"}
                aria-describedby={errors.last_name && touched.last_name ? "last_name-error" : undefined}
              />
              {errors.last_name && touched.last_name && (
                <p id="last_name-error" className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <X className="h-4 w-4" />
                  {errors.last_name}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-900 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-4 py-2 rounded-lg border-2 transition-all duration-200 focus:outline-none ${
                  errors.email && touched.email
                    ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                    : "border-slate-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                }`}
                placeholder="john@example.com"
                aria-invalid={errors.email && touched.email ? "true" : "false"}
                aria-describedby={errors.email && touched.email ? "email-error" : undefined}
              />
              {errors.email && touched.email && (
                <p id="email-error" className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <X className="h-4 w-4" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-900 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-2.5 pr-12 rounded-lg border-2 transition-all duration-200 focus:outline-none ${
                    errors.password && touched.password
                      ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                      : "border-slate-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                  }`}
                  placeholder="••••••••"
                  aria-invalid={errors.password && touched.password ? "true" : "false"}
                  aria-describedby={errors.password && touched.password ? "password-error" : "password-strength"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {formData.password && (
                <div id="password-strength" className="mt-1.5">
                  <div className="flex gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                          i < passwordStrength
                            ? i < 2
                              ? "bg-red-500"
                              : i < 3
                                ? "bg-yellow-500"
                                : i < 4
                                  ? "bg-green-500"
                                  : "bg-emerald-500"
                            : "bg-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-sm font-semibold ${passwordStrengthInfo.color}`}>{passwordStrengthInfo.label}</p>
                </div>
              )}
              {errors.password && touched.password && (
                <p id="password-error" className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <X className="h-4 w-4" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-900 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-2.5 pr-12 rounded-lg border-2 transition-all duration-200 focus:outline-none ${
                    errors.confirmPassword && touched.confirmPassword
                      ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                      : "border-slate-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                  }`}
                  placeholder="••••••••"
                  aria-invalid={errors.confirmPassword && touched.confirmPassword ? "true" : "false"}
                  aria-describedby={
                    errors.confirmPassword && touched.confirmPassword ? "confirmPassword-error" : undefined
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {formData.confirmPassword && !errors.confirmPassword && (
                <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                  <Check className="h-4 w-4" />
                  Passwords match
                </p>
              )}
              {errors.confirmPassword && touched.confirmPassword && (
                <p id="confirmPassword-error" className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <X className="h-4 w-4" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="agreeToTerms"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                onBlur={handleBlur}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 cursor-pointer"
                aria-invalid={errors.agreeToTerms && touched.agreeToTerms ? "true" : "false"}
                aria-describedby={errors.agreeToTerms && touched.agreeToTerms ? "agreeToTerms-error" : undefined}
              />
              <label htmlFor="agreeToTerms" className="text-sm text-slate-600 cursor-pointer">
                {"I agree to the "}
                <Link to="/legal/terms" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-700 hover:underline font-semibold">
                  Terms and Conditions
                </Link>
                {" and "}
                <Link to="/legal/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-700 hover:underline font-semibold">
                  Privacy Policy
                </Link>
              </label>
            </div>
            {errors.agreeToTerms && touched.agreeToTerms && (
              <p id="agreeToTerms-error" className="text-sm text-red-600 flex items-center gap-1">
                <X className="h-4 w-4" />
                {errors.agreeToTerms}
              </p>
            )}

            <Button
              type="submit"
              className="w-full text-base h-10 btn-gradient text-white font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-300 cursor-pointer"
              disabled={!isFormValid() || registerLoading}
            >
              {registerLoading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Creating account...
                </>
              ) : (
                <>
                  Create account
                  <Sparkles className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-600 mt-6">
            {"Already have an account? "}
            <Link to="/auth/login" className="text-indigo-600 hover:text-indigo-700 hover:underline font-semibold">
              Log in
            </Link>
          </p>
        </div>
      </div>

      {/* Marketing Section */}
      <div className="hidden lg:flex lg:w-1/2 lg:fixed lg:right-0 lg:top-0 lg:h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 text-white p-12 flex-col justify-center items-center relative overflow-hidden">
        {/* Animated gradient orbs for visual interest */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div
          className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"
          style={{ animationDelay: "1s" }}
        />

        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-10 w-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/30">
              <span className="text-2xl font-bold">F</span>
            </div>
            <span className="text-2xl font-semibold">FiveMarket</span>
          </div>

          <div className="max-w-lg">
            <h2 className="text-4xl font-semibold mb-4 text-balance leading-tight">
              Start hiring talented freelancers today
            </h2>
            <p className="text-lg text-white/90 mb-10 leading-relaxed">
              {"Join thousands of clients finding the perfect freelancer for their projects"}
            </p>

            <div className="space-y-6">
              {/* Colorful icon backgrounds with cyan accent */}
              <div className="flex items-start gap-4 group">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/30 group-hover:scale-110 transition-transform duration-300">
                  <Star className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-semibold mb-1">Access to skilled professionals</h3>
                  <p className="text-sm text-white/80 leading-relaxed">
                    {"Connect with top-rated freelancers across all industries"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-semibold mb-1">Secure payments and contracts</h3>
                  <p className="text-sm text-white/80 leading-relaxed">
                    {"Protected transactions with escrow and milestone payments"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-semibold mb-1">Lightning-fast matching</h3>
                  <p className="text-sm text-white/80 leading-relaxed">
                    {"Get matched with the perfect freelancer in minutes, not days"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-semibold mb-1">Trusted community</h3>
                  <p className="text-sm text-white/80 leading-relaxed">
                    {"Join 50,000+ satisfied clients building amazing projects"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-8">
          <div className="bg-white/15 backdrop-blur-md rounded-xl p-4 border border-white/20 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center flex-shrink-0 text-lg font-bold shadow-lg">
                S
              </div>
              <div>
                <p className="text-sm text-white/95 leading-relaxed italic mb-2">
                  "
                  {
                    "FiveMarket made it incredibly easy to find the right developer for our project. The quality of work exceeded our expectations."
                  }
                  "
                </p>
                <p className="text-xs font-semibold text-white">Sarah Johnson</p>
                <p className="text-xs text-white/70">CEO, TechStart Inc.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
