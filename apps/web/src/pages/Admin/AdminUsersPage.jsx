import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { APICore } from "@/helpers/apiCore";
import { Users, Filter, Search, Shield, UserPlus, X } from "lucide-react";
import { toast } from "sonner";

export default function AdminUsersPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [roleCounts, setRoleCounts] = useState({ all: 0, admin: 0, freelancer: 0, client: 0 });
  const [roleFilter, setRoleFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [promoting, setPromoting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    try {
      const api = new APICore();
      const params = roleFilter === "all" ? "" : `?role=${roleFilter}`;
      const response = await api.get(`/api/users/admin/all${params}`);
      setUsers(response.data.users || []);
      setRoleCounts(response.data.counts || { all: 0, admin: 0, freelancer: 0, client: 0 });
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handlePromoteClick = (user) => {
    setSelectedUser(user);
    setShowPromoteModal(true);
  };

  const handlePromoteConfirm = async () => {
    if (!selectedUser) return;

    setPromoting(true);
    try {
      const api = new APICore();
      await api.post(`/api/users/admin/promote/${selectedUser.userID}`, {});
      toast.success(`${selectedUser.first_name} ${selectedUser.last_name} promoted to admin!`);
      setShowPromoteModal(false);
      setSelectedUser(null);
      fetchUsers(); // Refresh list
    } catch (error) {
      console.error("Error promoting user:", error);
      toast.error(error.message || "Failed to promote user");
    } finally {
      setPromoting(false);
    }
  };

  const getRoleBadges = (roles) => {
    const badgeColors = {
      admin: "bg-purple-100 text-purple-700 border-purple-200",
      freelancer: "bg-blue-100 text-blue-700 border-blue-200",
      client: "bg-green-100 text-green-700 border-green-200",
    };

    return roles.map((role) => (
      <span
        key={role}
        className={`px-2 py-1 rounded-full text-xs font-medium border ${badgeColors[role]}`}
      >
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    ));
  };

  const filteredUsers = users.filter((user) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      user.first_name.toLowerCase().includes(searchLower) ||
      user.last_name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower)
    );
  });



  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-purple-50 to-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">User Management</h1>
          <p className="text-slate-600">Manage platform users and permissions</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <Filter className="h-5 w-5 text-slate-400 flex-shrink-0" />
            {[
              { key: "all", label: "All Users" },
              { key: "admin", label: "Admins" },
              { key: "freelancer", label: "Freelancers" },
              { key: "client", label: "Clients" },
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setRoleFilter(filter.key)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  roleFilter === filter.key
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
                }`}
              >
                {filter.label}
                {roleCounts[filter.key] > 0 && (
                  <span className="ml-2 text-sm opacity-75">({roleCounts[filter.key]})</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Users List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-slate-600">Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Users Found</h3>
            <p className="text-slate-600">
              {searchQuery ? "No users match your search" : "No users in this category"}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Roles
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredUsers.map((user) => (
                  <tr key={user.userID} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="text-indigo-600 font-semibold">
                            {user.first_name[0]}
                            {user.last_name[0]}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-900">
                            {user.first_name} {user.last_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-600">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">{getRoleBadges(user.roles)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-600">
                        {new Date(user.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {!user.roles.includes("admin") ? (
                        <button
                          onClick={() => handlePromoteClick(user)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          <Shield className="h-4 w-4" />
                          Promote to Admin
                        </button>
                      ) : (
                        <span className="text-sm text-slate-400">Administrator</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Promote to Admin Modal */}
      {showPromoteModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900">Promote to Administrator</h3>
              <button
                onClick={() => setShowPromoteModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg mb-4">
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <span className="text-purple-600 font-semibold text-lg">
                    {selectedUser.first_name[0]}
                    {selectedUser.last_name[0]}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">
                    {selectedUser.first_name} {selectedUser.last_name}
                  </p>
                  <p className="text-sm text-slate-600">{selectedUser.email}</p>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Warning:</strong> This will grant full administrator privileges to this
                  user, including:
                </p>
                <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside space-y-1">
                  <li>Access to all disputes and orders</li>
                  <li>Ability to manage users</li>
                  <li>Full platform access (admin, client, freelancer roles)</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPromoteModal(false)}
                disabled={promoting}
                className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handlePromoteConfirm}
                disabled={promoting}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {promoting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Promoting...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4" />
                    Confirm Promotion
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
