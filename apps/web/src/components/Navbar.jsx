import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Search, Menu, X, ChevronDown, User, Settings, HelpCircle, LogOut, DollarSign, FileText, Shield } from "lucide-react";

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setMobileMenuOpen(false);
    }
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return "";
    const firstInitial = user.first_name?.[0] || "";
    const lastInitial = user.last_name?.[0] || "";
    return (firstInitial + lastInitial).toUpperCase();
  };

  // Check if user is freelancer
  const isFreelancer = user?.roles?.includes("freelancer");
  const isAdmin = user?.roles?.includes("admin");

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-300 shadow-sm mb-10 rounded-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
              <span className="text-lg font-bold text-white">F</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hidden sm:block">
              FiveMarket
            </span>
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search services..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 outline-none"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            </div>
            <button
              type="submit"
              className="ml-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
            >
              Search
            </button>
          </form>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/browse" className="text-slate-700 hover:text-indigo-600 font-medium transition-colors">
              Browse
            </Link>

            {user ? (
              <>
                {/* Freelancer-specific */}
                {isFreelancer && (
                  <>
                    <Link to="/my-services" className="text-slate-700 hover:text-indigo-600 font-medium transition-colors">
                      My Services
                    </Link>
                    <Link
                      to="/create-service"
                      className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
                    >
                      Create Service
                    </Link>
                  </>
                )}

                {/* Common for logged-in users */}
                <Link to="/orders" className="text-slate-700 hover:text-indigo-600 font-medium transition-colors">
                  Orders
                </Link>
                <Link to="/messages" className="text-slate-700 hover:text-indigo-600 font-medium transition-colors">
                  Messages
                </Link>

                {/* Admin */}
                {isAdmin && (
                  <Link to="/admin" className="text-slate-700 hover:text-indigo-600 font-medium transition-colors">
                    Admin
                  </Link>
                )}

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-md">
                      {getUserInitials()}
                    </div>
                    <ChevronDown className={`h-4 w-4 text-slate-600 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-20">
                        <div className="px-4 py-2 border-b border-slate-200">
                          <p className="text-sm font-semibold text-slate-900">
                            {user.first_name} {user.last_name}
                          </p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>

                        <Link
                          to="/profile"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <User className="h-4 w-4" />
                          Profile
                        </Link>

                        {isFreelancer && (
                          <>
                            <Link
                              to="/earnings"
                              className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <DollarSign className="h-4 w-4" />
                              Earnings
                            </Link>
                            <Link
                              to="/skill-tests"
                              className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <FileText className="h-4 w-4" />
                              Skill Tests
                            </Link>
                          </>
                        )}

                        <Link
                          to="/settings"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Settings className="h-4 w-4" />
                          Settings
                        </Link>

                        <Link
                          to="/support"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <HelpCircle className="h-4 w-4" />
                          Support
                        </Link>

                        <div className="border-t border-slate-200 mt-2 pt-2">
                          <Link
                            to="/auth/logout"
                            className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <LogOut className="h-4 w-4" />
                            Logout
                          </Link>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/auth/login" className="text-slate-700 hover:text-indigo-600 font-medium transition-colors">
                  Sign in
                </Link>
                <Link
                  to="/auth/register"
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors">
            {mobileMenuOpen ? <X className="h-6 w-6 text-slate-700" /> : <Menu className="h-6 w-6 text-slate-700" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <div className="px-4 py-4 space-y-4">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search services..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 outline-none"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold"
              >
                Search
              </button>
            </form>

            {/* Mobile Navigation Links */}
            <div className="space-y-2">
              <Link
                to="/browse"
                className="block px-4 py-2 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Browse
              </Link>

              {user ? (
                <>
                  {isFreelancer && (
                    <>
                      <Link
                        to="/my-services"
                        className="block px-4 py-2 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        My Services
                      </Link>
                      <Link
                        to="/create-service"
                        className="block px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold text-center"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Create Service
                      </Link>
                    </>
                  )}

                  <Link
                    to="/orders"
                    className="block px-4 py-2 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Orders
                  </Link>
                  <Link
                    to="/messages"
                    className="block px-4 py-2 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Messages
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="block px-4 py-2 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Admin
                    </Link>
                  )}

                  {/* Mobile User Menu */}
                  <div className="border-t border-slate-200 pt-4 mt-4">
                    <div className="px-4 py-2 mb-2">
                      <p className="text-sm font-semibold text-slate-900">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>

                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-4 py-2 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </Link>

                    {isFreelancer && (
                      <>
                        <Link
                          to="/earnings"
                          className="flex items-center gap-3 px-4 py-2 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <DollarSign className="h-4 w-4" />
                          Earnings
                        </Link>
                        <Link
                          to="/skill-tests"
                          className="flex items-center gap-3 px-4 py-2 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <FileText className="h-4 w-4" />
                          Skill Tests
                        </Link>
                      </>
                    )}

                    <Link
                      to="/settings"
                      className="flex items-center gap-3 px-4 py-2 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>

                    <Link
                      to="/support"
                      className="flex items-center gap-3 px-4 py-2 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <HelpCircle className="h-4 w-4" />
                      Support
                    </Link>

                    <Link
                      to="/auth/logout"
                      className="flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/auth/login"
                    className="block px-4 py-2 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/auth/register"
                    className="block px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
