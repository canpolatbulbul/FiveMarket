import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  User, FileText, Shield, 
  Search, ShoppingBag, Briefcase, 
  DollarSign, BarChart3, Users, Settings 
} from "lucide-react";
import { canActAsClient, canActAsFreelancer, Roles } from "@/helpers/roles.js";

/**
 * Dashboard Component - Reusable dashboard skeleton for all user types
 * Shows role-based quick links and user information
 */
export default function Dashboard() {
  const { user } = useAuth();

  const isClient = canActAsClient(user);
  const isFreelancer = canActAsFreelancer(user);
  const isAdmin = user?.roles?.includes(Roles.ADMIN) || user?.clearance >= 3;
  
  const primaryRole = user?.roles?.[0] || user?.role || "client";
  const displayRole = primaryRole ? primaryRole.charAt(0).toUpperCase() + primaryRole.slice(1) : "User";
  
  // Role-based quick links
  const getQuickLinks = () => {
    const links = [];
    
    // Common links for all users
    links.push({ 
      label: "Profile", 
      to: "/profile", 
      icon: User, 
      color: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" 
    });
    
    // Client-specific links
    if (isClient) {
      links.push(
        { 
          label: "Find Services", 
          to: "/services", 
          icon: Search, 
          color: "bg-blue-100 text-blue-700 hover:bg-blue-200" 
        },
        { 
          label: "My Orders", 
          to: "/orders", 
          icon: ShoppingBag, 
          color: "bg-purple-100 text-purple-700 hover:bg-purple-200" 
        }
      );
    }
    
    // Freelancer-specific links
    if (isFreelancer) {
      links.push(
        { 
          label: "My Services", 
          to: "/my-services", 
          icon: Briefcase, 
          color: "bg-indigo-100 text-indigo-700 hover:bg-indigo-200" 
        },
        { 
          label: "Earnings", 
          to: "/earnings", 
          icon: DollarSign, 
          color: "bg-green-100 text-green-700 hover:bg-green-200" 
        }
      );
    }
    
    // Admin-specific links
    if (isAdmin) {
      links.push(
        { 
          label: "Admin Panel", 
          to: "/admin", 
          icon: Settings, 
          color: "bg-red-100 text-red-700 hover:bg-red-200" 
        },
        { 
          label: "Reports", 
          to: "/admin/reports", 
          icon: BarChart3, 
          color: "bg-orange-100 text-orange-700 hover:bg-orange-200" 
        },
        { 
          label: "Users", 
          to: "/admin/users", 
          icon: Users, 
          color: "bg-pink-100 text-pink-700 hover:bg-pink-200" 
        }
      );
    }
    
    // Legal links for all users
    links.push(
      { 
        label: "Terms", 
        to: "/legal/terms", 
        icon: FileText, 
        color: "bg-amber-100 text-amber-700 hover:bg-amber-200" 
      },
      { 
        label: "Privacy", 
        to: "/legal/privacy", 
        icon: Shield, 
        color: "bg-sky-100 text-sky-700 hover:bg-sky-200" 
      }
    );
    
    return links;
  };

  const quickLinks = getQuickLinks();

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wide mb-1">
            Dashboard
          </p>
          <h2 className="text-2xl font-bold text-slate-900">
            Quick Overview
          </h2>
        </div>
        <div className="px-4 py-2 rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200">
          <p className="text-xs uppercase text-indigo-600 font-semibold mb-1">Your Role</p>
          <p className="text-lg font-bold text-indigo-700">
            {displayRole}
          </p>
        </div>
      </div>

      <div className={`grid grid-cols-1 ${quickLinks.length <= 3 ? 'md:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-3'} gap-4`}>
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.label}
              to={link.to}
              className={`p-5 rounded-xl border-2 border-slate-200 bg-white shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-4 group ${link.color}`}
            >
              <div className="h-12 w-12 rounded-lg bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                <Icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-900 mb-1">{link.label}</p>
                <p className="text-xs text-slate-600">Access {link.label.toLowerCase()}</p>
              </div>
              <span className="text-xl font-bold opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all">→</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

