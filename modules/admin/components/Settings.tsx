"use client";

import { useState } from "react";
import {
  Box, Typography, Button, TextField, MenuItem, Chip,
  IconButton, Divider,
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";
import {
  useAdminRoles, useAdminSkills, useAdminMappings,
  useCreateRole, useDeleteRole,
  useCreateSkill, useDeleteSkill,
  useCreateMapping, useDeleteMapping,
} from "@/modules/admin/hooks";

const card = {
  bgcolor: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 2,
  p: 3,
};

const inputSx = {
  "& .MuiOutlinedInput-root": {
    color: "#fff", bgcolor: "rgba(255,255,255,0.04)",
    "& fieldset": { borderColor: "rgba(255,255,255,0.1)" },
    "&.Mui-focused fieldset": { borderColor: "#3b82f6" },
  },
  "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.4)" },
  "& .MuiSelect-icon": { color: "rgba(255,255,255,0.4)" },
};

const levelColor: Record<string, string> = {
  beginner: "#22c55e", intermediate: "#f59e0b", advanced: "#ef4444",
};

function InlineAdd({ placeholder, onAdd, loading }: { placeholder: string; onAdd: (v: string) => void; loading: boolean }) {
  const [val, setVal] = useState("");
  return (
    <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
      <TextField size="small" placeholder={placeholder} value={val} onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" && val.trim()) { onAdd(val.trim()); setVal(""); } }}
        sx={{ flex: 1, ...inputSx }} />
      <Button variant="contained" size="small" disabled={!val.trim() || loading}
        onClick={() => { onAdd(val.trim()); setVal(""); }}
        sx={{ bgcolor: "#3b82f6", "&:hover": { bgcolor: "#2563eb" } }}>
        <Add fontSize="small" />
      </Button>
    </Box>
  );
}

export default function Settings() {
  const { data: roles }    = useAdminRoles();
  const { data: skills }   = useAdminSkills();
  const { data: mappings } = useAdminMappings();

  const createRole    = useCreateRole();
  const deleteRole    = useDeleteRole();
  const createSkill   = useCreateSkill();
  const deleteSkill   = useDeleteSkill();
  const createMapping = useCreateMapping();
  const deleteMapping = useDeleteMapping();

  const [mapForm, setMapForm] = useState({ role: "", skill: "", level: "beginner" as string });
  const [mapError, setMapError] = useState("");

  const handleAddMapping = async () => {
    if (!mapForm.role || !mapForm.skill) return;
    setMapError("");
    try {
      await createMapping.mutateAsync(mapForm);
      setMapForm((f) => ({ ...f, role: "", skill: "" }));
    } catch (e) {
      setMapError((e as Error).message);
    }
  };

  return (
    <Box>
      <Typography sx={{ color: "#fff", fontSize: 22, fontWeight: 700, mb: 0.5 }}>Settings</Typography>
      <Typography sx={{ color: "rgba(255,255,255,0.35)", fontSize: 13, mb: 3 }}>
        Manage roles, skills, and mappings
      </Typography>

      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 2 }}>
        {/* Roles */}
        <Box sx={card}>
          <Typography sx={{ color: "#fff", fontWeight: 600, fontSize: 14, mb: 2 }}>Roles</Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {(roles ?? []).map((r) => (
              <Box key={r._id} sx={{
                display: "flex", alignItems: "center",
                px: 1.5, py: 1, borderRadius: 1,
                bgcolor: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}>
                <Typography sx={{ color: "rgba(255,255,255,0.35)", fontSize: 11, mr: 1.5 }}>#{r.roleId}</Typography>
                <Typography sx={{ color: "#fff", fontSize: 13, flex: 1 }}>{r.name}</Typography>
                <IconButton size="small" onClick={() => confirm(`Delete role "${r.name}"?`) && deleteRole.mutate(r._id)}
                  sx={{ color: "rgba(255,255,255,0.2)", "&:hover": { color: "#ef4444" } }}>
                  <Delete sx={{ fontSize: 15 }} />
                </IconButton>
              </Box>
            ))}
          </Box>
          <InlineAdd placeholder="New role name" onAdd={(name) => createRole.mutate({ name })} loading={createRole.isPending} />
        </Box>

        {/* Skills */}
        <Box sx={card}>
          <Typography sx={{ color: "#fff", fontWeight: 600, fontSize: 14, mb: 2 }}>Skills</Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {(skills ?? []).map((s) => (
              <Box key={s._id} sx={{
                display: "flex", alignItems: "center",
                px: 1.5, py: 1, borderRadius: 1,
                bgcolor: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}>
                <Typography sx={{ color: "rgba(255,255,255,0.35)", fontSize: 11, mr: 1.5 }}>#{s.skillId}</Typography>
                <Typography sx={{ color: "#fff", fontSize: 13, flex: 1 }}>{s.name}</Typography>
                <IconButton size="small" onClick={() => confirm(`Delete skill "${s.name}"?`) && deleteSkill.mutate(s._id)}
                  sx={{ color: "rgba(255,255,255,0.2)", "&:hover": { color: "#ef4444" } }}>
                  <Delete sx={{ fontSize: 15 }} />
                </IconButton>
              </Box>
            ))}
          </Box>
          <InlineAdd placeholder="New skill name" onAdd={(name) => createSkill.mutate({ name })} loading={createSkill.isPending} />
        </Box>
      </Box>

      {/* Mappings */}
      <Box sx={card}>
        <Typography sx={{ color: "#fff", fontWeight: 600, fontSize: 14, mb: 2 }}>Role–Skill Mappings</Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, mb: 3 }}>
          {(mappings ?? []).map((m) => (
            <Box key={m._id} sx={{
              display: "flex", alignItems: "center", gap: 1.5,
              px: 2, py: 1, borderRadius: 1,
              bgcolor: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}>
              <Typography sx={{ color: "#fff", fontSize: 13, width: 160 }}>{m.role?.name ?? "—"}</Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>→</Typography>
              <Typography sx={{ color: "#fff", fontSize: 13, width: 120 }}>{m.skill?.name ?? "—"}</Typography>
              <Chip label={m.level} size="small" sx={{
                bgcolor: `${levelColor[m.level]}22`, color: levelColor[m.level],
                fontSize: 11, height: 20,
              }} />
              <Box sx={{ flex: 1 }} />
              <IconButton size="small" onClick={() => deleteMapping.mutate(m._id)}
                sx={{ color: "rgba(255,255,255,0.2)", "&:hover": { color: "#ef4444" } }}>
                <Delete sx={{ fontSize: 15 }} />
              </IconButton>
            </Box>
          ))}
          {(mappings ?? []).length === 0 && (
            <Typography sx={{ color: "rgba(255,255,255,0.25)", fontSize: 13 }}>No mappings yet.</Typography>
          )}
        </Box>

        <Divider sx={{ borderColor: "rgba(255,255,255,0.06)", mb: 2 }} />
        <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: 12, mb: 1.5 }}>Add Mapping</Typography>
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start", flexWrap: "wrap" }}>
          <TextField select label="Role" value={mapForm.role} onChange={(e) => setMapForm((f) => ({ ...f, role: e.target.value }))}
            size="small" sx={{ width: 180, ...inputSx }}>
            {(roles ?? []).map((r) => <MenuItem key={r._id} value={r._id}>{r.name}</MenuItem>)}
          </TextField>
          <TextField select label="Skill" value={mapForm.skill} onChange={(e) => setMapForm((f) => ({ ...f, skill: e.target.value }))}
            size="small" sx={{ width: 180, ...inputSx }}>
            {(skills ?? []).map((s) => <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>)}
          </TextField>
          <TextField select label="Level" value={mapForm.level} onChange={(e) => setMapForm((f) => ({ ...f, level: e.target.value }))}
            size="small" sx={{ width: 150, ...inputSx }}>
            {["beginner", "intermediate", "advanced"].map((l) => (
              <MenuItem key={l} value={l} sx={{ textTransform: "capitalize" }}>{l}</MenuItem>
            ))}
          </TextField>
          <Button variant="contained" startIcon={<Add />} onClick={handleAddMapping}
            disabled={!mapForm.role || !mapForm.skill || createMapping.isPending}
            sx={{ bgcolor: "#3b82f6", "&:hover": { bgcolor: "#2563eb" }, mt: 0.1 }}>
            Add
          </Button>
        </Box>
        {mapError && <Typography sx={{ color: "#ef4444", fontSize: 12, mt: 1 }}>{mapError}</Typography>}
      </Box>
    </Box>
  );
}
