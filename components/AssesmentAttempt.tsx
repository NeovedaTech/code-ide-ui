"use client";
import { useAssessment } from "@/context/AssesmentContext";
import AssessmentCodeInterface from "./AssessmentCodeInterface";
import AssesmentQuizInterface from "./AssesmentQuizInterface";
import AssessmentHeader from "./AssessmentHeader";
import AssesmentSubmitted from "./AssesmentSubmitted";
import AssesmentInstructions from "./AssesmentInstructions";
import { AnswersProvider, useAnswers } from "@/context/AnswersContext";
import { QuizSection } from "@/types/assessment";
import { ErrorBox } from "@/shared/ErrorBox";
import { LoadingBox } from "@/shared/LoadingBox";
import { AutoSubmitBox } from "@/shared/AutosubmitBox";

export default function AssesmentAttempt() {
  const {
    currentSection,
    hasStarted,
    hasSubmitted,
    assessmentLoading,
    assessmentError,
    solutionId,
  } = useAssessment();

  const SECTION_TYPE = currentSection?.type;
  const { handleSubmit } = useAnswers();
  const { autoSubmit, setAutoSubmit } = useAssessment();

  if (assessmentLoading) return <LoadingBox isOpen />;

  if (assessmentError)
    return (
      <ErrorBox
        title="Solution Not Found"
        message="Solution to respected assessment id or userId not found"
        details={JSON.stringify(assessmentError)}
        onClose={() => {}}
        isOpen
      />
    );
  if (!hasStarted) return <AssesmentInstructions />;
  if (hasSubmitted)
    return <AssesmentSubmitted solutionId={solutionId as string} />;
  return (
    <>
      <AutoSubmitBox
        onClose={() => setAutoSubmit(false)}
        isOpen={autoSubmit}
        onSubmit={handleSubmit}
      />
      <AssessmentHeader />
      {SECTION_TYPE === "quiz" && (
        <AssesmentQuizInterface section={currentSection as QuizSection} />
      )}
      {SECTION_TYPE === "coding" && (
        <AssessmentCodeInterface section={currentSection} />
      )}
    </>
  );
}
