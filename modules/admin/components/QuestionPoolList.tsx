"use client";

import { useState } from "react";
import {
  Box, Typography, Button, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Chip, IconButton, Skeleton,
  Accordion, AccordionSummary, AccordionDetails,
} from "@mui/material";
import { Add, Delete, ExpandMore } from "@mui/icons-material";
import { useAdminPools, useCreatePool, useDeletePool, useAddQuestion, useDeleteQuestion } from "@/modules/admin/hooks";
import type { Question } from "@/modules/admin/types";

const card = {
  bgcolor: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 2,
};

const inputSx = {
  "& .MuiOutlinedInput-root": {
    color: "#fff", bgcolor: "rgba(255,255,255,0.04)",
    "& fieldset": { borderColor: "rgba(255,255,255,0.1)" },
    "&.Mui-focused fieldset": { borderColor: "#3b82f6" },
  },
  "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.4)" },
};

const categoryColor: Record<string, string> = {
  MCQ: "#3b82f6", MSQ: "#8b5cf6", Text: "#06b6d4",
};

function QuestionRow({ poolId, q }: { poolId: string; q: Question }) {
  const del = useDeleteQuestion(poolId);
  return (
    <Box sx={{
      display: "flex", alignItems: "flex-start", gap: 1.5,
      py: 1, borderBottom: "1px solid rgba(255,255,255,0.04)",
      "&:last-child": { borderBottom: "none" },
    }}>
      <Chip label={q.category} size="small" sx={{
        bgcolor: `${categoryColor[q.category]}22`,
        color: categoryColor[q.category],
        fontSize: 10, height: 18, flexShrink: 0, mt: 0.2,
      }} />
      <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: 13, flex: 1 }}>
        {q.question}
      </Typography>
      <Typography sx={{ color: "rgba(255,255,255,0.3)", fontSize: 11, flexShrink: 0 }}>
        {q.marks}m
      </Typography>
      <IconButton size="small" onClick={() => confirm("Delete this question?") && q._id && del.mutate(q._id)}
        sx={{ color: "rgba(255,255,255,0.2)", "&:hover": { color: "#ef4444" }, flexShrink: 0 }}>
        <Delete sx={{ fontSize: 15 }} />
      </IconButton>
    </Box>
  );
}

function NewPoolDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const create = useCreatePool();
  const [name, setName] = useState("");

  const handleCreate = async () => {
    if (!name.trim()) return;
    await create.mutateAsync({ name: name.trim() });
    setName("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: { bgcolor: "#111827", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 2, minWidth: 360 } }}>
      <DialogTitle sx={{ color: "#fff", fontSize: 16 }}>New Question Pool</DialogTitle>
      <DialogContent>
        <TextField label="Pool Name *" value={name} onChange={(e) => setName(e.target.value)} fullWidth size="small" sx={{ ...inputSx, mt: 1 }} />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ color: "rgba(255,255,255,0.5)" }}>Cancel</Button>
        <Button onClick={handleCreate} variant="contained" disabled={!name.trim() || create.isPending}
          sx={{ bgcolor: "#3b82f6", "&:hover": { bgcolor: "#2563eb" } }}>
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function AddQuestionDialog({ poolId, open, onClose }: { poolId: string; open: boolean; onClose: () => void }) {
  const add = useAddQuestion(poolId);
  const [q, setQ] = useState<Omit<Question, "_id">>({
    question: "", category: "MCQ", marks: 1, negative: 0, options: [
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
    ],
  });

  const handleAdd = async () => {
    if (!q.question.trim()) return;
    await add.mutateAsync(q);
    setQ({ question: "", category: "MCQ", marks: 1, negative: 0, options: [{ text: "", isCorrect: false }, { text: "", isCorrect: false }] });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: { bgcolor: "#111827", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 2, minWidth: 480 } }}>
      <DialogTitle sx={{ color: "#fff", fontSize: 16 }}>Add Question</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
        <TextField label="Question *" value={q.question} onChange={(e) => setQ((x) => ({ ...x, question: e.target.value }))} multiline rows={2} fullWidth size="small" sx={inputSx} />
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1.5 }}>
          <TextField select label="Category" value={q.category} onChange={(e) => setQ((x) => ({ ...x, category: e.target.value as Question["category"] }))} size="small" sx={inputSx}>
            {["MCQ", "MSQ", "Text"].map((c) => <option key={c} value={c}>{c}</option>)}
          </TextField>
          <TextField label="Marks" type="number" value={q.marks} onChange={(e) => setQ((x) => ({ ...x, marks: Number(e.target.value) }))} size="small" sx={inputSx} />
          <TextField label="Negative" type="number" value={q.negative} onChange={(e) => setQ((x) => ({ ...x, negative: Number(e.target.value) }))} size="small" sx={inputSx} />
        </Box>
        {q.category !== "Text" && (
          <Box>
            <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: 12, mb: 1 }}>Options</Typography>
            {q.options.map((opt, i) => (
              <Box key={i} sx={{ display: "flex", gap: 1, mb: 1, alignItems: "center" }}>
                <input type={q.category === "MCQ" ? "radio" : "checkbox"}
                  checked={opt.isCorrect}
                  onChange={() => setQ((x) => ({
                    ...x,
                    options: x.options.map((o, idx) => ({
                      ...o,
                      isCorrect: q.category === "MCQ" ? idx === i : idx === i ? !o.isCorrect : o.isCorrect,
                    })),
                  }))}
                  style={{ accentColor: "#3b82f6" }}
                />
                <TextField value={opt.text} size="small" fullWidth placeholder={`Option ${i + 1}`}
                  onChange={(e) => setQ((x) => ({ ...x, options: x.options.map((o, idx) => idx === i ? { ...o, text: e.target.value } : o) }))}
                  sx={inputSx} />
              </Box>
            ))}
            <Button size="small" startIcon={<Add />} onClick={() => setQ((x) => ({ ...x, options: [...x.options, { text: "", isCorrect: false }] }))}
              sx={{ color: "#3b82f6", fontSize: 12 }}>
              Add Option
            </Button>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ color: "rgba(255,255,255,0.5)" }}>Cancel</Button>
        <Button onClick={handleAdd} variant="contained" disabled={!q.question.trim() || add.isPending}
          sx={{ bgcolor: "#3b82f6", "&:hover": { bgcolor: "#2563eb" } }}>
          Add Question
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function QuestionPoolList() {
  const { data: pools, isLoading } = useAdminPools();
  const deletePool = useDeletePool();
  const [newPoolOpen, setNewPoolOpen]   = useState(false);
  const [addQPool, setAddQPool]         = useState<string | null>(null);

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
        <Box>
          <Typography sx={{ color: "#fff", fontSize: 22, fontWeight: 700 }}>Question Pools</Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.35)", fontSize: 13 }}>{pools?.length ?? 0} pools</Typography>
        </Box>
        <Button startIcon={<Add />} variant="contained" onClick={() => setNewPoolOpen(true)}
          sx={{ bgcolor: "#3b82f6", "&:hover": { bgcolor: "#2563eb" }, borderRadius: 1.5, fontSize: 13 }}>
          New Pool
        </Button>
      </Box>

      {isLoading
        ? Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="rectangular" height={56} sx={{ bgcolor: "rgba(255,255,255,0.04)", mb: 1, borderRadius: 2 }} />
          ))
        : (pools ?? []).map((pool) => (
            <Accordion key={pool._id} sx={{
              ...card, mb: 1,
              "&::before": { display: "none" },
              "&.Mui-expanded": { ...card, mb: 1 },
            }}>
              <AccordionSummary expandIcon={<ExpandMore sx={{ color: "rgba(255,255,255,0.4)" }} />}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1, pr: 2 }}>
                  <Typography sx={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>{pool.name}</Typography>
                  <Chip label={`${pool.questions.length} questions`} size="small"
                    sx={{ bgcolor: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.5)", fontSize: 11 }} />
                  <Box sx={{ flex: 1 }} />
                  <Button size="small" startIcon={<Add />} onClick={(e) => { e.stopPropagation(); setAddQPool(pool._id); }}
                    sx={{ color: "#3b82f6", fontSize: 12 }}>
                    Add Q
                  </Button>
                  <IconButton size="small" onClick={(e) => { e.stopPropagation(); confirm(`Delete pool "${pool.name}"?`) && deletePool.mutate(pool._id); }}
                    sx={{ color: "rgba(255,255,255,0.2)", "&:hover": { color: "#ef4444" } }}>
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0, px: 2, pb: 2 }}>
                {pool.questions.length === 0
                  ? <Typography sx={{ color: "rgba(255,255,255,0.25)", fontSize: 13 }}>No questions yet.</Typography>
                  : pool.questions.map((q) => <QuestionRow key={q._id} poolId={pool._id} q={q} />)
                }
              </AccordionDetails>
            </Accordion>
          ))
      }

      <NewPoolDialog open={newPoolOpen} onClose={() => setNewPoolOpen(false)} />
      {addQPool && (
        <AddQuestionDialog poolId={addQPool} open={!!addQPool} onClose={() => setAddQPool(null)} />
      )}
    </Box>
  );
}
