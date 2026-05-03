import { CodingProblem } from "@/types/assessment";
import { Typography, Chip } from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  Code as CodeIcon,
  TipsAndUpdatesOutlined as TipsIcon,
  CheckCircleOutline as ConstraintIcon,
} from "@mui/icons-material";
import React, { useState, useMemo, useEffect } from "react";
import { MarkdownRenderer } from "./ProbelmDescription";
import { useAssessment } from "@/modules/assesment/context/AssesmentContext";
import { COLORS } from "@/constants/colors";

interface ProblemSelectorProps {
  problems: CodingProblem[];
  setProblemId: (id: string) => void;
  selectedId?: string;
}

export default function ProblemSelector({
  problems,
  setProblemId,
  selectedId,
}: ProblemSelectorProps) {
  // const [searchQuery, setSearchQuery] = useState("");
  // const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [expandedProblemId, setExpandedProblemId] = useState<string | null>(
    null,
  );
  const { currResponse } = useAssessment();

  useEffect(() => {
    if (selectedId) {
      setExpandedProblemId(selectedId);
    }
  }, [selectedId]);

  // const filteredProblems = useMemo(() => {
  //   return problems.filter((problem) => {
  //     const matchesSearch =
  //       problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //       problem.description?.toLowerCase().includes(searchQuery.toLowerCase());
  //     const matchesDifficulty =
  //       difficultyFilter === "all" ||
  //       problem.difficulty?.toLowerCase() === difficultyFilter;
  //     return matchesSearch && matchesDifficulty;
  //   });
  // }, [problems, searchQuery, difficultyFilter]);

  const problemStats = useMemo(() => {
    return {
      total: problems.length,
      easy: problems.filter((p) => p.difficulty?.toLowerCase() === "easy")
        .length,
      medium: problems.filter((p) => p.difficulty?.toLowerCase() === "medium")
        .length,
      hard: problems.filter((p) => p.difficulty?.toLowerCase() === "hard")
        .length,
    };
  }, [problems]);

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return {
          bg: "bg-emerald-50",
          border: "border-emerald-200",
          text: "text-emerald-700",
          dot: "bg-emerald-500",
        };
      case "medium":
        return {
          bg: "bg-amber-50",
          border: "border-amber-200",
          text: "text-amber-700",
          dot: "bg-amber-500",
        };
      case "hard":
        return {
          bg: "bg-rose-50",
          border: "border-rose-200",
          text: "text-rose-700",
          dot: "bg-rose-500",
        };
      default:
        return {
          bg: "bg-slate-50",
          border: "border-slate-200",
          text: "text-slate-700",
          dot: "bg-slate-500",
        };
    }
  };

  const handleProblemSelect = (id: string) => {
    if (id === selectedId) {
      setExpandedProblemId(expandedProblemId === id ? null : id);
    } else {
      setProblemId(id);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 bg-white border-b border-slate-200">
        <div className="flex items-center gap-2">
          <CodeIcon sx={{ fontSize: 18, color: "#3b82f6" }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#1e293b", fontSize: "0.8rem" }}>
            Coding Problems
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: "#94a3b8",
              fontSize: "0.65rem",
              fontWeight: 600,
              ml: "auto",
            }}
          >
            {problems.length} problem{problems.length !== 1 ? "s" : ""}
          </Typography>
        </div>
      </div>

      {/* Problems List */}
      <div className="flex-1 overflow-auto px-4 py-3 bg-[#fafbfc]">
        {/* {filteredProblems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <SearchIcon sx={{ fontSize: 56, marginBottom: 2, opacity: 0.5 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#475569", mb: 0.5 }}>
              No problems found
            </Typography>
            <Typography variant="caption" sx={{ color: "#94a3b8" }}>
              Try adjusting your search or filters
            </Typography>
          </div>
        ) : ( */}
        <div className="flex flex-col gap-2">
          {problems.map((problem) => {
            const isSubmitted = currResponse?.codingAnswers[0]?.[problem?._id];
            const isSelected = selectedId === problem._id
            const isExpanded = expandedProblemId === problem._id;
            const colors = getDifficultyColor(problem.difficulty);
            return (
              <div
                key={problem._id}
                className={`bg-white relative border rounded-lg overflow-hidden transition-all duration-150 ${isSelected
                  ? "border-blue-400 ring-1 ring-blue-100"
                  : "border-slate-200 hover:border-slate-300"
                  }`}
              >
                {/* Problem Header */}
                {isSubmitted && (
                  <div className="absolute top-0 left-0 w-24 h-24 overflow-hidden pointer-events-none">
                    <div className="absolute top-1.5 -left-8 bg-emerald-500 text-white text-center text-[8px] font-bold py-0.5 pl-8 pr-12 transform -rotate-45 shadow-sm">
                      Submitted
                    </div>
                  </div>
                )}

                <button
                  onClick={() => handleProblemSelect(problem._id)}
                  className="w-full px-4 py-3 text-left transition-colors"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 700,
                          color: "#1e293b",
                          marginBottom: 1,
                          fontSize: "0.95rem",
                        }}
                      >
                        {problem.title}
                      </Typography>
                      {/* <Typography
                        variant="body2"
                        sx={{
                          color: "#64748b",
                          lineHeight: 1.5,
                          fontSize: "0.85rem",
                        }}
                      >
                        {problem.description
                          ? problem.description.substring(0, 140) +
                            (problem.description.length > 140 ? "..." : "")
                          : "No description available"}
                      </Typography> */}
                    </div>

                    {/* Right Side Controls */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Chip
                        label={problem.difficulty || "Unknown"}
                        size="small"
                        icon={
                          <div
                            className={`w-2 h-2 rounded-full ${colors.dot}`}
                          />
                        }
                        sx={{
                          backgroundColor: colors.bg,
                          borderColor: colors.border,
                          color: colors.text,
                          fontWeight: 600,
                          fontSize: "0.75rem",
                          height: "24px",
                          border: `1px solid ${colors.border === "border-emerald-200" ? "#dcfce7" : colors.border === "border-amber-200" ? "#fef3c7" : colors.border === "border-rose-200" ? "#ffe4e6" : "#e2e8f0"}`,
                          "& .MuiChip-icon": {
                            marginLeft: "2px",
                            fontSize: "0.5rem",
                          },
                        }}
                      />

                      {problem.languagesSupported &&
                        problem.languagesSupported.length > 0 && (
                          <Chip
                            label={`${problem.languagesSupported.length}`}
                            size="small"
                            variant="outlined"
                            icon={<CodeIcon sx={{ fontSize: "0.9rem" }} />}
                            sx={{
                              height: "24px",
                              fontSize: "0.75rem",
                              fontWeight: 500,
                              borderColor: "#cbd5e1",
                              color: "#64748b",
                            }}
                          />
                        )}

                      <ExpandMoreIcon
                        sx={{
                          color: "#94a3b8",
                          transition: "transform 200ms",
                          transform: isExpanded
                            ? "rotate(180deg)"
                            : "rotate(0deg)",
                          fontSize: 22,
                        }}
                      />
                    </div>
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 space-y-4">
                    {/* Full Description */}
                    {/* {problem.description && (
                      <div>
                        <Typography
                          variant="overline"
                          sx={{
                            fontWeight: 700,
                            color: "#475569",
                            fontSize: "0.7rem",
                            letterSpacing: "0.5px",
                            display: "block",
                            marginBottom: 1,
                          }}
                        >
                          Description
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#334155",
                            lineHeight: 1.6,
                            fontSize: "0.85rem",
                          }}
                        >
                          {problem.description}
                        </Typography>
                      </div>
                    )} */}
                    <MarkdownRenderer source={problem.description} />

                    {/* Languages Supported */}
                    {problem.languagesSupported &&
                      problem.languagesSupported.length > 0 && (
                        <div>
                          <Typography
                            variant="overline"
                            sx={{
                              fontWeight: 700,
                              color: "#475569",
                              fontSize: "0.7rem",
                              letterSpacing: "0.5px",
                              display: "block",
                              marginBottom: 1.5,
                            }}
                          >
                            Languages Supported
                          </Typography>
                          <div className="flex flex-wrap gap-2">
                            {problem.languagesSupported.map((lang) => (
                              <Chip
                                key={lang}
                                label={
                                  lang.charAt(0).toUpperCase() + lang.slice(1)
                                }
                                size="small"
                                variant="outlined"
                                sx={{
                                  backgroundColor: "#eff6ff",
                                  borderColor: "#bfdbfe",
                                  color: "#1e40af",
                                  fontWeight: 500,
                                  fontSize: "0.8rem",
                                  height: "28px",
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Function Signatures */}
                    {/* {problem.functionSignature &&
                      problem.functionSignature.length > 0 && (
                        <div>
                          <Typography
                            variant="overline"
                            sx={{
                              fontWeight: 700,
                              color: "#475569",
                              fontSize: "0.7rem",
                              letterSpacing: "0.5px",
                              display: "block",
                              marginBottom: 1.5,
                            }}
                          >
                            Function Signatures
                          </Typography>
                          <div className="space-y-3">
                            {problem.functionSignature.map((sig, idx) => (
                              <div key={idx}>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontWeight: 700,
                                    color: "#64748b",
                                    fontSize: "0.7rem",
                                    letterSpacing: "0.3px",
                                    textTransform: "uppercase",
                                  }}
                                >
                                  {sig.language}
                                </Typography>
                                <pre className="bg-slate-900 text-slate-100 rounded-md p-3 overflow-x-auto text-xs font-mono border border-slate-700 mt-1 leading-relaxed">
                                  <code>{sig.signature}</code>
                                </pre>
                              </div>
                            ))}
                          </div>
                        </div>
                      )} */}

                    {/* Constraints */}
                    {problem.constraints && problem.constraints.length > 0 && (
                      <div>
                        <Typography
                          variant="overline"
                          sx={{
                            fontWeight: 700,
                            color: "#475569",
                            fontSize: "0.7rem",
                            letterSpacing: "0.5px",
                            display: "block",
                            marginBottom: 1.5,
                          }}
                        >
                          Constraints
                        </Typography>
                        <ul className="space-y-2 pl-5">
                          {problem.constraints.map((constraint, idx) => (
                            <li
                              key={idx}
                              className="text-sm text-slate-700 leading-relaxed flex gap-2"
                            >
                              <ConstraintIcon
                                sx={{
                                  fontSize: 16,
                                  color: "#0ea5e9",
                                  flexShrink: 0,
                                  marginTop: "2px",
                                }}
                              />
                              <span className="text-xs">{constraint}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Examples */}
                    {problem.examples && problem.examples.length > 0 && (
                      <div>
                        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100 mb-3">
                          <CodeIcon
                            sx={{
                              color: "#0284c7",
                              fontSize: 20,
                              flexShrink: 0,
                            }}
                          />
                          <div>
                            <Typography
                              variant="overline"
                              sx={{
                                fontWeight: 700,
                                color: "#0c4a6e",
                                fontSize: "0.7rem",
                                letterSpacing: "0.5px",
                                display: "block",
                              }}
                            >
                              Examples
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                color: "#0c4a6e",
                                fontWeight: 500,
                                fontSize: "0.8rem",
                              }}
                            >
                              {problem.examples.length} example
                              {problem.examples.length !== 1 ? "s" : ""}{" "}
                              provided
                            </Typography>
                          </div>
                        </div>
                        <div className="space-y-3">
                          {problem.examples.map((example, idx) => (
                            <div
                              key={idx}
                              className="p-3 bg-slate-50 rounded-lg border border-slate-200"
                            >
                              <Typography
                                variant="caption"
                                sx={{
                                  fontWeight: 700,
                                  color: "#475569",
                                  fontSize: "0.7rem",
                                  letterSpacing: "0.3px",
                                  textTransform: "uppercase",
                                  display: "block",
                                  marginBottom: 1,
                                }}
                              >
                                Example {idx + 1}
                              </Typography>
                              {example.input && (
                                <div className="mb-2">
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: "#64748b",
                                      fontWeight: 600,
                                      fontSize: "0.75rem",
                                    }}
                                  >
                                    Input:
                                  </Typography>
                                  <pre className="bg-white text-slate-800 rounded p-2 overflow-x-auto text-xs font-mono border border-slate-300 mt-1">
                                    <code>
                                      {typeof example.input === "string"
                                        ? example.input
                                        : JSON.stringify(
                                          example.input,
                                          null,
                                          2,
                                        )}
                                    </code>
                                  </pre>
                                </div>
                              )}
                              {example.output && (
                                <div>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: "#64748b",
                                      fontWeight: 600,
                                      fontSize: "0.75rem",
                                    }}
                                  >
                                    Output:
                                  </Typography>
                                  <pre className="bg-white text-slate-800 rounded p-2 overflow-x-auto text-xs font-mono border border-slate-300 mt-1">
                                    <code>
                                      {typeof example.output === "string"
                                        ? example.output
                                        : JSON.stringify(
                                          example.output,
                                          null,
                                          2,
                                        )}
                                    </code>
                                  </pre>
                                </div>
                              )}
                              {example.explanation && (
                                <div className="mt-2 pt-2 border-t border-slate-200">
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: "#475569",
                                      fontSize: "0.8rem",
                                      fontStyle: "italic",
                                    }}
                                  >
                                    {example.explanation}
                                  </Typography>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Hints */}
                    {problem.hints && problem.hints.length > 0 && (
                      <div>
                        <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100 mb-3">
                          <TipsIcon
                            sx={{
                              color: "#b45309",
                              fontSize: 20,
                              flexShrink: 0,
                            }}
                          />
                          <div>
                            <Typography
                              variant="overline"
                              sx={{
                                fontWeight: 700,
                                color: "#78350f",
                                fontSize: "0.7rem",
                                letterSpacing: "0.5px",
                                display: "block",
                              }}
                            >
                              Help Available
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                color: "#78350f",
                                fontWeight: 500,
                                fontSize: "0.8rem",
                              }}
                            >
                              {problem.hints.length} hint
                              {problem.hints.length !== 1 ? "s" : ""} available
                            </Typography>
                          </div>
                        </div>
                        <ul className="space-y-2">
                          {problem.hints.map((hint, idx) => (
                            <li
                              key={idx}
                              className="flex gap-2 p-3 bg-amber-50 rounded-lg border border-amber-100"
                            >
                              <TipsIcon
                                sx={{
                                  color: "#b45309",
                                  fontSize: 18,
                                  flexShrink: 0,
                                  marginTop: "2px",
                                }}
                              />
                              <Typography
                                variant="body2"
                                sx={{
                                  color: "#78350f",
                                  fontSize: "0.85rem",
                                  lineHeight: 1.5,
                                }}
                              >
                                {hint}
                              </Typography>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {/* )} */}
      </div>
    </div>
  );
}
