/* eslint-disable react-hooks/set-state-in-effect */

"use client";
import { useGetAssesment } from "@/modules/assesment/hooks/AssesmentApi";
import { AssessmentSection, SectionResponse } from "@/types/assessment";
import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  ReactNode,
  useEffect,
  SetStateAction,
  Dispatch,
} from "react";

interface AssessmentContextType {
  assessmentId: string;
  currentSection: AssessmentSection | undefined;
  currSectionNumber: number;
  currResponse: SectionResponse | undefined;
  Loading: boolean;
  hasStarted: boolean;
  hasSubmitted: boolean;
  assessmentLoading: boolean;
  assessmentError: any;
  solutionId: string;
  isSectionDone: boolean;
  autoSubmit: boolean;
  setAutoSubmit: Dispatch<SetStateAction<boolean>>;
  isProctored: boolean;
  isAvEnabled: boolean;
  isScreenCapture: boolean;
  initialCamStream: MediaStream | null;
  initialScreenStream: MediaStream | null;
}

const AssessmentContext = createContext<AssessmentContextType | undefined>(
  undefined,
);

interface AssessmentProviderProps {
  children: ReactNode;
  assessmentId: string;
  userId: string;
  isProctored?: boolean;
  isAvEnabled?: boolean;
  isScreenCapture?: boolean;
  initialCamStream?: MediaStream | null;
  initialScreenStream?: MediaStream | null;
}

export const AssessmentProvider: React.FC<AssessmentProviderProps> = ({
  children,
  assessmentId,
  userId,
  isProctored = false,
  isAvEnabled = false,
  isScreenCapture = false,
  initialCamStream = null,
  initialScreenStream = null,
}) => {
  const [autoSubmit, setAutoSubmit] = useState<boolean>(false);
  const [isSectionDone, setIsSectionDone] = useState(false);

  const {
    data: assesment,
    isLoading: assessmentLoading,
    error: assessmentError,
  } = useGetAssesment({ assessmentId, userId });

  if (!assessmentId) throw new Error("Assessment ID is required");
  if (!userId)       throw new Error("User ID is required");

  // ── Derived directly from query data (no useState lag) ─────────────────────
  const hasStarted  = assesment?.data?.hasAgreed    ?? false;
  const hasSubmitted = assesment?.data?.isSubmitted  ?? false;
  const solutionId  = assesment?.data?._id           ?? "";

  const currSectionNumber = assesment?.data?.currSection ?? 0;

  const currentSection = useMemo<AssessmentSection | undefined>(() => {
    if (!assesment) return undefined;
    return assesment.data.assesmentSnapshot[assesment.data.currSection];
  }, [assesment]);

  const currResponse = useMemo<SectionResponse | undefined>(() => {
    if (!assesment) return undefined;
    return assesment.data.response[assesment.data.currSection];
  }, [assesment]);

  // isSectionDone has side-effect logic — keep in useEffect
  useEffect(() => {
    if (!assesment || assesment.data.isSubmitted || !assesment.data.hasAgreed) return;
    const curr = assesment.data.currSection;
    const section = assesment.data.assesmentSnapshot[curr];
    const response = assesment.data.response[curr];
    if (section?.type === "coding") {
      const currSolution = response?.codingAnswers[0] as {};
      setIsSectionDone(
        Number(section.problems.length) === Object.keys(currSolution ?? {}).length,
      );
    }
    setAutoSubmit(false);
  }, [assesment]);

  const Loading = assessmentLoading;

  return (
    <AssessmentContext.Provider
      value={{
        currResponse,
        solutionId,
        assessmentId,
        currentSection,
        autoSubmit,
        setAutoSubmit,
        assessmentLoading,
        Loading,
        currSectionNumber,
        isSectionDone,
        assessmentError,
        hasStarted,
        hasSubmitted,
        isProctored,
        isAvEnabled,
        isScreenCapture,
        initialCamStream,
        initialScreenStream,
      }}
    >
      {children}
    </AssessmentContext.Provider>
  );
};

export const useAssessment = () => {
  const context = useContext(AssessmentContext);
  if (context === undefined) {
    throw new Error("useAssessment must be used within an AssessmentProvider");
  }
  return context;
};
