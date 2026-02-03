import React from "react";
import { CodingProblem } from "@/types/assessment";

// Custom Markdown Renderer
export function MarkdownRenderer({ source }: { source: string }) {
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
          <h3 key={i} className="text-lg font-semibold text-gray-900 mt-4 mb-2">
            {line.slice(4)}
          </h3>
        );
      } else if (line.startsWith("## ")) {
        elements.push(
          <h2 key={i} className="text-xl font-semibold text-gray-900 mt-5 mb-3">
            {line.slice(3)}
          </h2>
        );
      } else if (line.startsWith("# ")) {
        elements.push(
          <h1 key={i} className="text-2xl font-bold text-gray-900 mt-6 mb-4">
            {line.slice(2)}
          </h1>
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
            className="bg-gray-900 text-gray-100 rounded-lg p-4 my-3 overflow-x-auto text-sm font-mono border border-gray-700"
          >
            <code>{codeLines.join("\n")}</code>
          </pre>
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
          <ul key={i} className="list-disc list-inside space-y-1.5 my-3 text-gray-700">
            {listItems.map((item, idx) => (
              <li key={idx} dangerouslySetInnerHTML={{ __html: parseInline(item) }} />
            ))}
          </ul>
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
          <ol key={i} className="list-decimal list-inside space-y-1.5 my-3 text-gray-700">
            {listItems.map((item, idx) => (
              <li key={idx} dangerouslySetInnerHTML={{ __html: parseInline(item) }} />
            ))}
          </ol>
        );
      }
      // Empty lines
      else if (line.trim() === "") {
        elements.push(<div key={i} className="h-2" />);
      }
      // Regular paragraphs
      else {
        elements.push(
          <p
            key={i}
            className="text-gray-700 leading-relaxed my-2"
            dangerouslySetInnerHTML={{ __html: parseInline(line) }}
          />
        );
      }

      i++;
    }

    return elements;
  };

  const parseInline = (text: string) => {
    return text
      .replace(/`([^`]+)`/g, (match, code) => `<code class="bg-gray-100 text-red-600 px-1.5 py-0.5 rounded text-sm font-mono">${code}</code>`)
      .replace(/\*\*([^*]+)\*\*/g, (match, bold) => `<strong class="font-semibold text-gray-900">${bold}</strong>`)
      .replace(/\*([^*]+)\*/g, (match, italic) => `<em class="italic">${italic}</em>`)
      .replace(/_([^_]+)_/g, (match, underline) => `<u>${underline}</u>`);
  };

  return <div className="prose max-w-none">{renderMarkdown(source)}</div>;
}

export default function ProblemDescription({
  problem,
}: {
  problem: CodingProblem;
}) {
  if (!problem) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <p className="text-gray-500 text-lg font-medium">Select a problem</p>
      </div>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    const styles = {
      easy: {
        color: "#059669",
        backgroundColor: "#d1fae5",
        borderColor: "#34d399",
      },
      medium: {
        color: "#d97706",
        backgroundColor: "#fef3c7",
        borderColor: "#fbbf24",
      },
      hard: {
        color: "#dc2626",
        backgroundColor: "#fee2e2",
        borderColor: "#f87171",
      },
      default: {
        color: "#4b5563",
        backgroundColor: "#f3f4f6",
        borderColor: "#d1d5db",
      },
    };

    return (
      styles[difficulty?.toLowerCase() as keyof typeof styles] || styles.default
    );
  };

  const difficultyStyle = getDifficultyColor(problem.difficulty);

  return (
    <div className="h-full overflow-y-auto bg-white">
      <div className="max-w-4xl mx-auto px-8 py-8">
        {/* Title Section */}
        <div className="border-b border-gray-200 pb-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            {problem.title || "Problem Description"}
          </h1>
          {problem.difficulty && (
            <span
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border"
              style={{
                color: difficultyStyle.color,
                backgroundColor: difficultyStyle.backgroundColor,
                borderColor: difficultyStyle.borderColor,
              }}
            >
              {problem.difficulty}
            </span>
          )}
        </div>

        {/* Description */}
        <div className="mb-8">
          <MarkdownRenderer source={problem.description} />
        </div>

        {/* Constraints */}
        {problem?.constraints && problem.constraints.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
              <span className="w-1 h-6 bg-blue-600 mr-3 rounded"></span>
              Constraints
            </h2>
            <ul className="space-y-2 bg-gray-50 rounded-lg p-5 border border-gray-200">
              {problem.constraints.map((constraint, i) => (
                <li key={i} className="flex items-start text-gray-700">
                  <span className="text-blue-600 mr-3 mt-1">•</span>
                  <span className="flex-1">{constraint}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Input Format */}
        {problem?.inputFormat && problem.inputFormat.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
              <span className="w-1 h-6 bg-green-600 mr-3 rounded"></span>
              Input Format
            </h2>
            <ul className="space-y-2 bg-gray-50 rounded-lg p-5 border border-gray-200">
              {problem.inputFormat.map((format, i) => (
                <li key={i} className="flex items-start text-gray-700">
                  <span className="text-green-600 mr-3 mt-1">•</span>
                  <span className="flex-1">{format}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Output Format */}
        {problem?.outputFormat && problem.outputFormat.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
              <span className="w-1 h-6 bg-purple-600 mr-3 rounded"></span>
              Output Format
            </h2>
            <ul className="space-y-2 bg-gray-50 rounded-lg p-5 border border-gray-200">
              {problem.outputFormat.map((format, i) => (
                <li key={i} className="flex items-start text-gray-700">
                  <span className="text-purple-600 mr-3 mt-1">•</span>
                  <span className="flex-1">{format}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Examples */}
        {problem?.examples?.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="w-1 h-6 bg-amber-600 mr-3 rounded"></span>
              Examples
            </h2>
            <div className="space-y-6">
              {problem.examples.map((ex, idx) => (
                <div
                  key={idx}
                  className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm"
                >
                  <div className="bg-gray-100 px-5 py-3 border-b border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900">
                      Example {idx + 1}
                    </h3>
                  </div>
                  <div className="p-5 space-y-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-2">
                        Input:
                      </p>
                      <pre className="bg-gray-900 text-gray-100 rounded-md p-3 overflow-x-auto text-sm font-mono">
                        <code>{ex.input}</code>
                      </pre>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-2">
                        Output:
                      </p>
                      <pre className="bg-gray-900 text-gray-100 rounded-md p-3 overflow-x-auto text-sm font-mono">
                        <code>{ex.output}</code>
                      </pre>
                    </div>
                    {ex.explanation && (
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">
                          Explanation:
                        </p>
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-md">
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {ex.explanation}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hints */}
        {problem?.hints && problem.hints.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="w-1 h-6 bg-indigo-600 mr-3 rounded"></span>
              Hints
            </h2>
            <div className="space-y-3">
              {problem.hints.map((hint, i) => (
                <div
                  key={i}
                  className="bg-indigo-50 border border-indigo-200 rounded-lg p-4"
                >
                  <p className="text-sm font-semibold text-indigo-900 mb-1">
                    Hint {i + 1}
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed">{hint}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}