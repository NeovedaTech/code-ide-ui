"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Box, Typography, Button, TextField, MenuItem, Switch,
  FormControlLabel, Chip, IconButton, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions,
  List, ListItem, ListItemText, Alert, Divider,
} from "@mui/material";
import { Add, Delete, Search, Lock } from "@mui/icons-material";
import {
  useAdminAssessment, useUpdateAssessment,
  useAdminPools, useAdminProblems, useAdminSkills,
  useAdminSolutions,
} from "@/modules/admin/hooks";
import type { AssessmentFormData, Problem, QuestionPool } from "@/modules/admin/types";

// ─── Styles ────────────────────────────────────────────────────────────────────

const section = {
  bgcolor: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 2,
  p: 3,
  mb: 2,
};

const inputSx = {
  "& .MuiOutlinedInput-root": {
    color: "#fff",
    bgcolor: "rgba(255,255,255,0.04)",
    "& fieldset": { borderColor: "rgba(255,255,255,0.1)" },
    "&:hover fieldset": { borderColor: "rgba(59,130,246,0.4)" },
    "&.Mui-focused fieldset": { borderColor: "#3b82f6" },
    "&.Mui-disabled": { bgcolor: "rgba(255,255,255,0.02)", "& fieldset": { borderColor: "rgba(255,255,255,0.05)" } },
  },
  "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.4)" },
  "& .MuiInputLabel-root.Mui-disabled": { color: "rgba(255,255,255,0.2)" },
  "& .MuiSelect-icon": { color: "rgba(255,255,255,0.4)" },
};

const label = (text: string) => (
  <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, mb: 1 }}>
    {text}
  </Typography>
);

// ─── Problem picker ────────────────────────────────────────────────────────────

function ProblemPickerDialog({ open, onClose, selectedIds, onToggle, allProblems }: {
  open: boolean; onClose: () => void;
  selectedIds: string[]; onToggle: (id: string) => void;
  allProblems: Problem[];
}) {
  const [search, setSearch] = useState("");
  const filtered = useMemo(
    () => allProblems.filter(p =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.difficulty.toLowerCase().includes(search.toLowerCase())
    ),
    [allProblems, search],
  );
  const dc = (d: string) => d === "Easy" ? "#22c55e" : d === "Medium" ? "#f59e0b" : "#ef4444";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { bgcolor: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)" } }}>
      <DialogTitle sx={{ color: "#fff", pb: 1 }}>Add Problems to Section</DialogTitle>
      <DialogContent>
        <TextField fullWidth size="small" placeholder="Search…" value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{ ...inputSx, mb: 2, mt: 1 }}
          InputProps={{ startAdornment: <Search sx={{ color: "rgba(255,255,255,0.3)", mr: 0.5, fontSize: 18 }} /> }}
        />
        {filtered.length === 0
          ? <Typography sx={{ color: "rgba(255,255,255,0.3)", fontSize: 13, textAlign: "center", py: 4 }}>No problems found</Typography>
          : (
            <List sx={{ maxHeight: 380, overflow: "auto", p: 0 }}>
              {filtered.map(p => {
                const sel = selectedIds.includes(p._id);
                return (
                  <ListItem key={p._id} onClick={() => onToggle(p._id)} sx={{
                    borderRadius: 1.5, mb: 0.5, cursor: "pointer",
                    bgcolor: sel ? "rgba(59,130,246,0.1)" : "rgba(255,255,255,0.02)",
                    border: `1px solid ${sel ? "rgba(59,130,246,0.35)" : "rgba(255,255,255,0.06)"}`,
                    "&:hover": { bgcolor: sel ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.05)" },
                  }}>
                    <ListItemText
                      primary={<Typography sx={{ color: "#fff", fontSize: 13, fontWeight: 500 }}>{p.title}</Typography>}
                      secondary={
                        <Box sx={{ display: "flex", gap: 0.7, mt: 0.5, flexWrap: "wrap" }}>
                          <Chip label={p.difficulty} size="small" sx={{ height: 18, fontSize: 10, bgcolor: "transparent", color: dc(p.difficulty), border: `1px solid ${dc(p.difficulty)}33` }} />
                          {(p.languagesSupported ?? []).slice(0, 4).map(l => (
                            <Chip key={l} label={l} size="small" sx={{ height: 18, fontSize: 10, bgcolor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.45)" }} />
                          ))}
                        </Box>
                      }
                    />
                    <Chip label={sel ? "Remove" : "Add"} size="small" sx={{ fontSize: 11, height: 22, ml: 1, flexShrink: 0, bgcolor: sel ? "rgba(239,68,68,0.12)" : "rgba(59,130,246,0.12)", color: sel ? "#ef4444" : "#3b82f6" }} />
                  </ListItem>
                );
              })}
            </List>
          )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Typography sx={{ flex: 1, color: "rgba(255,255,255,0.3)", fontSize: 12 }}>{selectedIds.length} selected</Typography>
        <Button onClick={onClose} variant="contained" sx={{ bgcolor: "#3b82f6", "&:hover": { bgcolor: "#2563eb" }, fontSize: 13 }}>Done</Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Section row ───────────────────────────────────────────────────────────────

type SectionDraft = Omit<import("@/modules/admin/types").AssessmentSection, "_id">;

function SectionCard({ idx, sec, pools, problemMap, allProblems, locked, canRemove, onRemove, onChange, onPickProblems }: {
  idx: number; sec: SectionDraft;
  pools: QuestionPool[]; problemMap: Record<string, Problem>; allProblems: Problem[];
  locked: boolean; canRemove: boolean;
  onRemove: () => void; onChange: (k: string, v: unknown) => void; onPickProblems: () => void;
}) {
  const showPool  = sec.type === "quiz"   || sec.type === "mixed";
  const showProbs = sec.type === "coding" || sec.type === "mixed";
  const dc = (d: string) => d === "Easy" ? "#22c55e" : d === "Medium" ? "#f59e0b" : "#ef4444";

  return (
    <Box sx={{ bgcolor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 2, p: 2.5, mb: 1.5 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <Chip label={`Section ${idx + 1}`} size="small" sx={{ bgcolor: "rgba(59,130,246,0.15)", color: "#3b82f6", fontSize: 11 }} />
          <Chip label={sec.type} size="small" sx={{ bgcolor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)", fontSize: 11, textTransform: "capitalize" }} />
        </Box>
        {canRemove && !locked && (
          <IconButton size="small" onClick={onRemove} sx={{ color: "#ef4444" }}><Delete fontSize="small" /></IconButton>
        )}
      </Box>

      {/* Title + Type */}
      <Box sx={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 2, mb: 2 }}>
        <TextField label="Title *" size="small" value={sec.title} disabled={locked}
          onChange={e => onChange("title", e.target.value)} sx={inputSx} />
        <TextField select label="Type" size="small" value={sec.type} disabled={locked}
          onChange={e => onChange("type", e.target.value)} sx={inputSx}>
          {["quiz", "coding", "mixed"].map(t => <MenuItem key={t} value={t} sx={{ textTransform: "capitalize" }}>{t}</MenuItem>)}
        </TextField>
      </Box>

      {/* Time / Score / Questions */}
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2, mb: showPool || showProbs ? 2 : 0 }}>
        <TextField label="Max Time (mins)" type="number" size="small" value={sec.maxTime} disabled={locked}
          onChange={e => onChange("maxTime", Number(e.target.value))} sx={inputSx} />
        <TextField label="Max Score" type="number" size="small" value={sec.maxScore} disabled={locked}
          onChange={e => onChange("maxScore", Number(e.target.value))} sx={inputSx} />
        <TextField label="Max Questions" type="number" size="small" value={sec.maxQuestion} disabled={locked}
          onChange={e => onChange("maxQuestion", Number(e.target.value))} sx={inputSx} />
      </Box>

      {/* Question Pool */}
      {showPool && (
        <Box sx={{ mb: showProbs ? 2 : 0 }}>
          {label("Question Pool")}
          <TextField select size="small" fullWidth label="Select pool" value={sec.questionPool ?? ""} disabled={locked}
            onChange={e => onChange("questionPool", e.target.value || null)} sx={inputSx}>
            <MenuItem value="">— None —</MenuItem>
            {pools.map(p => (
              <MenuItem key={p._id} value={p._id}>
                {p.name}
                <Typography component="span" sx={{ color: "rgba(255,255,255,0.3)", fontSize: 11, ml: 1 }}>({p.questions.length} Qs)</Typography>
              </MenuItem>
            ))}
          </TextField>
          {!locked && pools.length === 0 && (
            <Typography sx={{ color: "rgba(255,193,7,0.6)", fontSize: 12, mt: 0.5 }}>No pools yet — create one in Question Pools.</Typography>
          )}
        </Box>
      )}

      {/* Problems */}
      {showProbs && (
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
            {label(`Problems (${(sec.problemPool ?? []).length})`)}
            {!locked && (
              <Button size="small" startIcon={<Add fontSize="small" />} onClick={onPickProblems}
                sx={{ color: "#3b82f6", fontSize: 12, p: "2px 8px", minWidth: 0, mb: 1 }}>
                Add / Remove
              </Button>
            )}
          </Box>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
            {(sec.problemPool ?? []).length === 0
              ? <Typography sx={{ color: "rgba(255,255,255,0.2)", fontSize: 12 }}>No problems selected.</Typography>
              : (sec.problemPool ?? []).map(pid => {
                  const prob = problemMap[pid];
                  return (
                    <Chip key={pid}
                      label={prob ? `${prob.title} · ${prob.difficulty}` : `…${pid.slice(-6)}`}
                      size="small"
                      onDelete={locked ? undefined : () => onChange("problemPool", (sec.problemPool ?? []).filter(id => id !== pid))}
                      sx={{ bgcolor: "rgba(59,130,246,0.08)", color: "#93c5fd", border: "1px solid rgba(59,130,246,0.25)", fontSize: 11, "& .MuiChip-deleteIcon": { color: "rgba(147,197,253,0.5)", "&:hover": { color: "#ef4444" } } }}
                    />
                  );
                })
            }
          </Box>
        </Box>
      )}
    </Box>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────

export default function AssessmentEditForm({ id }: { id: string }) {
  const router = useRouter();
  const { data: assessment, isLoading }   = useAdminAssessment(id);
  const updateMut                          = useUpdateAssessment(id);
  const { data: pools   = [] }            = useAdminPools();
  const { data: skills  = [] }            = useAdminSkills();
  const { data: probRes }                 = useAdminProblems({ limit: 100 });
  const { data: solutionRes }             = useAdminSolutions({ assessmentId: id, limit: 1 });

  const allProblems   = probRes?.data ?? [];
  const submissionCount = solutionRes?.pagination?.total ?? 0;
  const locked        = submissionCount > 0;

  const [probDialogIdx, setProbDialogIdx] = useState<number | null>(null);
  const [error, setError]                 = useState("");
  const [form, setForm]                   = useState<AssessmentFormData>({
    name: "", slug: "", skillId: null,
    isProctored: false, isAvEnabled: false, isScreenCapture: false,
    passCodeEnabled: false, passCode: "",
    isPublished: false, sections: [],
  });

  useEffect(() => {
    if (!assessment) return;
    setForm({
      name:            assessment.name,
      slug:            assessment.slug,
      skillId:         assessment.skillId ?? null,
      isProctored:     assessment.isProctored,
      isAvEnabled:     assessment.isAvEnabled,
      isScreenCapture: assessment.isScreenCapture ?? false,
      passCodeEnabled: assessment.passCodeEnabled,
      isPublished:     assessment.isPublished,
      sections: assessment.sections.map(s => ({
        title:       s.title,
        type:        s.type,
        maxTime:     s.maxTime,
        maxScore:    s.maxScore,
        maxQuestion: s.maxQuestion,
        description: s.description ?? "",
        questionPool: s.questionPool ?? null,
        problemPool:  Array.isArray(s.problemPool) ? s.problemPool : [],
      })),
    });
  }, [assessment]);

  const set = (key: keyof AssessmentFormData, val: unknown) =>
    setForm(f => {
      const next = { ...f, [key]: val };
      if (key === "isAvEnabled" && val)    next.isProctored = true;
      if (key === "isScreenCapture" && val) next.isProctored = true;
      if (key === "isProctored" && !val)  { next.isAvEnabled = false; next.isScreenCapture = false; }
      return next;
    });

  const setSection = (i: number, k: string, v: unknown) =>
    setForm(f => {
      const sections = [...f.sections];
      sections[i] = { ...sections[i], [k]: v } as typeof sections[0];
      return { ...f, sections };
    });

  const addSection = () =>
    setForm(f => ({
      ...f,
      sections: [...f.sections, { title: "", type: "quiz", maxTime: 30, maxScore: 100, maxQuestion: 10, description: "", questionPool: null, problemPool: [] }],
    }));

  const removeSection = (i: number) =>
    setForm(f => ({ ...f, sections: f.sections.filter((_, idx) => idx !== i) }));

  const toggleProblem = (sIdx: number, pid: string) => {
    const curr = form.sections[sIdx].problemPool ?? [];
    setSection(sIdx, "problemPool", curr.includes(pid) ? curr.filter(x => x !== pid) : [...curr, pid]);
  };

  const handleSave = async () => {
    setError("");
    try {
      const payload = { ...form };
      if (!payload.passCode) delete payload.passCode;
      await updateMut.mutateAsync(payload);
      router.push("/admin/assessments");
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const problemMap = useMemo(
    () => Object.fromEntries(allProblems.map(p => [p._id, p])),
    [allProblems],
  );

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", pt: 10 }}>
        <CircularProgress sx={{ color: "#3b82f6" }} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 860 }}>
      {/* Page header */}
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 3 }}>
        <Box>
          <Typography sx={{ color: "#fff", fontSize: 22, fontWeight: 700 }}>Edit Assessment</Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.35)", fontSize: 13, mt: 0.3 }}>{assessment?.name}</Typography>
        </Box>
        <Button variant="outlined" onClick={() => router.push("/admin/assessments")}
          sx={{ color: "rgba(255,255,255,0.5)", borderColor: "rgba(255,255,255,0.15)", fontSize: 13 }}>
          Cancel
        </Button>
      </Box>

      {/* Locked banner */}
      {locked && (
        <Alert
          icon={<Lock fontSize="small" />}
          severity="warning"
          sx={{ mb: 3, bgcolor: "rgba(245,158,11,0.08)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.2)", "& .MuiAlert-icon": { color: "#f59e0b" } }}
        >
          This assessment has <strong>{submissionCount}</strong> submission{submissionCount !== 1 ? "s" : ""} and is locked from editing.
        </Alert>
      )}

      {/* ── Basic Info ─────────────────────────────────────────────────────────── */}
      <Box sx={section}>
        {label("Basic Info")}
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 2 }}>
          <TextField label="Assessment Name *" size="small" value={form.name} disabled={locked}
            onChange={e => set("name", e.target.value)} sx={inputSx} />
          <TextField label="Slug" size="small" value={form.slug} disabled={locked}
            onChange={e => set("slug", e.target.value)} sx={inputSx} />
        </Box>
        <TextField select label="Skill" size="small" fullWidth value={form.skillId ?? ""} disabled={locked}
          onChange={e => set("skillId", e.target.value ? Number(e.target.value) : null)} sx={inputSx}>
          <MenuItem value="">— None —</MenuItem>
          {skills.map(s => <MenuItem key={s.skillId} value={s.skillId}>{s.name}</MenuItem>)}
        </TextField>
      </Box>

      {/* ── Proctoring ─────────────────────────────────────────────────────────── */}
      <Box sx={section}>
        {label("Proctoring")}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          <FormControlLabel
            control={<Switch checked={form.isProctored} size="small" disabled={locked}
              onChange={e => set("isProctored", e.target.checked)} />}
            label={<Typography sx={{ color: locked ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.7)", fontSize: 13 }}>Enable Proctoring (tab / fullscreen tracking)</Typography>}
          />
          <FormControlLabel
            control={<Switch checked={form.isAvEnabled} size="small" disabled={locked || !form.isProctored}
              onChange={e => set("isAvEnabled", e.target.checked)} />}
            label={<Typography sx={{ color: locked || !form.isProctored ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.7)", fontSize: 13 }}>Enable AV Recording (webcam + mic → S3)</Typography>}
          />
          <FormControlLabel
            control={<Switch checked={form.isScreenCapture} size="small" disabled={locked || !form.isProctored}
              onChange={e => set("isScreenCapture", e.target.checked)} />}
            label={<Typography sx={{ color: locked || !form.isProctored ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.7)", fontSize: 13 }}>Enable Screen Capture (screen recording → S3)</Typography>}
          />
          <FormControlLabel
            control={<Switch checked={form.passCodeEnabled} size="small" disabled={locked}
              onChange={e => set("passCodeEnabled", e.target.checked)} />}
            label={<Typography sx={{ color: locked ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.7)", fontSize: 13 }}>Require Passcode</Typography>}
          />
          {form.passCodeEnabled && (
            <TextField label="New Passcode (leave empty to keep current)" type="password" size="small"
              value={form.passCode ?? ""} disabled={locked}
              onChange={e => set("passCode", e.target.value)}
              sx={{ ...inputSx, mt: 1, maxWidth: 340 }} />
          )}
        </Box>
      </Box>

      {/* ── Sections ───────────────────────────────────────────────────────────── */}
      <Box sx={section}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
          {label("Sections")}
          {!locked && (
            <Button size="small" startIcon={<Add fontSize="small" />} onClick={addSection} variant="outlined"
              sx={{ color: "#3b82f6", borderColor: "rgba(59,130,246,0.3)", fontSize: 12, mb: 1 }}>
              Add Section
            </Button>
          )}
        </Box>

        {form.sections.length === 0 && (
          <Typography sx={{ color: "rgba(255,255,255,0.25)", fontSize: 13 }}>No sections yet.</Typography>
        )}

        {form.sections.map((sec, i) => (
          <SectionCard key={i} idx={i} sec={sec}
            pools={pools} problemMap={problemMap} allProblems={allProblems}
            locked={locked} canRemove={form.sections.length > 1}
            onRemove={() => removeSection(i)}
            onChange={(k, v) => setSection(i, k, v)}
            onPickProblems={() => setProbDialogIdx(i)}
          />
        ))}
      </Box>

      {/* Problem picker dialog */}
      {probDialogIdx !== null && (
        <ProblemPickerDialog
          open
          onClose={() => setProbDialogIdx(null)}
          selectedIds={form.sections[probDialogIdx]?.problemPool ?? []}
          onToggle={pid => toggleProblem(probDialogIdx, pid)}
          allProblems={allProblems}
        />
      )}

      {/* ── Footer ─────────────────────────────────────────────────────────────── */}
      {error && (
        <Alert severity="error" sx={{ mb: 2, bgcolor: "rgba(239,68,68,0.08)", color: "#ef4444", "& .MuiAlert-icon": { color: "#ef4444" } }}>
          {error}
        </Alert>
      )}

      {!locked && (
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", pt: 1 }}>
          <FormControlLabel
            control={
              <Switch checked={form.isPublished} size="small"
                onChange={e => set("isPublished", e.target.checked)}
                sx={{ "& .MuiSwitch-thumb": { bgcolor: form.isPublished ? "#22c55e" : undefined } }} />
            }
            label={
              <Typography sx={{ color: form.isPublished ? "#22c55e" : "rgba(255,255,255,0.4)", fontSize: 13 }}>
                {form.isPublished ? "Published" : "Draft"}
              </Typography>
            }
          />
          <Box sx={{ flex: 1 }} />
          <Button variant="outlined" onClick={() => router.push("/admin/assessments")}
            sx={{ color: "rgba(255,255,255,0.5)", borderColor: "rgba(255,255,255,0.15)" }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSave} disabled={updateMut.isPending}
            sx={{ bgcolor: "#3b82f6", "&:hover": { bgcolor: "#2563eb" }, minWidth: 130 }}>
            {updateMut.isPending ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : "Save Changes"}
          </Button>
        </Box>
      )}
    </Box>
  );
}
