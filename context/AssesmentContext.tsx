/* eslint-disable react-hooks/set-state-in-effect */

"use client";
import { useGetAssesment } from "@/hooks/AssesmentApi";
import { AssessmentSection, SectionResponse } from "@/types/assessment";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  SetStateAction,
  Dispatch,
} from "react";
/**
 * @interface AssessmentContextType
 * Defines the shape of the data that will be available in the assessment context.
 * @property {string} assessmentId - The ID of the current assessment.
 * @property {AssessmentSection | undefined} currentSection - The current section of the assessment the user is on.
 */
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
}
/**
 * @const AssessmentContext
 * React context to hold assessment state. This allows assessment data to be accessed from any component
 * wrapped in the AssessmentProvider without passing props down through multiple levels.
 */
const AssessmentContext = createContext<AssessmentContextType | undefined>(
  undefined,
);
/**
 * @interface AssessmentProviderProps
 * Defines the props for the AssessmentProvider component.
 * @property {ReactNode} children - The child components that will have access to the context.
 * @property {string} assessmentId - The ID of the assessment to be loaded.
 * @property {string} userId - The ID of the user taking the assessment.
 */
interface AssessmentProviderProps {
  children: ReactNode;
  assessmentId: string;
  userId: string;
}
/**
 * @component AssessmentProvider
 * This component provides the AssessmentContext to its children.
 * It fetches assessment data and manages the current state of the assessment,
 * such as the current section the user is viewing.
 *
 * @param {AssessmentProviderProps} props - The props for the component.
 * @returns {React.ReactElement} The provider component.
 */
export const AssessmentProvider: React.FC<AssessmentProviderProps> = ({
  children,
  assessmentId,
  userId,
}) => {
  // State to hold the current assessment section.
  const [currentSection, setCurrentSection] = useState<
    AssessmentSection | undefined
  >();
  const [currResponse, setCurrResponse] = useState<
    SectionResponse | undefined
  >();
  const [solutionId, setSolutionId] = useState<string>("");
  const [autoSubmit, setAutoSubmit] = useState<boolean>(false);

  // / const {isAuthenticated} = useUser();

  // if(!isA ) return to binarykeeda.com
  // State to hold the current section number.
  const [currSectionNumber, setCurrSectionNumber] = useState<number>(1);
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [Loading, setLoading] = useState<boolean>(false);
  const [isSectionDone, setIsSectionDone] = useState(false);
  // Custom hook to fetch assessment data from the API.
  const {
    data: assesment,
    isLoading: assessmentLoading,
    error: assessmentError,
  } = useGetAssesment({ assessmentId, userId });

  // Basic validation to ensure required IDs are present.
  if (!assessmentId) {
    throw new Error("Assessment ID is required");
  }
  if (!userId) {
    throw new Error("User ID is required");
  }

  /**
   * useEffect hook to update the current section when the assessment data changes.
   * This runs when the component mounts and whenever the assessment data, loading state, or error state changes.
   */

  useEffect(() => {
    // Don't do anything while the assessment is loading.
    if (assessmentLoading) {
      setLoading(true);
      return;
    }
    // Don't do anything if there was an error fetching the assessment.
    if (assessmentError) {
      setLoading(false);
      return;
    }
    setLoading(false);
    // If the assessment data is available, update the current section and section number.
    if (assesment) {
      const curr = assesment.data.currSection;
      const section = assesment.data.assesmentSnapshot[curr];
      const response = assesment.data.response[curr];
      setAutoSubmit(false);
      setCurrentSection(section);
      setCurrSectionNumber(curr);
      setHasStarted(assesment.data.hasAgreed);
      setSolutionId(assesment.data._id);
      setHasSubmitted(assesment.data.isSubmitted);
      setCurrResponse(response);

      if (
        !assesment.data.isSubmitted &&
        assesment.data.hasAgreed &&
        section.type === "coding"
      ) {
        const currSolution = response?.codingAnswers[0] as {};
        setIsSectionDone(
          Number(section.problems.length) ===
            Object.keys(currSolution ?? {})?.length,
        );
      }
      // setIsSectionDone(assesment.data)
    }
  }, [assesment, assessmentLoading, assessmentError]);

  // The provider component makes the assessment data available to all child components.
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
      }}
    >
      {children}
    </AssessmentContext.Provider>
  );
};

/**
 * @function useAssessment
 * Custom hook to easily access the AssessmentContext data from any component.
 * It ensures that the component using the hook is wrapped within an AssessmentProvider.
 *
 * @returns {AssessmentContextType} The assessment context data.
 * @throws {Error} If the hook is used outside of an AssessmentProvider.
 */
export const useAssessment = () => {
  const context = useContext(AssessmentContext);
  if (context === undefined) {
    throw new Error("useAssessment must be used within an AssessmentProvider");
  }
  return context;
};
