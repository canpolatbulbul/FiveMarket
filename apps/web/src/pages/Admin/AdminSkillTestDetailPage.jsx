import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { APICore } from "@/helpers/apiCore";
import { BookOpen, ArrowLeft, Edit, Clock, Award, FileQuestion, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function AdminSkillTestDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [test, setTest] = useState(null);

  useEffect(() => {
    fetchTest();
  }, [id]);

  const fetchTest = async () => {
    try {
      setLoading(true);
      const api = new APICore();
      const response = await api.get(`/api/skill-tests/admin/${id}`);
      setTest(response.data.test);
    } catch (error) {
      console.error("Error fetching test:", error);
      toast.error("Failed to load skill test");
      navigate("/admin/skill-tests");
    } finally {
      setLoading(false);
    }
  };

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

  if (!test) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <button
          onClick={() => navigate("/admin/skill-tests")}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Skill Tests
        </button>

        {/* Header */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="h-8 w-8 text-indigo-600" />
                <h1 className="text-2xl font-bold text-slate-900">{test.title}</h1>
              </div>
              {test.categoryName && (
                <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                  {test.categoryName}
                </span>
              )}
              {test.description && (
                <p className="text-slate-600 mt-3">{test.description}</p>
              )}
            </div>
            <button
              onClick={() => navigate(`/admin/skill-tests/${id}/edit`)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Edit className="h-4 w-4" />
              Edit Test
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-200">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-slate-600 mb-1">
                <FileQuestion className="h-4 w-4" />
                <span className="text-sm">Questions</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{test.questions.length}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-slate-600 mb-1">
                <Clock className="h-4 w-4" />
                <span className="text-sm">Time Limit</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{test.timeLimitMinutes} min</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-slate-600 mb-1">
                <Award className="h-4 w-4" />
                <span className="text-sm">Pass %</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{test.passPercentage}%</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-slate-600 mb-1">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">Status</span>
              </div>
              <p className={`text-lg font-bold ${test.isActive ? "text-green-600" : "text-red-600"}`}>
                {test.isActive ? "Active" : "Inactive"}
              </p>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Questions ({test.questions.length})</h2>
          
          <div className="space-y-6">
            {test.questions.map((question, index) => (
              <div key={question.questionId} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-start gap-3 mb-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </span>
                  <p className="text-slate-900 font-medium pt-1">{question.questionText}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-11">
                  {["A", "B", "C", "D"].map((option) => {
                    const optionKey = `option${option}`;
                    const isCorrect = question.correctAnswer === option;
                    
                    return (
                      <div
                        key={option}
                        className={`flex items-center gap-2 p-3 rounded-lg ${
                          isCorrect
                            ? "bg-green-100 border-2 border-green-500"
                            : "bg-slate-50 border border-slate-200"
                        }`}
                      >
                        <span className={`font-semibold ${isCorrect ? "text-green-700" : "text-slate-600"}`}>
                          {option}.
                        </span>
                        <span className={isCorrect ? "text-green-700" : "text-slate-700"}>
                          {question[optionKey]}
                        </span>
                        {isCorrect && (
                          <CheckCircle className="h-4 w-4 text-green-600 ml-auto" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
