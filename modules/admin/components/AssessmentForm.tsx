"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Box, Typography, Button, TextField, MenuItem, Switch,
  FormControlLabel, Stepper, Step, StepLabel, Chip, IconButton,
  CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
  List, ListItem, ListItemText,
} from "@mui/material";
import { Add, Delete, Search } from "@mui/icons-material";
import {
  useCreateAssessment, useAdminSkills,
  useAdminPools, useAdminProblems,
} from "@/modules/admin/hooks";
import type { AssessmentFormData, Problem, QuestionPool } from "@/modules/admin/types";

// ─── Shared styles ─────────────────────────────────────────────────────────────

const card = {
  bgcolor: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 2,
  p: 3,
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

const STEPS = ["Basic Info", "Sections", "Review"];

// ─── Problem picker dialog ─────────────────────────────────────────────────────

function ProblemPickerDialog({
  open, onClose, selectedIds, onToggle, allProblems,
}: {
  open: boolean;
  onClose: () => void;
  selectedIds: string[];
  onToggle: (id: string) => void;
  allProblems: Problem[];
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      allProblems.filter(
        (p) =>
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          p.difficulty.toLowerCase().includes(search.toLowerCase()),
      ),
    [allProblems, search],
  );

  const diffColor = (d: string) =>
    d === "Easy" ? "#22c55e" : d === "Medium" ? "#f59e0b" : "#ef4444";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { bgcolor: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)" } }}
    >
      <DialogTitle sx={{ color: "#fff", pb: 1 }}>Add Problems to Section</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth size="small" placeholder="Search by title or difficulty…"
          value={search} onChange={(e) => setSearch(e.target.value)}
          sx={{ ...inputSx, mb: 2, mt: 1 }}
          InputProps={{ startAdornment: <Search sx={{ color: "rgba(255,255,255,0.3)", mr: 0.5, fontSize: 18 }} /> }}
        />
        {filtered.length === 0 ? (
          <Typography sx={{ color: "rgba(255,255,255,0.3)", fontSize: 13, textAlign: "center", py: 4 }}>
            No problems found
          </Typography>
        ) : (
          <List sx={{ maxHeight: 380, overflow: "auto", p: 0 }}>
            {filtered.map((p) => {
              const selected = selectedIds.includes(p._id);
              return (
                <ListItem
                  key={p._id}
                  onClick={() => onToggle(p._id)}
                  sx={{
                    borderRadius: 1.5, mb: 0.5, cursor: "pointer",
                    bgcolor: selected ? "rgba(59,130,246,0.1)" : "rgba(255,255,255,0.02)",
                    border: `1px solid ${selected ? "rgba(59,130,246,0.35)" : "rgba(255,255,255,0.06)"}`,
                    "&:hover": { bgcolor: selected ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.05)" },
                  }}
                >
                  <ListItemText
                    primary={<Typography sx={{ color: "#fff", fontSize: 13, fontWeight: 500 }}>{p.title}</Typography>}
                    secondary={
                      <Box sx={{ display: "flex", gap: 0.7, mt: 0.5, flexWrap: "wrap" }}>
                        <Chip label={p.difficulty} size="small"
                          sx={{ height: 18, fontSize: 10, bgcolor: "transparent", color: diffColor(p.difficulty), border: `1px solid ${diffColor(p.difficulty)}33` }} />
                        {(p.languagesSupported ?? []).slice(0, 4).map((l) => (
                          <Chip key={l} label={l} size="small"
                            sx={{ height: 18, fontSize: 10, bgcolor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.45)" }} />
                        ))}
                      </Box>
                    }
                  />
                  <Box sx={{ ml: 1, flexShrink: 0 }}>
                    <Chip label={selected ? "Remove" : "Add"} size="small"
                      sx={{
                        fontSize: 11, height: 22,
                        bgcolor: selected ? "rgba(239,68,68,0.12)" : "rgba(59,130,246,0.12)",
                        color: selected ? "#ef4444" : "#3b82f6",
                      }} />
                  </Box>
                </ListItem>
              );
            })}
          </List>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Typography sx={{ flex: 1, color: "rgba(255,255,255,0.3)", fontSize: 12 }}>
          {selectedIds.length} problem{selectedIds.length !== 1 ? "s" : ""} selected
        </Typography>
        <Button onClick={onClose} variant="contained"
          sx={{ bgcolor: "#3b82f6", "&:hover": { bgcolor: "#2563eb" }, fontSize: 13 }}>
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Section card ──────────────────────────────────────────────────────────────

type SectionDraft = Omit<import("@/modules/admin/types").AssessmentSection, "_id">;

function SectionCard({
  idx, section, pools, allProblems, problemMap, canRemove,
  onRemove, onChange, onOpenProblemPicker,
}: {
  idx: number;
  section: SectionDraft;
  pools: QuestionPool[];
  allProblems: Problem[];
  problemMap: Record<string, Problem>;
  canRemove: boolean;
  onRemove: () => void;
  onChange: (key: string, val: unknown) => void;
  onOpenProblemPicker: () => void;
}) {
  const showPool  = section.type === "quiz"   || section.type === "mixed";
  const showProbs = section.type === "coding" || section.type === "mixed";

  return (
    <Box sx={{ ...card, mb: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <Chip label={`Section ${idx + 1}`} size="small" sx={{ bgcolor: "rgba(59,130,246,0.15)", color: "#3b82f6", fontSize: 11 }} />
          <Chip label={section.type} size="small" sx={{ bgcolor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)", fontSize: 11, textTransform: "capitalize" }} />
        </Box>
        {canRemove && (
          <IconButton size="small" onClick={onRemove} sx={{ color: "#ef4444" }}>
            <Delete fontSize="small" />
          </IconButton>
        )}
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 2, mb: 2 }}>
        <TextField label="Section Title *" size="small" value={section.title}
          onChange={(e) => onChange("title", e.target.value)} sx={inputSx} />
        <TextField select label="Type" size="small" value={section.type}
          onChange={(e) => onChange("type", e.target.value)} sx={inputSx}>
          {["quiz", "coding", "mixed"].map((t) => (
            <MenuItem key={t} value={t} sx={{ textTransform: "capitalize" }}>{t}</MenuItem>
          ))}
        </TextField>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2, mb: 2 }}>
        <TextField label="Max Time (mins)" type="number" size="small"
          value={section.maxTime} onChange={(e) => onChange("maxTime", Number(e.target.value))} sx={inputSx} />
        <TextField label="Max Score" type="number" size="small"
          value={section.maxScore} onChange={(e) => onChange("maxScore", Number(e.target.value))} sx={inputSx} />
        <TextField label="Max Questions" type="number" size="small"
          value={section.maxQuestion} onChange={(e) => onChange("maxQuestion", Number(e.target.value))} sx={inputSx} />
      </Box>

      {/* Question Pool */}
      {showPool && (
        <Box sx={{ mb: showProbs ? 2 : 0 }}>
          <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, mb: 1 }}>
            Question Pool
          </Typography>
          <TextField select size="small" fullWidth label="Select Question Pool"
            value={section.questionPool ?? ""}
            onChange={(e) => onChange("questionPool", e.target.value || null)}
            sx={inputSx}>
            <MenuItem value="">— None —</MenuItem>
            {pools.map((p) => (
              <MenuItem key={p._id} value={p._id}>
                {p.name}
                <Typography component="span" sx={{ color: "rgba(255,255,255,0.3)", fontSize: 11, ml: 1 }}>
                  ({p.questions.length} Qs)
                </Typography>
              </MenuItem>
            ))}
          </TextField>
          {pools.length === 0 && (
            <Typography sx={{ color: "rgba(255,193,7,0.6)", fontSize: 12, mt: 0.5 }}>
              No pools yet — create one in Question Pools.
            </Typography>
          )}
        </Box>
      )}

      {/* Problem Pool */}
      {showProbs && (
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
            <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 }}>
              Problems ({(section.problemPool ?? []).length})
            </Typography>
            <Button size="small" startIcon={<Add fontSize="small" />} onClick={onOpenProblemPicker}
              sx={{ color: "#3b82f6", fontSize: 12, p: "2px 8px", minWidth: 0 }}>
              Add / Remove
            </Button>
          </Box>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
            {(section.problemPool ?? []).length === 0 ? (
              <Typography sx={{ color: "rgba(255,255,255,0.2)", fontSize: 12 }}>
                No problems — click "Add / Remove" to pick from the library.
              </Typography>
            ) : (
              (section.problemPool ?? []).map((pid) => {
                const prob = problemMap[pid];
                return (
                  <Chip key={pid}
                    label={prob ? `${prob.title} · ${prob.difficulty}` : `…${pid.slice(-6)}`}
                    size="small"
                    onDelete={() => onChange("problemPool", (section.problemPool ?? []).filter((id) => id !== pid))}
                    sx={{
                      bgcolor: "rgba(59,130,246,0.08)", color: "#93c5fd",
                      border: "1px solid rgba(59,130,246,0.25)", fontSize: 11,
                      "& .MuiChip-deleteIcon": { color: "rgba(147,197,253,0.5)", "&:hover": { color: "#ef4444" } },
                    }}
                  />
                );
              })
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

const emptySection = (): SectionDraft => ({
  title: "", type: "quiz", maxTime: 30, maxScore: 100, maxQuestion: 10,
  description: "", questionPool: null, problemPool: [],
});

export default function AssessmentForm() {
  const router = useRouter();
  const create             = useCreateAssessment();
  const { data: skills  = [] } = useAdminSkills();
  const { data: pools   = [] } = useAdminPools();
  const { data: probRes }      = useAdminProblems({ limit: 100 });
  const allProblems = probRes?.data ?? [];

  const [step, setStep]         = useState(0);
  const [error, setError]       = useState("");
  const [probDialogIdx, setProbDialogIdx] = useState<number | null>(null);

  const [form, setForm] = useState<AssessmentFormData>({
    name: "", slug: "", skillId: null,
    isProctored: false, isAvEnabled: false, isScreenCapture: false,
    passCodeEnabled: false, passCode: "",
    isPublished: false,
    sections: [emptySection()],
  });

  const set = (key: keyof AssessmentFormData, val: unknown) =>
    setForm((f) => {
      const next = { ...f, [key]: val };
      if (key === "isAvEnabled" && val) next.isProctored = true;
      if (key === "isScreenCapture" && val) next.isProctored = true;
      if (key === "isProctored" && !val) { next.isAvEnabled = false; next.isScreenCapture = false; }
      if (key === "name") next.slug = (val as string).toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      return next;
    });

  const setSection = (i: number, key: string, val: unknown) =>
    setForm((f) => {
      const sections = [...f.sections];
      sections[i] = { ...sections[i], [key]: val } as typeof sections[0];
      return { ...f, sections };
    });

  const addSection    = () => setForm((f) => ({ ...f, sections: [...f.sections, emptySection()] }));
  const removeSection = (i: number) => setForm((f) => ({ ...f, sections: f.sections.filter((_, idx) => idx !== i) }));

  const toggleProblem = (sIdx: number, pid: string) => {
    const curr = form.sections[sIdx].problemPool ?? [];
    setSection(sIdx, "problemPool", curr.includes(pid) ? curr.filter((x) => x !== pid) : [...curr, pid]);
  };

  const handleSubmit = async (publish: boolean) => {
    setError("");
    try {
      await create.mutateAsync({ ...form, isPublished: publish });
      router.push("/admin/assessments");
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const problemMap = useMemo(
    () => Object.fromEntries(allProblems.map((p) => [p._id, p])),
    [allProblems],
  );

  return (
    <Box>
      <Typography sx={{ color: "#fff", fontSize: 22, fontWeight: 700, mb: 0.5 }}>New Assessment</Typography>
      <Typography sx={{ color: "rgba(255,255,255,0.35)", fontSize: 13, mb: 3 }}>Fill in the details to create an assessment</Typography>

      <Stepper activeStep={step} sx={{ mb: 3 }}>
        {STEPS.map((label) => (
          <Step key={label}>
            <StepLabel sx={{
              "& .MuiStepLabel-label":               { color: "rgba(255,255,255,0.4)" },
              "& .MuiStepLabel-label.Mui-active":    { color: "#fff" },
              "& .MuiStepLabel-label.Mui-completed": { color: "#3b82f6" },
              "& .MuiStepIcon-root":                 { color: "rgba(255,255,255,0.15)" },
              "& .MuiStepIcon-root.Mui-active":      { color: "#3b82f6" },
              "& .MuiStepIcon-root.Mui-completed":   { color: "#3b82f6" },
            }}>
              {label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* ── Step 0: Basic Info ─────────────────────────────────────────────────── */}
      {step === 0 && (
        <Box sx={card}>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 2 }}>
            <TextField label="Assessment Name *" size="small" value={form.name}
              onChange={(e) => set("name", e.target.value)} sx={inputSx} />
            <TextField label="Slug" size="small" value={form.slug}
              onChange={(e) => set("slug", e.target.value)} sx={inputSx} />
          </Box>

          <TextField select label="Skill" size="small" fullWidth
            value={form.skillId ?? ""}
            onChange={(e) => set("skillId", e.target.value ? Number(e.target.value) : null)}
            sx={{ ...inputSx, mb: 3 }}
          >
            <MenuItem value="">— None —</MenuItem>
            {skills.map((s) => <MenuItem key={s.skillId} value={s.skillId}>{s.name}</MenuItem>)}
          </TextField>

          <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, mb: 1.5 }}>
            Proctoring
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            <FormControlLabel
              control={<Switch checked={form.isProctored} size="small"
                onChange={(e) => set("isProctored", e.target.checked)}
                sx={{ "& .MuiSwitch-thumb": { bgcolor: form.isProctored ? "#3b82f6" : undefined } }} />}
              label={<Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>Enable Proctoring (tab / fullscreen tracking)</Typography>}
            />
            <FormControlLabel
              control={<Switch checked={form.isAvEnabled} size="small" disabled={!form.isProctored}
                onChange={(e) => set("isAvEnabled", e.target.checked)} />}
              label={
                <Typography sx={{ color: form.isProctored ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.3)", fontSize: 13 }}>
                  Enable AV Recording (webcam + mic → S3)
                </Typography>
              }
            />
            <FormControlLabel
              control={<Switch checked={form.isScreenCapture} size="small" disabled={!form.isProctored}
                onChange={(e) => set("isScreenCapture", e.target.checked)} />}
              label={
                <Typography sx={{ color: form.isProctored ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.3)", fontSize: 13 }}>
                  Enable Screen Capture (screen recording → S3)
                </Typography>
              }
            />
            <FormControlLabel
              control={<Switch checked={form.passCodeEnabled} size="small"
                onChange={(e) => set("passCodeEnabled", e.target.checked)} />}
              label={<Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>Require Passcode</Typography>}
            />
            {form.passCodeEnabled && (
              <TextField label="Passcode (min 6 chars)" type="password" size="small"
                value={form.passCode ?? ""} onChange={(e) => set("passCode", e.target.value)}
                sx={{ ...inputSx, mt: 1, maxWidth: 300 }} />
            )}
          </Box>
        </Box>
      )}

      {/* ── Step 1: Sections ───────────────────────────────────────────────────── */}
      {step === 1 && (
        <Box>
          {form.sections.map((sec, i) => (
            <SectionCard
              key={i}
              idx={i}
              section={sec}
              pools={pools}
              allProblems={allProblems}
              problemMap={problemMap}
              canRemove={form.sections.length > 1}
              onRemove={() => removeSection(i)}
              onChange={(key, val) => setSection(i, key, val)}
              onOpenProblemPicker={() => setProbDialogIdx(i)}
            />
          ))}
          <Button startIcon={<Add />} onClick={addSection} variant="outlined" size="small"
            sx={{ color: "#3b82f6", borderColor: "rgba(59,130,246,0.3)" }}>
            Add Section
          </Button>

          {probDialogIdx !== null && (
            <ProblemPickerDialog
              open
              onClose={() => setProbDialogIdx(null)}
              selectedIds={form.sections[probDialogIdx]?.problemPool ?? []}
              onToggle={(pid) => toggleProblem(probDialogIdx, pid)}
              allProblems={allProblems}
            />
          )}
        </Box>
      )}

      {/* ── Step 2: Review ─────────────────────────────────────────────────────── */}
      {step === 2 && (
        <Box sx={card}>
          <Typography sx={{ color: "#fff", fontWeight: 600, mb: 2 }}>Review</Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: "140px 1fr", rowGap: 1, mb: 3 }}>
            {[
              ["Name",         form.name],
              ["Slug",         form.slug],
              ["Skill",        skills.find((s) => s.skillId === form.skillId)?.name ?? "None"],
              ["Sections",     form.sections.length],
              ["Proctoring",       form.isProctored     ? "Enabled" : "Disabled"],
              ["AV Recording",     form.isAvEnabled     ? "Enabled" : "Disabled"],
              ["Screen Capture",   form.isScreenCapture ? "Enabled" : "Disabled"],
              ["Passcode",         form.passCodeEnabled  ? "Required" : "None"],
            ].map(([k, v]) => (
              <>
                <Typography key={`k-${k}`} sx={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>{k}</Typography>
                <Typography key={`v-${k}`} sx={{ color: "#fff", fontSize: 13 }}>{String(v)}</Typography>
              </>
            ))}
          </Box>

          <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, mb: 1.5 }}>
            Sections
          </Typography>
          {form.sections.map((s, i) => (
            <Box key={i} sx={{ mb: 1.5, p: 1.5, bgcolor: "rgba(255,255,255,0.03)", borderRadius: 1.5, border: "1px solid rgba(255,255,255,0.07)" }}>
              <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 0.5 }}>
                <Typography sx={{ color: "#fff", fontSize: 13, fontWeight: 500 }}>{s.title || `Section ${i + 1}`}</Typography>
                <Chip label={s.type} size="small" sx={{ height: 18, fontSize: 10, bgcolor: "rgba(59,130,246,0.1)", color: "#60a5fa", textTransform: "capitalize" }} />
              </Box>
              <Typography sx={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>
                {s.maxTime}m · {s.maxScore}pts · {s.maxQuestion}Q
                {s.questionPool && ` · Pool: ${pools.find((p) => p._id === s.questionPool)?.name ?? `…${s.questionPool.slice(-6)}`}`}
                {(s.problemPool ?? []).length > 0 && ` · ${s.problemPool.length} problem(s)`}
              </Typography>
            </Box>
          ))}

          {error && (
            <Typography sx={{ color: "#ef4444", fontSize: 13, mt: 2 }}>{error}</Typography>
          )}
        </Box>
      )}

      {/* Navigation */}
      <Box sx={{ display: "flex", gap: 1.5, mt: 3 }}>
        <Button variant="outlined"
          onClick={() => (step > 0 ? setStep(step - 1) : router.back())}
          sx={{ color: "rgba(255,255,255,0.6)", borderColor: "rgba(255,255,255,0.15)" }}>
          {step === 0 ? "Cancel" : "Back"}
        </Button>
        <Box sx={{ flex: 1 }} />
        {step < STEPS.length - 1 && (
          <Button variant="contained" onClick={() => setStep(step + 1)}
            sx={{ bgcolor: "#3b82f6", "&:hover": { bgcolor: "#2563eb" } }}>
            Next
          </Button>
        )}
        {step === STEPS.length - 1 && (
          <>
            <Button variant="outlined" onClick={() => handleSubmit(false)} disabled={create.isPending}
              sx={{ color: "rgba(255,255,255,0.6)", borderColor: "rgba(255,255,255,0.15)" }}>
              Save as Draft
            </Button>
            <Button variant="contained" onClick={() => handleSubmit(true)} disabled={create.isPending}
              sx={{ bgcolor: "#3b82f6", "&:hover": { bgcolor: "#2563eb" } }}>
              {create.isPending ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : "Publish"}
            </Button>
          </>
        )}
      </Box>
    </Box>
  );
}
