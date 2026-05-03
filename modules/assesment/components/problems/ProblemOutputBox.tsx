import { useAnswers } from "@/modules/assesment/context/AnswersContext";
import { ExecutionResult } from "@/types/execution";
import { Box, Skeleton } from "@mui/material";
import { CheckCircle2, AlertCircle, X } from "lucide-react";
import TerminalRounded from "@mui/icons-material/TerminalRounded";

export default function ProblemOutputBox() {
  const { results, isCodeRunning, isCodeSubmitting } = useAnswers();

  const getStatusInfo = (statusId: number, hasError: boolean) => {
    if (Number(statusId) === 3) {
      return {
        passed: !hasError,
        icon: hasError ? <X className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />,
        label: hasError ? "Failed" : "Passed",
        bg: hasError ? "#fef2f2" : "#f0fdf4",
        text: hasError ? "#dc2626" : "#16a34a",
        border: hasError ? "#fecaca" : "#bbf7d0",
      };
    }
    if (Number(statusId) === 4) {
      return {
        passed: false,
        icon: <X className="w-3.5 h-3.5" />,
        label: "Wrong Answer",
        bg: "#fef2f2",
        text: "#dc2626",
        border: "#fecaca",
      };
    }
    if (statusId === 6 || statusId === 11) {
      return {
        passed: false,
        icon: <AlertCircle className="w-3.5 h-3.5" />,
        label: "Warning",
        bg: "#fffbeb",
        text: "#d97706",
        border: "#fde68a",
      };
    }
    if (statusId === -1) {
      return {
        passed: false,
        icon: <X className="w-3.5 h-3.5" />,
        label: "Error",
        bg: "#fef2f2",
        text: "#dc2626",
        border: "#fecaca",
      };
    }
    if (statusId === 5 || statusId === -2) {
      return {
        passed: false,
        icon: <AlertCircle className="w-3.5 h-3.5" />,
        label: "Time Limit",
        bg: "#f8fafc",
        text: "#64748b",
        border: "#e2e8f0",
      };
    }
    return {
      passed: false,
      icon: <AlertCircle className="w-3.5 h-3.5" />,
      label: "Pending",
      bg: "#eff6ff",
      text: "#2563eb",
      border: "#bfdbfe",
    };
  };

  // Empty state
  if (!isCodeRunning && !isCodeSubmitting && (!results || results.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6">
        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center mb-3">
          <TerminalRounded sx={{ fontSize: 20, color: "#94a3b8" }} />
        </div>
        <p className="text-xs font-medium text-slate-400 text-center">
          Run your code to see test results
        </p>
      </div>
    );
  }

  // Loading skeleton
  if (isCodeRunning || isCodeSubmitting) {
    return (
      <div className="flex flex-col h-full">
        <div className="px-4 py-2.5 border-b border-slate-200 bg-white">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Test Results
          </span>
        </div>
        <div className="flex-1 overflow-auto p-3 space-y-2 bg-[#fafbfc]">
          {Array.from({ length: isCodeRunning ? 2 : 7 }).map((_, i) => (
            <Skeleton
              key={i}
              variant="rectangular"
              height={80}
              sx={{ borderRadius: "8px", bgcolor: "#f1f5f9" }}
            />
          ))}
        </div>
      </div>
    );
  }

  const passedCount = results.filter((r: ExecutionResult) => {
    const hasError = Boolean(r.stderr || r.compile_error);
    return Number(r.status.id) === 3 && !hasError;
  }).length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 bg-white">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Test Results
        </span>
        <span className="text-[10px] font-bold tabular-nums text-slate-500">
          <span className={passedCount === results.length ? "text-emerald-600" : "text-slate-500"}>
            {passedCount}
          </span>
          /{results.length} passed
        </span>
      </div>

      {/* Results list */}
      <div className="flex-1 overflow-auto bg-[#fafbfc]">
        {results.map((result: ExecutionResult, index: number) => {
          const hasError = Boolean(result.stderr || result.compile_error);
          const statusInfo = getStatusInfo(result.status.id, hasError);
          const isPending = isCodeRunning || isCodeSubmitting || result.status.id === 0 || !result.status.id;

          return (
            <div
              key={index}
              className={`px-4 py-3 ${index < results.length - 1 ? "border-b border-slate-100" : ""}`}
            >
              {/* Case header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Case {index + 1}
                  </span>
                  {!isPending && (
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide"
                      style={{
                        backgroundColor: statusInfo.bg,
                        color: statusInfo.text,
                        border: `1px solid ${statusInfo.border}`,
                      }}
                    >
                      {statusInfo.icon}
                      {statusInfo.label}
                    </span>
                  )}
                  {isPending && (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold text-slate-500 bg-slate-100 border border-slate-200">
                      <div className="w-2.5 h-2.5 border border-slate-400 border-t-transparent rounded-full animate-spin" />
                      Running
                    </span>
                  )}
                </div>

                {/* Time / Memory */}
                {!isPending && (
                  <div className="flex items-center gap-4 text-[10px]">
                    <div className="text-right">
                      <span className="font-medium text-slate-400 uppercase tracking-wider">Time </span>
                      <span className="font-bold text-slate-600 tabular-nums">{result.time}s</span>
                    </div>
                    <div className="text-right">
                      <span className="font-medium text-slate-400 uppercase tracking-wider">Mem </span>
                      <span className="font-bold text-slate-600 tabular-nums">{result.memory}kb</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Output */}
              {!isPending && (
                <>
                  {result.stdout || result.compile_error || result.stderr ? (
                    <div className="space-y-2">
                      {result.stdout && (
                        <>
                          {result.stdin != null && (
                            <TerminalBlock label="Input" color="default">
                              {result.stdin}
                            </TerminalBlock>
                          )}
                          <TerminalBlock label="Output" color="default">
                            {result.stdout}
                          </TerminalBlock>
                        </>
                      )}
                      {result.compile_error && (
                        <TerminalBlock label="Compilation Error" color="error">
                          {result.compile_error}
                        </TerminalBlock>
                      )}
                      {result.stderr && (
                        <TerminalBlock label="Runtime Error" color="warning">
                          {result.stderr}
                        </TerminalBlock>
                      )}
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-400 italic">
                      No output generated
                    </p>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TerminalBlock({
  label,
  color,
  children,
}: {
  label: string;
  color: "default" | "error" | "warning";
  children: React.ReactNode;
}) {
  const colors = {
    default: { text: "#c9d1d9", border: "#30363d", label: "#8b949e" },
    error:   { text: "#ff7b72", border: "#49201f", label: "#f85149" },
    warning: { text: "#e3b341", border: "#3d2e00", label: "#d29922" },
  };
  const c = colors[color];

  return (
    <div>
      <p className="text-[9px] font-bold uppercase tracking-wider mb-1" style={{ color: c.label }}>
        {label}
      </p>
      <pre
        className="text-[11px] leading-relaxed rounded-md px-3 py-2 overflow-auto whitespace-pre-wrap break-words max-h-[100px]"
        style={{
          backgroundColor: "#0d1117",
          color: c.text,
          border: `1px solid ${c.border}`,
          fontFamily: '"SF Mono", "Fira Code", "Cascadia Code", monospace',
        }}
      >
        {children}
      </pre>
    </div>
  );
}
