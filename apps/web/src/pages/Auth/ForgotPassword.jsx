import { useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { X, Check, Mail } from "lucide-react"
import useForgotPassword from "@/hooks/auth/useForgotPassword"

export default function ForgotPasswordPage() {
  const { forgotPassword, error: forgotPasswordError, success, isLoading, reset } = useForgotPassword()
  const [email, setEmail] = useState("")
  const [touched, setTouched] = useState(false)

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const error = touched && !validateEmail(email) ? "Please enter a valid email address" : ""

  const handleSubmit = async (event) => {
    event.preventDefault()
    setTouched(true)

    if (validateEmail(email)) {
      try {
        await forgotPassword({ email })
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
            <h1 className="text-2xl font-semibold text-slate-900 mb-1 text-balance">Forgot your password?</h1>
            <p className="text-sm text-slate-600">
              {success 
                ? "Check your email for reset instructions" 
                : "No worries! Enter your email and we'll send you reset instructions"}
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
                    <p className="text-sm font-semibold text-green-900 mb-1">Email sent successfully!</p>
                    <p className="text-sm text-green-800">
                      We've sent password reset instructions to <strong className="text-green-900">{email}</strong>
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-10">
                    <p className="text-sm font-semibold text-blue-900 mb-2">What's next?</p>
                    <ul className="space-y-1.5 text-sm text-blue-800">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>Check your inbox (and spam folder)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>Click the reset link in the email</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>Create a new password</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={reset}
                  className="flex-1 text-base h-10 bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold transition-all duration-300"
                >
                  Send again
                </Button>
                <Link to="/auth/login" className="flex-1">
                  <Button className="w-full text-base h-10 btn-gradient text-white font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-300">
                    Back to login
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            // Form State
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error Alert */}
              {forgotPasswordError && (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600 flex items-center gap-2">
                    <X className="h-4 w-4" />
                    {forgotPasswordError}
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched(true)}
                  className={`w-full px-4 py-2 rounded-lg border-2 transition-all duration-200 focus:outline-none ${
                    error
                      ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                      : "border-slate-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                  }`}
                  placeholder="john@example.com"
                  aria-invalid={error ? "true" : "false"}
                  aria-describedby={error ? "email-error" : undefined}
                />
                {error && (
                  <p id="email-error" className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <X className="h-4 w-4" />
                    {error}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full text-base h-10 btn-gradient text-white font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-300 cursor-pointer"
                disabled={!validateEmail(email) || isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Sending...
                  </>
                ) : (
                  "Send reset link"
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
        {/* Animated gradient orbs */}
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
            <Mail className="h-10 w-10 text-white" />
          </div>

          <h2 className="text-4xl font-semibold mb-4 text-balance leading-tight">
            We've got you covered
          </h2>
          <p className="text-lg text-white/90 mb-8 leading-relaxed">
            Password resets are quick and secure. You'll be back to work in no time.
          </p>

          <div className="bg-white/15 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-2xl">
            <div className="space-y-4 text-left">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center flex-shrink-0">
                  <Check className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white mb-1">Secure Process</p>
                  <p className="text-xs text-white/80">Your reset link expires in 1 hour for security</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center flex-shrink-0">
                  <Check className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white mb-1">Fast Delivery</p>
                  <p className="text-xs text-white/80">Reset emails arrive within seconds</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center flex-shrink-0">
                  <Check className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white mb-1">Always Available</p>
                  <p className="text-xs text-white/80">24/7 support if you need help</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
