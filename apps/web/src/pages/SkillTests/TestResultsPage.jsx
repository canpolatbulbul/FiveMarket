import { useLocation, useNavigate, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CheckCircle, XCircle, Award, RotateCcw, ArrowLeft, Trophy } from "lucide-react";

export default function TestResultsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { attemptId } = useParams();
  
  const { result, test } = location.state || {};

  if (!result || !test) {
    navigate("/skill-tests");
    return null;
  }

  const { scorePercent, passed, correctCount, totalQuestions, correctAnswers, userAnswers } = result;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <button
          onClick={() => navigate("/skill-tests")}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Skill Tests
        </button>

        {/* Results Card */}
        <div className={`bg-white rounded-xl border-2 p-8 mb-8 ${
          passed ? "border-green-500" : "border-red-500"
        }`}>
          <div className="text-center">
            {passed ? (
              <div className="mb-4">
                <Trophy className="h-20 w-20 text-green-600 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-green-600 mb-2">
                  Congratulations! You Passed!
                </h1>
                <p className="text-slate-600">
                  You've earned a skill certification for {test.title}
                </p>
              </div>
            ) : (
              <div className="mb-4">
                <XCircle className="h-20 w-20 text-red-600 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-red-600 mb-2">
                  You Didn't Pass This Time
                </h1>
                <p className="text-slate-600">
                  Keep practicing and try again!
                </p>
              </div>
            )}

            {/* Score */}
            <div className="my-8">
              <div className={`text-6xl font-bold mb-2 ${
                passed ? "text-green-600" : "text-red-600"
              }`}>
                {scorePercent}%
              </div>
              <p className="text-slate-600 text-lg">
                {correctCount} out of {totalQuestions} questions correct
              </p>
              <p className="text-slate-500 text-sm mt-2">
                Pass threshold: {test.passPercentage}%
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-4 justify-center">
              {passed ? (
                <button
                  onClick={() => navigate("/profile")}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  <Award className="h-5 w-5" />
                  View Certificate
                </button>
              ) : (
                <button
                  onClick={() => navigate(`/skill-tests/${test.testId}/take`)}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  <RotateCcw className="h-5 w-5" />
                  Retake Test
                </button>
              )}
              <button
                onClick={() => navigate("/skill-tests")}
                className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
              >
                Browse Tests
              </button>
            </div>
          </div>
        </div>

        {/* Answer Review */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Answer Review</h2>
          
          <div className="space-y-6">
            {test.questions.map((question, index) => {
              const userAnswerLetter = userAnswers[question.questionId];
              const correctAnswer = correctAnswers[question.questionId];
              const isCorrect = userAnswerLetter === correctAnswer;

              return (
                <div
                  key={question.questionId}
                  className={`border-2 rounded-lg p-6 ${
                    isCorrect ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                  }`}
                >
                  {/* Question Header */}
                  <div className="flex items-start gap-3 mb-4">
                    {isCorrect ? (
                      <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 mb-1">
                        Question {index + 1}
                      </h3>
                      <p className="text-slate-700">{question.questionText}</p>
                    </div>
                  </div>

                  {/* Options */}
                  <div className="space-y-2 ml-9">
                    {["A", "B", "C", "D"].map((option) => {
                      const optionKey = `option${option}`;
                      const optionText = question[optionKey];
                      const isUserAnswer = userAnswerLetter === option;
                      const isCorrectAnswer = correctAnswer === option;

                      let optionClass = "border-slate-200 bg-white";
                      if (isCorrectAnswer) {
                        optionClass = "border-green-500 bg-green-100";
                      } else if (isUserAnswer && !isCorrect) {
                        optionClass = "border-red-500 bg-red-100";
                      }

                      return (
                        <div
                          key={option}
                          className={`flex items-start gap-3 p-3 border-2 rounded-lg ${optionClass}`}
                        >
                          <span className="font-semibold text-slate-700">{option}.</span>
                          <span className="flex-1 text-slate-900">{optionText}</span>
                          {isCorrectAnswer && (
                            <span className="text-green-600 font-semibold text-sm">
                              ✓ Correct
                            </span>
                          )}
                          {isUserAnswer && !isCorrect && (
                            <span className="text-red-600 font-semibold text-sm">
                              Your Answer
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  {!isCorrect && (
                    <div className="mt-4 ml-9 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        <strong>Correct Answer:</strong> Option {correctAnswer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-8 flex gap-4 justify-center">
          {!passed && (
            <button
              onClick={() => navigate(`/skill-tests/${test.testId}/take`)}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              <RotateCcw className="h-5 w-5" />
              Retake Test
            </button>
          )}
          <button
            onClick={() => navigate("/skill-tests")}
            className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
          >
            Back to Tests
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
