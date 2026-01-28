"use client";
import { useAssessment } from "@/context/AssesmentContext";
import AssessmentCodeInterface from "./AssessmentCodeInterface";
import AssesmentQuizInterface from "./AssesmentQuizInterface";
import { useServerSync } from "@/hooks/AssesmentApi";
import AssessmentHeader from "./AssessmentHeader";
import AssesmentSubmitted from "./AssesmentSubmitted";
import AssesmentInstructions from "./AssesmentInstructions";
import { AnswersProvider } from "@/context/AnswersContext";
import { QuizSection } from "@/types/assessment";

export default function AssesmentAttempt() {
  const { currentSection, hasStarted, hasSubmitted , currSectionNumber} = useAssessment();

  const { data: serverSync } = useServerSync();

  const SECTION_TYPE = currentSection?.type;

  if (!hasStarted)
    return (
      <>
        <AssesmentInstructions />
      </>
    );
  if (hasSubmitted)
    return (
      <>
        <AssesmentSubmitted />
      </>
    );
  return (
    <AnswersProvider>
      <AssessmentHeader />
      {SECTION_TYPE === "quiz" && (
        <AssesmentQuizInterface section={currentSection as QuizSection} />
      )}
      {SECTION_TYPE === "coding" && (
        <AssessmentCodeInterface section={currentSection} />
      )}
    </AnswersProvider>
  );
}
