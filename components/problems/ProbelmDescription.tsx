import React from "react";
import { CodingProblem } from "@/types/assessment";

// Custom Markdown Renderer
function MarkdownRenderer({ source }: { source: string }) {
  if (!source) return null;

  const renderMarkdown = (text: string) => {
    const lines = text.split("\n");
    const elements = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // Headers
      if (line.startsWith("### ")) {
        elements.push(
          <h3
            key={i}
            style={{
              fontSize: "16px",
              fontWeight: "bold",
              marginTop: "12px",
              marginBottom: "8px",
            }}
          >
            {line.slice(4)}
          </h3>,
        );
      } else if (line.startsWith("## ")) {
        elements.push(
          <h2
            key={i}
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              marginTop: "16px",
              marginBottom: "12px",
            }}
          >
            {line.slice(3)}
          </h2>,
        );
      } else if (line.startsWith("# ")) {
        elements.push(
          <h1
            key={i}
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              marginTop: "20px",
              marginBottom: "16px",
            }}
          >
            {line.slice(2)}
          </h1>,
        );
      }
      // Code blocks
      else if (line.startsWith("```")) {
        const codeLines = [];
        i++;
        while (i < lines.length && !lines[i].startsWith("```")) {
          codeLines.push(lines[i]);
          i++;
        }
        elements.push(
          <pre
            key={i}
            style={{
              backgroundColor: "#f5f5f5",
              border: "1px solid #e0e0e0",
              borderRadius: "4px",
              padding: "12px",
              overflow: "auto",
              fontSize: "13px",
              fontFamily: "monospace",
              marginTop: "8px",
              marginBottom: "8px",
            }}
          >
            <code>{codeLines.join("\n")}</code>
          </pre>,
        );
      }
      // Bullet lists
      else if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        const listItems = [];
        while (
          i < lines.length &&
          (lines[i].trim().startsWith("- ") || lines[i].trim().startsWith("* "))
        ) {
          listItems.push(lines[i].trim().slice(2));
          i++;
        }
        i--;
        elements.push(
          <ul
            key={i}
            style={{
              marginLeft: "20px",
              marginTop: "8px",
              marginBottom: "8px",
              paddingLeft: "20px",
            }}
          >
            {listItems.map((item, idx) => (
              <li key={idx} style={{ marginBottom: "4px" }}>
                {parseInline(item)}
              </li>
            ))}
          </ul>,
        );
      }
      // Numbered lists
      else if (/^\d+\.\s/.test(line.trim())) {
        const listItems = [];
        while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
          listItems.push(lines[i].trim().replace(/^\d+\.\s/, ""));
          i++;
        }
        i--;
        elements.push(
          <ol
            key={i}
            style={{
              marginLeft: "20px",
              marginTop: "8px",
              marginBottom: "8px",
              paddingLeft: "20px",
            }}
          >
            {listItems.map((item, idx) => (
              <li key={idx} style={{ marginBottom: "4px" }}>
                {parseInline(item)}
              </li>
            ))}
          </ol>,
        );
      }
      // Empty lines
      else if (line.trim() === "") {
        elements.push(<div key={i} style={{ height: "12px" }} />);
      }
      // Regular paragraphs
      else {
        elements.push(
          <p key={i} style={{ marginBottom: "12px", lineHeight: "1.6" }}>
            {parseInline(line)}
          </p>,
        );
      }

      i++;
    }

    return elements;
  };

  const parseInline = (text: string) => {
    return text
      .replace(/`([^`]+)`/g, (match, code) => `${code}`)
      .replace(/\*\*([^*]+)\*\*/g, (match, bold) => bold)
      .replace(/\*([^*]+)\*/g, (match, italic) => italic)
      .replace(/_([^_]+)_/g, (match, underline) => underline);
  };

  return (
    <div style={{ fontSize: "14px", lineHeight: "1.6", color: "#333" }}>
      {renderMarkdown(source)}
    </div>
  );
}

export default function ProblemDescription({
  problem,
}: {
  problem: CodingProblem;
}) {
  if (!problem) {
    return (
      <div style={{ padding: "20px", textAlign: "center", color: "#999" }}>
        Select a problem
      </div>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    const styles = {
      easy: {
        color: "#16a34a",
        backgroundColor: "#f0fdf4",
        borderColor: "#86efac",
      },
      medium: {
        color: "#b45309",
        backgroundColor: "#fefce8",
        borderColor: "#fde047",
      },
      hard: {
        color: "#dc2626",
        backgroundColor: "#fef2f2",
        borderColor: "#fca5a5",
      },
      default: {
        color: "#4b5563",
        backgroundColor: "#f9fafb",
        borderColor: "#e5e7eb",
      },
    };

    return (
      styles[difficulty?.toLowerCase() as keyof typeof styles] || styles.default
    );
  };

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#fff",
        height: "100%",
        overflow: "auto",
      }}
    >
      {/* Title Section */}
      <div style={{ marginBottom: "20px" }}>
        {/* {problem?._id && (
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
            #{problem._id}
          </div>
        )} */}
        <h1
          style={{
            fontSize: "28px",
            fontWeight: "bold",
            marginBottom: "12px",
            color: "#000",
          }}
        >
          {problem.title || "Problem Description"}
        </h1>
        {problem.difficulty && (
          <span
            style={{
              display: "inline-block",
              padding: "4px 12px",
              borderRadius: "16px",
              border: `1px solid ${getDifficultyColor(problem.difficulty).borderColor}`,
              ...getDifficultyColor(problem.difficulty),
              fontSize: "13px",
              fontWeight: "500",
            }}
          >
            {problem.difficulty}
          </span>
        )}
      </div>

      {/* Description */}
      <div style={{ marginBottom: "24px" }}>
        <MarkdownRenderer source={problem.description} />
      </div>

      {/* Constraints */}
      {problem?.constraints && problem.constraints.length > 0 && (
        <div style={{ marginBottom: "24px" }}>
          <h2
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              marginBottom: "12px",
              color: "#000",
            }}
          >
            Constraints:
          </h2>
          <ul
            style={{
              marginLeft: "20px",
              paddingLeft: "20px",
              listStyleType: "disc",
            }}
          >
            {problem.constraints.map((constraint, i) => (
              <li key={i} style={{ marginBottom: "8px", color: "#333" }}>
                {constraint}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Input Format */}
      {problem?.inputFormat && problem.inputFormat.length > 0 && (
        <div style={{ marginBottom: "24px" }}>
          <h2
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              marginBottom: "12px",
              color: "#000",
            }}
          >
            Input Format:
          </h2>
          <ul
            style={{
              marginLeft: "20px",
              paddingLeft: "20px",
              listStyleType: "disc",
            }}
          >
            {problem.inputFormat.map((format, i) => (
              <li key={i} style={{ marginBottom: "8px", color: "#333" }}>
                {format}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Output Format */}
      {problem?.outputFormat && problem.outputFormat.length > 0 && (
        <div style={{ marginBottom: "24px" }}>
          <h2
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              marginBottom: "12px",
              color: "#000",
            }}
          >
            Output Format:
          </h2>
          <ul
            style={{
              marginLeft: "20px",
              paddingLeft: "20px",
              listStyleType: "disc",
            }}
          >
            {problem.outputFormat.map((format, i) => (
              <li key={i} style={{ marginBottom: "8px", color: "#333" }}>
                {format}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Examples */}
      {problem?.examples?.length > 0 && (
        <div style={{ marginBottom: "24px" }}>
          <h2
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              marginBottom: "16px",
              color: "#000",
            }}
          >
            Examples:
          </h2>
          <div>
            {problem.examples.map((ex, idx) => (
              <div
                key={idx}
                style={{
                  marginBottom: "20px",
                  padding: "16px",
                  backgroundColor: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  borderRadius: "6px",
                }}
              >
                <h3
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    marginBottom: "12px",
                    color: "#000",
                  }}
                >
                  Example {idx + 1}
                </h3>
                <div style={{ marginBottom: "12px" }}>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: "500",
                      marginBottom: "8px",
                      color: "#333",
                    }}
                  >
                    Input:
                  </div>
                  <pre
                    style={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "4px",
                      padding: "10px",
                      overflow: "auto",
                      fontSize: "12px",
                      fontFamily: "monospace",
                      color: "#333",
                    }}
                  >
                    {ex.input}
                  </pre>
                </div>
                <div style={{ marginBottom: "12px" }}>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: "500",
                      marginBottom: "8px",
                      color: "#333",
                    }}
                  >
                    Output:
                  </div>
                  <pre
                    style={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "4px",
                      padding: "10px",
                      overflow: "auto",
                      fontSize: "12px",
                      fontFamily: "monospace",
                      color: "#333",
                    }}
                  >
                    {ex.output}
                  </pre>
                </div>
                {ex.explanation && (
                  <div>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: "500",
                        marginBottom: "8px",
                        color: "#333",
                      }}
                    >
                      Explanation:
                    </div>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "#555",
                        lineHeight: "1.5",
                      }}
                    >
                      {ex.explanation}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hints */}
      {problem?.hints && problem.hints.length > 0 && (
        <div style={{ marginBottom: "24px" }}>
          <h2
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              marginBottom: "16px",
              color: "#000",
            }}
          >
            Hints:
          </h2>
          <div>
            {problem.hints.map((hint, i) => (
              <div
                key={i}
                style={{
                  marginBottom: "12px",
                  padding: "12px",
                  backgroundColor: "#f0f9ff",
                  border: "1px solid #bfdbfe",
                  borderRadius: "4px",
                  fontSize: "13px",
                  color: "#1e40af",
                }}
              >
                <strong>Hint {i + 1}:</strong> {hint}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
