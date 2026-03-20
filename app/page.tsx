"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AppBar, Toolbar, Container, Typography, Button, Skeleton,
  Card, CardContent, Box, Chip, TextField, InputAdornment, Pagination,
} from "@mui/material";
import {
  Search, ChevronRight, ArrowLeft, Briefcase, Zap, Star,
  Code, Terminal, CheckCircle, ExternalLink,
} from "lucide-react";
import { styled } from "@mui/material/styles";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { ROLE_SKILL_ROUTES, ASSESMENT_ROUTES, USER_ROUTES } from "@/constants/ApiRoutes";

// ─── Styled ──────────────────────────────────────────────────────────────────

const StyledAppBar = styled(AppBar)({
  backgroundColor: "rgba(0,0,0,0.95)",
  backdropFilter: "blur(20px)",
  borderBottom: "1px solid rgba(59,130,246,0.1)",
  boxShadow: "0 4px 30px rgba(0,0,0,0.5)",
});

const PageWrap = styled(Box)({
  minHeight: "100vh",
  background: "#000",
  backgroundImage: `
    radial-gradient(circle at 10% 20%, rgba(59,130,246,0.08) 0%, transparent 40%),
    radial-gradient(circle at 90% 80%, rgba(139,92,246,0.08) 0%, transparent 40%)
  `,
  color: "white",
  paddingTop: "80px",
  paddingBottom: "60px",
});

const GlassCard = styled(Card)({
  backgroundColor: "rgba(15,15,15,0.7)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "16px",
  backdropFilter: "blur(20px)",
  color: "white",
  cursor: "pointer",
  transition: "all 0.25s ease",
  "&:hover": {
    borderColor: "rgba(59,130,246,0.4)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 16px rgba(59,130,246,0.15)",
    transform: "translateY(-3px)",
  },
});

const SearchField = styled(TextField)({
  "& .MuiOutlinedInput-root": {
    color: "white",
    borderRadius: "12px",
    backgroundColor: "rgba(255,255,255,0.05)",
    "& fieldset": { borderColor: "rgba(255,255,255,0.12)" },
    "&:hover fieldset": { borderColor: "rgba(59,130,246,0.4)" },
    "&.Mui-focused fieldset": { borderColor: "#3b82f6" },
  },
  "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.4)" },
  "& .MuiInputLabel-root.Mui-focused": { color: "#3b82f6" },
});

const SkeletonCard = styled(Skeleton)({
  backgroundColor: "rgba(255,255,255,0.06)",
  borderRadius: "16px",
  transform: "none",
});

const LEVEL_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  beginner:     { bg: "rgba(34,197,94,0.1)",  text: "#22c55e", border: "rgba(34,197,94,0.3)" },
  intermediate: { bg: "rgba(234,179,8,0.1)",  text: "#eab308", border: "rgba(234,179,8,0.3)" },
  advanced:     { bg: "rgba(239,68,68,0.1)",  text: "#ef4444", border: "rgba(239,68,68,0.3)" },
};

// ─── Skeleton grids ───────────────────────────────────────────────────────────

function RoleSkeletons() {
  return (
    <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(280px, 1fr))" gap={2}>
      {Array.from({ length: 12 }).map((_, i) => (
        <SkeletonCard key={i} variant="rectangular" height={88} />
      ))}
    </Box>
  );
}

function SkillSkeletons() {
  return (
    <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(240px, 1fr))" gap={2}>
      {Array.from({ length: 15 }).map((_, i) => (
        <SkeletonCard key={i} variant="rectangular" height={96} />
      ))}
    </Box>
  );
}

function AssessmentSkeletons() {
  return (
    <Box display="flex" flexDirection="column" gap={2}>
      {Array.from({ length: 5 }).map((_, i) => (
        <SkeletonCard key={i} variant="rectangular" height={84} />
      ))}
    </Box>
  );
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface Role       { _id: string; roleId: number; name: string }
interface Skill      { _id: string; skillId: number; name: string; level: string }
interface Assessment { _id: string; name: string; slug: string; sections: unknown[]; skillId?: number }
interface Meta       { page: number; pages: number; total: number; limit: number }

// ─── Page ────────────────────────────────────────────────────────────────────

export default function Page() {
  const { user, logout, isLoading } = useAuth();
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1 — Roles
  const [roles, setRoles]             = useState<Role[]>([]);
  const [rolesMeta, setRolesMeta]     = useState<Meta | null>(null);
  const [rolesPage, setRolesPage]     = useState(1);
  const [rolesSearch, setRolesSearch] = useState("");
  const [rolesLoading, setRolesLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  // Step 2 — Skills
  const [skills, setSkills]           = useState<Skill[]>([]);
  const [skillsMeta, setSkillsMeta]   = useState<Meta | null>(null);
  const [skillsPage, setSkillsPage]   = useState(1);
  const [skillsLoading, setSkillsLoading] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  // Step 3 — Assessments
  const [assessments, setAssessments]         = useState<Assessment[]>([]);
  const [assessmentsMeta, setAssessmentsMeta] = useState<Meta | null>(null);
  const [assessmentsPage, setAssessmentsPage] = useState(1);
  const [assessmentsLoading, setAssessmentsLoading] = useState(false);
  const [completedMap, setCompletedMap] = useState<Record<string, string>>({});

  // ── URL sync helpers ──
  const pushParams = useCallback((roleId?: number, skillId?: number) => {
    const p = new URLSearchParams();
    if (roleId  !== undefined) p.set("roleId",  String(roleId));
    if (skillId !== undefined) p.set("skillId", String(skillId));
    router.replace(`/?${p.toString()}`, { scroll: false });
  }, [router]);

  useEffect(() => {
    if (!isLoading && !user) router.replace("/auth");
  }, [user, isLoading, router]);

  // ── Data fetchers ──
  const fetchRoles = useCallback(async (page: number, search: string) => {
    setRolesLoading(true);
    try {
      const p = new URLSearchParams({ page: String(page), limit: "12" });
      if (search.trim()) p.set("search", search.trim());
      const res  = await fetch(`${ROLE_SKILL_ROUTES.ROLES}?${p}`);
      const data = await res.json();
      if (data.success) { setRoles(data.data); setRolesMeta(data.pagination); }
    } finally { setRolesLoading(false); }
  }, []);

  const fetchSkills = useCallback(async (roleId: number, page: number): Promise<Skill[]> => {
    setSkillsLoading(true);
    try {
      const p = new URLSearchParams({ page: String(page), limit: "15" });
      const res  = await fetch(`${ROLE_SKILL_ROUTES.SKILLS_BY_ROLE(roleId)}?${p}`);
      const data = await res.json();
      if (data.success) { setSkills(data.data); setSkillsMeta(data.pagination); return data.data; }
    } finally { setSkillsLoading(false); }
    return [];
  }, []);

  const fetchAssessments = useCallback(async (skillId: number | null, page: number) => {
    setAssessmentsLoading(true);
    try {
      const p = new URLSearchParams({ page: String(page), limit: "10" });
      if (skillId !== null) p.set("skillId", String(skillId));
      const res  = await fetch(`${ASSESMENT_ROUTES.ALL}?${p}`);
      const data = await res.json();
      if (data.success) { setAssessments(data.data); setAssessmentsMeta(data.pagination); }
    } finally { setAssessmentsLoading(false); }
  }, []);

  const fetchCompleted = useCallback(async (userId: string) => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("knovia_token") : null;
      const res  = await fetch(USER_ROUTES.COMPLETED_ASSESSMENTS(userId), {
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.success) {
        const map: Record<string, string> = {};
        (data.data as { assessmentId: string; solutionId: string }[]).forEach(
          ({ assessmentId, solutionId }) => { map[assessmentId] = solutionId; }
        );
        setCompletedMap(map);
      }
    } catch { /* non-fatal */ }
  }, []);

  // ── Restore state from URL params on first load ──
  useEffect(() => {
    if (!user) return;
    const roleIdParam  = searchParams.get("roleId");
    const skillIdParam = searchParams.get("skillId");
    if (!roleIdParam) { fetchRoles(1, ""); return; }

    // Fetch roles list first (for breadcrumb)
    fetchRoles(1, "");

    // Restore selected role by fetching its skills
    const roleId = Number(roleIdParam);
    fetchSkills(roleId, 1).then((fetchedSkills) => {
      // We need the role name — find it from the roles list after it loads,
      // but roles may not be loaded yet; use a placeholder and patch when ready.
      setSelectedRole({ _id: "", roleId, name: "Loading…" });
      setStep(skillIdParam ? 3 : 2);

      if (skillIdParam) {
        const skillId = Number(skillIdParam);
        const matched = fetchedSkills.find((s) => s.skillId === skillId);
        if (matched) {
          setSelectedSkill(matched);
          fetchAssessments(skillId, 1);
          fetchCompleted(user._id);
        }
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Patch selectedRole name once roles are loaded
  useEffect(() => {
    if (selectedRole && selectedRole.name === "Loading…" && roles.length > 0) {
      const matched = roles.find((r) => r.roleId === selectedRole.roleId);
      if (matched) setSelectedRole(matched);
    }
  }, [roles, selectedRole]);

  // Fetch roles on search/page change (only after initial load)
  useEffect(() => {
    if (!user || step !== 1) return;
    const t = setTimeout(() => fetchRoles(rolesPage, rolesSearch), rolesSearch ? 300 : 0);
    return () => clearTimeout(t);
  }, [user, rolesPage, rolesSearch, fetchRoles, step]);

  // ── Handlers ──
  const handleSelectRole = (role: Role) => {
    setSelectedRole(role);
    setSkills([]); setSkillsPage(1); setSelectedSkill(null);
    setStep(2);
    fetchSkills(role.roleId, 1);
    pushParams(role.roleId);
  };

  const handleSelectSkill = (skill: Skill) => {
    setSelectedSkill(skill);
    setAssessments([]); setAssessmentsPage(1);
    setStep(3);
    fetchAssessments(skill.skillId, 1);
    if (user) fetchCompleted(user._id);
    if (selectedRole) pushParams(selectedRole.roleId, skill.skillId);
  };

  const handleBackToRoles = () => {
    setStep(1); setSelectedRole(null); setSelectedSkill(null);
    router.replace("/", { scroll: false });
    fetchRoles(rolesPage, rolesSearch);
  };

  const handleBackToSkills = () => {
    setStep(2); setSelectedSkill(null);
    if (selectedRole) pushParams(selectedRole.roleId);
    fetchSkills(selectedRole!.roleId, skillsPage);
  };

  const handleSkillsPage = (_: React.ChangeEvent<unknown>, page: number) => {
    setSkillsPage(page);
    if (selectedRole) fetchSkills(selectedRole.roleId, page);
  };

  const handleAssessmentsPage = (_: React.ChangeEvent<unknown>, page: number) => {
    setAssessmentsPage(page);
    fetchAssessments(selectedSkill?.skillId ?? null, page);
  };

  if (isLoading || !user) {
    return (
      <PageWrap>
        <Container maxWidth="lg" sx={{ pt: 6 }}>
          <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(280px, 1fr))" gap={2}>
            {Array.from({ length: 12 }).map((_, i) => (
              <SkeletonCard key={i} variant="rectangular" height={88} />
            ))}
          </Box>
        </Container>
      </PageWrap>
    );
  }

  return (
    <>
      {/* ── Navbar ── */}
      <StyledAppBar position="fixed">
        <Toolbar sx={{ justifyContent: "space-between", minHeight: 70 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, background: "linear-gradient(to right, #fff, #94a3b8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            KNOVIA AI
          </Typography>
          <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
            <Link href="/playground" style={{ textDecoration: "none" }}>
              <Typography sx={{ color: "rgba(255,255,255,0.6)", fontWeight: 500, "&:hover": { color: "#fff" } }}>Playground</Typography>
            </Link>
            <Link href="/terminal" style={{ textDecoration: "none" }}>
              <Typography sx={{ color: "rgba(255,255,255,0.6)", fontWeight: 500, "&:hover": { color: "#fff" } }}>Terminal</Typography>
            </Link>
            <Typography sx={{ color: "rgba(255,255,255,0.35)", fontSize: "0.875rem" }}>{user.name}</Typography>
            <Button onClick={logout} size="small" sx={{ color: "#f87171", fontWeight: 600, textTransform: "none" }}>Logout</Button>
          </Box>
        </Toolbar>
      </StyledAppBar>

      <PageWrap>
        <Container maxWidth="lg">

          {/* ── Breadcrumb ── */}
          {step > 1 && (
            <Box display="flex" alignItems="center" gap={1} mb={5} flexWrap="wrap">
              <Typography
                sx={{ color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: "0.875rem", "&:hover": { color: "#fff" } }}
                onClick={handleBackToRoles}
              >
                Roles
              </Typography>
              {selectedRole && (
                <>
                  <Typography sx={{ color: "rgba(255,255,255,0.2)", fontSize: "0.875rem" }}>/</Typography>
                  <Typography
                    sx={{ color: step === 2 ? "white" : "rgba(255,255,255,0.4)", cursor: step === 3 ? "pointer" : "default", fontSize: "0.875rem", "&:hover": step === 3 ? { color: "#fff" } : {} }}
                    onClick={() => { if (step === 3) handleBackToSkills(); }}
                  >
                    {selectedRole.name}
                  </Typography>
                </>
              )}
              {selectedSkill && (
                <>
                  <Typography sx={{ color: "rgba(255,255,255,0.2)", fontSize: "0.875rem" }}>/</Typography>
                  <Typography sx={{ color: "white", fontSize: "0.875rem" }}>{selectedSkill.name}</Typography>
                </>
              )}
            </Box>
          )}

          {/* ════════════════ STEP 1 — Roles ════════════════ */}
          {step === 1 && (
            <Box>
              <Box textAlign="center" mb={6}>
                <Typography variant="h3" fontWeight={900} mb={1}>Select Your Role</Typography>
                <Typography variant="h6" color="rgba(255,255,255,0.4)">Choose a job role to explore its skill requirements</Typography>
              </Box>

              <Box maxWidth={480} mx="auto" mb={5}>
                <SearchField
                  fullWidth
                  placeholder="Search roles..."
                  value={rolesSearch}
                  onChange={(e) => { setRolesSearch(e.target.value); setRolesPage(1); }}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Search size={18} color="rgba(255,255,255,0.4)" /></InputAdornment> }}
                />
              </Box>

              {rolesLoading ? <RoleSkeletons /> : (
                <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(280px, 1fr))" gap={2}>
                  {roles.map((role) => (
                    <GlassCard key={role._id} onClick={() => handleSelectRole(role)}>
                      <CardContent sx={{ p: 3 }}>
                        <Box display="flex" alignItems="center" gap={1.5} mb={1.5}>
                          <Box sx={{ p: 1, borderRadius: "10px", bgcolor: "rgba(59,130,246,0.1)", display: "flex" }}>
                            <Briefcase size={18} color="#3b82f6" />
                          </Box>
                          <Typography variant="body1" fontWeight={700} sx={{ lineHeight: 1.3 }}>{role.name}</Typography>
                        </Box>
                        <Box display="flex" justifyContent="flex-end">
                          <ChevronRight size={16} color="rgba(59,130,246,0.6)" />
                        </Box>
                      </CardContent>
                    </GlassCard>
                  ))}
                </Box>
              )}

              {rolesMeta && rolesMeta.pages > 1 && (
                <Box display="flex" flexDirection="column" alignItems="center" gap={1} mt={5}>
                  <Pagination count={rolesMeta.pages} page={rolesPage} onChange={(_, p) => setRolesPage(p)}
                    sx={{ "& .MuiPaginationItem-root": { color: "rgba(255,255,255,0.6)" }, "& .Mui-selected": { bgcolor: "rgba(59,130,246,0.2) !important", color: "#3b82f6" } }}
                  />
                  <Typography variant="caption" color="rgba(255,255,255,0.3)">{rolesMeta.total} roles total</Typography>
                </Box>
              )}
            </Box>
          )}

          {/* ════════════════ STEP 2 — Skills ════════════════ */}
          {step === 2 && selectedRole && (
            <Box>
              <Box display="flex" alignItems="flex-start" gap={2} mb={6}>
                <Button onClick={handleBackToRoles} startIcon={<ArrowLeft size={16} />}
                  sx={{ color: "rgba(255,255,255,0.5)", textTransform: "none", mt: 0.5 }}>
                  Back
                </Button>
                <Box>
                  <Typography variant="h4" fontWeight={900}>{selectedRole.name}</Typography>
                  <Typography color="rgba(255,255,255,0.4)" mt={0.5}>Click a skill to view its assessments</Typography>
                </Box>
              </Box>

              {skillsLoading ? <SkillSkeletons /> : (
                <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(240px, 1fr))" gap={2}>
                  {skills.map((skill) => {
                    const lvl = LEVEL_COLORS[skill.level] ?? LEVEL_COLORS.beginner;
                    return (
                      <GlassCard key={skill._id} onClick={() => handleSelectSkill(skill)}>
                        <CardContent sx={{ p: 3 }}>
                          <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                            <Box sx={{ p: 1, borderRadius: "10px", bgcolor: "rgba(139,92,246,0.1)", display: "flex" }}>
                              {skill.level === "advanced" ? <Star size={16} color="#a78bfa" /> : <Zap size={16} color="#a78bfa" />}
                            </Box>
                            <Typography variant="body1" fontWeight={700}>{skill.name}</Typography>
                          </Box>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Chip label={skill.level} size="small"
                              sx={{ bgcolor: lvl.bg, color: lvl.text, border: `1px solid ${lvl.border}`, fontWeight: 600, fontSize: "0.7rem", textTransform: "capitalize" }}
                            />
                            <ChevronRight size={14} color="rgba(139,92,246,0.5)" />
                          </Box>
                        </CardContent>
                      </GlassCard>
                    );
                  })}
                </Box>
              )}

              {skillsMeta && skillsMeta.pages > 1 && (
                <Box display="flex" flexDirection="column" alignItems="center" gap={1} mt={5}>
                  <Pagination count={skillsMeta.pages} page={skillsPage} onChange={handleSkillsPage}
                    sx={{ "& .MuiPaginationItem-root": { color: "rgba(255,255,255,0.6)" }, "& .Mui-selected": { bgcolor: "rgba(139,92,246,0.2) !important", color: "#a78bfa" } }}
                  />
                  <Typography variant="caption" color="rgba(255,255,255,0.3)">{skillsMeta.total} skills total</Typography>
                </Box>
              )}
            </Box>
          )}

          {/* ════════════════ STEP 3 — Assessments ════════════════ */}
          {step === 3 && selectedSkill && (
            <Box>
              <Box display="flex" alignItems="flex-start" gap={2} mb={6}>
                <Button onClick={handleBackToSkills} startIcon={<ArrowLeft size={16} />}
                  sx={{ color: "rgba(255,255,255,0.5)", textTransform: "none", mt: 0.5 }}>
                  Back
                </Button>
                <Box>
                  <Typography variant="h4" fontWeight={900}>{selectedSkill.name}</Typography>
                  <Typography color="rgba(255,255,255,0.4)" mt={0.5}>
                    {assessmentsMeta ? `${assessmentsMeta.total} assessment${assessmentsMeta.total !== 1 ? "s" : ""} available` : "Loading…"}
                  </Typography>
                </Box>
              </Box>

              {assessmentsLoading ? <AssessmentSkeletons /> : assessments.length === 0 ? (
                <Box textAlign="center" py={10}>
                  <Typography color="rgba(255,255,255,0.3)" variant="h6">No assessments available for this skill yet.</Typography>
                </Box>
              ) : (
                <Box display="flex" flexDirection="column" gap={2}>
                  {assessments.map((a) => {
                    const solutionId = completedMap[a._id];
                    const done = Boolean(solutionId);
                    return (
                      <GlassCard key={a._id}
                        onClick={() => { if (!done) router.push(`/user?assessmentId=${a._id}&userId=${user._id}`); }}
                        sx={{ cursor: done ? "default" : "pointer", "&:hover": done ? { transform: "none", boxShadow: "none", borderColor: "rgba(255,255,255,0.08)" } : {} }}
                      >
                        <CardContent sx={{ p: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <Box>
                            <Box display="flex" alignItems="center" gap={2} mb={1}>
                              <Typography variant="h6" fontWeight={700}>{a.name}</Typography>
                              {done && (
                                <Chip icon={<CheckCircle size={13} />} label="Completed" size="small"
                                  sx={{ bgcolor: "rgba(76,175,80,0.1)", color: "#4caf50", border: "1px solid rgba(76,175,80,0.3)" }}
                                />
                              )}
                            </Box>
                            <Box display="flex" gap={3}>
                              <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "rgba(255,255,255,0.4)" }}>
                                <Terminal size={13} /> {a.sections?.length ?? 0} section{(a.sections?.length ?? 0) !== 1 ? "s" : ""}
                              </Typography>
                              <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "rgba(255,255,255,0.4)" }}>
                                <Code size={13} /> Coding
                              </Typography>
                            </Box>
                          </Box>

                          {!done ? (
                            <Button
                              variant="contained"
                              size="small"
                              onClick={(e) => { e.stopPropagation(); router.push(`/user?assessmentId=${a._id}&userId=${user._id}`); }}
                              endIcon={<ChevronRight size={16} />}
                              sx={{ borderRadius: "10px", bgcolor: "#3b82f6", "&:hover": { bgcolor: "#2563eb" }, textTransform: "none", fontWeight: 700, whiteSpace: "nowrap" }}
                            >
                              Start
                            </Button>
                          ) : (
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={(e) => { e.stopPropagation(); router.push(`/assessment/preview/${solutionId}`); }}
                              endIcon={<ExternalLink size={14} />}
                              sx={{ borderRadius: "10px", borderColor: "rgba(59,130,246,0.5)", color: "#93c5fd", "&:hover": { borderColor: "#3b82f6", bgcolor: "rgba(59,130,246,0.08)" }, textTransform: "none", fontWeight: 600, whiteSpace: "nowrap" }}
                            >
                              Preview
                            </Button>
                          )}
                        </CardContent>
                      </GlassCard>
                    );
                  })}
                </Box>
              )}

              {assessmentsMeta && assessmentsMeta.pages > 1 && (
                <Box display="flex" flexDirection="column" alignItems="center" gap={1} mt={5}>
                  <Pagination count={assessmentsMeta.pages} page={assessmentsPage} onChange={handleAssessmentsPage}
                    sx={{ "& .MuiPaginationItem-root": { color: "rgba(255,255,255,0.6)" }, "& .Mui-selected": { bgcolor: "rgba(59,130,246,0.2) !important", color: "#3b82f6" } }}
                  />
                  <Typography variant="caption" color="rgba(255,255,255,0.3)">{assessmentsMeta.total} assessments total</Typography>
                </Box>
              )}
            </Box>
          )}

        </Container>
      </PageWrap>
    </>
  );
}
