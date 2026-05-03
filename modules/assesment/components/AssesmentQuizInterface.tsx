
import { useState, useEffect } from "react";
import { isMCQQuestion, isMSQQuestion, isTextQuestion } from "@/types/validate";
import { ConfirmBox, useConfirmBox } from "@/shared/ConfirmBox";
import { QuizSection } from "@/types/assessment";
import { useAnswers } from "@/modules/assesment/context/AnswersContext";

// `interface UserAnswer {
//   [questionId: string]: string | string[];
// }

// interface QuestionStatus {
//   [questionId: string]: "not-started" | "in-progress" | "done" | "flagged";
// }`

export default function AssessmentQuizInterface({
  section,
}: {
  section: QuizSection;
}) {
  const [currentQuestionId, setCurrentQuestionId] = useState<string>(
    () => section?.questions?.[0]?._id ?? "",
  );
  // const [questionStatus, setQuestionStatus] = useState<QuestionStatus>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(
    new Set(),
  );
  const confirmModal = useConfirmBox();

  const {
    currentSectionAnswers: userAnswers,
    setCurrentSectionAnswers: setUserAnswers,
    handleSubmit,
  } = useAnswers();
  // Reset to first question when section changes (e.g. next section)
  useEffect(() => {
    if (!section?.questions?.length) return;
    const ids = section.questions.map((q) => q._id);
    if (!ids.includes(currentQuestionId)) {
      setCurrentQuestionId(section.questions[0]._id);
    }
  }, [section, currentQuestionId]);

  const handleConfirm = () => {
    handleSubmit();
  };

  // Update question status when answer changes
  // useEffect(() => {
  //   if (userAnswers && userAnswers[currentQuestionId]) {
  //     setQuestionStatus((prev) => ({
  //       ...prev,
  //       [currentQuestionId]: flaggedQuestions.has(currentQuestionId)
  //         ? "flagged"
  //         : "done",
  //     }));
  //   }
  // }, [userAnswers, currentQuestionId, flaggedQuestions]);

  if (!section) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <p className="text-gray-700 text-lg font-semibold">
            No assessment data available
          </p>
        </div>
      </div>
    );
  }

  const currentQuestionIndex = section.questions.findIndex(
    (q) => q._id === currentQuestionId,
  );
  const question = section.questions[currentQuestionIndex];

  if (!question) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <p className="text-gray-700 text-lg font-semibold">
            Question not found
          </p>
        </div>
      </div>
    );
  }

  const getQuestionStatusColor = (questionId: string) => {
    if (flaggedQuestions.has(questionId))
      return "bg-amber-700 text-white hover:bg-amber-800";
    if (userAnswers && userAnswers[questionId])
      return "bg-green-700 text-white hover:bg-green-800";
    return "bg-gray-300 text-gray-800 hover:bg-gray-400";
  };

  const handleAnswerChange = (value: string | string[]) => {
    console.log('Current userAnswers:', userAnswers);
    console.log('Current questionId:', currentQuestionId);
    console.log('New value:', value);
    const currentAnswers = userAnswers ? { ...userAnswers } : {};
    currentAnswers[currentQuestionId] = value;
    setUserAnswers(currentAnswers);
    if (flaggedQuestions.has(currentQuestionId)) {
      setFlaggedQuestions((prev) => {
        const updated = new Set(prev);
        updated.delete(currentQuestionId);
        return updated;
      });
    }
  };

  const toggleFlag = () => {
    setFlaggedQuestions((prev) => {
      const updated = new Set(prev);
      if (updated.has(currentQuestionId)) {
        updated.delete(currentQuestionId);
      } else {
        updated.add(currentQuestionId);
      }
      return updated;
    });
  };

  const clearSelection = () => {
    if (!userAnswers) return;
    const updated = { ...userAnswers };
    delete updated[currentQuestionId];
    setUserAnswers(updated);
    // setQuestionStatus((prev) => ({
    //   ...prev,
    //   [currentQuestionId]: "not-started",
    // }));
  };

  const handleOpenModal = () => {
    confirmModal.openModal();
  };

  const goToPrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionId(section.questions[currentQuestionIndex - 1]._id);
    }
  };

  const goToNext = () => {
    if (currentQuestionIndex < section.questions.length - 1) {
      setCurrentQuestionId(section.questions[currentQuestionIndex + 1]._id);
    }
  };

  return (
    <>
      <ConfirmBox
        title="Submit Section"
        content="Are you sure you want to submit the section?"
        isOpen={confirmModal.isOpen}
        onClose={confirmModal.closeModal}
        onConfirm={handleConfirm}
        size="md"
        closeOnBackdropClick={true}
      />
      <div className="h-[calc(100vh - 180px)] bg-gray-100 py-8 px-6">
        <style>{`
        input[type="radio"]:checked + span,
        input[type="checkbox"]:checked + span {
          color: #1e3a8a;
          font-weight: 600;
        }
      `}</style>

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                {/* Status Legend */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-300">
                  <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-widest">
                    Status Legend
                  </h3>
                  <div className="space-y-4 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-gray-300 border border-gray-400"></div>
                      <span className="text-gray-700">Unanswered</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-green-700"></div>
                      <span className="text-gray-700">Answered</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-amber-700"></div>
                      <span className="text-gray-700">Flagged</span>
                    </div>
                  </div>
                </div>

                {/* Question Navigator */}
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-300">
                  <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-widest">
                    Questions
                  </h3>
                  <div className="grid grid-cols-5 gap-2 max-h-96 overflow-y-auto">
                    {section.questions.map((item, idx) => (
                      <button
                        key={item._id}
                        onClick={() => setCurrentQuestionId(item._id)}
                        className={`aspect-square rounded font-bold text-xs transition-all ${currentQuestionId === item._id
                            ? "ring-2 ring-offset-1 ring-blue-900"
                            : ""
                          } ${getQuestionStatusColor(item._id)}`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Statistics */}
                <div className="bg-white rounded-lg shadow-md p-6 mt-6 border border-gray-300">
                  <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-widest">
                    Statistics
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-700">Answered:</span>
                      <span className="font-bold text-green-700">
                        {userAnswers &&
                          Object.values(userAnswers).length -
                          flaggedQuestions.size}
                      </span>
                      e
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-700">Flagged:</span>
                      <span className="font-bold text-amber-700">
                        {flaggedQuestions.size}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-700">Remaining:</span>
                      <span className="font-bold text-gray-900">
                        {section.questions.length -
                          (userAnswers ? Object.values(userAnswers).length : 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-4">
              {/* Question Info Bar */}
              <div className="bg-white rounded-lg shadow-md mb-6 px-8 py-4 border border-gray-300 flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-widest font-semibold">
                    Question {currentQuestionIndex + 1}
                  </p>
                  <p className="text-sm text-gray-800 font-semibold mt-1">
                    Points: {question.marks}
                  </p>
                </div>
                <button
                  onClick={toggleFlag}
                  className={`px-4 py-2 rounded font-semibold text-sm transition-colors ${flaggedQuestions.has(currentQuestionId)
                      ? "bg-amber-700 text-white hover:bg-amber-800"
                      : "bg-gray-300 text-gray-800 hover:bg-gray-400"
                    }`}
                >
                  {flaggedQuestions.has(currentQuestionId)
                    ? "★ Flagged"
                    : "☆ Flag"}
                </button>
              </div>

              {/* Question Card */}
              <div className="bg-white rounded-lg shadow-md p-8 mb-8 border border-gray-300">
                <h2 className="text-2xl font-bold text-gray-900 mb-8 leading-relaxed">
                  {question.question}
                </h2>

                {/* Options */}
                <div className="space-y-4">
                  {isMSQQuestion(question) && (
                    <div className="space-y-4">
                      {question.options.map((option: any, idx: number) => (
                        <label
                          key={idx}
                          className="flex items-center p-4 border border-gray-300 rounded cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                          <input
                            type="checkbox"
                            value={option.text}
                            checked={
                              userAnswers &&
                                Array.isArray(userAnswers[currentQuestionId])
                                ? (
                                  userAnswers[currentQuestionId] as string[]
                                ).includes(option.text)
                                : false
                            }
                            onChange={(e) => {
                              const current =
                                userAnswers &&
                                  Array.isArray(userAnswers[currentQuestionId])
                                  ? (userAnswers[currentQuestionId] as string[])
                                  : [];
                              if (e.target.checked) {
                                handleAnswerChange([...current, option.text]);
                              } else {
                                handleAnswerChange(
                                  current.filter((a) => a !== option.text),
                                );
                              }
                            }}
                            className="w-5 h-5 rounded border-gray-400 cursor-pointer accent-blue-900"
                          />
                          <span className="ml-4 text-gray-900 text-base font-medium">
                            {option.text}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}

                  {isMCQQuestion(question) && (
                    <div className="space-y-4">
                      {question.options.map((option: any, idx: number) => (
                        <label
                          key={idx}
                          className="flex items-center p-4 border border-gray-300 rounded cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                          <input
                            type="radio"
                            name={`question-${currentQuestionId}`}
                            value={option.text}
                            checked={
                              userAnswers
                                ? userAnswers[currentQuestionId] === option.text
                                : false
                            }
                            onChange={(e) => handleAnswerChange(e.target.value)}
                            className="w-5 h-5 border-gray-400 cursor-pointer accent-blue-900"
                          />
                          <span className="ml-4 text-gray-900 text-base font-medium">
                            {option.text}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}

                  {isTextQuestion(question) && (
                    <input
                      type="text"
                      placeholder="Enter your response..."
                      value={
                        userAnswers
                          ? (userAnswers[currentQuestionId] as string) || ""
                          : ""
                      }
                      onChange={(e) => handleAnswerChange(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-400 rounded text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900 font-medium"
                    />
                  )}
                </div>
              </div>

              {/* Clear Button */}
              <div className="mb-6 flex justify-end">
                <button
                  onClick={clearSelection}
                  disabled={!userAnswers || !userAnswers[currentQuestionId]}
                  className="px-6 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold text-sm"
                >
                  Clear Selection
                </button>
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={goToPrevious}
                  disabled={currentQuestionIndex === 0}
                  className="flex-1 px-6 py-3 bg-white text-gray-900 border-2 border-gray-400 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                >
                  Previous
                </button>

                {currentQuestionIndex < section.questions.length - 1 ? (
                  <button
                    onClick={goToNext}
                    className="flex-1 px-6 py-3 bg-blue-900 text-white rounded hover:bg-blue-950 transition-colors font-semibold"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={handleOpenModal}
                    className="flex-1 px-6 py-3 bg-green-800 text-white rounded hover:bg-green-900 transition-colors font-semibold"
                  >
                    Submit Assessment
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
