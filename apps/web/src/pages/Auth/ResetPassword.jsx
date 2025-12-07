import { useState, useEffect } from "react"
import { Link, useSearchParams, useNavigate, Navigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff, X, Check, Lock } from "lucide-react"
import useResetPassword from "@/hooks/auth/useResetPassword"
import { useAuth } from "@/contexts/AuthContext"

export default function ResetPasswordPage() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get("token")
  
  const { resetPassword, error: resetError, success, isLoading } = useResetPassword()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  })

  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/home" replace />
  }

  // Redirect if no token
  if (!token) {
    return <Navigate to="/auth/forgot-password" replace />
  }

  const validatePassword = (password) => {
    if (password.length < 8) return "Password must be at least 8 characters"
    return ""
  }

  const validateConfirmPassword = (confirmPassword) => {
    if (confirmPassword !== formData.password) return "Passwords do not match"
    return ""
  }

  const validateField = (name, value) => {
    switch (name) {
      case "password":
        return validatePassword(value)
      case "confirmPassword":
        return validateConfirmPassword(value)
      default:
        return ""
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }))
    }
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }))
  }

  const isFormValid = () => {
    return (
      formData.password.length >= 8 &&
      formData.password === formData.confirmPassword
    )
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const newTouched = {
      password: true,
      confirmPassword: true,
    }
    setTouched(newTouched)

    const newErrors = {
      password: validateField("password", formData.password),
      confirmPassword: validateField("confirmPassword", formData.confirmPassword),
    }
    setErrors(newErrors)

    if (Object.values(newErrors).every((error) => !error)) {
      try {
        await resetPassword({ token, password: formData.password })
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
          {/* Logo */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <span className="text-2xl font-bold text-white">F</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                FiveMarket
              </span>
            </div>
            <h1 className="text-2xl font-semibold text-slate-900 mb-1 text-balance">
              {success ? "Password reset successful!" : "Reset your password"}
            </h1>
            <p className="text-sm text-slate-600">
              {success ? "You can now log in with your new password" : "Enter your new password below"}
            </p>
          </div>

          {success ? (
            // Success State
            <div className="space-y-4">
              <div className="bg-green-100 border-2 border-green-300 rounded-lg p-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                    <Check className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-green-900 mb-1">Password updated!</p>
                    <p className="text-sm text-green-800">
                      Your password has been successfully reset. You can now log in with your new password.
                    </p>
                  </div>
                </div>
              </div>

              <Link to="/auth/login" className="block">
                <Button className="w-full text-base h-10 btn-gradient text-white font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-300">
                  Continue to login
                </Button>
              </Link>
            </div>
          ) : (
            // Form State
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Error Alert */}
              {resetError && (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600 flex items-center gap-2">
                    <X className="h-4 w-4" />
                    {resetError}
                  </p>
                </div>
              )}

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-slate-900 mb-1">
                  New Password
                </label>
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
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && touched.password && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <X className="h-4 w-4" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-900 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-2 pr-12 rounded-lg border-2 transition-all duration-200 focus:outline-none ${
                      errors.confirmPassword && touched.confirmPassword
                        ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                        : "border-slate-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.confirmPassword && touched.confirmPassword && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <X className="h-4 w-4" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full text-base h-10 btn-gradient text-white font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-300 cursor-pointer"
                disabled={!isFormValid() || isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Resetting password...
                  </>
                ) : (
                  "Reset password"
                )}
              </Button>

              <div className="text-center">
                <Link to="/auth/login" className="text-sm text-indigo-600 hover:text-indigo-700 hover:underline font-semibold">
                  ← Back to login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Marketing Section */}
      <div className="hidden lg:flex lg:w-1/2 lg:fixed lg:right-0 lg:top-0 lg:h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 text-white p-12 flex-col justify-center items-center relative overflow-hidden">
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

          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <Lock className="h-10 w-10 text-white" />
          </div>

          <h2 className="text-4xl font-semibold mb-4 text-balance leading-tight">
            Secure password reset
          </h2>
          <p className="text-lg text-white/90 mb-8 leading-relaxed">
            Your security is our priority. Reset your password securely and get back to work.
          </p>

          <div className="bg-white/15 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-2xl">
            <div className="space-y-4 text-left">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center flex-shrink-0">
                  <Check className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white mb-1">Encrypted Connection</p>
                  <p className="text-xs text-white/80">Your data is protected with industry-standard encryption</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center flex-shrink-0">
                  <Check className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white mb-1">One-Time Token</p>
                  <p className="text-xs text-white/80">Reset links expire after 1 hour for security</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center flex-shrink-0">
                  <Check className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white mb-1">Instant Access</p>
                  <p className="text-xs text-white/80">Log in immediately after resetting your password</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
