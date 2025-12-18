import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { APICore } from "@/helpers/apiCore";
import { BookOpen, Plus, Trash2, GripVertical, Save, X, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function AdminSkillTestFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category_id: "",
    pass_percentage: 70,
    questions: [
      {
        question_text: "",
        option_a: "",
        option_b: "",
        option_c: "",
        option_d: "",
        correct_answer: "A",
      },
    ],
  });

  useEffect(() => {
    fetchCategories();
    if (isEdit) {
      fetchTestDetails();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const api = new APICore();
      const response = await api.get("/api/categories");
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchTestDetails = async () => {
    try {
      setLoading(true);
      const api = new APICore();
      const response = await api.get(`/api/skill-tests/admin/${id}`);
      const test = response.data.test;
      
      setFormData({
        title: test.title,
        description: test.description || "",
        category_id: test.category_id || "",
        pass_percentage: test.passPercentage,
        questions: test.questions.map((q) => ({
          question_text: q.questionText,
          option_a: q.optionA,
          option_b: q.optionB,
          option_c: q.optionC,
          option_d: q.optionD,
          correct_answer: q.correctAnswer,
        })),
      });
    } catch (error) {
      console.error("Error fetching test details:", error);
      toast.error("Failed to load test details");
      navigate("/admin/skill-tests");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toast.error("Please enter a test title");
      return;
    }

    if (formData.questions.length === 0) {
      toast.error("Please add at least one question");
      return;
    }

    // Validate all questions
    for (let i = 0; i < formData.questions.length; i++) {
      const q = formData.questions[i];
      if (!q.question_text.trim()) {
        toast.error(`Question ${i + 1}: Please enter question text`);
        return;
      }
      if (!q.option_a.trim() || !q.option_b.trim() || !q.option_c.trim() || !q.option_d.trim()) {
        toast.error(`Question ${i + 1}: Please fill in all options`);
        return;
      }
    }

    setSaving(true);
    try {
      const api = new APICore();
      
      if (isEdit) {
        await api.put(`/api/skill-tests/admin/${id}`, formData);
        toast.success("Skill test updated successfully");
      } else {
        await api.post("/api/skill-tests/admin", formData);
        toast.success("Skill test created successfully");
      }
      
      navigate("/admin/skill-tests");
    } catch (error) {
      console.error("Error saving test:", error);
      toast.error(error.message || "Failed to save skill test");
    } finally {
      setSaving(false);
    }
  };

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        {
          question_text: "",
          option_a: "",
          option_b: "",
          option_c: "",
          option_d: "",
          correct_answer: "A",
        },
      ],
    });
  };

  const removeQuestion = (index) => {
    if (formData.questions.length === 1) {
      toast.error("Test must have at least one question");
      return;
    }
    setFormData({
      ...formData,
      questions: formData.questions.filter((_, i) => i !== index),
    });
  };

  const updateQuestion = (index, field, value) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value,
    };
    setFormData({
      ...formData,
      questions: updatedQuestions,
    });
  };

  const moveQuestion = (index, direction) => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === formData.questions.length - 1)
    ) {
      return;
    }

    const newQuestions = [...formData.questions];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newQuestions[index], newQuestions[targetIndex]] = [
      newQuestions[targetIndex],
      newQuestions[index],
    ];

    setFormData({
      ...formData,
      questions: newQuestions,
    });
  };

  const timeLimit = formData.questions.length * 2;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading test details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/admin/skill-tests")}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Skill Tests
          </button>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-indigo-600" />
            {isEdit ? "Edit Skill Test" : "Create New Skill Test"}
          </h1>
          <p className="text-slate-600 mt-1">
            {isEdit ? "Update test details and questions" : "Create a new skill certification test"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Test Details */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Test Details</h2>
            
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Test Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., JavaScript Fundamentals"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  rows="3"
                  placeholder="Brief description of what this test covers..."
                />
              </div>

              {/* Category and Pass Percentage */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Uncategorized</option>
                    {categories.map((cat) => (
                      <option key={cat.category_id} value={cat.category_id}>
                        {cat.description}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Pass Percentage <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.pass_percentage}
                    onChange={(e) => setFormData({ ...formData, pass_percentage: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              {/* Time Limit (Auto-calculated) */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <p className="text-sm text-indigo-900">
                  <strong>Time Limit:</strong> {timeLimit} minutes ({formData.questions.length} questions × 2 minutes)
                </p>
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900">Questions</h2>
              <button
                type="button"
                onClick={addQuestion}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
              >
                <Plus className="h-4 w-4" />
                Add Question
              </button>
            </div>

            <div className="space-y-6">
              {formData.questions.map((question, index) => (
                <div
                  key={index}
                  className="border border-slate-200 rounded-lg p-4 bg-slate-50"
                >
                  {/* Question Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-5 w-5 text-slate-400" />
                      <span className="font-semibold text-slate-900">Question {index + 1}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => moveQuestion(index, "up")}
                          className="p-1 text-slate-600 hover:text-slate-900"
                          title="Move up"
                        >
                          ↑
                        </button>
                      )}
                      {index < formData.questions.length - 1 && (
                        <button
                          type="button"
                          onClick={() => moveQuestion(index, "down")}
                          className="p-1 text-slate-600 hover:text-slate-900"
                          title="Move down"
                        >
                          ↓
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeQuestion(index)}
                        className="p-1 text-red-600 hover:text-red-700"
                        title="Remove question"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Question Text */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Question Text <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={question.question_text}
                      onChange={(e) => updateQuestion(index, "question_text", e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      rows="2"
                      placeholder="Enter your question..."
                      required
                    />
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    {["A", "B", "C", "D"].map((option) => (
                      <div key={option}>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Option {option} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={question[`option_${option.toLowerCase()}`]}
                          onChange={(e) =>
                            updateQuestion(index, `option_${option.toLowerCase()}`, e.target.value)
                          }
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder={`Option ${option}`}
                          required
                        />
                      </div>
                    ))}
                  </div>

                  {/* Correct Answer */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Correct Answer <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-4">
                      {["A", "B", "C", "D"].map((option) => (
                        <label key={option} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name={`correct_${index}`}
                            value={option}
                            checked={question.correct_answer === option}
                            onChange={(e) => updateQuestion(index, "correct_answer", e.target.value)}
                            className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-sm font-medium text-slate-700">Option {option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate("/admin/skill-tests")}
              className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors disabled:opacity-50"
            >
              <Save className="h-5 w-5" />
              {saving ? "Saving..." : isEdit ? "Update Test" : "Create Test"}
            </button>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
}
