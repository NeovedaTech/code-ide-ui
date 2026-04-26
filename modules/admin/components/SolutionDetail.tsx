"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Box, Chip, CircularProgress, Divider, IconButton,
  LinearProgress, Skeleton, Tab, Tabs, Typography,
} from "@mui/material";
import ArrowBackIcon       from "@mui/icons-material/ArrowBack";
import WarningAmberIcon    from "@mui/icons-material/WarningAmber";
import VideocamOffIcon     from "@mui/icons-material/VideocamOff";
import AccessTimeIcon      from "@mui/icons-material/AccessTime";
import PersonIcon          from "@mui/icons-material/Person";
import AssignmentIcon      from "@mui/icons-material/Assignment";
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

// ── WebM init-segment stripper ────────────────────────────────────────────────
// MediaRecorder timeslice emits: chunk-0 = [EBML header + Tracks + Cluster-0],
// chunks 1+ = [EBML header + Tracks + Cluster-N] (after our fix).
// Naively concatenating produces multiple EBML roots, which most parsers ignore
// after the first. Fix: keep chunk-0 whole, strip [EBML + Tracks] from chunks
// 1+ so we get one valid stream: [init][cluster-0][cluster-1]...
//
// Cluster EBML element ID: 0x1F 0x43 0xB6 0x75
function findClusterOffset(data: Uint8Array): number {
  for (let i = 0; i < data.length - 4; i++) {
    if (
      data[i]     === 0x1f && data[i + 1] === 0x43 &&
      data[i + 2] === 0xb6 && data[i + 3] === 0x75
    ) return i;
  }
  return 0; // not found → use whole buffer (old chunk with no prepended init)
}

// ── Detect actual WebM codec from binary header ───────────────────────────────
// WebM Tracks element stores CodecID as ASCII strings (V_VP8, V_VP9, A_OPUS…).
// Scan the first 4 KB of chunk-0 to build the correct MSE mime type.
function detectWebMMime(data: Uint8Array): string {
  const header = new TextDecoder().decode(data.slice(0, Math.min(data.length, 4096)));
  const video  = header.includes("V_VP9") ? "vp9" : "vp8";
  const audio  = header.includes("A_OPUS") || header.includes("A_VORBIS");
  const mime   = audio
    ? `video/webm; codecs="${video},opus"`
    : `video/webm; codecs="${video}"`;
  // Verify browser supports the detected type; fall back to codec-less hint
  if (typeof MediaSource !== "undefined" && MediaSource.isTypeSupported(mime)) return mime;
  return 'video/webm; codecs="vp8"'; // last-resort fallback
}

// Wait until SourceBuffer is not updating
const sbReady = (sb: SourceBuffer) =>
  sb.updating
    ? new Promise<void>((res, rej) => {
        sb.addEventListener("updateend", () => res(), { once: true });
        sb.addEventListener("error", rej,             { once: true });
      })
    : Promise.resolve();

// ── Streaming player (MSE) ────────────────────────────────────────────────────
// Chunks are fetched and appended one-by-one via MediaSource API.
// Playback starts as soon as chunk-0 is buffered — no need to download all chunks first.
function StreamingPlayer({ chunks }: { chunks: PlaybackChunk[] }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const msUrlRef = useRef("");
  const [loaded, setLoaded]   = useState(0);
  const [phase, setPhase]     = useState<"idle" | "streaming" | "done" | "error">("idle");

  const valid = useMemo(
    () => [...chunks.filter((c) => c.url)].sort((a, b) => a.chunkIndex - b.chunkIndex),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [chunks.map((c) => c.url).join("|")],
  );

  useEffect(() => {
    if (!valid.length || !videoRef.current) return;

    let cancelled = false;
    const ms = new MediaSource();
    msUrlRef.current = URL.createObjectURL(ms);
    videoRef.current.src = msUrlRef.current;

    ms.addEventListener("sourceopen", async () => {
      let sb: SourceBuffer;

      // ── Fetch chunk-0 first so we can detect the actual codec ────────────────
      let chunk0: Uint8Array;
      try {
        const res = await fetch(valid[0].url!);
        if (!res.ok) throw new Error(`${res.status}`);
        chunk0 = new Uint8Array(await res.arrayBuffer());
      } catch {
        if (!cancelled) setPhase("error");
        return;
      }

      const mime = detectWebMMime(chunk0);
      try {
        sb = ms.addSourceBuffer(mime);
      } catch {
        setPhase("error");
        return;
      }
      setPhase("streaming");

      // Append chunk-0 (full — init segment + cluster)
      try {
        await sbReady(sb);
        if (cancelled || ms.readyState !== "open") return;
        sb.appendBuffer(chunk0);
        await sbReady(sb);
        setLoaded(1);
        videoRef.current?.play().catch(() => {});
      } catch {
        if (!cancelled) setPhase("error");
        return;
      }

      // ── Remaining chunks ─────────────────────────────────────────────────────
      for (let i = 1; i < valid.length; i++) {
        if (cancelled || ms.readyState !== "open") break;
        try {
          const res = await fetch(valid[i].url!);
          if (!res.ok) throw new Error(`${res.status}`);
          const raw = new Uint8Array(await res.arrayBuffer());

          // Strip prepended init segment — append only the cluster data.
          const data = raw.subarray(findClusterOffset(raw));

          await sbReady(sb);
          if (cancelled || ms.readyState !== "open") break;
          sb.appendBuffer(data);
          await sbReady(sb);

          setLoaded(i + 1);
        } catch {
          if (!cancelled) setPhase("error");
          return;
        }
      }

      if (!cancelled && ms.readyState === "open") {
        try { ms.endOfStream(); } catch { /* ignore */ }
        setPhase("done");
      }
    }, { once: true });

    return () => {
      cancelled = true;
      if (ms.readyState === "open") { try { ms.endOfStream(); } catch { /* ignore */ } }
      URL.revokeObjectURL(msUrlRef.current);
      msUrlRef.current = "";
    };
  }, [valid]);

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

  const isLoading = phase === "idle" || (phase === "streaming" && loaded === 0);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Box sx={{
        ...card, position: "relative", bgcolor: "#000",
        borderRadius: 2, overflow: "hidden", aspectRatio: "16/9",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {isLoading && (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <CircularProgress size={28} sx={{ color: BLUE }} />
            <Typography sx={{ color: MUTED, fontSize: 12 }}>Loading first chunk…</Typography>
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
          controls
          style={{
            width: "100%", height: "100%", objectFit: "contain",
            display: loaded > 0 && phase !== "error" ? "block" : "none",
          }}
        />
      </Box>

      {/* Progress bar while streaming remaining chunks */}
      {phase === "streaming" && loaded > 0 && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <LinearProgress
            variant="determinate"
            value={Math.round((loaded / valid.length) * 100)}
            sx={{ flex: 1, borderRadius: 1, bgcolor: "rgba(255,255,255,0.08)", "& .MuiLinearProgress-bar": { bgcolor: BLUE } }}
          />
          <Typography sx={{ color: DIM, fontSize: 11, flexShrink: 0 }}>
            {loaded}/{valid.length} chunks
          </Typography>
        </Box>
      )}

      {phase === "done" && (
        <Typography sx={{ color: DIM, fontSize: 11, textAlign: "right" }}>
          {valid.length} chunk{valid.length !== 1 ? "s" : ""} · streamed
        </Typography>
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
