"use client";
import { useEffect, useRef, useState, useCallback } from "react";

export interface ProctoringLog {
  type: "tab_switch" | "window_blur" | "devtools" | "keystroke" | "fullscreen_exit" | "session_end" | "reconnect" | "no_face" | "multiple_faces";
  timestamp: string;
  detail?: string;
}

interface ProctoringProps {
  onLog?: (log: ProctoringLog) => void;
  onViolation?: (log: ProctoringLog) => void;
}

const DEVTOOLS_THRESHOLD = 160;

function timestamp() {
  return new Date().toISOString();
}

export default function Proctoring({ onLog, onViolation }: ProctoringProps) {
  const [violationMessage, setViolationMessage] = useState<string | null>(null);
  const [violationCount, setViolationCount] = useState(0);
  const [devtoolsOpen, setDevtoolsOpen] = useState(false);
  const devtoolsOpenRef = useRef(false);

  const log = useCallback(
    (entry: ProctoringLog) => {
      onLog?.(entry);
    },
    [onLog],
  );

  const violation = useCallback(
    (entry: ProctoringLog, message: string) => {
      log(entry);
      onViolation?.(entry);
      setViolationCount((c) => c + 1);
      setViolationMessage(message);
    },
    [log, onViolation],
  );

  // --- Fullscreen ---
  const requestFullscreen = useCallback(() => {
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen();
  }, []);

  useEffect(() => {
    requestFullscreen();
  }, [requestFullscreen]);

  // --- Tab visibility ---
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        violation(
          { type: "tab_switch", timestamp: timestamp(), detail: "Tab hidden" },
          "Tab switching detected. Please stay on this page.",
        );
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [violation]);

  // --- Window blur (minimize / switch app) ---
  useEffect(() => {
    const handleBlur = () => {
      violation(
        { type: "window_blur", timestamp: timestamp(), detail: "Window lost focus" },
        "Window minimized or switched. Please return to the assessment.",
      );
    };
    window.addEventListener("blur", handleBlur);
    return () => window.removeEventListener("blur", handleBlur);
  }, [violation]);

  // --- Fullscreen exit ---
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        violation(
          { type: "fullscreen_exit", timestamp: timestamp(), detail: "Fullscreen exited" },
          "Fullscreen mode exited. Please remain in fullscreen.",
        );
        setTimeout(requestFullscreen, 500);
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [violation, requestFullscreen]);

  // --- DevTools detection (size heuristic) ---
  useEffect(() => {
    const check = () => {
      const widthDiff = window.outerWidth - window.innerWidth;
      const heightDiff = window.outerHeight - window.innerHeight;
      const open = widthDiff > DEVTOOLS_THRESHOLD || heightDiff > DEVTOOLS_THRESHOLD;

      if (open && !devtoolsOpenRef.current) {
        devtoolsOpenRef.current = true;
        setDevtoolsOpen(true);
        violation(
          { type: "devtools", timestamp: timestamp(), detail: `size diff w:${widthDiff} h:${heightDiff}` },
          "Developer tools detected. Close DevTools to continue.",
        );
      } else if (!open && devtoolsOpenRef.current) {
        devtoolsOpenRef.current = false;
        setDevtoolsOpen(false);
        // Dismiss the devtools modal automatically once they close it
        setViolationMessage((prev) =>
          prev === "Developer tools detected. Close DevTools to continue." ? null : prev,
        );
      }
    };

    const interval = setInterval(check, 1000);
    return () => clearInterval(interval);
  }, [violation]);

  // --- Keystroke logging ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const blocked =
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(e.key.toUpperCase())) ||
        (e.ctrlKey && e.key.toUpperCase() === "U");

      if (blocked) {
        e.preventDefault();
        violation(
          { type: "devtools", timestamp: timestamp(), detail: `Blocked shortcut: ${e.key}` },
          "Developer tools shortcut blocked.",
        );
        return;
      }

      log({
        type: "keystroke",
        timestamp: timestamp(),
        detail: e.key,
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [log, violation]);

  // --- Context menu block ---
  useEffect(() => {
    const block = (e: MouseEvent) => e.preventDefault();
    document.addEventListener("contextmenu", block);
    return () => document.removeEventListener("contextmenu", block);
  }, []);

  // DevTools-specific persistent overlay — cannot be dismissed manually
  if (devtoolsOpen) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm">
        <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl">
          <div className="mb-4 text-5xl">🛑</div>
          <h2 className="mb-2 text-xl font-bold text-red-600">Developer Tools Open</h2>
          <p className="mb-4 text-gray-700">
            Developer tools are open. The assessment is paused until you close them.
          </p>
          <p className="mb-2 text-sm text-gray-500">
            Violation #{violationCount} — This incident has been recorded.
          </p>
          <p className="text-xs text-gray-400">
            This modal will dismiss automatically once DevTools are closed.
          </p>
        </div>
      </div>
    );
  }

  if (!violationMessage) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl">
        <div className="mb-4 text-5xl">⚠️</div>
        <h2 className="mb-2 text-xl font-bold text-red-600">Proctoring Violation</h2>
        <p className="mb-4 text-gray-700">{violationMessage}</p>
        <p className="mb-6 text-sm text-gray-500">
          Violation #{violationCount} — This incident has been recorded.
        </p>
        <button
          onClick={() => {
            setViolationMessage(null);
            requestFullscreen();
          }}
          className="rounded-lg bg-red-600 px-6 py-2 font-semibold text-white hover:bg-red-700"
        >
          Return to Assessment
        </button>
      </div>
    </div>
  );
}
