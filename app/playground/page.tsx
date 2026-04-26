"use client";

import React, { useState, useRef } from "react";
import { Box, Button, CircularProgress, Typography, AppBar, Toolbar, Paper, FormControl, Select, MenuItem } from "@mui/material";
// import { MonacoEditor } from "@/components/problems/MonacoEditor";
import { PlayArrow, Code as CodeIcon } from "@mui/icons-material";
import axios from "axios";
import { encodeBase64 } from "@/helpers/codeUtils";
import { CheckCircle2, AlertCircle, X } from "lucide-react";
import { MonacoEditor } from "@/modules/assesment/components/problems/MonacoEditor";

const JUDGE0_URL = "https://execution.velocify.in";

const SNIPPETS: Record<string, string> = {
  python: `print("Hello, Knovia Playground!")`,
  javascript: `console.log("Hello, Knovia Playground!");`,
  cpp: `#include <iostream>

int main() {
    std::cout << "Hello, Knovia Playground!" << std::endl;
    return 0;
}`,
  java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, Knovia Playground!");
    }
}`,
};

const getLanguageId = (lang: string) => {
  const map: Record<string, number> = {
    python: 71,
    javascript: 63,
    cpp: 54,
    java: 62,
  };
  return map[lang] || 71;
};

const decodeBase64 = (str: string) => {
  try {
    return str ? decodeURIComponent(escape(atob(str))) : "";
  } catch (e) {
    return str;
  }
};

export default function PlaygroundPage() {
  const [code, setCode] = useState<string>(SNIPPETS.python);
  const [language, setLanguage] = useState<string>("python");
  const [result, setResult] = useState<any | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const parentRef = useRef<HTMLDivElement>(null);

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    setCode(SNIPPETS[newLang] || "");
    setResult(null);
  };

  const pollResult = async (token: string) => {
    const maxAttempts = 10;
    const delay = 1500;

    for (let i = 0; i < maxAttempts; i++) {
      try {
        const res = await axios.get(`${JUDGE0_URL}/submissions/${token}?base64_encoded=true`);
        const data = res.data;

        // Status IDs 1 (In Queue) and 2 (Processing) mean we should keep polling
        if (data.status.id > 2) {
          setResult({
            ...data,
            stdout: decodeBase64(data.stdout),
            stderr: decodeBase64(data.stderr),
            compile_error: decodeBase64(data.compile_output),
          });
          setIsRunning(false);
          return;
        }
      } catch (error) {
        console.error("Polling error:", error);
        break;
      }
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    setIsRunning(false);
  };

  const handleRun = async () => {
    setIsRunning(true);
    setResult(null);
    try {
      const response = await axios.post(`${JUDGE0_URL}/submissions?base64_encoded=true&wait=false`, {
        source_code: encodeBase64(code),
        language_id: getLanguageId(language),
        stdin: encodeBase64(""),
      });

      if (response.data.token) {
        await pollResult(response.data.token);
      } else {
        setIsRunning(false);
      }
    } catch (error) {
      console.error("Execution failed", error);
      setIsRunning(false);
    }
  };

  const getStatusColor = (statusId: number) => {
    if (statusId === 3) return "#10b981"; // Accepted
    return "#ef4444"; // Error
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh", bgcolor: "#f8fafc" }}>
      <AppBar position="static" sx={{ bgcolor: "#020817", borderBottom: "1px solid #1e293b" }} elevation={0}>
        <Toolbar variant="dense" sx={{ justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <CodeIcon sx={{ color: "#3b82f6" }} />
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1.1rem" }}>
              Knovia Playground
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                sx={{ 
                  color: "white", 
                  bgcolor: "rgba(255,255,255,0.1)",
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.3)" },
                  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.5)" },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#3b82f6" },
                  height: 36,
                  fontSize: "0.875rem"
                }}
              >
                <MenuItem value="python">Python</MenuItem>
                <MenuItem value="javascript">JavaScript</MenuItem>
                <MenuItem value="cpp">C++</MenuItem>
                <MenuItem value="java">Java</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              startIcon={isRunning ? <CircularProgress size={20} color="inherit" /> : <PlayArrow />}
              onClick={handleRun}
              disabled={isRunning}
              sx={{
                bgcolor: "#16a34a",
                "&:hover": { bgcolor: "#15803d" },
                textTransform: "none",
                fontWeight: 600,
                borderRadius: "6px",
                height: 36
              }}
            >
              {isRunning ? "Running..." : "Run Code"}
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Editor Side */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", borderRight: "1px solid #e2e8f0" }}>
          <MonacoEditor
            value={code}
            language={language}
            onChange={(val) => setCode(val)}
            parentRef={parentRef}
          />
        </Box>

        {/* Output Side */}
        <Box sx={{ width: "40%", display: "flex", flexDirection: "column", bgcolor: "#ffffff" }}>
          <Box sx={{ p: 2, borderBottom: "1px solid #e2e8f0", bgcolor: "#f8fafc" }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#475569" }}>
              Execution Output
            </Typography>
          </Box>
          <Box sx={{ flex: 1, overflow: "auto", p: 2 }}>
            {!result && !isRunning && (
              <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                  Run your code to see the output here
                </Typography>
              </Box>
            )}
            
            {isRunning && !result && (
              <Box sx={{ display: "flex", justifyContent: "center", pt: 4 }}>
                <CircularProgress size={30} />
              </Box>
            )}

            {result && (
              <Paper variant="outlined" sx={{ p: 2, borderLeft: `4px solid ${getStatusColor(result.status.id)}` }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {result.status.id === 3 ? <CheckCircle2 size={16} color="#10b981" /> : <AlertCircle size={16} color="#ef4444" />}
                    <Typography variant="caption" sx={{ fontWeight: 700, color: getStatusColor(result.status.id) }}>
                      {result.status.description.toUpperCase()}
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                    {result.time}s | {result.memory}kb
                  </Typography>
                </Box>
                
                {result.stdout && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" sx={{ color: "#475569", fontWeight: 600 }}>STDOUT</Typography>
                    <pre className="mt-1 p-2 bg-slate-900 text-slate-100 rounded text-xs font-mono overflow-auto">
                      {result.stdout}
                    </pre>
                  </Box>
                )}
                
                {result.stderr && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" sx={{ color: "#e11d48", fontWeight: 600 }}>STDERR</Typography>
                    <pre className="mt-1 p-2 bg-rose-950 text-rose-200 rounded text-xs font-mono overflow-auto border border-rose-900">
                      {result.stderr}
                    </pre>
                  </Box>
                )}

                {result.compile_error && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" sx={{ color: "#e11d48", fontWeight: 600 }}>COMPILE ERROR</Typography>
                    <pre className="mt-1 p-2 bg-rose-950 text-rose-200 rounded text-xs font-mono overflow-auto border border-rose-900">
                      {result.compile_error}
                    </pre>
                  </Box>
                )}
              </Paper>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
