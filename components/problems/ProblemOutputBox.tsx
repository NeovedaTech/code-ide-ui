import { useAnswers } from "@/context/AnswersContext";
import { ExecutionResult } from "@/types/execution";
import { Box, CircularProgress } from "@mui/material";
import { CheckCircle2, AlertCircle, X, Clock } from "lucide-react";

export default function ProblemOutputBox() {
  const { results, isCodeRunning, isCodeSubmitting } = useAnswers();

  const getStatusInfo = (statusId: number, hasError: boolean) => {
    if (Number(statusId) === 3) {
      return {
        passed: !hasError,
        icon: hasError ? (
          <X className="w-4 h-4" />
        ) : (
          <CheckCircle2 className="w-4 h-4" />
        ),
        label: hasError ? "Failed" : "Passed",
        bgColor: hasError ? "bg-red-500/10" : "bg-emerald-500/10",
        textColor: hasError ? "text-red-600" : "text-emerald-600",
        borderColor: hasError ? "border-red-500/30" : "border-emerald-500/30",
      };
    }
    if (Number(statusId) === 4) {
      return {
        passed: false,
        icon: <X className="w-4 h-4" />,
        label: "Wrong Answer",
        bgColor: "bg-red-500/10",
        textColor: "text-red-600",
        borderColor: "border-red-500/30",
      };
    }
    if (statusId === 6 || statusId === 11) {
      return {
        passed: false,
        icon: <AlertCircle className="w-4 h-4" />,
        label: "Warning",
        bgColor: "bg-amber-500/10",
        textColor: "text-amber-600",
        borderColor: "border-amber-500/30",
      };
    }
    if (statusId === -1) {
      return {
        passed: false,
        icon: <X className="w-4 h-4" />,
        label: "Error",
        bgColor: "bg-red-500/10",
        textColor: "text-red-600",
        borderColor: "border-red-500/30",
      };
    }
    if (statusId === -2) {
      return {
        passed: false,
        icon: <AlertCircle className="w-4 h-4" />,
        label: "Timeout",
        bgColor: "bg-slate-500/10",
        textColor: "text-slate-600",
        borderColor: "border-slate-500/30",
      };
    }
    return {
      passed: false,
      icon: <AlertCircle className="w-4 h-4" />,
      label: "Pending",
      bgColor: "bg-blue-500/10",
      textColor: "text-blue-600",
      borderColor: "border-blue-500/30",
    };
  };

  if (!results || results.length === 0) {
    return (
      <Box
        sx={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
      >
        <p className="text-xs text-gray-500 text-center">
          Run your code to see test results
        </p>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: "100%",
        overflow: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 0,
        backgroundColor: "#fafafa",
      }}
    >
      {results.map((result: ExecutionResult, index: number) => {
        const hasError = Boolean(result.stderr || result.compile_error);
        const statusInfo = getStatusInfo(result.status.id, hasError);
        const isLoading = isCodeRunning || isCodeSubmitting;
        // Consider a result "pending" if it's loading and has no status yet
        const isPending =
          isLoading || result.status.id === 0 || !result.status.id;

        return (
          <Box
            key={index}
            sx={{
              borderBottom:
                index < results.length - 1 ? "1px solid #e5e7eb" : "none",
              p: "14px 16px",
              transition: "background-color 0.2s",
              minHeight: isPending ? "160px" : "auto",
              "&:hover": {
                backgroundColor: "#f3f4f6",
              },
            }}
          >
            {/* Test Case Header */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: isPending ? 2 : 1.5,
                gap: 2,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  flex: 1,
                  minWidth: 0,
                }}
              >
                {isPending ? (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.75,
                      px: 1.5,
                      py: 0.5,
                      borderRadius: "4px",
                      backgroundColor: "bg-slate-500/10",
                      border: "1px solid border-slate-500/30",
                    }}
                  >
                    <CircularProgress size={16} sx={{ color: "#64748b" }} />
                    <span className="text-xs font-semibold text-slate-600">
                      Running
                    </span>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.75,
                      px: 1.5,
                      py: 0.5,
                      borderRadius: "4px",
                      backgroundColor: statusInfo.bgColor,
                      border: `1px solid ${statusInfo.borderColor}`,
                    }}
                  >
                    <Box
                      sx={{
                        color: statusInfo.textColor,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {statusInfo.icon}
                    </Box>
                    <span
                      className={`text-xs font-semibold ${statusInfo.textColor}`}
                    >
                      {statusInfo.label}
                    </span>
                  </Box>
                )}
                <span className="text-xs text-gray-700 font-medium truncate">
                  Case {index + 1}
                </span>
              </Box>

              {/* Time & Memory */}
              {!isPending && (
                <Box
                  sx={{
                    display: "flex",
                    gap: 3,
                    fontSize: "0.75rem",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Box sx={{ textAlign: "right" }}>
                    <Box className="text-gray-500 font-medium">TIME</Box>
                    <Box className="text-gray-800 font-semibold">
                      {result.time}s
                    </Box>
                  </Box>
                  <Box sx={{ textAlign: "right" }}>
                    <Box className="text-gray-500 font-medium">MEMORY</Box>
                    <Box className="text-gray-800 font-semibold">
                      {result.memory}MB
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>

            {/* Loading State */}
            {isPending ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                  py: 2,
                }}
              >
                <CircularProgress size={16} sx={{ color: "#64748b" }} />
                <p className="text-xs text-gray-600">
                  {isCodeRunning ? "Running test case..." : "Submitting..."}
                </p>
              </Box>
            ) : (
              <>
                {/* Output Section */}
                {result.stdout || result.compile_error || result.stderr ? (
                  <Box sx={{ mt: 1.5 }}>
                    {result.stdout && (
                      <Box sx={{ mb: 1.5 }}>
                        <Box className="text-xs text-gray-600 font-semibold mb-1 uppercase tracking-wide">
                          Output
                        </Box>
                        <Box
                          sx={{
                            backgroundColor: "#1a1a1a",
                            borderRadius: "4px",
                            p: "10px 12px",
                            fontFamily: '"Courier New", monospace',
                            fontSize: "0.75rem",
                            color: "#d4d4d4",
                            overflow: "auto",
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                            maxHeight: "120px",
                            border: "1px solid #333",
                            lineHeight: "1.4",
                          }}
                        >
                          {result.stdout}
                        </Box>
                      </Box>
                    )}

                    {result.compile_error && (
                      <Box sx={{ mb: 1.5 }}>
                        <Box className="text-xs text-red-700 font-semibold mb-1 uppercase tracking-wide">
                          Compilation Error
                        </Box>
                        <Box
                          sx={{
                            backgroundColor: "#1a1a1a",
                            borderRadius: "4px",
                            p: "10px 12px",
                            fontFamily: '"Courier New", monospace',
                            fontSize: "0.75rem",
                            color: "#ff6b6b",
                            overflow: "auto",
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                            maxHeight: "120px",
                            border: "1px solid #ff6b6b33",
                            lineHeight: "1.4",
                          }}
                        >
                          {result.compile_error}
                        </Box>
                      </Box>
                    )}

                    {result.stderr && (
                      <Box sx={{ mb: 1.5 }}>
                        <Box className="text-xs text-amber-700 font-semibold mb-1 uppercase tracking-wide">
                          Runtime Error
                        </Box>
                        <Box
                          sx={{
                            backgroundColor: "#1a1a1a",
                            borderRadius: "4px",
                            p: "10px 12px",
                            fontFamily: '"Courier New", monospace',
                            fontSize: "0.75rem",
                            color: "#ffd700",
                            overflow: "auto",
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                            maxHeight: "120px",
                            border: "1px solid #ffd70033",
                            lineHeight: "1.4",
                          }}
                        >
                          {result.stderr}
                        </Box>
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Box className="text-xs text-gray-500 italic mt-1.5">
                    No output generated
                  </Box>
                )}
              </>
            )}
          </Box>
        );
      })}
    </Box>
  );
}
