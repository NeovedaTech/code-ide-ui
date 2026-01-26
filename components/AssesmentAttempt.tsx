"use client"
import { useAssessment } from "@/context/AssesmentContext";
import AssessmentCodeInterface from "./AssessmentCodeInterface";
import AssesmentQuizInterface from "./AssesmentQuizInterface";
import { useServerSync } from "@/hooks/AssesmentApi";
import AssessmentHeader from "./AssessmentHeader";
import AssesmentSubmitted from "./AssesmentSubmitted";
import AssesmentInstructions from "./AssesmentInstructions";

export default function AssesmentAttempt() {
  const { currentSection , hasStarted , hasSubmitted} = useAssessment();

  const {data:serverSync} = useServerSync();

  const SECTION_TYPE = currentSection?.type;

  if(!hasStarted) return <>
    <AssesmentInstructions />
  </>
  if(hasSubmitted) return <>
    <AssesmentSubmitted/>
  </>
  return (
    <> 
      <AssessmentHeader />
      {SECTION_TYPE === "quiz" && (
        <AssesmentQuizInterface section={currentSection} />
      )}
      {SECTION_TYPE === "coding" && (
        <AssessmentCodeInterface section={currentSection} />
      )}
    </>
  );
}
