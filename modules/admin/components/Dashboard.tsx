"use client";

import { Box, Typography, Skeleton, Chip } from "@mui/material";
import {
  Assignment, People, WarningAmber, EmojiEvents,
  HourglassEmpty, Today,
} from "@mui/icons-material";
import { useAdminMetrics } from "@/modules/admin/hooks";
import type { RecentSubmission, SkillStat } from "@/modules/admin/types";

const card = {
  bgcolor: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 2,
  p: 2.5,
};

interface MetricCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  loading?: boolean;
}

function MetricCard({ label, value, icon, color, loading }: MetricCardProps) {
  return (
    <Box sx={{ ...card, display: "flex", alignItems: "center", gap: 2 }}>
      <Box sx={{
        width: 44, height: 44, borderRadius: 1.5,
        bgcolor: `${color}22`,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        "& svg": { color, fontSize: 22 },
      }}>
        {icon}
      </Box>
      <Box>
        {loading
          ? <Skeleton variant="text" width={60} sx={{ bgcolor: "rgba(255,255,255,0.08)" }} />
          : <Typography sx={{ color: "#fff", fontSize: 22, fontWeight: 700, lineHeight: 1 }}>{value}</Typography>
        }
        <Typography sx={{ color: "rgba(255,255,255,0.45)", fontSize: 12, mt: 0.3 }}>{label}</Typography>
      </Box>
    </Box>
  );
}

function SubmissionRow({ s }: { s: RecentSubmission }) {
  const score = Array.isArray(s.feedback) && s.feedback.length > 0
    ? `${(s.feedback as { score?: number }[])[0]?.score ?? "—"}`
    : "—";

  return (
    <Box sx={{
      display: "grid", gridTemplateColumns: "1fr 1fr 80px 80px",
      px: 2, py: 1.2, borderBottom: "1px solid rgba(255,255,255,0.05)",
      "&:last-child": { borderBottom: "none" },
      "&:hover": { bgcolor: "rgba(255,255,255,0.03)" },
    }}>
      <Typography sx={{ color: "#fff", fontSize: 13 }}>{s.userId?.name ?? "—"}</Typography>
      <Typography sx={{ color: "rgba(255,255,255,0.55)", fontSize: 13 }}>{s.assessmentId?.name ?? "—"}</Typography>
      <Typography sx={{ color: "rgba(255,255,255,0.55)", fontSize: 13 }}>{score}</Typography>
      <Box>
        {s.ufmAttempts > 0 && (
          <Chip
            label={`${s.ufmAttempts} ⚠`}
            size="small"
            sx={{ bgcolor: s.ufmAttempts >= 3 ? "rgba(239,68,68,0.2)" : "rgba(245,158,11,0.2)",
                  color: s.ufmAttempts >= 3 ? "#ef4444" : "#f59e0b",
                  fontSize: 11, height: 20 }}
          />
        )}
      </Box>
    </Box>
  );
}

function SkillBar({ skill }: { skill: SkillStat; max: number }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
      <Typography sx={{ color: "rgba(255,255,255,0.6)", fontSize: 12, width: 80, flexShrink: 0 }} noWrap>
        {skill.skillName}
      </Typography>
      <Box sx={{ flex: 1, height: 6, bgcolor: "rgba(255,255,255,0.07)", borderRadius: 99, overflow: "hidden" }}>
        <Box sx={{
          height: "100%", bgcolor: "#3b82f6", borderRadius: 99,
          width: `${(skill.count / (skill.count + 10)) * 100}%`,
        }} />
      </Box>
      <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: 11, width: 24, textAlign: "right", flexShrink: 0 }}>
        {skill.count}
      </Typography>
    </Box>
  );
}

export default function Dashboard() {
  const { data: metrics, isLoading } = useAdminMetrics();

  const stats = [
    { label: "Total Assessments",  value: metrics?.totalAssessments  ?? 0, icon: <Assignment />,     color: "#3b82f6" },
    { label: "Submitted Today",    value: metrics?.submittedToday    ?? 0, icon: <Today />,          color: "#22c55e" },
    { label: "Pending Evaluation", value: metrics?.pendingEvaluation ?? 0, icon: <HourglassEmpty />, color: "#f59e0b" },
    { label: "Total Candidates",   value: metrics?.totalCandidates   ?? 0, icon: <People />,         color: "#8b5cf6" },
    { label: "Flagged (UFM ≥ 3)",  value: metrics?.flaggedSolutions  ?? 0, icon: <WarningAmber />,   color: "#ef4444" },
    { label: "Certificates Sent",  value: metrics?.certificatesSent  ?? 0, icon: <EmojiEvents />,    color: "#06b6d4" },
  ];

  return (
    <Box>
      <Typography sx={{ color: "#fff", fontSize: 22, fontWeight: 700, mb: 0.5 }}>Dashboard</Typography>
      <Typography sx={{ color: "rgba(255,255,255,0.35)", fontSize: 13, mb: 3 }}>
        Platform overview
      </Typography>

      {/* Metric cards */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 2, mb: 3 }}>
        {stats.map((s) => (
          <MetricCard key={s.label} {...s} loading={isLoading} />
        ))}
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 2 }}>
        {/* Recent submissions */}
        <Box sx={card}>
          <Typography sx={{ color: "#fff", fontWeight: 600, fontSize: 14, mb: 2 }}>Recent Submissions</Typography>
          <Box sx={{
            display: "grid", gridTemplateColumns: "1fr 1fr 80px 80px",
            px: 2, pb: 1, borderBottom: "1px solid rgba(255,255,255,0.07)",
          }}>
            {["Candidate", "Assessment", "Score", "Flags"].map((h) => (
              <Typography key={h} sx={{ color: "rgba(255,255,255,0.3)", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 }}>
                {h}
              </Typography>
            ))}
          </Box>
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} variant="rectangular" height={40} sx={{ bgcolor: "rgba(255,255,255,0.05)", mb: 0.5 }} />
              ))
            : (metrics?.recentSubmissions ?? []).map((s) => <SubmissionRow key={s._id} s={s} />)
          }
        </Box>

        {/* Submissions by skill */}
        <Box sx={card}>
          <Typography sx={{ color: "#fff", fontWeight: 600, fontSize: 14, mb: 2 }}>By Skill</Typography>
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} variant="rectangular" height={20} sx={{ bgcolor: "rgba(255,255,255,0.05)", mb: 1 }} />
              ))
            : (metrics?.submissionsBySkill ?? []).map((s) => (
                <SkillBar key={s.skillName} skill={s} max={metrics?.submittedToday ?? 1} />
              ))
          }
        </Box>
      </Box>
    </Box>
  );
}
