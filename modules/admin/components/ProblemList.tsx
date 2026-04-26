"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box, Typography, Button, TextField, MenuItem, Chip,
  Skeleton, Pagination, IconButton,
} from "@mui/material";
import { Add, Delete, Edit } from "@mui/icons-material";
import { useAdminProblems, useDeleteProblem } from "@/modules/admin/hooks";
import type { ProblemFilters } from "@/modules/admin/types";

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
  "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.4)" },
};

const diffColor: Record<string, string> = {
  Easy: "#22c55e", Medium: "#f59e0b", Hard: "#ef4444",
};

export default function ProblemList() {
  const router = useRouter();
  const [filters, setFilters] = useState<ProblemFilters>({ page: 1, limit: 20 });
  const { data, isLoading } = useAdminProblems(filters);
  const deleteMut = useDeleteProblem();

  const problems   = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
        <Box>
          <Typography sx={{ color: "#fff", fontSize: 22, fontWeight: 700 }}>Problems</Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.35)", fontSize: 13 }}>{pagination?.total ?? 0} problems</Typography>
        </Box>
        <Button startIcon={<Add />} variant="contained"
          onClick={() => router.push("/admin/problems/new")}
          sx={{ bgcolor: "#3b82f6", "&:hover": { bgcolor: "#2563eb" }, borderRadius: 1.5, fontSize: 13 }}>
          New Problem
        </Button>
      </Box>

      <Box sx={{ display: "flex", gap: 1.5, mb: 2 }}>
        <TextField size="small" placeholder="Search…" value={filters.search ?? ""}
          onChange={(e) => setFilters((f) => ({ ...f, page: 1, search: e.target.value || undefined }))}
          sx={{ flex: 1, maxWidth: 280, ...inputSx }} />
        <TextField select size="small" label="Difficulty" value={filters.difficulty ?? "all"}
          onChange={(e) => setFilters((f) => ({ ...f, page: 1, difficulty: e.target.value === "all" ? undefined : e.target.value }))}
          sx={{ width: 140, ...inputSx }}>
          {["all", "Easy", "Medium", "Hard"].map((d) => (
            <MenuItem key={d} value={d}>{d === "all" ? "All Difficulty" : d}</MenuItem>
          ))}
        </TextField>
      </Box>

      <Box sx={card}>
        <Box sx={{
          display: "grid", gridTemplateColumns: "2fr 90px 1fr 80px",
          px: 2, py: 1.2, borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}>
          {["Title", "Difficulty", "Languages", ""].map((h) => (
            <Typography key={h} sx={{ color: "rgba(255,255,255,0.3)", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 }}>
              {h}
            </Typography>
          ))}
        </Box>

        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} variant="rectangular" height={48} sx={{ bgcolor: "rgba(255,255,255,0.04)", mb: "1px" }} />
            ))
          : problems.map((p) => (
              <Box key={p._id} sx={{
                display: "grid", gridTemplateColumns: "2fr 90px 1fr 80px",
                px: 2, py: 1.2, alignItems: "center",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
                "&:last-child": { borderBottom: "none" },
                "&:hover": { bgcolor: "rgba(255,255,255,0.03)" },
              }}>
                <Typography sx={{ color: "#fff", fontSize: 13 }}>{p.title}</Typography>
                <Chip label={p.difficulty} size="small" sx={{
                  bgcolor: `${diffColor[p.difficulty]}22`,
                  color: diffColor[p.difficulty],
                  fontSize: 11, height: 20, width: "fit-content",
                }} />
                <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                  {(p.languagesSupported ?? []).slice(0, 3).map((l) => (
                    <Chip key={l} label={l} size="small" sx={{ bgcolor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)", fontSize: 10, height: 18 }} />
                  ))}
                </Box>
                <Box sx={{ display: "flex", gap: 0.5 }}>
                  <IconButton size="small" onClick={() => router.push(`/admin/problems/${p._id}/edit`)}
                    sx={{ color: "rgba(255,255,255,0.3)", "&:hover": { color: "#3b82f6" } }}><Edit fontSize="small" /></IconButton>
                  <IconButton size="small" onClick={() => confirm(`Delete "${p.title}"?`) && deleteMut.mutate(p._id)}
                    sx={{ color: "rgba(255,255,255,0.3)", "&:hover": { color: "#ef4444" } }}>
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            ))
        }
      </Box>

      {pagination && pagination.pages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <Pagination count={pagination.pages} page={pagination.page}
            onChange={(_, p) => setFilters((f) => ({ ...f, page: p }))}
            sx={{ "& .MuiPaginationItem-root": { color: "rgba(255,255,255,0.5)" } }} />
        </Box>
      )}
    </Box>
  );
}
