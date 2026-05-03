"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAssessment } from "@/modules/assesment/context/AssesmentContext";
import AssessmentCodeInterface from "./AssessmentCodeInterface";
import AssesmentQuizInterface from "./AssesmentQuizInterface";
import AssessmentHeader from "./AssessmentHeader";
import AssesmentSubmitted from "./AssesmentSubmitted";
import { useStartTest } from "@/modules/assesment/hooks/AssesmentApi";
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
    initialCamStream,
    initialScreenStream,
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

  const [cameraLost, setCameraLost] = useState(false);
  const [screenLost, setScreenLost] = useState(false);
  const [restoring, setRestoring]   = useState<"camera" | "screen" | null>(null);
  const [permError, setPermError]   = useState<string | null>(null);

  const { completeRecording, restartCamera, restartScreen } = useAVProctoring({
    solutionId:      solutionId  ?? "",
    assessmentId:    assessmentId ?? "",
    isProctored:     isProctored && avActive,
    isAvEnabled:     isAvEnabled && avActive,
    isScreenCapture: isScreenCapture && avActive,
    initialCamStream,
    initialScreenStream,
    onFaceViolation: useCallback(
      (type: "no_face" | "multiple_faces", detail: string) => faceViolationRef.current?.(type, detail),
      [],
    ),
    onCameraLost: useCallback(() => setCameraLost(true), []),
    onScreenLost: useCallback(() => setScreenLost(true), []),
  });

  const handleRestoreCamera = async () => {
    setRestoring("camera");
    setPermError(null);
    const ok = await restartCamera();
    setRestoring(null);
    if (ok) {
      setCameraLost(false);
    } else {
      setPermError("Camera access was denied. Check your browser's site settings (click the lock icon in the address bar) and allow camera access, then try again.");
    }
  };

  const handleRestoreScreen = async () => {
    setRestoring("screen");
    setPermError(null);
    const ok = await restartScreen();
    setRestoring(null);
    if (ok) {
      setScreenLost(false);
    } else {
      setPermError("Screen sharing was denied. Please try again and select your entire screen.");
    }
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

  // ── Auto-start (instructions are shown on the landing page) ────────────────
  const startTest = useStartTest();
  const hasAutoStartedRef = useRef(false);
  useEffect(() => {
    if (!hasStarted && solutionId && !hasAutoStartedRef.current) {
      hasAutoStartedRef.current = true;
      startTest.mutate({ solutionId });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasStarted, solutionId]);

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

  if (!hasStarted) return <LoadingBox isOpen />;
  if (hasSubmitted) return <AssesmentSubmitted solutionId={solutionId as string} />;

  return (
    <>
      {/* ── Re-permission modal — shown when camera and/or screen is lost ── */}
      {(cameraLost || screenLost) && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 10000,
          background: "rgba(0,0,0,0.88)", backdropFilter: "blur(6px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
        }}>
          <div style={{
            maxWidth: 420, width: "100%", background: "#fff",
            borderRadius: 16, padding: 32, textAlign: "center", boxShadow: "0 25px 60px rgba(0,0,0,0.4)",
          }}>
            <h2 style={{ margin: "0 0 8px", color: "#dc2626", fontSize: 20, fontWeight: 700 }}>
              Permissions Required
            </h2>
            <p style={{ margin: "0 0 20px", color: "#374151", fontSize: 14, lineHeight: 1.6 }}>
              The following permissions must be restored to continue the assessment.
            </p>

            {permError && (
              <div style={{
                background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8,
                padding: "10px 14px", marginBottom: 16, textAlign: "left",
              }}>
                <p style={{ margin: 0, fontSize: 12, color: "#991b1b", lineHeight: 1.5 }}>{permError}</p>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {cameraLost && (
                <button
                  disabled={restoring === "camera"}
                  onClick={handleRestoreCamera}
                  style={{
                    background: "#1557a0", color: "#fff", border: "none",
                    cursor: restoring === "camera" ? "not-allowed" : "pointer",
                    borderRadius: 8, padding: "12px 20px", fontSize: 14, fontWeight: 600,
                    opacity: restoring === "camera" ? 0.7 : 1,
                    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
                  }}
                >
                  {restoring === "camera" && (
                    <span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
                  )}
                  {restoring === "camera" ? "Requesting..." : "Grant Camera & Microphone Access"}
                </button>
              )}

              {screenLost && (
                <button
                  disabled={restoring === "screen"}
                  onClick={handleRestoreScreen}
                  style={{
                    background: cameraLost ? "#475569" : "#1557a0", color: "#fff", border: "none",
                    cursor: restoring === "screen" ? "not-allowed" : "pointer",
                    borderRadius: 8, padding: "12px 20px", fontSize: 14, fontWeight: 600,
                    opacity: restoring === "screen" ? 0.7 : 1,
                    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
                  }}
                >
                  {restoring === "screen" && (
                    <span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
                  )}
                  {restoring === "screen" ? "Requesting..." : "Share Entire Screen"}
                </button>
              )}
            </div>

            <p style={{ margin: "16px 0 0", fontSize: 11, color: "#9ca3af" }}>
              This incident has been recorded.
            </p>
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
