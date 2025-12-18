import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { APICore } from "@/helpers/apiCore";
import { Clock, ChevronLeft, ChevronRight, AlertCircle, Send } from "lucide-react";
import { toast } from "sonner";

export default function TakeSkillTestPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [test, setTest] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    startTest();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [id]);

  useEffect(() => {
    if (timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [timeRemaining]);

  const startTest = async () => {
    try {
      setLoading(true);
      const api = new APICore();
      const response = await api.post(`/api/skill-tests/${id}/start`, {});
      
      setTest(response.data.test);
      setAttemptId(response.data.attemptId);
      setTimeRemaining(response.data.test.timeLimitSeconds);
      startTimeRef.current = Date.now();
    } catch (error) {
      console.error("Error starting test:", error);
      toast.error(error.message || "Failed to start test");
      navigate("/skill-tests");
    } finally {
      setLoading(false);
    }
  };

  const handleAutoSubmit = async () => {
    toast.warning("Time's up! Submitting your test...");
    await submitTest();
  };

  const handleSubmitClick = () => {
    const unansweredCount = test.questions.length - Object.keys(answers).length;
    if (unansweredCount > 0) {
      setShowSubmitModal(true);
    } else {
      submitTest();
    }
  };

  const submitTest = async () => {
    if (submitting) return;

    setSubmitting(true);
    setShowSubmitModal(false);

    try {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      const timeTakenSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
      
      // Convert answers to question_id: answer format
      const formattedAnswers = {};
      test.questions.forEach((q, index) => {
        if (answers[index] !== undefined) {
          formattedAnswers[q.questionId] = answers[index];
        }
      });

      const api = new APICore();
      const response = await api.post(`/api/skill-tests/attempts/${attemptId}/submit`, {
        answers: formattedAnswers,
        timeTakenSeconds,
      });

      // Navigate to results page
      navigate(`/skill-tests/results/${attemptId}`, {
        state: { result: response.data.result, test },
      });
    } catch (error) {
      console.error("Error submitting test:", error);
      toast.error(error.message || "Failed to submit test");
      setSubmitting(false);
    }
  };

  const handleAnswerChange = (answer) => {
    setAnswers({
      ...answers,
      [currentQuestionIndex]: answer,
    });
  };

  const goToQuestion = (index) => {
    setCurrentQuestionIndex(index);
  };

  const goToPrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentQuestionIndex < test.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const isAnswered = (index) => answers[index] !== undefined;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Starting test...</p>
        </div>
      </div>
    );
  }

  if (!test) return null;

  const currentQuestion = test.questions[currentQuestionIndex];
  const unansweredCount = test.questions.length - Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{test.title}</h1>
              <p className="text-slate-600 text-sm mt-1">
                Attempt {test.attemptNumber} • Pass: {test.passPercentage}%
              </p>
            </div>
            <div className="text-right">
              <div
                className={`text-3xl font-bold ${
                  timeRemaining < 60 ? "text-red-600" : "text-indigo-600"
                }`}
              >
                <Clock className="inline h-8 w-8 mr-2" />
                {formatTime(timeRemaining)}
              </div>
              <p className="text-slate-600 text-sm mt-1">Time Remaining</p>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">
              Question {currentQuestionIndex + 1} of {test.questions.length}
            </span>
            <span className="text-sm text-slate-600">
              {Object.keys(answers).length} answered
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all"
              style={{
                width: `${((currentQuestionIndex + 1) / test.questions.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="bg-white rounded-xl border border-slate-200 p-8 mb-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">
            {currentQuestion.questionText}
          </h2>

          <div className="space-y-3">
            {["A", "B", "C", "D"].map((option) => {
              const optionKey = `option${option}`;
              const optionText = currentQuestion[optionKey];
              const isSelected = answers[currentQuestionIndex] === option;

              return (
                <label
                  key={option}
                  className={`flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    isSelected
                      ? "border-indigo-600 bg-indigo-50"
                      : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestionIndex}`}
                    value={option}
                    checked={isSelected}
                    onChange={() => handleAnswerChange(option)}
                    className="mt-1 w-5 h-5 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div className="flex-1">
                    <span className="font-semibold text-slate-700 mr-2">{option}.</span>
                    <span className="text-slate-900">{optionText}</span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={goToPrevious}
            disabled={currentQuestionIndex === 0}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-5 w-5" />
            Previous
          </button>

          <button
            onClick={handleSubmitClick}
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
          >
            <Send className="h-5 w-5" />
            {submitting ? "Submitting..." : "Submit Test"}
          </button>

          <button
            onClick={goToNext}
            disabled={currentQuestionIndex === test.questions.length - 1}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Question Navigator */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Question Navigator</h3>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {test.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => goToQuestion(index)}
                className={`aspect-square rounded-lg font-semibold transition-all ${
                  index === currentQuestionIndex
                    ? "bg-indigo-600 text-white ring-2 ring-indigo-600 ring-offset-2"
                    : isAnswered(index)
                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-start gap-4 mb-4">
              <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Submit Test?</h3>
                <p className="text-slate-600">
                  You have <strong>{unansweredCount}</strong> unanswered question
                  {unansweredCount !== 1 ? "s" : ""}. Are you sure you want to submit?
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium transition-colors"
              >
                Review Answers
              </button>
              <button
                onClick={submitTest}
                className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 font-medium transition-colors"
              >
                Submit Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
