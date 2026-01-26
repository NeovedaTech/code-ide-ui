import { CodingProblem } from "@/types/assessment";
import React, { useState, useMemo, useEffect } from "react";

interface ProblemSelectorProps {
  problems: CodingProblem[];
  setProblemId: (id: string) => void;
  selectedId?: string;
}

// type DifficultyFilter = "all" | "easy" | "medium" | "hard";

export default function ProblemSelector({
  problems,
  setProblemId,
  selectedId,
}: ProblemSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [expandedProblemId, setExpandedProblemId] = useState<string | null>(
    null
  );

  // Auto-expand the selected problem
  useEffect(() => {
    if (selectedId) {
      setExpandedProblemId(selectedId);
    }
  }, [selectedId]);

  // Filter and search problems
  const filteredProblems = useMemo(() => {
    return problems.filter((problem) => {
      const matchesSearch =
        problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        problem.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDifficulty =
        difficultyFilter === "all" ||
        problem.difficulty?.toLowerCase() === difficultyFilter;
      return matchesSearch && matchesDifficulty;
    });
  }, [problems, searchQuery, difficultyFilter]);

  // Get problem stats
  const problemStats = useMemo(() => {
    const stats = {
      total: problems.length,
      easy: problems.filter((p) => p.difficulty?.toLowerCase() === "easy")
        .length,
      medium: problems.filter((p) => p.difficulty?.toLowerCase() === "medium")
        .length,
      hard: problems.filter((p) => p.difficulty?.toLowerCase() === "hard")
        .length,
    };
    return stats;
  }, [problems]);

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return {
          bg: "#dcfce7",
          border: "#86efac",
          text: "#16a34a",
          dot: "#22c55e",
        };
      case "medium":
        return {
          bg: "#fef3c7",
          border: "#fde047",
          text: "#b45309",
          dot: "#eab308",
        };
      case "hard":
        return {
          bg: "#fee2e2",
          border: "#fca5a5",
          text: "#dc2626",
          dot: "#ef4444",
        };
      default:
        return {
          bg: "#f3f4f6",
          border: "#d1d5db",
          text: "#4b5563",
          dot: "#9ca3af",
        };
    }
  };

  const handleProblemSelect = (id: string) => {
    if (id === selectedId) {
      // Toggle if clicking the same problem
      setExpandedProblemId(expandedProblemId === id ? null : id);
    } else {
      // Switch to new problem
      setProblemId(id);
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <h2 style={styles.title}>Coding Problems</h2>
          <p style={styles.subtitle}>
            {filteredProblems.length} of {problems.length} problems
          </p>
        </div>
      </div>

      {/* Stats Bar */}
      <div style={styles.statsBar}>
        <div style={styles.statItem}>
          <span style={styles.statLabel}>Total:</span>
          <span style={styles.statValue}>{problemStats.total}</span>
        </div>
        <div style={styles.statDivider}></div>
        <div style={styles.statItem}>
          <div
            style={{
              ...styles.statDot,
              backgroundColor: "#22c55e",
            }}
          ></div>
          <span style={styles.statLabel}>Easy:</span>
          <span style={styles.statValue}>{problemStats.easy}</span>
        </div>
        <div style={styles.statItem}>
          <div
            style={{
              ...styles.statDot,
              backgroundColor: "#eab308",
            }}
          ></div>
          <span style={styles.statLabel}>Medium:</span>
          <span style={styles.statValue}>{problemStats.medium}</span>
        </div>
        <div style={styles.statItem}>
          <div
            style={{
              ...styles.statDot,
              backgroundColor: "#ef4444",
            }}
          ></div>
          <span style={styles.statLabel}>Hard:</span>
          <span style={styles.statValue}>{problemStats.hard}</span>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div style={styles.filterSection}>
        {/* Search Bar */}
        <div style={styles.searchContainer}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Search problems..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              style={styles.clearButton}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Difficulty Filter */}
        <div style={styles.filterButtons}>
          {(["all", "easy", "medium", "hard"] as const).map((difficulty) => (
            <button
              key={difficulty}
              onClick={() => setDifficultyFilter(difficulty)}
              style={{
                ...styles.filterButton,
                ...(difficultyFilter === difficulty
                  ? styles.filterButtonActive
                  : styles.filterButtonInactive),
              }}
            >
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Problems List */}
      <div style={styles.problemsListContainer}>
        {filteredProblems.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyStateIcon}>🔎</div>
            <p style={styles.emptyStateText}>No problems found</p>
            <p style={styles.emptyStateSubtext}>
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div style={styles.problemsList}>
            {filteredProblems.map((problem) => {
              const isSelected = selectedId === problem._id;
              const colors = getDifficultyColor(problem.difficulty);
              const isExpanded = expandedProblemId === problem._id;

              return (
                <div
                  key={problem._id}
                  style={{
                    ...styles.problemCard,
                    ...(isSelected ? styles.problemCardSelected : {}),
                  }}
                >
                  <button
                    onClick={() => handleProblemSelect(problem._id)}
                    style={styles.problemCardButton}
                  >
                    <div style={styles.problemCardHeader}>
                      <div style={styles.problemCardTitleSection}>
                        <p style={styles.problemCardTitle}>{problem.title}</p>
                      </div>
                      <div style={styles.problemCardMeta}>
                        <div
                          style={{
                            ...styles.problemDifficulty,
                            backgroundColor: colors.bg,
                            borderColor: colors.border,
                            color: colors.text,
                          }}
                        >
                          <div
                            style={{
                              ...styles.difficultyDot,
                              backgroundColor: colors.dot,
                            }}
                          ></div>
                          {problem.difficulty}
                        </div>
                        {problem.languagesSupported &&
                          problem.languagesSupported.length > 0 && (
                            <span style={styles.languageBadge}>
                              {problem.languagesSupported.length} langs
                            </span>
                          )}
                        <span style={styles.expandIcon}>
                          {isExpanded ? "▼" : "▶"}
                        </span>
                      </div>
                    </div>

                    {/* Problem Preview Description */}
                    <p style={styles.problemPreview}>
                      {problem.description
                        ? problem.description.substring(0, 100) +
                          (problem.description.length > 100 ? "..." : "")
                        : "No description"}
                    </p>
                  </button>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div style={styles.problemDetails}>
                      {/* Full Description */}
                      {problem.description && (
                        <div style={styles.detailSection}>
                          <h4 style={styles.detailTitle}>Description</h4>
                          <p style={styles.detailContent}>
                            {problem.description}
                          </p>
                        </div>
                      )}

                      {/* Languages Supported */}
                      {problem.languagesSupported &&
                        problem.languagesSupported.length > 0 && (
                          <div style={styles.detailSection}>
                            <h4 style={styles.detailTitle}>Languages</h4>
                            <div style={styles.languagesList}>
                              {problem.languagesSupported.map((lang) => (
                                <span
                                  key={lang}
                                  style={styles.languageTag}
                                >
                                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                      {/* Function Signatures */}
                      {problem.functionSignature &&
                        problem.functionSignature.length > 0 && (
                          <div style={styles.detailSection}>
                            <h4 style={styles.detailTitle}>
                              Function Signatures
                            </h4>
                            <div style={styles.signaturesContainer}>
                              {problem.functionSignature.map((sig, idx) => (
                                <div
                                  key={idx}
                                  style={styles.signatureItem}
                                >
                                  <span style={styles.signatureLanguage}>
                                    {sig.language.toUpperCase()}
                                  </span>
                                  <pre style={styles.signatureCode}>
                                    {sig.signature}
                                  </pre>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      {/* Constraints */}
                      {problem.constraints &&
                        problem.constraints.length > 0 && (
                          <div style={styles.detailSection}>
                            <h4 style={styles.detailTitle}>Constraints</h4>
                            <ul style={styles.constraintsList}>
                              {problem.constraints.map(
                                (constraint, idx) => (
                                  <li key={idx} style={styles.constraintItem}>
                                    {constraint}
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        )}

                      {/* Examples Count */}
                      {problem.examples && problem.examples.length > 0 && (
                        <div style={styles.detailSection}>
                          <h4 style={styles.detailTitle}>Examples</h4>
                          <p style={styles.examplesCount}>
                            📝 {problem.examples.length} example
                            {problem.examples.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                      )}

                      {/* Hints Count */}
                      {problem.hints && problem.hints.length > 0 && (
                        <div style={styles.detailSection}>
                          <h4 style={styles.detailTitle}>Help</h4>
                          <p style={styles.hintsCount}>
                            💡 {problem.hints.length} hint
                            {problem.hints.length !== 1 ? "s" : ""} available
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
    overflow: "hidden",
    border: "1px solid #e5e7eb",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  header: {
    padding: "24px",
    backgroundColor: "#fff",
    borderBottom: "1px solid #e5e7eb",
  },
  headerContent: {},
  title: {
    fontSize: "24px",
    fontWeight: "700",
    margin: "0 0 4px 0",
    color: "#000",
  },
  subtitle: {
    fontSize: "13px",
    color: "#6b7280",
    margin: "0",
  },
  statsBar: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "12px 24px",
    backgroundColor: "#fff",
    borderBottom: "1px solid #e5e7eb",
    fontSize: "13px",
  },
  statItem: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  statDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    flexShrink: 0,
  },
  statLabel: {
    color: "#6b7280",
    fontWeight: "500",
  },
  statValue: {
    color: "#1f2937",
    fontWeight: "700",
  },
  statDivider: {
    width: "1px",
    height: "20px",
    backgroundColor: "#e5e7eb",
  },
  filterSection: {
    padding: "16px 24px",
    backgroundColor: "#fff",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    gap: "16px",
    alignItems: "center",
  },
  searchContainer: {
    position: "relative",
    flex: 1,
    display: "flex",
    alignItems: "center",
  },
  searchIcon: {
    position: "absolute",
    left: "12px",
    fontSize: "16px",
    color: "#9ca3af",
  },
  searchInput: {
    width: "100%",
    padding: "10px 12px 10px 36px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "13px",
    fontFamily: "inherit",
    outline: "none",
    transition: "all 0.2s ease",
    backgroundColor: "#f9fafb",
  },
  clearButton: {
    position: "absolute",
    right: "12px",
    background: "none",
    border: "none",
    fontSize: "16px",
    color: "#9ca3af",
    cursor: "pointer",
    padding: "4px 8px",
    transition: "color 0.2s ease",
  },
  filterButtons: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  filterButton: {
    padding: "8px 14px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
    backgroundColor: "#f9fafb",
    color: "#374151",
    whiteSpace: "nowrap",
  },
  filterButtonActive: {
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
    color: "#fff",
  },
  filterButtonInactive: {
    backgroundColor: "#f9fafb",
    color: "#374151",
  },
  problemsListContainer: {
    flex: 1,
    overflow: "auto",
    padding: "16px 24px",
    backgroundColor: "#f9fafb",
  },
  problemsList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  problemCard: {
    backgroundColor: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "6px",
    overflow: "hidden",
    transition: "all 0.2s ease",
  },
  problemCardSelected: {
    boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
    borderColor: "#3b82f6",
  },
  problemCardButton: {
    width: "100%",
    background: "none",
    border: "none",
    padding: "16px",
    textAlign: "left",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
  },
  problemCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "8px",
  },
  problemCardTitleSection: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  problemCardTitle: {
    fontSize: "15px",
    fontWeight: "600",
    margin: "0",
    color: "#000",
  },
  problemDifficulty: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "4px 10px",
    borderRadius: "12px",
    border: "1px solid",
    fontSize: "11px",
    fontWeight: "600",
    whiteSpace: "nowrap",
    flexShrink: 0,
  },
  difficultyDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    flexShrink: 0,
  },
  problemCardMeta: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  languageBadge: {
    fontSize: "12px",
    color: "#6b7280",
    fontWeight: "500",
    backgroundColor: "#f3f4f6",
    padding: "4px 8px",
    borderRadius: "4px",
  },
  expandIcon: {
    fontSize: "12px",
    color: "#9ca3af",
    transition: "transform 0.2s ease",
  },
  problemPreview: {
    margin: "0",
    fontSize: "13px",
    color: "#6b7280",
    lineHeight: "1.5",
  },
  problemDetails: {
    padding: "16px",
    backgroundColor: "#f9fafb",
    borderTop: "1px solid #e5e7eb",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  detailSection: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  detailTitle: {
    margin: "0",
    fontSize: "12px",
    fontWeight: "700",
    color: "#374151",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  detailContent: {
    margin: "0",
    fontSize: "13px",
    color: "#4b5563",
    lineHeight: "1.6",
  },
  languagesList: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  languageTag: {
    display: "inline-block",
    padding: "4px 10px",
    backgroundColor: "#eff6ff",
    color: "#1e40af",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: "500",
    border: "1px solid #bfdbfe",
  },
  signaturesContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  signatureItem: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  signatureLanguage: {
    fontSize: "10px",
    fontWeight: "700",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  signatureCode: {
    margin: "0",
    padding: "8px 10px",
    backgroundColor: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "4px",
    fontSize: "11px",
    fontFamily: "'Fira Code', 'Courier New', monospace",
    color: "#374151",
    overflow: "auto",
    maxHeight: "80px",
  },
  constraintsList: {
    margin: "0",
    paddingLeft: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  constraintItem: {
    margin: "0",
    fontSize: "13px",
    color: "#4b5563",
    lineHeight: "1.5",
  },
  examplesCount: {
    margin: "0",
    fontSize: "13px",
    color: "#4b5563",
    fontWeight: "500",
  },
  hintsCount: {
    margin: "0",
    fontSize: "13px",
    color: "#4b5563",
    fontWeight: "500",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "300px",
    color: "#9ca3af",
  },
  emptyStateIcon: {
    fontSize: "48px",
    margin: "0 0 12px 0",
  },
  emptyStateText: {
    margin: "0 0 4px 0",
    fontSize: "16px",
    fontWeight: "600",
    color: "#6b7280",
  },
  emptyStateSubtext: {
    margin: "0",
    fontSize: "13px",
    color: "#9ca3af",
  },
};