"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAssessment } from "@/modules/assesment/context/AssesmentContext";
import AssessmentCodeInterface from "./AssessmentCodeInterface";
import AssesmentQuizInterface from "./AssesmentQuizInterface";
import AssessmentHeader from "./AssessmentHeader";
import AssesmentSubmitted from "./AssesmentSubmitted";
import AssesmentInstructions from "./AssesmentInstructions";
import { useAnswers } from "@/modules/assesment/context/AnswersContext";
import { QuizSection } from "@/types/assessment";
import { ErrorBox } from "@/shared/ErrorBox";
import { LoadingBox } from "@/shared/LoadingBox";
import { AutoSubmitBox } from "@/shared/AutosubmitBox";
import Proctoring, { ProctoringLog } from "./Proctoring";
import { useAVProctoring } from "./AVProctoring";
import { post } from "@/helpers/api";
import { PROCTORING_ROUTES } from "@/constants/ApiRoutes";

const LOG_FLUSH_INTERVAL_MS = 10_000;

export default function AssesmentAttempt() {
  const {
    currentSection,
    hasStarted,
    hasSubmitted,
    assessmentLoading,
    assessmentError,
    solutionId,
    assessmentId,
    isProctored,
    isAvEnabled,
    isScreenCapture,
  } = useAssessment();

  const SECTION_TYPE = currentSection?.type;
  const { handleSubmit } = useAnswers();
  const { autoSubmit, setAutoSubmit } = useAssessment();

  // ── AV proctoring ────────────────────────────────────────────────────────────
  const avActive = (isProctored || isAvEnabled || isScreenCapture) && !!solutionId && hasStarted && !hasSubmitted;

  // Stable ref so onFaceViolation doesn't retrigger the recorder useEffect
  const logBuffer = useRef<ProctoringLog[]>([]);
  const faceViolationRef = useRef<((type: "no_face" | "multiple_faces", detail: string) => void) | undefined>(undefined);
  faceViolationRef.current = isProctored && avActive
    ? (type, detail) => logBuffer.current.push({ type, timestamp: new Date().toISOString(), detail })
    : undefined;

  const [mediaLost, setMediaLost]   = useState<"camera" | "screen" | null>(null);
  const [restoring, setRestoring]   = useState(false);

  const { completeRecording, restartCamera, restartScreen } = useAVProctoring({
    solutionId:      solutionId  ?? "",
    assessmentId:    assessmentId ?? "",
    isProctored:     isProctored && avActive,
    isAvEnabled:     isAvEnabled && avActive,
    isScreenCapture: isScreenCapture && avActive,
    onFaceViolation: useCallback(
      (type: "no_face" | "multiple_faces", detail: string) => faceViolationRef.current?.(type, detail),
      [],
    ),
    onCameraLost: useCallback(() => setMediaLost("camera"), []),
    onScreenLost: useCallback(() => setMediaLost("screen"), []),
  });

  const handleRestoreMedia = async () => {
    setRestoring(true);
    const ok = mediaLost === "camera" ? await restartCamera() : await restartScreen();
    setRestoring(false);
    if (ok) setMediaLost(null);
    // If failed, keep modal open so user can retry
  };

  // Track whether AV was ever active so we can call completeRecording on submit
  // even though avActive flips to false in the same render as hasSubmitted → true.
  const wasAvActiveRef = useRef(false);
  if (avActive) wasAvActiveRef.current = true;

  useEffect(() => {
    if (hasSubmitted && wasAvActiveRef.current) {
      completeRecording();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasSubmitted]);

  // ── Buffered proctoring log sender ───────────────────────────────────────────

  useEffect(() => {
    if (!solutionId || !hasStarted) return;

    const flush = async () => {
      if (!logBuffer.current.length) return;
      const batch = logBuffer.current.splice(0);
      await post(PROCTORING_ROUTES.LOG, {
        solutionId,
        events: batch.map((e) => ({
          type: e.type,
          timestamp: e.timestamp,
          detail: e.detail,
        })),
      }).catch(() => {
        // put them back on failure
        logBuffer.current.unshift(...batch);
      });
    };

    const interval = setInterval(flush, LOG_FLUSH_INTERVAL_MS);
    return () => {
      clearInterval(interval);
      flush(); // flush on unmount
    };
  }, [solutionId, hasStarted]);

  const handleProctoringLog = (log: ProctoringLog) => {
    logBuffer.current.push(log);
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  if (assessmentLoading) return <LoadingBox isOpen />;

  if (assessmentError)
    return (
      <ErrorBox
        title="Solution Not Found"
        message="Solution to respected assessment id or userId not found"
        details={JSON.stringify(assessmentError)}
        onClose={() => {}}
        isOpen
      />
    );

  if (!hasStarted) return <AssesmentInstructions />;
  if (hasSubmitted) return <AssesmentSubmitted solutionId={solutionId as string} />;

  return (
    <>
      {/* ── Re-permission modal — shown when camera/screen is lost mid-session ── */}
      {mediaLost && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 10000,
          background: "rgba(0,0,0,0.88)", backdropFilter: "blur(6px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
        }}>
          <div style={{
            maxWidth: 400, width: "100%", background: "#fff",
            borderRadius: 16, padding: 32, textAlign: "center", boxShadow: "0 25px 60px rgba(0,0,0,0.4)",
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>
              {mediaLost === "camera" ? "📷" : "🖥️"}
            </div>
            <h2 style={{ margin: "0 0 8px", color: "#dc2626", fontSize: 20, fontWeight: 700 }}>
              {mediaLost === "camera" ? "Camera Access Lost" : "Screen Sharing Stopped"}
            </h2>
            <p style={{ margin: "0 0 8px", color: "#374151", fontSize: 14, lineHeight: 1.6 }}>
              {mediaLost === "camera"
                ? "Your camera is no longer accessible. Please re-grant access to continue."
                : "Screen recording has stopped. Please re-share your screen to continue."}
            </p>
            <p style={{ margin: "0 0 24px", fontSize: 12, color: "#9ca3af" }}>
              This incident has been recorded.
            </p>
            <button
              disabled={restoring}
              onClick={handleRestoreMedia}
              style={{
                background: "#1557a0", color: "#fff", border: "none", cursor: restoring ? "not-allowed" : "pointer",
                borderRadius: 8, padding: "12px 28px", fontSize: 14, fontWeight: 600,
                opacity: restoring ? 0.7 : 1, display: "inline-flex", alignItems: "center", gap: 8,
              }}
            >
              {restoring && (
                <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
              )}
              {restoring
                ? "Requesting…"
                : mediaLost === "camera" ? "Re-grant Camera Access" : "Re-share Screen"}
            </button>
          </div>
        </div>
      )}

      {isProctored && <Proctoring onLog={handleProctoringLog} onViolation={handleProctoringLog} />}
      <AutoSubmitBox
        onClose={() => setAutoSubmit(false)}
        isOpen={autoSubmit}
        onSubmit={handleSubmit}
      />
      <AssessmentHeader />
      {SECTION_TYPE === "quiz" && (
        <AssesmentQuizInterface section={currentSection as QuizSection} />
      )}
      {SECTION_TYPE === "coding" && (
        <AssessmentCodeInterface section={currentSection} />
      )}
    </>
  );
}
