 
"use client";
import { useState, useEffect, useRef } from "react";
import { CodingProblem } from "@/types/assessment";
import type { Monaco } from "@monaco-editor/react";
import { MonacoEditor } from "./MonacoEditor";
import { Keyboard, RocketIcon, SaveIcon } from "lucide-react";
import Code from "@mui/icons-material/Code";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import Check from "@mui/icons-material/Check";
import CloudDone from "@mui/icons-material/CloudDone";
import CloudUpload from "@mui/icons-material/CloudUpload";
import RestartAlt from "@mui/icons-material/RestartAlt";
import NavigateBeforeRounded from "@mui/icons-material/NavigateBeforeRounded";
import NavigateNextRounded from "@mui/icons-material/NavigateNextRounded";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutline";
import { useAnswers } from "@/modules/assesment/context/AnswersContext";
import { Button, IconButton, Tooltip } from "@mui/material";
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

  const handleSaveManually = () => {
    saveCode(problem._id, problem.title, selectedLanguage, code);
    setIsSaved(true);
  };

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden border-l border-gray-200">
      <div className="flex bg-[] items-center justify-between px-6 py-3 bg-gray-50 border-gray-200">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-900 hover:bg-gray-50 hover:border-gray-400 transition-all min-w-[160px] shadow-sm"
          >
            <Code className="text-gray-600" sx={{ fontSize: 18 }} />
            <span className="flex-1 text-left">
              {selectedLanguage.charAt(0).toUpperCase() +
                selectedLanguage.slice(1)}
            </span>
            <KeyboardArrowDown
              className={`text-gray-500 transition-transform ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
              sx={{ fontSize: 18 }}
            />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
              <div className="py-1">
                {problem.languagesSupported?.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleLanguageChange(lang)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                      selectedLanguage === lang
                        ? "bg-blue-50 text-blue-700 font-semibold"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span className="flex-1 text-left">
                      {lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </span>
                    {selectedLanguage === lang && (
                      <Check className="text-blue-600" sx={{ fontSize: 16 }} />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button
            endIcon={
              isCodeRunning ? (
                <Sync
                  sx={{ fontSize: 20, animation: "spin 1s linear infinite" }}
                  className="animate-spin duration-150 ease-linear"
                />
              ) : null
            }
            onClick={handleRun}
            variant="contained"
            disabled={isCodeRunning}
            sx={{
              textTransform: "none",
              fontSize: 14,
              fontWeight: 500,
              borderRadius: "5px",
              background: "#16a349",
              color: "white",
              "&:hover": {
                backgroundColor: "#16a349",
              },
              "&:disabled": {
                color: "white",
                cursor: "not-allowed",
              },
            }}
          >
            Run
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isCodeSubmitting}
            endIcon={
              isCodeSubmitting ? (
                <Sync
                  sx={{ fontSize: 20, animation: "spin 1s linear infinite" }}
                  className="animate-spin duration-150 ease-linear"
                />
              ) : null
            }
            variant="contained"
            sx={{
              textTransform: "none",
              fontSize: 14,
              fontWeight: 500,
              borderRadius: "5px",
              background: "#16a349",
              color: "white",
              "&:hover": {
                backgroundColor: "#16a349",
              },
            }}
          >
            Submit
          </Button>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-gray-200">
            {isSaved ? (
              <CloudDone className="text-green-600" sx={{ fontSize: 18 }} />
            ) : (
              <CloudUpload
                className="text-yellow-600 animate-pulse"
                sx={{ fontSize: 18 }}
              />
            )}
            <span className="text-xs font-semibold text-gray-700">
              {isSaved ? "Saved" : "Saving..."}
            </span>
          </div>

          <Tooltip title="Reset">
            <button onClick={handleReset}>
              <RestartAlt className="text-gray-700" sx={{ fontSize: 18 }} />
            </button>
          </Tooltip>

          {/* <Tooltip title="Save">
          <button
            onClick={handleSaveManually}
            disabled={isSaved}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors border shadow-sm ${
              isSaved
                ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
                : "bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
            }`}
            title="Ctrl+S or Cmd+S"
          >
            <Save sx={{ fontSize: 18 }} />
          </button> */}
        </div>
      </div>
      {/* -------------------------------------------------------------------
                Monaco Editor
      ------------------------------------------------------------------- */}
      <div className="flex-1 overflow-hidden bg-white relative">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-gray-500 font-medium">
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
              if (value === code) {
                return;
              }
              handleCodeChange(value);
            }}
            readOnly={false}
          />
        )}
      </div>

     
    </div>
  );
}
