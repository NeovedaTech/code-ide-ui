"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Box, Chip, CircularProgress, IconButton, Slider,
  LinearProgress, Skeleton, Tab, Tabs, Typography,
} from "@mui/material";
import ArrowBackIcon       from "@mui/icons-material/ArrowBack";
import WarningAmberIcon    from "@mui/icons-material/WarningAmber";
import VideocamOffIcon     from "@mui/icons-material/VideocamOff";
import AccessTimeIcon      from "@mui/icons-material/AccessTime";
import PersonIcon          from "@mui/icons-material/Person";
import AssignmentIcon      from "@mui/icons-material/Assignment";
import PlayArrowIcon       from "@mui/icons-material/PlayArrow";
import PauseIcon           from "@mui/icons-material/Pause";
import VolumeUpIcon        from "@mui/icons-material/VolumeUp";
import VolumeOffIcon       from "@mui/icons-material/VolumeOff";
import FullscreenIcon      from "@mui/icons-material/Fullscreen";
import { useAdminSolution, useAdminProctoringData } from "@/modules/admin/hooks";
import type { PlaybackChunk, ProctoringLog } from "@/modules/admin/types";

// ── Design tokens ─────────────────────────────────────────────────────────────
const BG      = "#060608";
const SURFACE = "rgba(255,255,255,0.04)";
const BORDER  = "rgba(255,255,255,0.07)";
const TEXT     = "#ffffff";
const MUTED    = "rgba(255,255,255,0.45)";
const DIM      = "rgba(255,255,255,0.2)";
const BLUE     = "#3b82f6";
const RED      = "#ef4444";
const AMBER    = "#f59e0b";
const GREEN    = "#22c55e";

const card = {
  bgcolor: SURFACE,
  border: `1px solid ${BORDER}`,
  borderRadius: 2,
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function relTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

function fmtDuration(secs: number): string {
  if (!isFinite(secs) || secs < 0) return "0:00";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function violationColor(n: number) {
  if (n === 0) return GREEN;
  if (n < 3)   return AMBER;
  return RED;
}

const EVENT_LABELS: Record<string, { label: string; color: string }> = {
  tab_switch:      { label: "Tab Switch",        color: RED },
  window_blur:     { label: "Window Blur",        color: AMBER },
  fullscreen_exit: { label: "Fullscreen Exit",    color: AMBER },
  devtools:        { label: "DevTools Opened",    color: RED },
  session_end:     { label: "Session End",        color: DIM },
  reconnect:       { label: "Reconnected",        color: BLUE },
  keystroke:       { label: "Keystroke",          color: DIM },
  no_face:         { label: "No Face Detected",   color: RED },
  multiple_faces:  { label: "Multiple Faces",     color: RED },
};

// ── WebM binary helpers ───────────────────────────────────────────────────────
// EBML header signature: 0x1A 0x45 0xDF 0xA3
// Segment element ID:    0x18 0x53 0x80 0x67
// Cluster element ID:    0x1F 0x43 0xB6 0x75
//
// Chrome's MediaRecorder with timeslice produces chunk-0 with a Segment element
// whose size is set to the exact byte count of that chunk's content.  When we
// concatenate more data after chunk-0, the browser's parser stops at that size
// boundary and ignores everything else → only 9 seconds play.
//
// Fix: patch chunk-0's Segment size to the EBML "unknown size" marker so the
// parser reads through ALL concatenated data until EOF.

function hasEBMLHeader(data: Uint8Array): boolean {
  return data.length >= 4 &&
    data[0] === 0x1a && data[1] === 0x45 &&
    data[2] === 0xdf && data[3] === 0xa3;
}

/** Find the first Cluster element (0x1F43B675) offset, skipping EBML header. */
function findClusterOffset(data: Uint8Array): number {
  for (let i = 32; i < data.length - 4; i++) {
    if (data[i] === 0x1f && data[i+1] === 0x43 &&
        data[i+2] === 0xb6 && data[i+3] === 0x75) return i;
  }
  return -1;
}

/** Read the width (in bytes) of an EBML VINT from its leading byte. */
function vintWidth(leadByte: number): number {
  if (leadByte & 0x80) return 1;
  if (leadByte & 0x40) return 2;
  if (leadByte & 0x20) return 3;
  if (leadByte & 0x10) return 4;
  if (leadByte & 0x08) return 5;
  if (leadByte & 0x04) return 6;
  if (leadByte & 0x02) return 7;
  if (leadByte & 0x01) return 8;
  return 1;
}

/**
 * Patch chunk-0's Segment element to use "unknown size" so the browser parser
 * continues reading through all concatenated data instead of stopping at the
 * original chunk boundary.
 */
function patchSegmentSize(data: Uint8Array): Uint8Array {
  // Segment ID is 0x18 0x53 0x80 0x67 — search in the first 64 bytes
  for (let i = 0; i < Math.min(data.length - 12, 64); i++) {
    if (data[i] === 0x18 && data[i+1] === 0x53 &&
        data[i+2] === 0x80 && data[i+3] === 0x67) {
      const sizeStart = i + 4;
      const width = vintWidth(data[sizeStart]);

      // Write "unknown size" marker for this VINT width (all data bits = 1)
      // 1→0xFF  2→0x7F,FF  3→0x3F,FF,FF  4→0x1F,FF,FF,FF  ...  8→0x01,FF×7
      const patched = new Uint8Array(data);
      // First byte: keep only the VINT width marker bit, set data bits to 1
      patched[sizeStart] = (1 << (8 - width)) | ((1 << (8 - width)) - 1);
      for (let j = 1; j < width; j++) patched[sizeStart + j] = 0xff;
      return patched;
    }
  }
  return data; // Segment not found — return unchanged
}

/** Strip EBML + Segment/Info/Tracks from a chunk that has its own header,
 *  returning only the Cluster data for concatenation. */
function extractClusterData(raw: Uint8Array): Uint8Array {
  if (!hasEBMLHeader(raw)) return raw;
  const offset = findClusterOffset(raw);
  return offset > 0 ? raw.subarray(offset) : raw;
}

// ── Blob-concat player ────────────────────────────────────────────────────────
// Downloads all chunks in parallel, patches chunk-0's Segment size to "unknown",
// strips duplicate headers from chunks 1+ (if present), concatenates into one
// Blob, and hands it to a native <video> element.

function StreamingPlayer({
  chunks,
}: {
  chunks: PlaybackChunk[];
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const blobUrlRef = useRef("");
  const [loaded, setLoaded]     = useState(0);
  const [phase, setPhase]       = useState<"idle" | "loading" | "done" | "error">("idle");

  // Playback state
  const [playing, setPlaying]       = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration]     = useState(0);
  const [muted, setMuted]           = useState(false);
  const [seeking, setSeeking]       = useState(false);

  const valid = useMemo(
    () => [...chunks.filter((c) => c.url)].sort((a, b) => a.chunkIndex - b.chunkIndex),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [chunks.map((c) => c.url).join("|")],
  );

  // ── Resolve real duration (WebM blobs often report Infinity) ────────────
  const resolveDuration = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (isFinite(v.duration) && v.duration > 0) {
      setDuration(v.duration);
      return;
    }
    // Trick: seek to a huge time — browser clamps to real end, revealing duration
    const prev = v.currentTime;
    v.currentTime = 1e10;
    const onSeeked = () => {
      v.removeEventListener("seeked", onSeeked);
      if (isFinite(v.duration) && v.duration > 0) setDuration(v.duration);
      else setDuration(v.currentTime); // fallback: where it actually landed
      v.currentTime = prev;
    };
    v.addEventListener("seeked", onSeeked, { once: true });
  }, []);

  // ── Build blob from downloaded buffers ───────────────────────────────
  // Three strategies tried in order:
  //   1. Patched concat (patch Segment size to unknown, strip dup headers)
  //   2. Raw concat (no patching — works when Segment already has unknown size)
  //   3. Chunk-0 only (last resort — shows first ~10s)
  const buildBlob = useCallback((buffers: (ArrayBuffer | null)[], strategy: number): Blob | null => {
    const nonEmpty = buffers.filter((b): b is ArrayBuffer => b != null && b.byteLength > 0);
    if (nonEmpty.length === 0) return null;

    if (strategy === 3) {
      // Chunk-0 only
      console.log("[StreamingPlayer] fallback: chunk-0 only");
      return new Blob([nonEmpty[0]], { type: "video/webm" });
    }

    if (strategy === 2) {
      // Raw concatenation — no patching, no stripping
      console.log("[StreamingPlayer] trying: raw concat");
      return new Blob(nonEmpty, { type: "video/webm" });
    }

    // Strategy 1: patched concat
    console.log("[StreamingPlayer] trying: patched concat");
    const parts: Uint8Array[] = [];
    // Use original buffer index to identify chunk-0
    let isFirst = true;
    for (let i = 0; i < buffers.length; i++) {
      if (!buffers[i] || buffers[i]!.byteLength === 0) continue;
      const raw = new Uint8Array(buffers[i]!);
      if (isFirst) {
        parts.push(patchSegmentSize(raw));
        isFirst = false;
      } else if (hasEBMLHeader(raw)) {
        parts.push(extractClusterData(raw));
      } else {
        parts.push(raw);
      }
    }
    return parts.length > 0 ? new Blob(parts as BlobPart[], { type: "video/webm" }) : null;
  }, []);

  // ── Video event listeners ──────────────────────────────────────────────
  const strategyRef = useRef(1);
  const buffersRef  = useRef<(ArrayBuffer | null)[]>([]);

  const tryNextStrategy = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    strategyRef.current++;
    if (strategyRef.current > 3) {
      setPhase("error");
      return;
    }
    console.warn(`[StreamingPlayer] strategy ${strategyRef.current - 1} failed, trying ${strategyRef.current}`);
    if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    const blob = buildBlob(buffersRef.current, strategyRef.current);
    if (!blob) { setPhase("error"); return; }
    blobUrlRef.current = URL.createObjectURL(blob);
    v.src = blobUrlRef.current;
    v.load();
  }, [buildBlob]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTime  = () => { if (!seeking) setCurrentTime(v.currentTime); };
    const onPlay  = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onMeta  = () => {
      resolveDuration();
      v.play().catch(() => {});
    };
    const onDur   = () => resolveDuration();
    const onError = () => {
      console.error("[StreamingPlayer] video error:", v.error?.message, v.error?.code);
      tryNextStrategy();
    };
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    v.addEventListener("loadedmetadata", onMeta);
    v.addEventListener("durationchange", onDur);
    v.addEventListener("error", onError);
    return () => {
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("loadedmetadata", onMeta);
      v.removeEventListener("durationchange", onDur);
      v.removeEventListener("error", onError);
    };
  }, [resolveDuration, seeking, tryNextStrategy]);

  // ── Download + concat ──────────────────────────────────────────────────
  useEffect(() => {
    if (!valid.length || !videoRef.current) return;

    let cancelled = false;
    setPhase("loading");
    setLoaded(0);
    strategyRef.current = 1;

    (async () => {
      const buffers: (ArrayBuffer | null)[] = new Array(valid.length).fill(null);
      let completedCount = 0;

      await Promise.all(
        valid.map(async (chunk, i) => {
          try {
            const res = await fetch(chunk.url!);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            buffers[i] = await res.arrayBuffer();
          } catch (e) {
            console.warn(`[StreamingPlayer] chunk ${chunk.chunkIndex} failed:`, e);
            buffers[i] = null;
          } finally {
            completedCount++;
            if (!cancelled) setLoaded(completedCount);
          }
        }),
      );

      if (cancelled) return;

      // Log chunk info
      const sizes = buffers.map((b, i) => {
        if (!b) return `chunk-${i}: FAILED`;
        const u8 = new Uint8Array(b);
        const hdr = hasEBMLHeader(u8) ? "WebM" : "cont";
        return `chunk-${i}: ${(b.byteLength / 1024).toFixed(1)}KB [${hdr}]`;
      });
      console.log("[StreamingPlayer] downloaded:", sizes.join(", "));

      buffersRef.current = buffers;
      const blob = buildBlob(buffers, 1);
      if (!blob) {
        if (!cancelled) setPhase("error");
        return;
      }

      blobUrlRef.current = URL.createObjectURL(blob);
      if (!cancelled && videoRef.current) {
        videoRef.current.src = blobUrlRef.current;
        videoRef.current.load();
        setPhase("done");
      }
    })();

    return () => {
      cancelled = true;
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = "";
      }
    };
  }, [valid, buildBlob]);

  // ── Controls ───────────────────────────────────────────────────────────
  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const handleSeek = (_: Event, val: number | number[]) => {
    const t = typeof val === "number" ? val : val[0];
    setCurrentTime(t);
    setSeeking(true);
  };

  const handleSeekCommit = (_: React.SyntheticEvent | Event, val: number | number[]) => {
    const t = typeof val === "number" ? val : val[0];
    if (videoRef.current) videoRef.current.currentTime = t;
    setSeeking(false);
  };

  const handleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else el.requestFullscreen().catch(() => {});
  };

  // ── Render ─────────────────────────────────────────────────────────────
  if (!valid.length) {
    return (
      <Box sx={{
        ...card, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", py: 8, gap: 1.5,
      }}>
        <VideocamOffIcon sx={{ fontSize: 36, color: MUTED }} />
        <Typography sx={{ color: MUTED, fontSize: 13 }}>No recording available</Typography>
      </Box>
    );
  }

  const isLoading = phase === "idle" || phase === "loading";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Box
        ref={containerRef}
        sx={{
          ...card, position: "relative", bgcolor: "#000",
          borderRadius: 2, overflow: "hidden",
          display: "flex", flexDirection: "column",
        }}
      >
        {/* Video area */}
        <Box sx={{
          position: "relative", aspectRatio: "16/9",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: phase === "done" ? "pointer" : "default",
        }}
          onClick={phase === "done" ? togglePlay : undefined}
        >
          {isLoading && (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <CircularProgress size={28} sx={{ color: BLUE }} />
              <Typography sx={{ color: MUTED, fontSize: 12 }}>
                Loading recording… {Math.round((loaded / (valid.length || 1)) * 100)}%
              </Typography>
            </Box>
          )}
          {phase === "error" && (
            <Box sx={{ textAlign: "center" }}>
              <VideocamOffIcon sx={{ fontSize: 32, color: MUTED }} />
              <Typography sx={{ color: MUTED, fontSize: 12, mt: 1 }}>Failed to load recording</Typography>
            </Box>
          )}
          <video
            ref={videoRef}
            style={{
              width: "100%", height: "100%", objectFit: "contain",
              display: phase === "done" ? "block" : "none",
            }}
          />
        </Box>

        {/* Custom controls */}
        {phase === "done" && (
          <Box sx={{ px: 1.5, pb: 1, pt: 0.5 }}>
            {/* Seek bar */}
            <Slider
              size="small"
              min={0}
              max={duration || 1}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              onChangeCommitted={handleSeekCommit}
              sx={{
                color: BLUE,
                height: 4,
                p: 0,
                mb: 0.5,
                "& .MuiSlider-thumb": {
                  width: 12, height: 12,
                  transition: "0.1s",
                  "&:hover, &.Mui-focusVisible": { boxShadow: `0 0 0 6px ${BLUE}33` },
                },
                "& .MuiSlider-rail": { bgcolor: "rgba(255,255,255,0.15)" },
              }}
            />

            {/* Controls row */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <IconButton size="small" onClick={togglePlay} sx={{ color: TEXT, p: 0.5 }}>
                {playing ? <PauseIcon sx={{ fontSize: 20 }} /> : <PlayArrowIcon sx={{ fontSize: 20 }} />}
              </IconButton>

              <IconButton size="small" onClick={toggleMute} sx={{ color: TEXT, p: 0.5 }}>
                {muted ? <VolumeOffIcon sx={{ fontSize: 18 }} /> : <VolumeUpIcon sx={{ fontSize: 18 }} />}
              </IconButton>

              <Typography sx={{ color: MUTED, fontSize: 12, ml: 0.5, fontVariantNumeric: "tabular-nums" }}>
                {fmtDuration(currentTime)} / {fmtDuration(duration)}
              </Typography>

              <Box sx={{ flex: 1 }} />

              <IconButton size="small" onClick={handleFullscreen} sx={{ color: TEXT, p: 0.5 }}>
                <FullscreenIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Box>
          </Box>
        )}
      </Box>

      {/* Download progress bar */}
      {phase === "loading" && loaded > 0 && (
        <LinearProgress
          variant="determinate"
          value={Math.round((loaded / (valid.length || 1)) * 100)}
          sx={{ borderRadius: 1, bgcolor: "rgba(255,255,255,0.08)", "& .MuiLinearProgress-bar": { bgcolor: BLUE } }}
        />
      )}
    </Box>
  );
}

// ── Violation log ─────────────────────────────────────────────────────────────
function ViolationLog({ logs }: { logs: ProctoringLog[] }) {
  if (!logs.length) {
    return (
      <Box sx={{ py: 6, textAlign: "center" }}>
        <Typography sx={{ color: MUTED, fontSize: 13 }}>No proctoring events recorded</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      {logs.map((log, i) => {
        const meta = EVENT_LABELS[log.eventType] ?? { label: log.eventType, color: DIM };
        return (
          <Box key={i} sx={{
            display: "flex", alignItems: "flex-start", gap: 1.5, py: 1.25,
            borderBottom: i < logs.length - 1 ? `1px solid ${BORDER}` : "none",
          }}>
            <Box sx={{ mt: 0.6, width: 8, height: 8, borderRadius: "50%", bgcolor: meta.color, flexShrink: 0 }} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography sx={{ fontSize: 12, fontWeight: 600, color: meta.color }}>
                  {meta.label}
                </Typography>
                {log.detail && (
                  <Typography sx={{ fontSize: 11, color: DIM }} noWrap>· {log.detail}</Typography>
                )}
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.25 }}>
                <AccessTimeIcon sx={{ fontSize: 11, color: DIM }} />
                <Typography sx={{ fontSize: 11, color: DIM }}>{relTime(log.timestamp)}</Typography>
              </Box>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

// ── Info row ──────────────────────────────────────────────────────────────────
function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Box sx={{
      display: "flex", alignItems: "flex-start", gap: 1, py: 1,
      borderBottom: `1px solid ${BORDER}`, "&:last-child": { borderBottom: "none" },
    }}>
      <Typography sx={{ fontSize: 12, color: MUTED, minWidth: 130, flexShrink: 0 }}>{label}</Typography>
      <Typography sx={{ fontSize: 12, color: TEXT, wordBreak: "break-all" }} component="div">{value}</Typography>
    </Box>
  );
}

function StatusChip({ s }: { s: { isEvaluated: boolean; isSubmitted: boolean; hasAgreed: boolean } }) {
  if (s.isEvaluated)  return <Chip label="Evaluated"   size="small" sx={{ bgcolor: `${GREEN}22`, color: GREEN,  fontSize: 11, height: 20 }} />;
  if (s.isSubmitted)  return <Chip label="Submitted"   size="small" sx={{ bgcolor: `${AMBER}22`, color: AMBER,  fontSize: 11, height: 20 }} />;
  if (s.hasAgreed)    return <Chip label="In Progress" size="small" sx={{ bgcolor: `${BLUE}22`,  color: BLUE,   fontSize: 11, height: 20 }} />;
  return                     <Chip label="Not Started" size="small" sx={{ bgcolor: `${DIM}22`,   color: MUTED,  fontSize: 11, height: 20 }} />;
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function SolutionDetail({ id }: { id: string }) {
  const router = useRouter();
  const [tab, setTab] = useState(0);

  const { data: solution, isLoading: solLoading }    = useAdminSolution(id);
  const { data: proctoring, isLoading: procLoading } = useAdminProctoringData(id);

  if (solLoading) {
    return (
      <Box>
        <Skeleton variant="rectangular" height={32} width={120} sx={{ bgcolor: SURFACE, mb: 3 }} />
        <Box sx={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 2.5 }}>
          {[0, 1].map((i) => (
            <Skeleton key={i} variant="rectangular" height={300} sx={{ bgcolor: SURFACE, borderRadius: 2 }} />
          ))}
        </Box>
      </Box>
    );
  }

  if (!solution) {
    return (
      <Box sx={{ pt: 8, textAlign: "center" }}>
        <Typography sx={{ color: MUTED }}>Solution not found.</Typography>
      </Box>
    );
  }

  const pd = solution.proctoringData;
  const ai = solution.assessmentId;
  const violations = solution.ufmAttempts ?? 0;

  // Has camera / mic recording track
  const hasAvRecording  = pd?.isProctored || pd?.isAvEnabled || ai?.isProctored || ai?.isAvEnabled;
  // Has screen capture — check flag OR actual data (covers solutions created before the flag was added)
  const isScreenCapture = pd?.isScreenCapture || ai?.isScreenCapture
    || (proctoring?.screenPlayback?.length ?? 0) > 0
    || pd?.screenRecordingStatus === "active" || pd?.screenRecordingStatus === "completed";
  // Show proctoring panel at all
  const hasAnyProctoring = hasAvRecording || isScreenCapture || violations > 0;

  // Build tabs dynamically so indices are always correct
  const TABS: { key: string; label: string | React.ReactNode }[] = [];
  if (hasAvRecording)  TABS.push({ key: "recording", label: "Recording" });
  if (isScreenCapture) TABS.push({ key: "screen",    label: "Screen" });
  TABS.push({
    key: "violations",
    label: (
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
        Violation Log
        {violations > 0 && (
          <Box sx={{ fontSize: 10, px: 0.75, py: 0.1, borderRadius: 1, bgcolor: `${RED}22`, color: RED }}>
            {violations}
          </Box>
        )}
      </Box>
    ),
  });

  return (
    <Box>
      {/* Back */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <IconButton size="small" onClick={() => router.back()} sx={{ color: MUTED, "&:hover": { color: TEXT } }}>
          <ArrowBackIcon fontSize="small" />
        </IconButton>
        <Typography sx={{ color: MUTED, fontSize: 13 }}>Back to Candidates</Typography>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "300px 1fr" }, gap: 2.5, alignItems: "start" }}>
        {/* ── Left ── */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Candidate */}
          <Box sx={card}>
            <Box sx={{ px: 2, py: 1.5, display: "flex", alignItems: "center", gap: 1, borderBottom: `1px solid ${BORDER}` }}>
              <PersonIcon sx={{ fontSize: 14, color: MUTED }} />
              <Typography sx={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: 0.5, textTransform: "uppercase" }}>
                Candidate
              </Typography>
            </Box>
            <Box sx={{ px: 2, py: 0.5 }}>
              <InfoRow label="Name"    value={solution.userId?.name    ?? "—"} />
              <InfoRow label="Email"   value={solution.userId?.email   ?? "—"} />
              <InfoRow label="User ID" value={solution.userId?.userId  ?? "—"} />
              <InfoRow label="Level"   value={solution.userId?.skillLevel ?? "—"} />
            </Box>
          </Box>

          {/* Assessment */}
          <Box sx={card}>
            <Box sx={{ px: 2, py: 1.5, display: "flex", alignItems: "center", gap: 1, borderBottom: `1px solid ${BORDER}` }}>
              <AssignmentIcon sx={{ fontSize: 14, color: MUTED }} />
              <Typography sx={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: 0.5, textTransform: "uppercase" }}>
                Assessment
              </Typography>
            </Box>
            <Box sx={{ px: 2, py: 0.5 }}>
              <InfoRow label="Name"      value={solution.assessmentId?.name ?? "—"} />
              <InfoRow label="Slug"      value={solution.assessmentId?.slug ?? "—"} />
              <InfoRow label="Status"    value={<StatusChip s={solution} />} />
              <InfoRow label="Section"   value={`${(solution.currSection ?? 0) + 1}`} />
              <InfoRow label="Submitted" value={fmt(solution.updatedAt)} />
            </Box>
          </Box>

          {/* Proctoring summary */}
          {hasAnyProctoring && (
            <Box sx={card}>
              <Box sx={{ px: 2, py: 1.5, display: "flex", alignItems: "center", gap: 1, borderBottom: `1px solid ${BORDER}` }}>
                <WarningAmberIcon sx={{ fontSize: 14, color: MUTED }} />
                <Typography sx={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: 0.5, textTransform: "uppercase" }}>
                  Proctoring
                </Typography>
              </Box>
              <Box sx={{ px: 2, py: 0.5 }}>
                <InfoRow label="Violations" value={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    {violations > 0 && <WarningAmberIcon sx={{ fontSize: 13, color: violationColor(violations) }} />}
                    <Typography sx={{ fontSize: 12, color: violationColor(violations), fontWeight: 600 }}>
                      {violations}
                    </Typography>
                  </Box>
                } />
                <InfoRow label="Recording" value={
                  <Chip
                    label={proctoring?.recordingStatus ?? solution.proctoringData?.recordingStatus ?? "—"}
                    size="small"
                    sx={{
                      bgcolor: proctoring?.recordingStatus === "completed" ? `${GREEN}22` : `${AMBER}22`,
                      color:   proctoring?.recordingStatus === "completed" ? GREEN : AMBER,
                      fontSize: 10, height: 18,
                    }}
                  />
                } />
                <InfoRow label="Started"  value={fmt(proctoring?.recordingStartedAt ?? null)} />
                <InfoRow label="Ended"    value={fmt(proctoring?.recordingEndedAt   ?? null)} />
                <InfoRow label="Chunks"   value={proctoring?.playback?.length ?? "—"} />
                {isScreenCapture && (
                  <InfoRow label="Screen" value={
                    <Chip
                      label={proctoring?.screenRecordingStatus ?? "—"}
                      size="small"
                      sx={{
                        bgcolor: proctoring?.screenRecordingStatus === "completed" ? `${GREEN}22` : `${AMBER}22`,
                        color:   proctoring?.screenRecordingStatus === "completed" ? GREEN : AMBER,
                        fontSize: 10, height: 18,
                      }}
                    />
                  } />
                )}
                {isScreenCapture && (
                  <InfoRow label="Screen chunks" value={proctoring?.screenPlayback?.length ?? "—"} />
                )}
              </Box>
            </Box>
          )}
        </Box>

        {/* ── Right ── */}
        <Box>
          {hasAnyProctoring ? (
            <Box sx={card}>
              <Tabs
                value={Math.min(tab, TABS.length - 1)}
                onChange={(_, v) => setTab(v)}
                sx={{
                  px: 2,
                  borderBottom: `1px solid ${BORDER}`,
                  "& .MuiTab-root": { color: MUTED, fontSize: 12, textTransform: "none", minWidth: 0, px: 2 },
                  "& .Mui-selected": { color: TEXT },
                  "& .MuiTabs-indicator": { bgcolor: BLUE },
                }}
              >
                {TABS.map((t, i) => <Tab key={i} label={t.label} />)}
              </Tabs>

              <Box sx={{ p: 2 }}>
                {procLoading ? (
                  <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                    <CircularProgress size={28} sx={{ color: BLUE }} />
                  </Box>
                ) : (
                  <>
                    {TABS[tab]?.key === "recording" && (
                      <StreamingPlayer chunks={proctoring?.playback ?? []} />
                    )}
                    {TABS[tab]?.key === "screen" && (
                      <StreamingPlayer chunks={proctoring?.screenPlayback ?? []} />
                    )}
                    {TABS[tab]?.key === "violations" && (
                      <ViolationLog logs={proctoring?.logs ?? []} />
                    )}
                  </>
                )}
              </Box>
            </Box>
          ) : (
            <Box sx={{ ...card, p: 3 }}>
              <Typography sx={{ color: MUTED, fontSize: 13, textAlign: "center" }}>
                Proctoring was not enabled for this assessment.
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
