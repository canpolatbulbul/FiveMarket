import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { APICore } from "@/helpers/apiCore";
import { BookOpen, Clock, FileQuestion, Award, Lock, CheckCircle, XCircle, Filter } from "lucide-react";
import { toast } from "sonner";

export default function SkillTestsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tests, setTests] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("");

  useEffect(() => {
    fetchCategories();
    fetchTests();
  }, [categoryFilter]);

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
      const params = categoryFilter ? `?category_id=${categoryFilter}` : "";
      const response = await api.get(`/api/skill-tests${params}`);
      setTests(response.data.tests || []);
    } catch (error) {
      console.error("Error fetching tests:", error);
      toast.error("Failed to load skill tests");
    } finally {
      setLoading(false);
    }
  };

  const handleTakeTest = (testId, canTake) => {
    if (!canTake) {
      toast.error("You have reached the maximum number of attempts for this test");
      return;
    }
    navigate(`/skill-tests/${testId}/take`);
  };

  const getStatusBadge = (test) => {
    if (test.hasPassed) {
      return (
        <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
          <CheckCircle className="h-4 w-4" />
          Passed
        </div>
      );
    }
    if (test.failedAttempts >= 3) {
      return (
        <div className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
          <Lock className="h-4 w-4" />
          Locked
        </div>
      );
    }
    if (test.failedAttempts > 0) {
      return (
        <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
          <XCircle className="h-4 w-4" />
          Failed ({test.failedAttempts}/3)
        </div>
      );
    }
    return (
      <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
        Not Started
      </div>
    );
  };

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-indigo-600" />
            Skill Certification Tests
          </h1>
          <p className="text-slate-600 mt-1">
            Take tests to earn skill certifications and showcase your expertise
          </p>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-slate-600" />
            <h3 className="font-semibold text-slate-900">Filter by Category</h3>
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full md:w-64 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.category_id} value={cat.category_id}>
                {cat.description}
              </option>
            ))}
          </select>
        </div>

        {/* Tests Grid */}
        {tests.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <BookOpen className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 text-lg">No skill tests available</p>
            <p className="text-slate-500 text-sm mt-1">Check back later for new tests</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map((test) => (
              <div
                key={test.testId}
                className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow"
              >
                {/* Header */}
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-bold text-slate-900">{test.title}</h3>
                    {getStatusBadge(test)}
                  </div>
                  {test.categoryName && (
                    <span className="inline-block px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                      {test.categoryName}
                    </span>
                  )}
                </div>

                {/* Description */}
                {test.description && (
                  <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                    {test.description}
                  </p>
                )}

                {/* Stats */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <FileQuestion className="h-4 w-4" />
                    <span>{test.questionCount} Questions</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Clock className="h-4 w-4" />
                    <span>{test.timeLimitMinutes} Minutes</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Award className="h-4 w-4" />
                    <span>Pass: {test.passPercentage}%</span>
                  </div>
                </div>

                {/* Best Score */}
                {test.bestScore !== null && (
                  <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600">
                      Best Score: <span className="font-semibold text-slate-900">{test.bestScore}%</span>
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  {test.hasPassed ? (
                    <button
                      onClick={() => navigate("/profile")}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      View Certificate
                    </button>
                  ) : (
                    <button
                      onClick={() => handleTakeTest(test.testId, test.canTake)}
                      disabled={!test.canTake}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                        test.canTake
                          ? "bg-indigo-600 text-white hover:bg-indigo-700"
                          : "bg-slate-300 text-slate-500 cursor-not-allowed"
                      }`}
                    >
                      {test.failedAttempts === 0 ? "Take Test" : "Retake Test"}
                    </button>
                  )}

                </div>

                {/* Attempts Warning */}
                {test.failedAttempts > 0 && test.failedAttempts < 3 && !test.hasPassed && (
                  <p className="mt-3 text-xs text-yellow-600 text-center">
                    {3 - test.failedAttempts} attempt{3 - test.failedAttempts !== 1 ? "s" : ""} remaining
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
