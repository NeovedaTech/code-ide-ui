
"use client";
import { useState, useEffect, useRef } from "react";
import { CodingProblem } from "@/types/assessment";
import type { Monaco } from "@monaco-editor/react";
import { MonacoEditor } from "./MonacoEditor";
import Code from "@mui/icons-material/Code";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import Check from "@mui/icons-material/Check";
import CloudDone from "@mui/icons-material/CloudDone";
import CloudUpload from "@mui/icons-material/CloudUpload";
import RestartAlt from "@mui/icons-material/RestartAlt";
import NavigateBeforeRounded from "@mui/icons-material/NavigateBeforeRounded";
import NavigateNextRounded from "@mui/icons-material/NavigateNextRounded";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutline";
import PlayArrowRounded from "@mui/icons-material/PlayArrowRounded";
import PublishRounded from "@mui/icons-material/PublishRounded";
import { useAnswers } from "@/modules/assesment/context/AnswersContext";
import { IconButton, Tooltip } from "@mui/material";
import { Sync } from "@mui/icons-material";
import { useAssessment } from "@/modules/assesment/context/AssesmentContext";

const generateStorageKey = (
  problemId: string,
  problemTitle: string,
  language: string,
): string => {
  return `${problemId}|${problemTitle}|${language}`;
};

const getStoredCode = (
  problemId: string,
  problemTitle: string,
  language: string,
): string => {
  try {
    const key = generateStorageKey(problemId, problemTitle, language);
    const stored = localStorage.getItem(`code:${key}`);
    return stored || "";
  } catch (e) {
    console.warn("Failed to access localStorage:", e);
    return "";
  }
};

const saveCode = (
  problemId: string,
  problemTitle: string,
  language: string,
  code: string,
): void => {
  try {
    const key = generateStorageKey(problemId, problemTitle, language);
    localStorage.setItem(`code:${key}`, code);
  } catch (e) {
    console.warn("Failed to save to localStorage:", e);
  }
};

const getLanguageMode = (language: string): string => {
  const languageMap: Record<string, string> = {
    python: "python",
    cpp: "cpp",
    c: "c",
    java: "java",
    javascript: "javascript",
    typescript: "typescript",
    go: "go",
    rust: "rust",
    csharp: "csharp",
  };
  return languageMap[language] || "plaintext";
};

export default function ProblemEditor({
  problem,
  sectionId,
  problemIndex = 0,
  totalProblems = 1,
  hasPrev = false,
  hasNext = false,
  isSubmitted = false,
  submittedCount = 0,
  onPrev,
  onNext,
  onNextUnsubmitted,
}: {
  problem: CodingProblem;
  sectionId: string;
  problemIndex?: number;
  totalProblems?: number;
  hasPrev?: boolean;
  hasNext?: boolean;
  isSubmitted?: boolean;
  submittedCount?: number;
  onPrev?: () => void;
  onNext?: () => void;
  onNextUnsubmitted?: () => void;
}) {
  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    problem.languagesSupported?.[0] || "python",
  );
  const [code, setCode] = useState<string>("");
  const [isSaved, setIsSaved] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { solutionId } = useAssessment();
  const { startExecution, isCodeRunning, isCodeSubmitting, startCodeSubmission } = useAnswers();

  const [showSubmitSuccess, setShowSubmitSuccess] = useState(false);
  const wasSubmittingRef = useRef(false);
  useEffect(() => {
    if (isCodeSubmitting) {
      wasSubmittingRef.current = true;
    } else if (wasSubmittingRef.current) {
      wasSubmittingRef.current = false;
      if (isSubmitted) setShowSubmitSuccess(true);
    }
  }, [isCodeSubmitting, isSubmitted]);

  useEffect(() => {
    setShowSubmitSuccess(false);
  }, [problem._id]);

  const handleSubmit = () => {
    startCodeSubmission({
      code,
      lang: selectedLanguage,
      problemId: problem._id,
      sectionId: sectionId,
      solutionId: solutionId,
    });
  };
  const handleRun = () => {
    startExecution({
      code,
      lang: selectedLanguage,
      problemId: problem._id,
      sectionId: sectionId,
    });
  };
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const stored = getStoredCode(problem._id, problem.title, selectedLanguage);
    const signature = problem.functionSignature?.find(
      (sig) => sig.language === selectedLanguage,
    )?.signature;

    const initialCode =
      stored || signature || `# Write your ${selectedLanguage} code here`;
    setCode(initialCode);
    setIsSaved(true);
    setIsLoading(false);
  }, [selectedLanguage, problem._id, problem.title, problem.functionSignature]);

  useEffect(() => {
    if (code && !isLoading) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        saveCode(problem._id, problem.title, selectedLanguage, code);
        setIsSaved(true);
      }, 1500);
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [code, selectedLanguage, problem._id, problem.title, isLoading]);

  const handleLanguageChange = (language: string) => {
    if (code && saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveCode(problem._id, problem.title, selectedLanguage, code);
    }
    setSelectedLanguage(language);
    setIsDropdownOpen(false);
  };

  const handleCodeChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
      setIsSaved(false);
    }
  };

  const parentRef = useRef<HTMLDivElement>(null);
  const handleReset = () => {
    const signature = problem.functionSignature?.find(
      (sig) => sig.language === selectedLanguage,
    )?.signature;
    const resetCode = signature || `# Write your ${selectedLanguage} code here`;
    setCode(resetCode);
    setIsSaved(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#fafbfc] overflow-hidden">
      {/* ── Problem navigation bar ── */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
        <div className="flex items-center gap-1.5">
          <Tooltip title="Previous problem">
            <span>
              <IconButton
                size="small"
                disabled={!hasPrev}
                onClick={onPrev}
                sx={{
                  p: 0.5,
                  color: "#64748b",
                  "&:hover": { bgcolor: "#f1f5f9" },
                  "&.Mui-disabled": { color: "#cbd5e1" },
                }}
              >
                <NavigateBeforeRounded sx={{ fontSize: 18 }} />
              </IconButton>
            </span>
          </Tooltip>
          <span className="text-xs font-semibold text-slate-600 select-none tabular-nums">
            Problem {problemIndex + 1} of {totalProblems}
          </span>
          <Tooltip title="Next problem">
            <span>
              <IconButton
                size="small"
                disabled={!hasNext}
                onClick={onNext}
                sx={{
                  p: 0.5,
                  color: "#64748b",
                  "&:hover": { bgcolor: "#f1f5f9" },
                  "&.Mui-disabled": { color: "#cbd5e1" },
                }}
              >
                <NavigateNextRounded sx={{ fontSize: 18 }} />
              </IconButton>
            </span>
          </Tooltip>
          {isSubmitted && (
            <span className="inline-flex items-center gap-1 ml-2 px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wide">
              <CheckCircleOutline sx={{ fontSize: 12 }} />
              Submitted
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            {submittedCount}/{totalProblems} submitted
          </span>
          {/* Save indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200">
            {isSaved ? (
              <CloudDone sx={{ fontSize: 14, color: "#16a34a" }} />
            ) : (
              <CloudUpload sx={{ fontSize: 14, color: "#d97706" }} className="animate-pulse" />
            )}
            <span className="text-[10px] font-semibold text-slate-500">
              {isSaved ? "Saved" : "Saving..."}
            </span>
          </div>
        </div>
      </div>

      {/* ── Success banner after submission ── */}
      {showSubmitSuccess && !isCodeSubmitting && (
        <div className="flex items-center justify-between px-4 py-2 bg-emerald-50 border-b border-emerald-200">
          <div className="flex items-center gap-2">
            <CheckCircleOutline sx={{ fontSize: 16, color: "#16a34a" }} />
            <span className="text-xs font-semibold text-emerald-800">
              Problem submitted successfully!
            </span>
          </div>
          <div className="flex items-center gap-2">
            {hasNext && (
              <button
                onClick={() => { setShowSubmitSuccess(false); onNextUnsubmitted?.(); }}
                className="px-3 py-1 text-[11px] font-semibold rounded bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
              >
                Next Problem
              </button>
            )}
            <button
              onClick={() => setShowSubmitSuccess(false)}
              className="px-2 py-1 text-[11px] font-medium rounded text-slate-500 hover:bg-slate-100 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* ── Editor Toolbar ── */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
        {/* Language selector */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2.5 pl-3 pr-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-all min-w-[140px]"
          >
            <Code sx={{ fontSize: 15, color: "#64748b" }} />
            <span className="flex-1 text-left">
              {selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1)}
            </span>
            <KeyboardArrowDown
              sx={{
                fontSize: 16,
                color: "#94a3b8",
                transition: "transform 0.2s",
                transform: isDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
              }}
            />
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-full bg-white border border-slate-200 rounded-md shadow-lg z-50 overflow-hidden">
              {problem.languagesSupported?.map((lang) => (
                <button
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs transition-colors ${
                    selectedLanguage === lang
                      ? "bg-blue-50 text-blue-700 font-semibold"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className="flex-1 text-left">
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </span>
                  {selectedLanguage === lang && (
                    <Check sx={{ fontSize: 14, color: "#2563eb" }} />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <Tooltip title="Reset to default">
            <IconButton
              onClick={handleReset}
              size="small"
              sx={{
                color: "#94a3b8",
                "&:hover": { bgcolor: "#f1f5f9", color: "#64748b" },
              }}
            >
              <RestartAlt sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>

          <div className="w-px h-5 bg-slate-200 mx-1" />

          {/* Run button — outlined */}
          <button
            onClick={handleRun}
            disabled={isCodeRunning}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md border border-blue-600 text-blue-600 bg-white hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isCodeRunning ? (
              <Sync sx={{ fontSize: 14 }} className="animate-spin" />
            ) : (
              <PlayArrowRounded sx={{ fontSize: 16 }} />
            )}
            Run
          </button>

          {/* Submit button — filled */}
          <button
            onClick={handleSubmit}
            disabled={isCodeSubmitting}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {isCodeSubmitting ? (
              <Sync sx={{ fontSize: 14 }} className="animate-spin" />
            ) : (
              <PublishRounded sx={{ fontSize: 16 }} />
            )}
            Submit
          </button>
        </div>
      </div>

      {/* ── Monaco Editor ── */}
      <div className="flex-1 overflow-hidden bg-[#020817] relative">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-3">
              <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-400 font-medium">
                Loading editor...
              </p>
            </div>
          </div>
        ) : (
          <MonacoEditor
            parentRef={parentRef}
            value={code}
            language={getLanguageMode(selectedLanguage)}
            onChange={(value) => {
              if (value === code) return;
              handleCodeChange(value);
            }}
            readOnly={false}
          />
        )}
      </div>
    </div>
  );
}
