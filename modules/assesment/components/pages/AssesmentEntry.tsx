"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  LinearProgress,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import MicNoneOutlinedIcon from "@mui/icons-material/MicNoneOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import QuizOutlinedIcon from "@mui/icons-material/QuizOutlined";
import CodeOutlinedIcon from "@mui/icons-material/CodeOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import ScreenShareOutlinedIcon from "@mui/icons-material/ScreenShareOutlined";

import { useQueryClient } from "@tanstack/react-query";
import { useAssessmentInfo } from "@/modules/assesment/hooks/AssesmentApi";
import { getAssesment, startAssessment } from "@/modules/assesment/hooks/ApiCalls";
import { useAuth } from "@/context/AuthContext";
import AssesmentAttempt from "@/modules/assesment/components/AssesmentAttempt";
import { AnswersProvider } from "@/modules/assesment/context/AnswersContext";
import { AssessmentProvider } from "@/modules/assesment/context/AssesmentContext";

// ─── Design tokens ─────────────────────────────────────────────────────────────
const BRAND = "#1557a0";
const BRAND_DARK = "#0e3f78";
const SURFACE = "#ffffff";
const BG = "#f0f2f5";
const BORDER = "#dde1e7";
const TEXT_PRIMARY = "#0a1931";
const TEXT_SECONDARY = "#566474";

type DeviceStatus = "idle" | "checking" | "ok" | "error";
type PermissionStatus = "not_required" | DeviceStatus;

export interface AcquiredStreams {
  camStream: MediaStream | null;
  screenStream: MediaStream | null;
}

// ─── Section type icon ─────────────────────────────────────────────────────────
function SectionIcon({ type }: { type: string }) {
  if (type === "coding") return <CodeOutlinedIcon sx={{ fontSize: 16, color: BRAND }} />;
  if (type === "quiz") return <QuizOutlinedIcon sx={{ fontSize: 16, color: "#7c3aed" }} />;
  return <LayersOutlinedIcon sx={{ fontSize: 16, color: "#0891b2" }} />;
}

// ─── Requirement row ────────────────────────────────────────────────────────────

function RequirementRow({
  icon,
  label,
  status,
  onRequest,
  errorHint,
}: {
  icon: React.ReactNode;
  label: string;
  status: PermissionStatus;
  onRequest?: () => void;
  errorHint?: string;
}) {
  const dimmed = status === "not_required";
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        py: 1.25,
        opacity: dimmed ? 0.4 : 1,
      }}
    >
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: dimmed ? "#f5f5f5" : "#e8f0fe",
          color: dimmed ? TEXT_SECONDARY : BRAND,
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="body2"
          sx={{ fontWeight: 500, color: TEXT_PRIMARY }}
        >
          {label}
        </Typography>
        {status === "error" && errorHint && (
          <Typography variant="caption" sx={{ color: "#dc2626", display: "block" }}>
            {errorHint}
          </Typography>
        )}
      </Box>
      {status === "not_required" && (
        <Typography variant="caption" sx={{ color: TEXT_SECONDARY }}>
          Not required
        </Typography>
      )}
      {(status === "idle" || status === "error") && onRequest && (
        <Button
          size="small"
          variant="text"
          onClick={onRequest}
          sx={{
            fontSize: 11,
            textTransform: "none",
            color: status === "error" ? "#dc2626" : BRAND,
            fontWeight: 600,
            minWidth: 0,
            px: 1,
          }}
        >
          {status === "error" ? "Retry" : "Grant"}
        </Button>
      )}
      {status === "checking" && (
        <CircularProgress size={14} sx={{ color: BRAND }} />
      )}
      {status === "ok" && (
        <CheckCircleIcon sx={{ fontSize: 16, color: "#16a34a" }} />
      )}
    </Box>
  );
}

// ─── Section card ───────────────────────────────────────────────────────────────
function SectionCard({
  index,
  title,
  type,
  maxTime,
  maxScore,
}: {
  index: number;
  title: string;
  type: string;
  maxTime: number;
  maxScore: number;
}) {
  const typeLabel =
    type === "coding" ? "Coding" : type === "quiz" ? "Quiz" : "Mixed";

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        p: 2,
        borderRadius: 1.5,
        border: `1px solid ${BORDER}`,
        bgcolor: SURFACE,
        mb: 1.5,
      }}
    >
      {/* Index */}
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          bgcolor: BRAND,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          fontSize: 13,
          fontWeight: 700,
        }}
      >
        {index + 1}
      </Box>

      {/* Title + type */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="body2"
          fontWeight={600}
          noWrap
          sx={{ color: TEXT_PRIMARY }}
        >
          {title}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.25 }}>
          <SectionIcon type={type} />
          <Typography variant="caption" sx={{ color: TEXT_SECONDARY }}>
            {typeLabel}
          </Typography>
        </Box>
      </Box>

      {/* Meta */}
      <Box sx={{ textAlign: "right", flexShrink: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, justifyContent: "flex-end" }}>
          <AccessTimeIcon sx={{ fontSize: 13, color: TEXT_SECONDARY }} />
          <Typography variant="caption" sx={{ color: TEXT_SECONDARY, fontWeight: 500 }}>
            {maxTime} min
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ color: TEXT_SECONDARY }}>
          {maxScore} pts
        </Typography>
      </Box>
    </Box>
  );
}

// ─── Stat pill ──────────────────────────────────────────────────────────────────
function StatPill({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
}) {
  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        py: 2,
        px: 1,
        borderRadius: 2,
        bgcolor: "#f0f4ff",
        border: `1px solid #d4e0fa`,
      }}
    >
      <Box sx={{ color: BRAND, mb: 0.5 }}>{icon}</Box>
      <Typography variant="h6" fontWeight={700} sx={{ color: TEXT_PRIMARY, lineHeight: 1.1 }}>
        {value}
      </Typography>
      <Typography variant="caption" sx={{ color: TEXT_SECONDARY }}>
        {label}
      </Typography>
    </Box>
  );
}

// ─── Landing page ───────────────────────────────────────────────────────────────
function AssessmentLanding({
  assessmentId,
  onEnter,
}: {
  assessmentId: string;
  onEnter: (streams?: AcquiredStreams) => void;
}) {
  const { user } = useAuth();
  const { data: info, isLoading, error } = useAssessmentInfo(assessmentId);
  const queryClient = useQueryClient();

  const [passCode, setPassCode] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  // Permission states
  const [camStatus, setCamStatus] = useState<DeviceStatus>("idle");
  const [micStatus, setMicStatus] = useState<DeviceStatus>("idle");
  const [screenStatus, setScreenStatus] = useState<DeviceStatus>("idle");
  const [screenErr, setScreenErr] = useState("");

  // Stream refs
  const camStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const passingForwardRef = useRef(false);
  const hasRequestedCamRef = useRef(false);

  // Request camera + microphone
  const requestCamMic = useCallback(async () => {
    if (!info) return;
    camStreamRef.current?.getTracks().forEach((t) => t.stop());
    camStreamRef.current = null;
    if (info.isProctored) setCamStatus("checking");
    if (info.isAvEnabled) setMicStatus("checking");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: info.isProctored,
        audio: info.isAvEnabled,
      });
      camStreamRef.current = stream;
      if (info.isProctored) setCamStatus("ok");
      if (info.isAvEnabled) setMicStatus("ok");
    } catch {
      if (info.isProctored) setCamStatus("error");
      if (info.isAvEnabled) setMicStatus("error");
    }
  }, [info]);

  // Request screen share — entire screen only
  const requestScreen = useCallback(async () => {
    screenStreamRef.current?.getTracks().forEach((t) => t.stop());
    screenStreamRef.current = null;
    setScreenStatus("checking");
    setScreenErr("");
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      const track = stream.getVideoTracks()[0];
      const settings = track.getSettings() as MediaTrackSettings & { displaySurface?: string };

      // Reject anything other than the entire screen
      if (settings.displaySurface && settings.displaySurface !== "monitor") {
        stream.getTracks().forEach((t) => t.stop());
        setScreenStatus("error");
        setScreenErr("Please share your entire screen, not a window or tab.");
        return;
      }

      screenStreamRef.current = stream;
      track.addEventListener("ended", () => {
        setScreenStatus("idle");
        screenStreamRef.current = null;
      }, { once: true });

      setScreenStatus("ok");
    } catch {
      setScreenStatus("error");
      setScreenErr("Screen sharing was denied or failed.");
    }
  }, []);

  // Auto-request camera+mic when assessment info loads
  useEffect(() => {
    if (!info || hasRequestedCamRef.current) return;
    if (info.isProctored || info.isAvEnabled) {
      hasRequestedCamRef.current = true;
      requestCamMic();
    }
  }, [info, requestCamMic]);

  // Cleanup streams on unmount (unless forwarding to assessment)
  useEffect(() => {
    return () => {
      if (!passingForwardRef.current) {
        camStreamRef.current?.getTracks().forEach((t) => t.stop());
        screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  if (isLoading) {
    return (
      <Box sx={{ bgcolor: BG, minHeight: "100vh" }}>
        <LinearProgress sx={{ "& .MuiLinearProgress-bar": { bgcolor: BRAND } }} />
        <Box sx={{ display: "flex", justifyContent: "center", pt: 12 }}>
          <Typography variant="body2" color={TEXT_SECONDARY}>
            Loading assessment…
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error || !info) {
    return (
      <Box
        sx={{
          bgcolor: BG,
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <ErrorOutlineIcon sx={{ fontSize: 40, color: "#dc2626", mb: 1 }} />
          <Typography variant="body1" color={TEXT_PRIMARY} fontWeight={600}>
            Assessment not found
          </Typography>
          <Typography variant="body2" color={TEXT_SECONDARY} mt={0.5}>
            This link may be invalid or the assessment is no longer available.
          </Typography>
        </Box>
      </Box>
    );
  }

  const totalTime = info.sections.reduce((s, sec) => s + sec.maxTime, 0);
  const totalScore = info.sections.reduce((s, sec) => s + sec.maxScore, 0);

  // Derive permission readiness
  const camOk = !info.isProctored || camStatus === "ok";
  const micOk = !info.isAvEnabled || micStatus === "ok";
  const screenOk = !info.isScreenCapture || screenStatus === "ok";
  const passOk = !info.passCodeEnabled || passCode.trim().length > 0;
  const allReady = camOk && micOk && screenOk && passOk;

  // Display statuses for requirement rows
  const camDisplay: PermissionStatus = info.isProctored ? camStatus : "not_required";
  const micDisplay: PermissionStatus = info.isAvEnabled ? micStatus : "not_required";
  const screenDisplay: PermissionStatus = info.isScreenCapture ? screenStatus : "not_required";
  const passDisplay: PermissionStatus = info.passCodeEnabled ? (passCode.trim() ? "ok" : "idle") : "not_required";

  async function doBegin() {
    try {
      passingForwardRef.current = true;
      const result = await getAssesment(assessmentId, user!._id, passCode || undefined);
      const solutionId = result.data._id;

      // Start assessment (sets hasAgreed=true) — skips the instructions page
      await startAssessment({ solutionId });
      result.data.hasAgreed = true;

      queryClient.setQueryData(["assesment", assessmentId, user!._id], result);
      onEnter({ camStream: camStreamRef.current, screenStream: screenStreamRef.current });
    } catch (e: any) {
      passingForwardRef.current = false;
      camStreamRef.current?.getTracks().forEach((t) => t.stop());
      camStreamRef.current = null;
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
      setErr(
        e?.response?.data?.message ??
          e?.message ??
          "Unable to start assessment. Please check your passcode and try again.",
      );
      setSubmitting(false);
      throw e;
    }
  }

  async function handleBegin() {
    if (!user || !allReady) return;
    if (info!.passCodeEnabled && !passCode.trim()) {
      setErr("A passcode is required to access this assessment.");
      return;
    }
    setErr("");
    setSubmitting(true);
    await doBegin();
  }

  const rules = [
    "Ensure you are in a quiet environment with a stable internet connection.",
    "Do not navigate away from this window — tab switches will be flagged.",
    "Each section must be submitted before the timer expires.",
    "Once submitted, answers cannot be modified.",
    info.isProctored ? "Your camera will be active and monitored throughout the assessment." : null,
    info.isAvEnabled ? "Your microphone will be recorded during the session." : null,
    info.isScreenCapture ? "Your screen will be recorded during this assessment." : null,
  ].filter(Boolean) as string[];

  return (
    <Box sx={{ bgcolor: BG, minHeight: "100vh", py: 6, px: 2 }}>
      {/* Header bar */}
      <Box
        sx={{
          maxWidth: 780,
          mx: "auto",
          mb: 3,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <AssignmentIcon sx={{ color: BRAND, fontSize: 22 }} />
        <Typography variant="body2" sx={{ color: TEXT_SECONDARY, fontWeight: 500 }}>
          Online Assessment
        </Typography>
      </Box>

      <Box
        sx={{
          maxWidth: 780,
          mx: "auto",
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 320px" },
          gap: 2.5,
          alignItems: "start",
        }}
      >
        {/* ── Left column ── */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          {/* Title card */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              border: `1px solid ${BORDER}`,
              bgcolor: SURFACE,
            }}
          >
            <Typography
              variant="h5"
              fontWeight={700}
              sx={{ color: TEXT_PRIMARY, mb: 0.5 }}
            >
              {info.name}
            </Typography>
            <Typography variant="body2" sx={{ color: TEXT_SECONDARY, mb: 3 }}>
              Complete all sections to submit your assessment.
            </Typography>

            {/* Stats */}
            <Box sx={{ display: "flex", gap: 1.5 }}>
              <StatPill
                icon={<AccessTimeIcon fontSize="small" />}
                value={`${totalTime}`}
                label="minutes"
              />
              <StatPill
                icon={<AssignmentIcon fontSize="small" />}
                value={info.sections.length}
                label="sections"
              />
              <StatPill
                icon={<CheckCircleIcon fontSize="small" />}
                value={`${totalScore}`}
                label="total pts"
              />
            </Box>
          </Paper>

          {/* Sections */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              border: `1px solid ${BORDER}`,
              bgcolor: SURFACE,
            }}
          >
            <Typography
              variant="overline"
              sx={{ color: TEXT_SECONDARY, letterSpacing: 1, fontWeight: 700, fontSize: 11 }}
            >
              Assessment Sections
            </Typography>
            <Box sx={{ mt: 2 }}>
              {info.sections.map((sec, i) => (
                <SectionCard
                  key={i}
                  index={i}
                  title={sec.title}
                  type={sec.type}
                  maxTime={sec.maxTime}
                  maxScore={sec.maxScore}
                />
              ))}
            </Box>
          </Paper>

          {/* Instructions */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              border: `1px solid ${BORDER}`,
              bgcolor: SURFACE,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <InfoOutlinedIcon sx={{ fontSize: 16, color: TEXT_SECONDARY }} />
              <Typography
                variant="overline"
                sx={{ color: TEXT_SECONDARY, letterSpacing: 1, fontWeight: 700, fontSize: 11 }}
              >
                Important Instructions
              </Typography>
            </Box>
            <Box component="ol" sx={{ m: 0, pl: 2.5, display: "flex", flexDirection: "column", gap: 1 }}>
              {rules.map((rule, i) => (
                <Box component="li" key={i}>
                  <Typography variant="body2" sx={{ color: TEXT_SECONDARY, lineHeight: 1.6 }}>
                    {rule}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Box>

        {/* ── Right column ── */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, position: { md: "sticky" }, top: { md: 24 } }}>
          {/* System requirements */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              border: `1px solid ${BORDER}`,
              bgcolor: SURFACE,
            }}
          >
            <Typography
              variant="overline"
              sx={{ color: TEXT_SECONDARY, letterSpacing: 1, fontWeight: 700, fontSize: 11 }}
            >
              Requirements
            </Typography>

            <Box sx={{ mt: 1.5 }}>
              <RequirementRow
                icon={<VideocamOutlinedIcon sx={{ fontSize: 16 }} />}
                label="Camera access"
                status={camDisplay}
                onRequest={requestCamMic}
                errorHint="Camera unavailable — check browser permissions"
              />
              <Divider sx={{ borderColor: BORDER }} />
              <RequirementRow
                icon={<MicNoneOutlinedIcon sx={{ fontSize: 16 }} />}
                label="Microphone access"
                status={micDisplay}
                onRequest={requestCamMic}
                errorHint="Microphone unavailable — check browser permissions"
              />
              <Divider sx={{ borderColor: BORDER }} />
              <RequirementRow
                icon={<ScreenShareOutlinedIcon sx={{ fontSize: 16 }} />}
                label="Screen sharing"
                status={screenDisplay}
                onRequest={requestScreen}
                errorHint={screenErr || "Screen sharing failed — try again"}
              />
              <Divider sx={{ borderColor: BORDER }} />
              <RequirementRow
                icon={<LockOutlinedIcon sx={{ fontSize: 16 }} />}
                label="Passcode"
                status={passDisplay}
              />
            </Box>
          </Paper>

          {/* Entry card */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              border: `1px solid ${BORDER}`,
              bgcolor: SURFACE,
            }}
          >
            <Typography
              variant="overline"
              sx={{ color: TEXT_SECONDARY, letterSpacing: 1, fontWeight: 700, fontSize: 11, display: "block", mb: 2 }}
            >
              Begin Assessment
            </Typography>

            {info.passCodeEnabled && (
              <TextField
                fullWidth
                label="Enter passcode"
                type={showPass ? "text" : "password"}
                value={passCode}
                onChange={(e) => {
                  setPassCode(e.target.value);
                  setErr("");
                }}
                size="small"
                sx={{ mb: 1.5 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setShowPass((v) => !v)}
                        edge="end"
                      >
                        {showPass ? (
                          <VisibilityOffIcon sx={{ fontSize: 18 }} />
                        ) : (
                          <VisibilityIcon sx={{ fontSize: 18 }} />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            )}

            {err && (
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  alignItems: "flex-start",
                  bgcolor: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: 1,
                  p: 1.5,
                  mb: 1.5,
                }}
              >
                <ErrorOutlineIcon sx={{ fontSize: 16, color: "#dc2626", mt: 0.1, flexShrink: 0 }} />
                <Typography variant="caption" sx={{ color: "#991b1b" }}>
                  {err}
                </Typography>
              </Box>
            )}

            <Button
              variant="contained"
              fullWidth
              size="large"
              disabled={!allReady || submitting}
              onClick={handleBegin}
              sx={{
                bgcolor: BRAND,
                "&:hover": { bgcolor: BRAND_DARK },
                fontWeight: 700,
                letterSpacing: 0.3,
                py: 1.5,
                borderRadius: 1.5,
                boxShadow: "none",
                // "&:hover": { boxShadow: "none", bgcolor: BRAND_DARK },
              }}
            >
              {submitting ? (
                <CircularProgress size={20} sx={{ color: "#fff" }} />
              ) : (
                "Start Assessment"
              )}
            </Button>

            <Typography
              variant="caption"
              sx={{ color: TEXT_SECONDARY, display: "block", textAlign: "center", mt: 1.5 }}
            >
              By starting, you agree to the assessment terms and conditions.
            </Typography>
          </Paper>
        </Box>
      </Box>

    </Box>
  );
}

// ─── Entry ─────────────────────────────────────────────────────────────────────
export default function AssesmentEntry() {
  const searchParams = useSearchParams();
  const assessmentId = (searchParams.get("assessmentId") as string) ?? "";

  const { user } = useAuth();
  const { data: info } = useAssessmentInfo(assessmentId);
  const queryClient = useQueryClient();
  const streamsRef = useRef<AcquiredStreams>({ camStream: null, screenStream: null });

  const storageKey = `asmt_entered_${assessmentId}`;

  // "checking" → read sessionStorage + optionally probe backend
  // "landing"  → show landing page
  // "assessment" → solution confirmed in cache, render assessment
  const [phase, setPhase] = useState<"checking" | "landing" | "assessment">("checking");

  useEffect(() => {
    if (!assessmentId || !user?._id) return;

    const hasKey = !!sessionStorage.getItem(storageKey);

    if (!hasKey) {
      // First visit — show landing
      setPhase("landing");
      return;
    }

    // sessionStorage key exists — but cache may be empty after refresh.
    // Probe backend before mounting AssessmentProvider to avoid a cold
    // passcode-less request inside the provider causing a 403 loop.
    const cached = queryClient.getQueryData(["assesment", assessmentId, user._id]);
    if (cached) {
      setPhase("assessment");
      return;
    }

    getAssesment(assessmentId, user._id)
      .then((result) => {
        queryClient.setQueryData(["assesment", assessmentId, user._id], result);
        setPhase("assessment");
      })
      .catch(() => {
        // Solution gone or passcode required → clear stale key, go to landing
        sessionStorage.removeItem(storageKey);
        setPhase("landing");
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessmentId, user?._id]);

  const handleEnter = (streams?: AcquiredStreams) => {
    if (streams) streamsRef.current = streams;
    sessionStorage.setItem(storageKey, "1");
    setPhase("assessment");
  };

  if (phase === "checking" || !user) {
    return (
      <Box sx={{ bgcolor: BG, minHeight: "100vh" }}>
        <LinearProgress sx={{ "& .MuiLinearProgress-bar": { bgcolor: BRAND } }} />
      </Box>
    );
  }

  if (phase === "landing") {
    return <AssessmentLanding assessmentId={assessmentId} onEnter={handleEnter} />;
  }

  return (
    <AssessmentProvider
      assessmentId={assessmentId}
      userId={user._id}
      isProctored={info?.isProctored ?? false}
      isAvEnabled={info?.isAvEnabled ?? false}
      isScreenCapture={info?.isScreenCapture ?? false}
      initialCamStream={streamsRef.current.camStream}
      initialScreenStream={streamsRef.current.screenStream}
    >
      <AnswersProvider>
        <AssesmentAttempt />
      </AnswersProvider>
    </AssessmentProvider>
  );
}
