import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { APICore } from "@/helpers/apiCore";
import { BookOpen, Plus, Edit, Trash2, Eye, Filter, ToggleLeft, ToggleRight, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function AdminSkillTestsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tests, setTests] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [categories, setCategories] = useState([]);
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchTests();
  }, [categoryFilter, activeFilter]);

  const fetchCategories = async () => {
    try {
      const api = new APICore();
      const response = await api.get("/api/categories");
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchTests = async () => {
    try {
      setLoading(true);
      const api = new APICore();
      const params = new URLSearchParams();
      if (categoryFilter) params.append("category_id", categoryFilter);
      if (activeFilter !== "all") params.append("is_active", activeFilter === "active");
      
      const response = await api.get(`/api/skill-tests/admin?${params.toString()}`);
      setTests(response.data.tests || []);
    } catch (error) {
      console.error("Error fetching tests:", error);
      toast.error("Failed to load skill tests");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;

    setDeleting(true);
    try {
      const api = new APICore();
      await api.delete(`/api/skill-tests/admin/${deleteModal.testId}`);
      toast.success("Skill test deleted successfully");
      setDeleteModal(null);
      fetchTests();
    } catch (error) {
      console.error("Error deleting test:", error);
      toast.error(error.message || "Failed to delete skill test");
    } finally {
      setDeleting(false);
    }
  };

  const handleActivate = async (testId) => {
    try {
      const api = new APICore();
      await api.put(`/api/skill-tests/admin/${testId}`, { is_active: true });
      toast.success("Skill test activated successfully");
      fetchTests();
    } catch (error) {
      console.error("Error activating test:", error);
      toast.error(error.message || "Failed to activate skill test");
    }
  };

  const filteredTests = tests;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading skill tests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex-1 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-indigo-600" />
              Skill Tests
            </h1>
            <p className="text-slate-600 mt-1">Manage skill certification tests</p>
          </div>
          <button
            onClick={() => navigate("/admin/skill-tests/new")}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            <Plus className="h-5 w-5" />
            Create New Test
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-slate-600" />
            <h3 className="font-semibold text-slate-900">Filters</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.category_id} value={cat.category_id}>
                    {cat.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Active Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Status
              </label>
              <div className="flex gap-2">
                {["all", "active", "inactive"].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      activeFilter === filter
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tests Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {filteredTests.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 text-lg">No skill tests found</p>
              <p className="text-slate-500 text-sm mt-1">Create your first skill test to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Title</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Category</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-slate-700">Questions</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-slate-700">Pass %</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-slate-700">Time Limit</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-slate-700">Attempts</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-slate-700">Pass Rate</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-slate-700">Status</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTests.map((test) => (
                    <tr key={test.testId} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-slate-900">{test.title}</p>
                          {test.description && (
                            <p className="text-sm text-slate-500 truncate max-w-xs">
                              {test.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600">
                          {test.categoryName || "Uncategorized"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-medium text-slate-900">{test.questionCount}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-medium text-slate-900">{test.passPercentage}%</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-slate-600">{test.timeLimitMinutes} min</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-medium text-slate-900">{test.totalAttempts}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`font-medium ${
                          test.passRate >= 70 ? "text-green-600" :
                          test.passRate >= 50 ? "text-yellow-600" :
                          "text-red-600"
                        }`}>
                          {test.passRate}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {test.isActive ? (
                          <span className="flex items-center justify-center gap-1 text-green-600">
                            <ToggleRight className="h-5 w-5" />
                            <span className="text-sm font-medium">Active</span>
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-1 text-slate-400">
                            <ToggleLeft className="h-5 w-5" />
                            <span className="text-sm font-medium">Inactive</span>
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/admin/skill-tests/${test.testId}`)}
                            className="p-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/admin/skill-tests/${test.testId}/edit`)}
                            className="p-2 rounded-lg bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          {test.isActive ? (
                            <button
                              onClick={() => setDeleteModal(test)}
                              className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleActivate(test.testId)}
                              className="p-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                              title="Activate"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Skill Test?</h3>
            <p className="text-slate-600 mb-6">
              Are you sure you want to delete "<strong>{deleteModal.title}</strong>"?
              {deleteModal.totalAttempts > 0 && (
                <span className="block mt-2 text-yellow-600">
                  This test has {deleteModal.totalAttempts} attempt(s). It will be deactivated instead of deleted.
                </span>
              )}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteModal(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium transition-colors"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 font-medium transition-colors disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
