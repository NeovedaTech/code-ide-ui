"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box, Typography, Button, TextField, MenuItem, Chip,
  IconButton, Menu, Skeleton, Pagination,
} from "@mui/material";
import {
  Add, MoreVert, Edit, Delete, Visibility,
  VisibilityOff, Search,
} from "@mui/icons-material";
import { useAdminAssessments, useDeleteAssessment, useUpdateAssessment } from "@/modules/admin/hooks";
import type { Assessment, AssessmentFilters } from "@/modules/admin/types";

const card = {
  bgcolor: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 2,
};

function StatusChip({ published }: { published: boolean }) {
  return (
    <Chip
      label={published ? "Published" : "Draft"}
      size="small"
      sx={{
        bgcolor: published ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.07)",
        color:   published ? "#22c55e" : "rgba(255,255,255,0.4)",
        fontSize: 11, height: 20,
      }}
    />
  );
}

function RowMenu({ assessment, onEdit }: { assessment: Assessment; onEdit: () => void }) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const deleteMut  = useDeleteAssessment();
  const updateMut  = useUpdateAssessment(assessment._id);

  const togglePublish = () => {
    updateMut.mutate({ isPublished: !assessment.isPublished });
    setAnchor(null);
  };

  const handleDelete = () => {
    if (confirm(`Delete "${assessment.name}"?`)) deleteMut.mutate(assessment._id);
    setAnchor(null);
  };

  return (
    <>
      <IconButton size="small" onClick={(e) => setAnchor(e.currentTarget)} sx={{ color: "rgba(255,255,255,0.35)" }}>
        <MoreVert fontSize="small" />
      </IconButton>
      <Menu
        anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)}
        PaperProps={{ sx: { bgcolor: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)" } }}
      >
        {[
          { label: "Edit", icon: <Edit fontSize="small" />, action: onEdit },
          { label: assessment.isPublished ? "Unpublish" : "Publish",
            icon: assessment.isPublished ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />,
            action: togglePublish },
          { label: "Delete", icon: <Delete fontSize="small" />, action: handleDelete },
        ].map(({ label, icon, action }) => (
          <MenuItem key={label} onClick={action} sx={{ color: label === "Delete" ? "#ef4444" : "rgba(255,255,255,0.7)", fontSize: 13, gap: 1 }}>
            {icon} {label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

export default function AssessmentList() {
  const router = useRouter();
  const [filters, setFilters] = useState<AssessmentFilters>({ page: 1, limit: 20 });
  const { data, isLoading } = useAdminAssessments(filters);

  const assessments = data?.data ?? [];
  const pagination  = data?.pagination;

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
        <Box>
          <Typography sx={{ color: "#fff", fontSize: 22, fontWeight: 700 }}>Assessments</Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.35)", fontSize: 13 }}>
            {pagination?.total ?? 0} total
          </Typography>
        </Box>
        <Button
          startIcon={<Add />}
          variant="contained"
          onClick={() => router.push("/admin/assessments/new")}
          sx={{ bgcolor: "#3b82f6", "&:hover": { bgcolor: "#2563eb" }, borderRadius: 1.5, fontSize: 13 }}
        >
          New Assessment
        </Button>
      </Box>

      {/* Filters */}
      <Box sx={{ display: "flex", gap: 1.5, mb: 2 }}>
        <TextField
          size="small" placeholder="Search…"
          InputProps={{ startAdornment: <Search sx={{ color: "rgba(255,255,255,0.3)", mr: 0.5, fontSize: 18 }} /> }}
          sx={{ flex: 1, maxWidth: 280, "& .MuiOutlinedInput-root": { color: "#fff", bgcolor: "rgba(255,255,255,0.04)", "& fieldset": { borderColor: "rgba(255,255,255,0.1)" } } }}
        />
        <TextField
          select size="small" value={filters.isPublished ?? "all"}
          onChange={(e) => setFilters((f) => ({ ...f, page: 1, isPublished: e.target.value === "all" ? undefined : e.target.value === "true" }))}
          sx={{ width: 130, "& .MuiOutlinedInput-root": { color: "#fff", bgcolor: "rgba(255,255,255,0.04)", "& fieldset": { borderColor: "rgba(255,255,255,0.1)" } } }}
        >
          {[{ label: "All Status", value: "all" }, { label: "Published", value: "true" }, { label: "Draft", value: "false" }]
            .map(({ label, value }) => <MenuItem key={value} value={value} sx={{ fontSize: 13 }}>{label}</MenuItem>)}
        </TextField>
      </Box>

      {/* Table */}
      <Box sx={card}>
        {/* Header */}
        <Box sx={{
          display: "grid", gridTemplateColumns: "2fr 1fr 80px 80px 80px 40px",
          px: 2, py: 1.2, borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}>
          {["Name", "Skill", "Sections", "Attempts", "Status", ""].map((h) => (
            <Typography key={h} sx={{ color: "rgba(255,255,255,0.3)", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 }}>
              {h}
            </Typography>
          ))}
        </Box>

        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} variant="rectangular" height={48} sx={{ bgcolor: "rgba(255,255,255,0.04)", mb: "1px" }} />
            ))
          : assessments.map((a) => (
              <Box
                key={a._id}
                sx={{
                  display: "grid", gridTemplateColumns: "2fr 1fr 80px 80px 80px 40px",
                  px: 2, py: 1.2, alignItems: "center",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                  "&:last-child": { borderBottom: "none" },
                  "&:hover": { bgcolor: "rgba(255,255,255,0.03)" },
                }}
              >
                <Typography sx={{ color: "#fff", fontSize: 13, fontWeight: 500 }}>{a.name}</Typography>
                <Typography sx={{ color: "rgba(255,255,255,0.45)", fontSize: 13 }}>{a.skillId ?? "—"}</Typography>
                <Typography sx={{ color: "rgba(255,255,255,0.45)", fontSize: 13 }}>{a.sections?.length ?? 0}</Typography>
                <Typography sx={{ color: "rgba(255,255,255,0.45)", fontSize: 13 }}>{a.attemptCount ?? 0}</Typography>
                <StatusChip published={a.isPublished} />
                <RowMenu assessment={a} onEdit={() => router.push(`/admin/assessments/${a._id}/edit`)} />
              </Box>
            ))
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
