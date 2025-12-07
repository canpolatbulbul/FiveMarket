import { useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff, X } from "lucide-react"
import useLogin from "@/hooks/useLogin"

export default function LoginPage() {
  const { login, error: loginError, isLoading: loginLoading } = useLogin()
  const [showPassword, setShowPassword] = useState(false)

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })

  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const validateField = (name, value) => {
    switch (name) {
      case "email":
        return !validateEmail(value) ? "Please enter a valid email address" : ""
      case "password":
        return value.length < 1 ? "Password is required" : ""
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
  }

  const handleBlur = (e) => {
    const { name, value } = e.target

    setTouched((prev) => ({ ...prev, [name]: true }))
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }))
  }

  const isFormValid = () => {
    return validateEmail(formData.email) && formData.password.length > 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const newTouched = {
      email: true,
      password: true,
    }
    setTouched(newTouched)

    const newErrors = {
      email: validateField("email", formData.email),
      password: validateField("password", formData.password),
    }
    setErrors(newErrors)

    if (Object.values(newErrors).every((error) => !error)) {
      try {
        await login({
          email: formData.email,
          password: formData.password,
        })
        // Success! User is now logged in and redirected
      } catch (err) {
        // Error is handled by the hook
      }
    }
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-white via-purple-50/30 to-indigo-50/50">
      {/* Form Section */}
      <div className="w-full lg:w-1/2 lg:fixed lg:left-0 lg:top-0 lg:h-screen flex items-center justify-center p-4 lg:p-8 relative lg:overflow-y-auto">
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
            <h1 className="text-2xl font-semibold text-slate-900 mb-1 text-balance">Welcome back</h1>
            <p className="text-sm text-slate-600">Log in to your FiveMarket account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Error Alert */}
            {loginError && (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600 flex items-center gap-2">
                  <X className="h-4 w-4" />
                  {loginError}
                </p>
              </div>
            )}

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
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block text-sm font-semibold text-slate-900">
                  Password
                </label>
                <Link to="/auth/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-700 hover:underline font-semibold">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-2 pr-12 rounded-lg border-2 transition-all duration-200 focus:outline-none ${
                    errors.password && touched.password
                      ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                      : "border-slate-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                  }`}
                  placeholder="••••••••"
                  aria-invalid={errors.password && touched.password ? "true" : "false"}
                  aria-describedby={errors.password && touched.password ? "password-error" : undefined}
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
              {errors.password && touched.password && (
                <p id="password-error" className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <X className="h-4 w-4" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 cursor-pointer"
              />
              <label htmlFor="rememberMe" className="text-sm text-slate-600 cursor-pointer">
                Remember me
              </label>
            </div>

            <Button
              type="submit"
              className="w-full text-base h-10 btn-gradient text-white font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-300 cursor-pointer"
              disabled={!isFormValid() || loginLoading}
            >
              {loginLoading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Logging in...
                </>
              ) : (
                "Log in"
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-600 mt-6">
            {"Don't have an account? "}
            <Link to="/auth/register" className="text-indigo-600 hover:text-indigo-700 hover:underline font-semibold">
              Sign up
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

        <div className="relative z-10 text-center max-w-lg">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-10 w-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/30">
              <span className="text-2xl font-bold">F</span>
            </div>
            <span className="text-2xl font-semibold">FiveMarket</span>
          </div>

          <h2 className="text-4xl font-semibold mb-4 text-balance leading-tight">
            Continue your journey
          </h2>
          <p className="text-lg text-white/90 mb-8 leading-relaxed">
            Access your dashboard, manage projects, and connect with talented professionals
          </p>

          {/* Colorful feature highlights */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:bg-white/15 transition-all">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center mx-auto mb-2 shadow-lg">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <p className="text-xs font-semibold text-white/90">Fast Access</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:bg-white/15 transition-all">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center mx-auto mb-2 shadow-lg">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <p className="text-xs font-semibold text-white/90">Secure</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:bg-white/15 transition-all">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-2 shadow-lg">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-xs font-semibold text-white/90">Reliable</p>
            </div>
          </div>

          <div className="relative z-10 mt-8">
            <div className="bg-white/15 backdrop-blur-md rounded-xl p-4 border border-white/20 shadow-2xl">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center flex-shrink-0 text-lg font-bold shadow-lg">
                  M
                </div>
                <div>
                  <p className="text-sm text-white/95 leading-relaxed italic mb-2">
                    "FiveMarket has transformed how we find and work with freelancers. The platform makes collaboration seamless."
                  </p>
                  <p className="text-xs font-semibold text-white">Michael Chen</p>
                  <p className="text-xs text-white/70">Product Manager, StartupCo</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}