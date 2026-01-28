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

// Define the types for the context
interface AnswersContextType {
  showOutputWindow: boolean;
  currentSectionAnswers: codingAnswer | quizAnswer | null;
  setCurrentSectionAnswers: Dispatch<
    SetStateAction<codingAnswer | quizAnswer | null>
  >;
  isCodeRunning: boolean;
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
  sectionSubmitting: boolean;
  setSectionSubmitting: Dispatch<SetStateAction<boolean>>;
  isCodeSubmitting: boolean;
  results: any | null;
  openOutputWindow: () => void;
  closeOutputWindow: () => void;
  handleSubmit: () => void;
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
  endExecution: (results: any | null) => void;
  reset: () => void;
}

const AnswersContext = createContext<AnswersContextType | undefined>(undefined);

export const AnswersProvider = ({ children }: { children: ReactNode }) => {
  const { solutionId, currSectionNumber, currentSection } = useAssessment();
  const [isCodeRunning, setIsCodeRunning] = useState(false);
  const [sectionSubmitting, setSectionSubmitting] = useState(false);
  const [isCodeSubmitting, setIsCodeSubmitting] = useState(false);
  const [showOutputWindow, setShowOutputWindow] = useState(false);
  const [results, setResults] = useState<ExecutionResults[] | null>(null);
  const openOutputWindow = useCallback(() => setShowOutputWindow(true), []);
  const closeOutputWindow = useCallback(() => setShowOutputWindow(false), []);
  const runCodeMutation = useRunCode();
  const [currentSectionAnswers, setCurrentSectionAnswers] = useState<
    codingAnswer | quizAnswer | null
  >(null);
  const submitCodeMutation = useSubmitCode();

  useEffect(() => {
    const savedAnswers = localStorage.getItem(
      `${solutionId}-${currentSection?.sectionId}`,
    );
    if (savedAnswers) {
      setCurrentSectionAnswers(JSON.parse(savedAnswers));
    }
  }, []);

  useEffect(() => {
    if (currentSectionAnswers) {
      localStorage.setItem(
        `${solutionId}-${currentSection?.sectionId}`,
        JSON.stringify(currentSectionAnswers),
      );
    }
  }, [currentSectionAnswers]);
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
    [],
  );

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
      } catch (error) {
        console.error("Error in startExecution:", error);
        setResults(null);
      } finally {
        setIsCodeSubmitting(false);
        setShowOutputWindow(true);
      }
    },
    [],
  );

  const endExecution = useCallback((results: any | null) => {
    setIsCodeRunning(false);
    setResults(results);
  }, []);

  const reset = useCallback(() => {
    setShowOutputWindow(false);
    setIsCodeRunning(false);
    setResults(null);
  }, []);
  const submitSection = useSubmitSection();
  const handleSubmit = async () => {
    await submitSection.mutateAsync({
      solutionId,
      sectionId: currentSection?.sectionId as string,
      sectionType: currentSection?.type as string,
      response: currentSectionAnswers as codingAnswer | quizAnswer,
      current: Number(currSectionNumber),
    });
  };

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

export const useAnswers = () => {
  const context = useContext(AnswersContext);
  if (context === undefined) {
    throw new Error("useCodeOutput must be used within a AnswersProvider");
  }
  return context;
};
