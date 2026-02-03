/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { fetchResultsInBatches } from "@/helpers/codeUtils";
import {
  useRunCode,
  useSubmitCode,
  useSubmitSection,
} from "@/hooks/AssesmentApi";
import { ExecutionResults } from "@/types/execution";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useEffect,
  Dispatch,
  SetStateAction,
} from "react";
import { useAssessment } from "./AssesmentContext";
import { codingAnswer, quizAnswer } from "@/types/assessment";
import { QueryClient, useQueryClient } from "@tanstack/react-query";

// Define the types for the context
interface AnswersContextType {
  // Controls the visibility of the code execution output window.
  showOutputWindow: boolean;
  // Stores the answers for the current section, which can be either coding or quiz answers.
  currentSectionAnswers: codingAnswer | quizAnswer | null;
  // Function to set the current section's answers.
  setCurrentSectionAnswers: Dispatch<
    SetStateAction<codingAnswer | quizAnswer | null>
  >;
  // Indicates if code execution is currently in progress.
  isCodeRunning: boolean;
  // Initiates the submission of code for a specific problem.
  startCodeSubmission: ({
    code,
    lang,
    problemId,
    sectionId,
    solutionId,
  }: {
    code: string;
    lang: string;
    problemId: string;
    sectionId: string;
    solutionId: string;
  }) => void;
  // Indicates if the entire section is currently being submitted.
  sectionSubmitting: boolean;
  // Function to set the section submission status.
  setSectionSubmitting: Dispatch<SetStateAction<boolean>>;
  // Indicates if the code submission process is currently in progress.
  isCodeSubmitting: boolean;
  // Stores the results of code execution or submission.
  results: any | null;
  // Opens the output window.
  openOutputWindow: () => void;
  // Closes the output window.
  closeOutputWindow: () => void;
  // Handles the submission of the current section's answers.
  handleSubmit: () => void;
  // Initiates the execution of code for a specific problem.
  startExecution: ({
    code,
    lang,
    problemId,
    sectionId,
  }: {
    code: string;
    lang: string;
    problemId: string;
    sectionId: string;
  }) => void;
  // Ends the code execution process and updates the results.
  endExecution: (results: any | null) => void;
  // Resets the state of the output window and code execution.
  reset: () => void;
}

const AnswersContext = createContext<AnswersContextType | undefined>(undefined);

/**
 * Provides context for managing assessment answers and code execution.
 * This provider handles state related to code running, submission, output display,
 * and persistence of answers to local storage.
 */
export const AnswersProvider = ({ children }: { children: ReactNode }) => {
  // Destructure values from the AssessmentContext to get current assessment details.
  const { solutionId, currSectionNumber, currentSection } = useAssessment();

  // State to track if the code execution is currently running.
  const [isCodeRunning, setIsCodeRunning] = useState(false);
  // State to track if the entire section is being submitted.
  const [sectionSubmitting, setSectionSubmitting] = useState(false);
  // State to track if code submission for a problem is in progress.
  const [isCodeSubmitting, setIsCodeSubmitting] = useState(false);
  // State to control the visibility of the output window for code execution results.
  const [showOutputWindow, setShowOutputWindow] = useState(false);
  // State to store the results of code execution or submission.
  const [results, setResults] = useState<ExecutionResults[] | null>(null);
  // Memoized callback to open the output window.
  const openOutputWindow = useCallback(() => setShowOutputWindow(true), []);
  // Memoized callback to close the output window.
  const closeOutputWindow = useCallback(() => setShowOutputWindow(false), []);

  // Mutation hook for running code.
  const runCodeMutation = useRunCode();
  // QueryClient for invalidating queries after section submission.
  const queryClient = useQueryClient();
  // State to hold the answers for the current section (coding or quiz).
  const [currentSectionAnswers, setCurrentSectionAnswers] = useState<
    codingAnswer | quizAnswer | null
  >(null);
  // Mutation hook for submitting code.
  const submitCodeMutation = useSubmitCode();

  /**
   * Effect to load saved answers from local storage when the component mounts
   * or when solutionId or currentSection changes.
   */
  useEffect(() => {
    const savedAnswers = localStorage.getItem(
      `${solutionId}-${currentSection?.sectionId}`,
    );
    if (savedAnswers) {
      setCurrentSectionAnswers(JSON.parse(savedAnswers));
    }
  }, [solutionId, currentSection?.sectionId]);

  /**
   * Effect to save current section answers to local storage whenever they change.
   */
  useEffect(() => {
    if (currentSectionAnswers) {
      localStorage.setItem(
        `${solutionId}-${currentSection?.sectionId}`,
        JSON.stringify(currentSectionAnswers),
      );
    }
  }, [currentSectionAnswers, solutionId, currentSection?.sectionId]);

  /**
   * Initiates code execution. It sets loading states, calls the runCodeMutation,
   * fetches results in batches, and updates the current section's answers.
   */
  const startExecution = useCallback(
    async ({
      code,
      lang,
      problemId,
      sectionId,
    }: {
      code: string;
      lang: string;
      problemId: string;
      sectionId: string;
    }) => {
      try {
        console.log("startExecution", code, lang, problemId, sectionId);
        setIsCodeRunning(true);
        setShowOutputWindow(true);
        const res = await runCodeMutation.mutateAsync({
          code,
          language: lang,
          problemId,
        });
        const results = await fetchResultsInBatches(res);

        setCurrentSectionAnswers((prev) => {
          return {
            ...prev,
            [problemId]: {
              code,
              lang,
              results,
              tokens: res,
            },
          };
        });
        setResults(results);
      } catch (error) {
        console.error("Error in startExecution:", error);
        setResults(null);
      } finally {
        setIsCodeRunning(false);
        setShowOutputWindow(true);
      }
    },
    [runCodeMutation, solutionId, currentSection?.sectionId],
  );

  /**
   * Initiates code submission. It sets loading states, calls the submitCodeMutation,
   * fetches results in batches, and updates the current section's answers.
   */
  const startCodeSubmission = useCallback(
    async ({
      code,
      lang,
      problemId,
      sectionId,
      solutionId,
    }: {
      code: string;
      lang: string;
      problemId: string;
      sectionId: string;
      solutionId: string;
    }) => {
      try {
        console.log("startCodeSubmission", code, lang, problemId, sectionId);
        setIsCodeSubmitting(true);
        const res = await submitCodeMutation.mutateAsync({
          code,
          language: lang,
          problemId,
          sectionId,
          solutionId,
        });
        const results = await fetchResultsInBatches(res);

        setCurrentSectionAnswers((prev) => {
          return {
            ...prev,
            [problemId]: {
              code,
              lang,
              results,
              tokens: res,
            },
          };
        });
        setResults(results);
        queryClient.invalidateQueries({ queryKey: ['assesment'] })
      } catch (error) {
        console.error("Error in startExecution:", error);
        setResults(null);
      } finally {
        setIsCodeSubmitting(false);
        setShowOutputWindow(true);
      }
    },
    [submitCodeMutation, solutionId, currentSection?.sectionId],
  );

  /**
   * Cleans up after code execution, resetting the running state and updating results.
   */
  const endExecution = useCallback((results: any | null) => {
    setIsCodeRunning(false);
    setResults(results);
  }, []);

  /**
   * Resets the output window visibility and code execution states.
   */
  const reset = useCallback(() => {
    setShowOutputWindow(false);
    setIsCodeRunning(false);
    setResults(null);
  }, []);

  // Mutation hook for submitting an entire section.
  const submitSection = useSubmitSection();
  /**
   * Handles the submission of the entire current section's answers.
   * It calls the submitSection mutation and invalidates the 'assesment' query cache.
   */
  const handleSubmit = async () => {
    try {
      await submitSection.mutateAsync({
        solutionId,
        sectionId: currentSection?.sectionId as string,
        sectionType: currentSection?.type as string,
        response: currentSectionAnswers as codingAnswer | quizAnswer,
        current: Number(currSectionNumber),
      });
      // Invalidate the 'assesment' query to refetch assessment data after submission.
      queryClient.invalidateQueries({ queryKey: ['assesment'] })
    } catch (e) {
      console.error("Error submitting section:", e);
    }
  };

  // The value object provided by the context to its consumers.
  const value = {
    showOutputWindow,
    handleSubmit,
    isCodeRunning,
    isCodeSubmitting,
    results,
    openOutputWindow,
    closeOutputWindow,
    startExecution,
    startCodeSubmission,
    endExecution,
    reset,
    currentSectionAnswers,
    sectionSubmitting,
    setSectionSubmitting,
    setCurrentSectionAnswers,
  };
  return (
    <AnswersContext.Provider value={value}>{children}</AnswersContext.Provider>
  );
};

/**
 * Custom hook to consume the AnswersContext.
 * Throws an error if used outside of an AnswersProvider.
 * @returns The context value containing state and functions for managing answers and code execution.
 */
export const useAnswers = () => {
  const context = useContext(AnswersContext);
  if (context === undefined) {
    throw new Error("useCodeOutput must be used within a AnswersProvider");
  }
  return context;
};
