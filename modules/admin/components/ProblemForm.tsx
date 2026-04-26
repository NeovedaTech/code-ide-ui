"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box, Typography, Button, TextField, MenuItem,
  IconButton, Chip, Switch, FormControlLabel, CircularProgress,
} from "@mui/material";
import { Add, Delete, ArrowBack } from "@mui/icons-material";
import { useCreateProblem } from "@/modules/admin/hooks";
import type { FunctionSignature, TestCase } from "@/modules/admin/types";

const LANGUAGES = ["javascript", "python", "java", "cpp", "go", "rust", "typescript"];

const card = {
  bgcolor: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 2,
  p: 3,
  mb: 2.5,
};

const inputSx = {
  "& .MuiOutlinedInput-root": {
    color: "#fff",
    bgcolor: "rgba(255,255,255,0.04)",
    "& fieldset": { borderColor: "rgba(255,255,255,0.1)" },
    "&:hover fieldset": { borderColor: "rgba(59,130,246,0.4)" },
    "&.Mui-focused fieldset": { borderColor: "#3b82f6" },
  },
  "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.4)" },
  "& .MuiSelect-icon": { color: "rgba(255,255,255,0.4)" },
};

const sectionLabel = (text: string) => (
  <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, mb: 1.5 }}>
    {text}
  </Typography>
);

// ── Editable string list ───────────────────────────────────────────────────────
function StringList({
  label,
  items,
  onChange,
  placeholder,
}: {
  label: string;
  items: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  return (
    <Box sx={{ mb: 2 }}>
      {sectionLabel(label)}
      {items.map((item, i) => (
        <Box key={i} sx={{ display: "flex", gap: 1, mb: 1 }}>
          <TextField
            size="small" fullWidth value={item} placeholder={placeholder}
            onChange={(e) => {
              const next = [...items];
              next[i] = e.target.value;
              onChange(next);
            }}
            sx={inputSx}
          />
          <IconButton size="small" onClick={() => onChange(items.filter((_, idx) => idx !== i))}
            sx={{ color: "rgba(255,255,255,0.3)", "&:hover": { color: "#ef4444" } }}>
            <Delete fontSize="small" />
          </IconButton>
        </Box>
      ))}
      <Button size="small" startIcon={<Add />} onClick={() => onChange([...items, ""])}
        variant="outlined" sx={{ color: "#3b82f6", borderColor: "rgba(59,130,246,0.3)", fontSize: 12 }}>
        Add {label}
      </Button>
    </Box>
  );
}

// ── Test case row ─────────────────────────────────────────────────────────────
function TestCaseRow({
  tc, onChange, onRemove,
}: {
  tc: TestCase;
  onChange: (v: TestCase) => void;
  onRemove: () => void;
}) {
  return (
    <Box sx={{ p: 2, mb: 1.5, bgcolor: "rgba(255,255,255,0.02)", borderRadius: 1.5, border: "1px solid rgba(255,255,255,0.07)" }}>
      <Box sx={{ display: "flex", gap: 1.5, mb: 1 }}>
        <TextField size="small" label="Input" fullWidth multiline minRows={2}
          value={typeof tc.input === "string" ? tc.input : JSON.stringify(tc.input, null, 2)}
          onChange={(e) => onChange({ ...tc, input: e.target.value })}
          sx={inputSx} />
        <TextField size="small" label="Output" fullWidth multiline minRows={2}
          value={typeof tc.output === "string" ? tc.output : JSON.stringify(tc.output, null, 2)}
          onChange={(e) => onChange({ ...tc, output: e.target.value })}
          sx={inputSx} />
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <FormControlLabel
          control={<Switch size="small" checked={tc.hidden} onChange={(e) => onChange({ ...tc, hidden: e.target.checked })} />}
          label={<Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>Hidden</Typography>}
        />
        <IconButton size="small" onClick={onRemove} sx={{ color: "rgba(255,255,255,0.3)", "&:hover": { color: "#ef4444" } }}>
          <Delete fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
}

// ── Function signature row ─────────────────────────────────────────────────────
function SigRow({
  sig, onChange, onRemove,
}: {
  sig: FunctionSignature;
  onChange: (v: FunctionSignature) => void;
  onRemove: () => void;
}) {
  return (
    <Box sx={{ display: "flex", gap: 1, mb: 1, alignItems: "flex-start" }}>
      <TextField select size="small" label="Language" value={sig.language}
        onChange={(e) => onChange({ ...sig, language: e.target.value })}
        sx={{ ...inputSx, width: 160, flexShrink: 0 }}>
        {LANGUAGES.map((l) => <MenuItem key={l} value={l}>{l}</MenuItem>)}
      </TextField>
      <TextField size="small" label="Signature" fullWidth multiline minRows={2}
        value={sig.signature}
        onChange={(e) => onChange({ ...sig, signature: e.target.value })}
        sx={inputSx} />
      <IconButton size="small" onClick={onRemove} sx={{ color: "rgba(255,255,255,0.3)", "&:hover": { color: "#ef4444" }, mt: 0.5 }}>
        <Delete fontSize="small" />
      </IconButton>
    </Box>
  );
}

// ── Main form ──────────────────────────────────────────────────────────────────
export default function ProblemForm({ problemId }: { problemId?: string }) {
  const router   = useRouter();
  const createMut = useCreateProblem();

  const [title, setTitle]         = useState("");
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Easy");
  const [description, setDescription] = useState("");
  const [timeLimit, setTimeLimit] = useState(1000);
  const [memoryLimit, setMemoryLimit] = useState(256);
  const [languages, setLanguages] = useState<string[]>(["javascript"]);
  const [constraints, setConstraints]   = useState<string[]>([""]);
  const [inputFormat, setInputFormat]   = useState<string[]>([""]);
  const [outputFormat, setOutputFormat] = useState<string[]>([""]);
  const [hints, setHints]               = useState<string[]>([]);
  const [examples, setExamples]         = useState<{ input: string; output: string; explanation?: string }[]>([
    { input: "", output: "", explanation: "" },
  ]);
  const [testCases, setTestCases]         = useState<TestCase[]>([{ input: "", output: "", hidden: false }]);
  const [functionSignatures, setFunctionSignatures] = useState<FunctionSignature[]>([
    { language: "javascript", signature: "" },
  ]);
  const [error, setError] = useState("");

  const toggleLanguage = (lang: string) => {
    setLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang],
    );
  };

  const handleSubmit = async () => {
    setError("");
    if (!title.trim()) { setError("Title is required."); return; }
    if (!languages.length) { setError("Select at least one language."); return; }

    try {
      await createMut.mutateAsync({
        title: title.trim(),
        difficulty,
        description: description.trim(),
        timeLimit,
        memoryLimit,
        languagesSupported: languages,
        constraints: constraints.filter(Boolean),
        inputFormat: inputFormat.filter(Boolean),
        outputFormat: outputFormat.filter(Boolean),
        hints: hints.filter(Boolean),
        examples: examples.map((e) => ({
          input: e.input,
          output: e.output,
          explanation: e.explanation || undefined,
        })),
        testCases: testCases.map((tc) => ({
          input: tc.input,
          output: tc.output,
          hidden: tc.hidden,
        })),
        functionSignature: functionSignatures.filter((s) => s.language && s.signature),
      });
      router.push("/admin/problems");
    } catch (e) {
      setError((e as Error).message ?? "Failed to create problem.");
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <IconButton size="small" onClick={() => router.back()} sx={{ color: "rgba(255,255,255,0.45)", "&:hover": { color: "#fff" } }}>
          <ArrowBack fontSize="small" />
        </IconButton>
        <Box>
          <Typography sx={{ color: "#fff", fontSize: 22, fontWeight: 700 }}>New Problem</Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.35)", fontSize: 13 }}>Create a coding problem</Typography>
        </Box>
      </Box>

      {/* Basic info */}
      <Box sx={card}>
        {sectionLabel("Basic Info")}
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 160px", gap: 2, mb: 2 }}>
          <TextField label="Title *" size="small" value={title} onChange={(e) => setTitle(e.target.value)} sx={inputSx} />
          <TextField select label="Difficulty" size="small" value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as "Easy" | "Medium" | "Hard")} sx={inputSx}>
            {["Easy", "Medium", "Hard"].map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
          </TextField>
        </Box>
        <TextField label="Description" size="small" fullWidth multiline minRows={4}
          value={description} onChange={(e) => setDescription(e.target.value)} sx={{ ...inputSx, mb: 2 }} />
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 2 }}>
          <TextField label="Time Limit (ms)" type="number" size="small" value={timeLimit}
            onChange={(e) => setTimeLimit(Number(e.target.value))} sx={inputSx} />
          <TextField label="Memory Limit (MB)" type="number" size="small" value={memoryLimit}
            onChange={(e) => setMemoryLimit(Number(e.target.value))} sx={inputSx} />
        </Box>
        {sectionLabel("Languages Supported")}
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          {LANGUAGES.map((lang) => (
            <Chip
              key={lang} label={lang} size="small" clickable
              onClick={() => toggleLanguage(lang)}
              sx={{
                bgcolor: languages.includes(lang) ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.05)",
                color:   languages.includes(lang) ? "#60a5fa" : "rgba(255,255,255,0.4)",
                border:  `1px solid ${languages.includes(lang) ? "rgba(59,130,246,0.4)" : "rgba(255,255,255,0.08)"}`,
                fontSize: 12,
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Formats */}
      <Box sx={card}>
        <StringList label="Constraints" items={constraints} onChange={setConstraints} placeholder="e.g. 1 ≤ n ≤ 10^5" />
        <StringList label="Input Format" items={inputFormat} onChange={setInputFormat} placeholder="Describe input…" />
        <StringList label="Output Format" items={outputFormat} onChange={setOutputFormat} placeholder="Describe output…" />
        <StringList label="Hints" items={hints} onChange={setHints} placeholder="Optional hint…" />
      </Box>

      {/* Examples */}
      <Box sx={card}>
        {sectionLabel("Examples")}
        {examples.map((ex, i) => (
          <Box key={i} sx={{ p: 2, mb: 1.5, bgcolor: "rgba(255,255,255,0.02)", borderRadius: 1.5, border: "1px solid rgba(255,255,255,0.07)" }}>
            <Box sx={{ display: "flex", gap: 1.5, mb: 1 }}>
              <TextField size="small" label="Input" fullWidth multiline minRows={2}
                value={ex.input} onChange={(e) => {
                  const next = [...examples]; next[i] = { ...next[i], input: e.target.value }; setExamples(next);
                }} sx={inputSx} />
              <TextField size="small" label="Output" fullWidth multiline minRows={2}
                value={ex.output} onChange={(e) => {
                  const next = [...examples]; next[i] = { ...next[i], output: e.target.value }; setExamples(next);
                }} sx={inputSx} />
            </Box>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <TextField size="small" label="Explanation (optional)" fullWidth
                value={ex.explanation ?? ""} onChange={(e) => {
                  const next = [...examples]; next[i] = { ...next[i], explanation: e.target.value }; setExamples(next);
                }} sx={inputSx} />
              <IconButton size="small" onClick={() => setExamples(examples.filter((_, idx) => idx !== i))}
                disabled={examples.length <= 1}
                sx={{ color: "rgba(255,255,255,0.3)", "&:hover": { color: "#ef4444" } }}>
                <Delete fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        ))}
        <Button size="small" startIcon={<Add />} onClick={() => setExamples([...examples, { input: "", output: "", explanation: "" }])}
          variant="outlined" sx={{ color: "#3b82f6", borderColor: "rgba(59,130,246,0.3)", fontSize: 12 }}>
          Add Example
        </Button>
      </Box>

      {/* Test cases */}
      <Box sx={card}>
        {sectionLabel("Test Cases")}
        {testCases.map((tc, i) => (
          <TestCaseRow
            key={i}
            tc={tc}
            onChange={(v) => { const next = [...testCases]; next[i] = v; setTestCases(next); }}
            onRemove={() => setTestCases(testCases.filter((_, idx) => idx !== i))}
          />
        ))}
        <Button size="small" startIcon={<Add />}
          onClick={() => setTestCases([...testCases, { input: "", output: "", hidden: false }])}
          variant="outlined" sx={{ color: "#3b82f6", borderColor: "rgba(59,130,246,0.3)", fontSize: 12 }}>
          Add Test Case
        </Button>
      </Box>

      {/* Function signatures */}
      <Box sx={card}>
        {sectionLabel("Function Signatures")}
        {functionSignatures.map((sig, i) => (
          <SigRow
            key={i}
            sig={sig}
            onChange={(v) => { const next = [...functionSignatures]; next[i] = v; setFunctionSignatures(next); }}
            onRemove={() => setFunctionSignatures(functionSignatures.filter((_, idx) => idx !== i))}
          />
        ))}
        <Button size="small" startIcon={<Add />}
          onClick={() => setFunctionSignatures([...functionSignatures, { language: "javascript", signature: "" }])}
          variant="outlined" sx={{ color: "#3b82f6", borderColor: "rgba(59,130,246,0.3)", fontSize: 12 }}>
          Add Signature
        </Button>
      </Box>

      {error && (
        <Typography sx={{ color: "#ef4444", fontSize: 13, mb: 2 }}>{error}</Typography>
      )}

      <Box sx={{ display: "flex", gap: 1.5 }}>
        <Button variant="outlined" onClick={() => router.back()}
          sx={{ color: "rgba(255,255,255,0.5)", borderColor: "rgba(255,255,255,0.15)" }}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={createMut.isPending}
          sx={{ bgcolor: "#3b82f6", "&:hover": { bgcolor: "#2563eb" }, fontWeight: 600 }}>
          {createMut.isPending ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : "Create Problem"}
        </Button>
      </Box>
    </Box>
  );
}
