"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box, Button, CircularProgress, LinearProgress, Paper, Typography,
} from "@mui/material";
import CheckCircleIcon         from "@mui/icons-material/CheckCircle";
import ErrorOutlineIcon        from "@mui/icons-material/ErrorOutline";
import VideocamOutlinedIcon    from "@mui/icons-material/VideocamOutlined";
import MicNoneOutlinedIcon     from "@mui/icons-material/MicNoneOutlined";
import ScreenShareOutlinedIcon from "@mui/icons-material/ScreenShareOutlined";
import RefreshIcon             from "@mui/icons-material/Refresh";
import ArrowBackIcon           from "@mui/icons-material/ArrowBack";

const BRAND      = "#1557a0";
const BRAND_DARK = "#0e3f78";
const SURFACE    = "#ffffff";
const BG         = "#f0f2f5";
const BORDER     = "#dde1e7";
const TEXT_PRIMARY   = "#0a1931";
const TEXT_SECONDARY = "#566474";

type CheckStatus = "idle" | "checking" | "ok" | "error";

export interface AcquiredStreams {
  camStream: MediaStream | null;
  screenStream: MediaStream | null;
}

export interface DeviceCheckProps {
  isProctored:     boolean;
  isAvEnabled:     boolean;
  isScreenCapture: boolean;
  onComplete: (streams: AcquiredStreams) => Promise<void>;
  onBack: () => void;
}

export default function DeviceCheck({
  isProctored,
  isAvEnabled,
  isScreenCapture,
  onComplete,
  onBack,
}: DeviceCheckProps) {
  // Default each non-required check to "ok" so it doesn't block the button
  const [camStatus,    setCamStatus]    = useState<CheckStatus>(isProctored     ? "idle" : "ok");
  const [micStatus,    setMicStatus]    = useState<CheckStatus>(isAvEnabled     ? "idle" : "ok");
  const [screenStatus, setScreenStatus] = useState<CheckStatus>(isScreenCapture ? "idle" : "ok");
  const [micLevel,     setMicLevel]     = useState(0);
  const [starting,     setStarting]     = useState(false);

  const videoRef        = useRef<HTMLVideoElement>(null);
  const screenVideoRef  = useRef<HTMLVideoElement>(null);
  const camStreamRef    = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const audioRafRef     = useRef<number>(0);
  const audioCtxRef     = useRef<AudioContext | null>(null);
  const passingForwardRef = useRef(false);

  const stopCamStream = useCallback(() => {
    cancelAnimationFrame(audioRafRef.current);
    audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
    camStreamRef.current?.getTracks().forEach((t) => t.stop());
    camStreamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setMicLevel(0);
  }, []);

  const stopScreenStream = useCallback(() => {
    screenStreamRef.current?.getTracks().forEach((t) => t.stop());
    screenStreamRef.current = null;
    if (screenVideoRef.current) screenVideoRef.current.srcObject = null;
  }, []);

  // ── Camera + mic check ────────────────────────────────────────────────────
  const startCamMicCheck = useCallback(async () => {
    stopCamStream();
    if (isProctored) setCamStatus("checking");
    if (isAvEnabled) setMicStatus("checking");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isProctored,
        audio: isAvEnabled,
      });
      camStreamRef.current = stream;

      if (isProctored && videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
        setCamStatus("ok");
      }

      if (isAvEnabled) {
        const ctx      = new AudioContext();
        audioCtxRef.current = ctx;
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        ctx.createMediaStreamSource(stream).connect(analyser);
        const data = new Uint8Array(analyser.frequencyBinCount);
        const tick = () => {
          analyser.getByteFrequencyData(data);
          const avg = data.reduce((s, v) => s + v, 0) / data.length;
          setMicLevel(Math.min(100, avg * 2.5));
          audioRafRef.current = requestAnimationFrame(tick);
        };
        audioRafRef.current = requestAnimationFrame(tick);
        setMicStatus("ok");
      }
    } catch {
      if (isProctored) setCamStatus("error");
      if (isAvEnabled) setMicStatus("error");
    }
  }, [isProctored, isAvEnabled, stopCamStream]);

  // ── Screen check ──────────────────────────────────────────────────────────
  const startScreenCheck = useCallback(async () => {
    stopScreenStream();
    setScreenStatus("checking");
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      screenStreamRef.current = stream;

      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = stream;
        await screenVideoRef.current.play().catch(() => {});
      }

      // If user clicks browser "Stop sharing" while on check screen, reset
      stream.getVideoTracks()[0].addEventListener("ended", () => {
        setScreenStatus("idle");
        screenStreamRef.current = null;
        if (screenVideoRef.current) screenVideoRef.current.srcObject = null;
      }, { once: true });

      setScreenStatus("ok");
    } catch {
      setScreenStatus("error");
    }
  }, [stopScreenStream]);

  // Auto-run camera/mic check on mount
  useEffect(() => {
    if (isProctored || isAvEnabled) startCamMicCheck();
    return () => {
      // Only stop streams if we're going back, not forward to the assessment
      if (!passingForwardRef.current) {
        stopCamStream();
        stopScreenStream();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const allOk = camStatus === "ok" && micStatus === "ok" && screenStatus === "ok";

  const handleBegin = async () => {
    passingForwardRef.current = true;

    // Clean up UI helpers (audio meter, video previews) but keep tracks alive
    // so AVProctoring can reuse them without re-prompting the user.
    cancelAnimationFrame(audioRafRef.current);
    audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    if (screenVideoRef.current) screenVideoRef.current.srcObject = null;
    setMicLevel(0);

    setStarting(true);
    try {
      await onComplete({
        camStream: camStreamRef.current,
        screenStream: screenStreamRef.current,
      });
    } catch {
      // Parent handles error — streams should be stopped on failure
      passingForwardRef.current = false;
    } finally {
      setStarting(false);
    }
  };

  return (
    <Box sx={{
      bgcolor: BG, minHeight: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center",
      py: 6, px: 2,
    }}>
      <Box sx={{ maxWidth: 560, width: "100%" }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 4 }}>
          <Button
            onClick={onBack}
            startIcon={<ArrowBackIcon sx={{ fontSize: 16 }} />}
            sx={{ color: TEXT_SECONDARY, textTransform: "none", fontWeight: 500, p: 0, minWidth: 0, mr: 0.5 }}
          >
            Back
          </Button>
          <Box>
            <Typography variant="h5" fontWeight={700} sx={{ color: TEXT_PRIMARY, lineHeight: 1.2 }}>
              Device Check
            </Typography>
            <Typography variant="body2" sx={{ color: TEXT_SECONDARY }}>
              Verify your devices are working before starting
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Camera */}
          {isProctored && (
            <CheckCard icon={<VideocamOutlinedIcon />} title="Camera" status={camStatus} onRetry={startCamMicCheck}>
              <Box sx={{
                position: "relative", width: "100%", aspectRatio: "16/9",
                bgcolor: "#111", borderRadius: 1.5, overflow: "hidden",
              }}>
                <video
                  ref={videoRef}
                  muted
                  playsInline
                  style={{
                    width: "100%", height: "100%", objectFit: "cover",
                    display: camStatus === "ok" ? "block" : "none",
                  }}
                />
                {camStatus !== "ok" && (
                  <Box sx={{
                    position: "absolute", inset: 0,
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center", gap: 1,
                  }}>
                    {camStatus === "checking" && <CircularProgress size={24} sx={{ color: "#fff" }} />}
                    {camStatus === "error" && (
                      <>
                        <ErrorOutlineIcon sx={{ fontSize: 32, color: "#ef4444" }} />
                        <Typography variant="caption" sx={{ color: "#ef4444" }}>
                          Camera unavailable — check browser permissions
                        </Typography>
                      </>
                    )}
                    {camStatus === "idle" && (
                      <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)" }}>
                        Initialising…
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            </CheckCard>
          )}

          {/* Microphone */}
          {isAvEnabled && (
            <CheckCard icon={<MicNoneOutlinedIcon />} title="Microphone" status={micStatus} onRetry={startCamMicCheck}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 0.5 }}>
                <MicNoneOutlinedIcon sx={{ fontSize: 18, color: TEXT_SECONDARY, flexShrink: 0 }} />
                <Box sx={{ flex: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={micLevel}
                    sx={{
                      height: 8, borderRadius: 4, bgcolor: "#e5e7eb",
                      "& .MuiLinearProgress-bar": {
                        bgcolor: micLevel > 50 ? "#16a34a" : micLevel > 15 ? BRAND : "#cbd5e1",
                        transition: "none",
                      },
                    }}
                  />
                </Box>
                <Typography variant="caption" sx={{ color: TEXT_SECONDARY, minWidth: 36, textAlign: "right" }}>
                  {micStatus === "ok" ? "Live" : micStatus === "error" ? "Error" : "—"}
                </Typography>
              </Box>
              {micStatus === "error" && (
                <Typography variant="caption" sx={{ color: "#dc2626", display: "block", mt: 0.5 }}>
                  Microphone unavailable — check browser permissions.
                </Typography>
              )}
            </CheckCard>
          )}

          {/* Screen share */}
          {isScreenCapture && (
            <CheckCard icon={<ScreenShareOutlinedIcon />} title="Screen Share" status={screenStatus} onRetry={startScreenCheck}>
              {(screenStatus === "idle" || screenStatus === "error") && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {screenStatus === "error" && (
                    <Typography variant="caption" sx={{ color: "#dc2626" }}>
                      Screen sharing was denied or failed. Try again.
                    </Typography>
                  )}
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ScreenShareOutlinedIcon sx={{ fontSize: 16 }} />}
                    onClick={startScreenCheck}
                    sx={{
                      alignSelf: "flex-start", color: BRAND, borderColor: BRAND, fontSize: 12,
                      "&:hover": { borderColor: BRAND_DARK, bgcolor: "#f0f4ff" },
                    }}
                  >
                    {screenStatus === "error" ? "Retry Screen Share" : "Test Screen Share"}
                  </Button>
                </Box>
              )}
              {screenStatus === "checking" && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CircularProgress size={14} />
                  <Typography variant="caption" sx={{ color: TEXT_SECONDARY }}>Opening screen picker…</Typography>
                </Box>
              )}
              {screenStatus === "ok" && (
                <>
                  <Box sx={{
                    position: "relative", width: "100%", aspectRatio: "16/9",
                    bgcolor: "#111", borderRadius: 1.5, overflow: "hidden",
                  }}>
                    <video
                      ref={screenVideoRef}
                      muted
                      playsInline
                      style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    />
                  </Box>
                  <Typography variant="caption" sx={{ color: TEXT_SECONDARY, mt: 0.75, display: "block" }}>
                    You will be asked to share your screen again when the assessment starts.
                  </Typography>
                </>
              )}
            </CheckCard>
          )}
        </Box>

        {/* CTA */}
        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            fullWidth
            disabled={!allOk || starting}
            onClick={handleBegin}
            sx={{
              bgcolor: BRAND, "&:hover": { bgcolor: BRAND_DARK },
              fontWeight: 700, py: 1.5, borderRadius: 1.5, boxShadow: "none",
              "&:disabled": { bgcolor: "#b0bec5", color: "#fff" },
            }}
          >
            {starting
              ? <CircularProgress size={20} sx={{ color: "#fff" }} />
              : "Begin Assessment"}
          </Button>
          {!allOk && !starting && (
            <Typography variant="caption" sx={{ color: TEXT_SECONDARY, display: "block", textAlign: "center", mt: 1 }}>
              All required devices must pass the check before you can begin.
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}

// ── Check card ─────────────────────────────────────────────────────────────────
function CheckCard({
  icon, title, status, onRetry, children,
}: {
  icon: React.ReactNode;
  title: string;
  status: CheckStatus;
  onRetry: () => void;
  children: React.ReactNode;
}) {
  const statusLabel: Record<CheckStatus, string> = {
    idle:     "Not tested",
    checking: "Checking…",
    ok:       "Ready",
    error:    "Failed",
  };
  const statusColor: Record<CheckStatus, string> = {
    idle:     "#94a3b8",
    checking: BRAND,
    ok:       "#16a34a",
    error:    "#dc2626",
  };

  return (
    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: `1px solid ${BORDER}`, bgcolor: SURFACE }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{ color: BRAND, display: "flex" }}>{icon}</Box>
          <Typography variant="body2" fontWeight={600} sx={{ color: TEXT_PRIMARY }}>{title}</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          {status === "checking" && <CircularProgress size={13} />}
          {status === "ok"       && <CheckCircleIcon  sx={{ fontSize: 15, color: "#16a34a" }} />}
          {status === "error"    && <ErrorOutlineIcon sx={{ fontSize: 15, color: "#dc2626" }} />}
          <Typography variant="caption" sx={{ color: statusColor[status], fontWeight: 600, fontSize: 11 }}>
            {statusLabel[status]}
          </Typography>
          {status === "error" && (
            <Button size="small" onClick={onRetry} sx={{ minWidth: 0, px: 0.5, py: 0, color: BRAND, ml: 0.25 }}>
              <RefreshIcon sx={{ fontSize: 14 }} />
            </Button>
          )}
        </Box>
      </Box>
      {children}
    </Paper>
  );
}
