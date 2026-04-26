"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box, Typography, TextField, MenuItem, Chip, Pagination, Skeleton, Button,
} from "@mui/material";
import { OpenInNew, WarningAmber } from "@mui/icons-material";
import { useAdminSolutions } from "@/modules/admin/hooks";
import type { Solution, SolutionFilters } from "@/modules/admin/types";

const card = {
  bgcolor: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 2,
};

const inputSx = {
  "& .MuiOutlinedInput-root": {
    color: "#fff", bgcolor: "rgba(255,255,255,0.04)",
    "& fieldset": { borderColor: "rgba(255,255,255,0.1)" },
  },
};

function statusLabel(s: Solution) {
  if (s.isEvaluated)  return { label: "Evaluated",   color: "#22c55e" };
  if (s.isSubmitted)  return { label: "Submitted",   color: "#f59e0b" };
  if (s.hasAgreed)    return { label: "In Progress", color: "#3b82f6" };
  return                     { label: "Not Started", color: "rgba(255,255,255,0.3)" };
}

function SolutionRow({ s }: { s: Solution }) {
  const router = useRouter();
  const st     = statusLabel(s);
  const score  = Array.isArray(s.feedback) && s.feedback.length > 0
    ? `${(s.feedback as { score?: number }[])[0]?.score ?? "—"}`
    : "—";

  return (
    <Box sx={{
      display: "grid", gridTemplateColumns: "1.5fr 1.5fr 80px 80px 100px 40px",
      px: 2, py: 1.3, alignItems: "center",
      borderBottom: "1px solid rgba(255,255,255,0.04)",
      "&:last-child": { borderBottom: "none" },
      "&:hover": { bgcolor: "rgba(255,255,255,0.03)" },
    }}>
      <Box>
        <Typography sx={{ color: "#fff", fontSize: 13 }}>{s.userId?.name ?? "—"}</Typography>
        <Typography sx={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}>{s.userId?.email ?? ""}</Typography>
      </Box>
      <Typography sx={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>{s.assessmentId?.name ?? "—"}</Typography>
      <Typography sx={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>{score}</Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        {s.ufmAttempts > 0 && <WarningAmber sx={{ fontSize: 14, color: s.ufmAttempts >= 3 ? "#ef4444" : "#f59e0b" }} />}
        <Typography sx={{ color: s.ufmAttempts >= 3 ? "#ef4444" : "rgba(255,255,255,0.5)", fontSize: 13 }}>
          {s.ufmAttempts}
        </Typography>
      </Box>
      <Chip label={st.label} size="small" sx={{ bgcolor: `${st.color}22`, color: st.color, fontSize: 11, height: 20 }} />
      <Button size="small" onClick={() => router.push(`/admin/solutions/${s._id}`)}
        sx={{ minWidth: 0, p: 0.5, color: "rgba(255,255,255,0.3)", "&:hover": { color: "#3b82f6" } }}>
        <OpenInNew fontSize="small" />
      </Button>
    </Box>
  );
}

export default function SolutionList() {
  const [filters, setFilters] = useState<SolutionFilters>({ page: 1, limit: 20 });
  const { data, isLoading } = useAdminSolutions(filters);

  const solutions  = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <Box>
      <Typography sx={{ color: "#fff", fontSize: 22, fontWeight: 700, mb: 0.5 }}>Candidates</Typography>
      <Typography sx={{ color: "rgba(255,255,255,0.35)", fontSize: 13, mb: 3 }}>
        {pagination?.total ?? 0} submissions
      </Typography>

      <Box sx={{ display: "flex", gap: 1.5, mb: 2 }}>
        <TextField
          select size="small" label="Status" value={
            filters.isSubmitted === undefined ? "all"
            : filters.isEvaluated ? "evaluated"
            : "submitted"
          }
          onChange={(e) => {
            const v = e.target.value;
            setFilters((f) => ({
              ...f, page: 1,
              isSubmitted:  v !== "all",
              isEvaluated:  v === "evaluated" ? true : undefined,
            }));
          }}
          sx={{ width: 150, ...inputSx }}
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="submitted">Submitted</MenuItem>
          <MenuItem value="evaluated">Evaluated</MenuItem>
        </TextField>

        <TextField
          select size="small" label="Flags" value={filters.minViolations ?? "any"}
          onChange={(e) => setFilters((f) => ({ ...f, page: 1, minViolations: e.target.value === "any" ? undefined : Number(e.target.value) }))}
          sx={{ width: 130, ...inputSx }}
        >
          <MenuItem value="any">Any Flags</MenuItem>
          <MenuItem value={1}>≥ 1 Flag</MenuItem>
          <MenuItem value={3}>≥ 3 Flags</MenuItem>
        </TextField>
      </Box>

      <Box sx={card}>
        <Box sx={{
          display: "grid", gridTemplateColumns: "1.5fr 1.5fr 80px 80px 100px 40px",
          px: 2, py: 1.2, borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}>
          {["Candidate", "Assessment", "Score", "Flags", "Status", ""].map((h) => (
            <Typography key={h} sx={{ color: "rgba(255,255,255,0.3)", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 }}>
              {h}
            </Typography>
          ))}
        </Box>

        {isLoading
          ? Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} variant="rectangular" height={50} sx={{ bgcolor: "rgba(255,255,255,0.04)", mb: "1px" }} />
            ))
          : solutions.map((s) => <SolutionRow key={s._id} s={s} />)
        }
      </Box>

      {pagination && pagination.pages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <Pagination
            count={pagination.pages} page={pagination.page}
            onChange={(_, p) => setFilters((f) => ({ ...f, page: p }))}
            sx={{ "& .MuiPaginationItem-root": { color: "rgba(255,255,255,0.5)" } }}
          />
        </Box>
      )}
    </Box>
  );
}
