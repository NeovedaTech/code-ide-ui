"use client";
import React, { useEffect, useRef, useCallback } from "react";
import { post, get } from "@/helpers/api";
import { PROCTORING_ROUTES } from "@/constants/ApiRoutes";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
const TOKEN_KEY = "knovia_token";

// Save chunks every 10 seconds — worst-case data loss is ≤10 s.
const CHUNK_INTERVAL_MS = 10_000;

// ─── IndexedDB helpers ─────────────────────────────────────────────────────────
const IDB_NAME  = "av_proctoring_pending";
const IDB_STORE = "chunks";

async function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(IDB_STORE);
    req.onsuccess  = () => resolve(req.result);
    req.onerror    = () => reject(req.error);
  });
}

async function idbStore(solutionId: string, chunkIndex: number, blob: Blob) {
  try {
    const db = await getDB();
    const tx = db.transaction(IDB_STORE, "readwrite");
    tx.objectStore(IDB_STORE).put(blob, `${solutionId}_chunk_${chunkIndex}`);
  } catch { /* silent */ }
}

async function idbRemove(solutionId: string, chunkIndex: number) {
  try {
    const db = await getDB();
    const tx = db.transaction(IDB_STORE, "readwrite");
    tx.objectStore(IDB_STORE).delete(`${solutionId}_chunk_${chunkIndex}`);
  } catch { /* silent */ }
}

async function idbGetPending(solutionId: string): Promise<{ chunkIndex: number; blob: Blob }[]> {
  try {
    const db    = await getDB();
    const tx    = db.transaction(IDB_STORE, "readwrite");
    const store = tx.objectStore(IDB_STORE);
    return new Promise((resolve) => {
      const results: { chunkIndex: number; blob: Blob }[] = [];
      const req = store.openCursor();
      req.onsuccess = () => {
        const cursor = req.result;
        if (!cursor) { resolve(results); return; }
        const key = cursor.key as string;
        if (key.startsWith(`${solutionId}_chunk_`)) {
          const chunkIndex = parseInt(key.split("_chunk_")[1], 10);
          results.push({ chunkIndex, blob: cursor.value as Blob });
          store.delete(cursor.key);
        }
        cursor.continue();
      };
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

// ─── Face detection ────────────────────────────────────────────────────────────
// Loaded lazily — only when camera is active. Model is cached after first load.
let detectorPromise: Promise<import("@tensorflow-models/blazeface").BlazeFaceModel> | null = null;

async function getFaceDetector() {
  if (!detectorPromise) {
    detectorPromise = (async () => {
      const [tf, blazeface] = await Promise.all([
        import("@tensorflow/tfjs"),
        import("@tensorflow-models/blazeface"),
      ]);
      await tf.ready();
      return blazeface.load({ maxFaces: 4 });
    })().catch((e) => {
      detectorPromise = null;
      throw e;
    });
  }
  return detectorPromise;
}

/**
 * Attaches face-detection to a camera stream.
 * Runs every DETECT_INTERVAL_MS; logs a violation after CONSECUTIVE_THRESHOLD
 * consecutive bad frames to avoid noise from brief look-aways.
 * Returns a cleanup function.
 */
async function startFaceDetection(
  stream: MediaStream,
  onViolation: (type: "no_face" | "multiple_faces", detail: string) => void,
  activeRef: React.MutableRefObject<boolean>,
): Promise<() => void> {
  const DETECT_INTERVAL_MS    = 3_000;
  const CONSECUTIVE_THRESHOLD = 2; // must fire N times in a row before logging

  let detector: import("@tensorflow-models/blazeface").BlazeFaceModel;
  try {
    detector = await getFaceDetector();
  } catch (e) {
    console.warn("[FaceDetect] model load failed:", e);
    return () => {};
  }

  // Off-screen video element fed from the camera stream
  const video = document.createElement("video");
  video.srcObject = stream;
  video.muted     = true;
  video.playsInline = true;
  await video.play().catch(() => {});

  let noFaceStreak    = 0;
  let multiFaceStreak = 0;

  const interval = setInterval(async () => {
    if (!activeRef.current || video.readyState < 2) return;
    try {
      const faces = await detector.estimateFaces(video, false /* returnTensors */);

      if (faces.length === 0) {
        noFaceStreak++;
        multiFaceStreak = 0;
        if (noFaceStreak === CONSECUTIVE_THRESHOLD) {
          onViolation("no_face", "Face not visible");
        }
      } else if (faces.length > 1) {
        multiFaceStreak++;
        noFaceStreak = 0;
        if (multiFaceStreak === CONSECUTIVE_THRESHOLD) {
          onViolation("multiple_faces", `${faces.length} faces detected`);
        }
      } else {
        noFaceStreak    = 0;
        multiFaceStreak = 0;
      }
    } catch { /* ignore transient errors */ }
  }, DETECT_INTERVAL_MS);

  return () => {
    clearInterval(interval);
    video.srcObject = null;
  };
}

// ─── Core hook ─────────────────────────────────────────────────────────────────
export function useAVProctoring({
  solutionId,
  assessmentId,
  isProctored,
  isAvEnabled,
  isScreenCapture,
  onFaceViolation,
  onCameraLost,
  onScreenLost,
}: {
  solutionId: string;
  assessmentId: string;
  isProctored: boolean;
  isAvEnabled: boolean;
  isScreenCapture: boolean;
  onFaceViolation?: (type: "no_face" | "multiple_faces", detail: string) => void;
  onCameraLost?: () => void;
  onScreenLost?: () => void;
}) {
  // ── Camera / mic refs ─────────────────────────────────────────────────────
  const mediaRecorderRef    = useRef<MediaRecorder | null>(null);
  const streamRef           = useRef<MediaStream | null>(null);
  const chunkIndexRef       = useRef(0);
  const completedRef        = useRef<{ chunkIndex: number; s3Key: string }[]>([]);
  const initSegmentRef      = useRef<Blob | null>(null);
  const faceDetectCleanupRef = useRef<(() => void) | null>(null);

  // ── Screen refs ───────────────────────────────────────────────────────────
  const screenRecorderRef    = useRef<MediaRecorder | null>(null);
  const screenStreamRef      = useRef<MediaStream | null>(null);
  const screenChunkIndexRef  = useRef(0);
  const screenCompletedRef   = useRef<{ chunkIndex: number; s3Key: string }[]>([]);
  const screenInitSegmentRef = useRef<Blob | null>(null);

  const activeRef      = useRef(false);
  const isUnloadingRef = useRef(false);

  // Stable refs so callbacks don't cause effect re-runs
  const onCameraLostRef = useRef(onCameraLost);
  onCameraLostRef.current = onCameraLost;
  const onScreenLostRef = useRef(onScreenLost);
  onScreenLostRef.current = onScreenLost;

  // ── Camera upload helpers ─────────────────────────────────────────────────
  const uploadChunkAt = useCallback(
    async (blob: Blob, idx: number) => {
      if (!blob.size) return;
      let attempts = 0;
      while (attempts < 3) {
        try {
          const { url, key } = await post<{ url: string; key: string; expiresIn: number }>(
            PROCTORING_ROUTES.PRESIGNED_URL,
            { solutionId, assessmentId, chunkIndex: idx, contentType: "video/webm" },
          );
          const res = await fetch(url, {
            method: "PUT",
            body: blob,
            headers: { "Content-Type": "video/webm" },
          });
          if (!res.ok) throw new Error(`S3 PUT ${res.status}`);
          completedRef.current.push({ chunkIndex: idx, s3Key: key });
          await idbRemove(solutionId, idx);
          return;
        } catch {
          attempts++;
          if (attempts < 3) await new Promise((r) => setTimeout(r, 1000 * 2 ** attempts));
          else await idbStore(solutionId, idx, blob);
        }
      }
    },
    [solutionId, assessmentId],
  );

  const uploadChunk = useCallback(
    (blob: Blob) => {
      const idx = chunkIndexRef.current++;
      return uploadChunkAt(blob, idx);
    },
    [uploadChunkAt],
  );

  const beaconChunk = useCallback(
    (blob: Blob) => {
      if (!blob.size) return;
      const idx   = chunkIndexRef.current++;
      const token = typeof window !== "undefined"
        ? (localStorage.getItem(TOKEN_KEY) ?? "")
        : "";
      const params = new URLSearchParams({
        solutionId,
        assessmentId,
        chunkIndex: String(idx),
        t: token,
      });
      navigator.sendBeacon(
        `${API_BASE}/api/v1/proctoring/relay-chunk?${params}`,
        blob,
      );
    },
    [solutionId, assessmentId],
  );

  // ── Screen upload helpers ─────────────────────────────────────────────────
  const uploadScreenChunkAt = useCallback(
    async (blob: Blob, idx: number) => {
      if (!blob.size) return;
      let attempts = 0;
      while (attempts < 3) {
        try {
          const { url, key } = await post<{ url: string; key: string; expiresIn: number }>(
            PROCTORING_ROUTES.PRESIGNED_URL,
            { solutionId, assessmentId, chunkIndex: idx, contentType: "video/webm", recordingType: "screen" },
          );
          const res = await fetch(url, {
            method: "PUT",
            body: blob,
            headers: { "Content-Type": "video/webm" },
          });
          if (!res.ok) throw new Error(`S3 PUT ${res.status}`);
          screenCompletedRef.current.push({ chunkIndex: idx, s3Key: key });
          return;
        } catch {
          attempts++;
          if (attempts < 3) await new Promise((r) => setTimeout(r, 1000 * 2 ** attempts));
        }
      }
    },
    [solutionId, assessmentId],
  );

  const uploadScreenChunk = useCallback(
    (blob: Blob) => {
      const idx = screenChunkIndexRef.current++;
      return uploadScreenChunkAt(blob, idx);
    },
    [uploadScreenChunkAt],
  );

  const beaconScreenChunk = useCallback(
    (blob: Blob) => {
      if (!blob.size) return;
      const idx   = screenChunkIndexRef.current++;
      const token = typeof window !== "undefined"
        ? (localStorage.getItem(TOKEN_KEY) ?? "")
        : "";
      const params = new URLSearchParams({
        solutionId,
        assessmentId,
        chunkIndex: String(idx),
        recordingType: "screen",
        t: token,
      });
      navigator.sendBeacon(
        `${API_BASE}/api/v1/proctoring/relay-chunk?${params}`,
        blob,
      );
    },
    [solutionId, assessmentId],
  );

  // ── Main effect: camera/mic MediaRecorder ─────────────────────────────────
  useEffect(() => {
    if (!solutionId || !assessmentId || (!isProctored && !isAvEnabled)) return;

    activeRef.current      = true;
    isUnloadingRef.current = false;
    let recorder: MediaRecorder | null = null;

    (async () => {
      // Reconnect: resume chunk index from last known state
      try {
        const session = await get<{
          recordingStatus: string;
          lastKnownChunkIndex: number;
          sessionCount: number;
        }>(PROCTORING_ROUTES.SESSION(solutionId));

        if (session.recordingStatus === "completed") return;
        if (session.lastKnownChunkIndex >= 0) {
          chunkIndexRef.current = session.lastKnownChunkIndex + 1;
        }
        if (session.recordingStatus === "interrupted") {
          await post(PROCTORING_ROUTES.LOG, {
            solutionId,
            events: [{
              type: "reconnect",
              timestamp: new Date().toISOString(),
              detail: `session_${session.sessionCount + 1}`,
            }],
          }).catch(() => {});
        }
      } catch { /* first session */ }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: isProctored,
          audio: isAvEnabled,
        });
        if (!activeRef.current) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;

        // Detect camera turned off mid-assessment
        stream.getVideoTracks().forEach((track) => {
          track.addEventListener("ended", () => {
            faceDetectCleanupRef.current?.();
            if (mediaRecorderRef.current?.state === "recording") mediaRecorderRef.current.stop();
            onCameraLostRef.current?.();
          }, { once: true });
        });

        const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")
          ? "video/webm;codecs=vp8,opus"
          : "video/webm";

        recorder = new MediaRecorder(stream, { mimeType });
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (e) => {
          if (!e.data.size || !activeRef.current) return;

          if (!initSegmentRef.current) {
            initSegmentRef.current = e.data;
            return;
          }

          const blob = new Blob([initSegmentRef.current, e.data], { type: "video/webm" });

          if (isUnloadingRef.current) {
            beaconChunk(blob);
          } else {
            uploadChunk(blob).catch(console.error);
          }
        };

        recorder.start(CHUNK_INTERVAL_MS);
        setTimeout(() => recorder?.requestData(), 0);

        // Face detection — only when camera is on (isProctored)
        if (isProctored && onFaceViolation) {
          startFaceDetection(stream, onFaceViolation, activeRef).then((cleanup) => {
            faceDetectCleanupRef.current = cleanup;
          });
        }
      } catch (e) {
        console.warn("[AV] getUserMedia failed:", e);
      }
    })();

    return () => {
      activeRef.current      = false;
      initSegmentRef.current = null;
      faceDetectCleanupRef.current?.();
      faceDetectCleanupRef.current = null;
      if (recorder?.state === "recording") recorder.stop();
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [solutionId, assessmentId, isProctored, isAvEnabled, uploadChunk, beaconChunk, onFaceViolation]);

  // ── Screen capture MediaRecorder ──────────────────────────────────────────
  useEffect(() => {
    if (!solutionId || !assessmentId || !isScreenCapture) return;

    activeRef.current      = true;
    isUnloadingRef.current = false;
    let recorder: MediaRecorder | null = null;

    (async () => {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false,
        });
        if (!activeRef.current) { stream.getTracks().forEach((t) => t.stop()); return; }
        screenStreamRef.current = stream;

        // When the user clicks the browser's "Stop sharing" button
        stream.getVideoTracks()[0].addEventListener("ended", () => {
          if (screenRecorderRef.current?.state === "recording") screenRecorderRef.current.stop();
          onScreenLostRef.current?.();
        }, { once: true });

        const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp8")
          ? "video/webm;codecs=vp8"
          : "video/webm";

        recorder = new MediaRecorder(stream, { mimeType });
        screenRecorderRef.current = recorder;

        recorder.ondataavailable = (e) => {
          if (!e.data.size || !activeRef.current) return;

          if (!screenInitSegmentRef.current) {
            screenInitSegmentRef.current = e.data;
            return;
          }

          const blob = new Blob([screenInitSegmentRef.current, e.data], { type: "video/webm" });

          if (isUnloadingRef.current) {
            beaconScreenChunk(blob);
          } else {
            uploadScreenChunk(blob).catch(console.error);
          }
        };

        recorder.start(CHUNK_INTERVAL_MS);
        setTimeout(() => recorder?.requestData(), 0);
      } catch (e) {
        console.warn("[Screen] getDisplayMedia failed:", e);
      }
    })();

    return () => {
      screenInitSegmentRef.current = null;
      if (recorder?.state === "recording") recorder.stop();
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [solutionId, assessmentId, isScreenCapture, uploadScreenChunk, beaconScreenChunk]);

  // ── beforeunload: flush partial chunks from both recorders ────────────────
  useEffect(() => {
    if (!solutionId) return;
    const handleUnload = () => {
      isUnloadingRef.current = true;

      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.requestData();
      }
      if (screenRecorderRef.current?.state === "recording") {
        screenRecorderRef.current.requestData();
      }

      navigator.sendBeacon(
        `${API_BASE}/api/v1/proctoring/log`,
        new Blob(
          [JSON.stringify({
            solutionId,
            events: [{ type: "session_end", timestamp: new Date().toISOString(), detail: "beforeunload" }],
          })],
          { type: "application/json" },
        ),
      );
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [solutionId]);

  // ── Online: retry IndexedDB pending camera chunks ─────────────────────────
  useEffect(() => {
    if (!solutionId) return;
    const handleOnline = async () => {
      const pending = await idbGetPending(solutionId);
      for (const { chunkIndex, blob } of pending) {
        await uploadChunkAt(blob, chunkIndex).catch(console.error);
      }
    };
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [solutionId, uploadChunkAt]);

  // ── restartCamera: re-request camera/mic after permission lost ───────────
  const restartCamera = useCallback(async (): Promise<boolean> => {
    faceDetectCleanupRef.current?.();
    faceDetectCleanupRef.current = null;
    if (mediaRecorderRef.current?.state === "recording") mediaRecorderRef.current.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    initSegmentRef.current = null;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isProctored,
        audio: isAvEnabled,
      });
      streamRef.current = stream;
      activeRef.current = true;

      stream.getVideoTracks().forEach((track) => {
        track.addEventListener("ended", () => {
          faceDetectCleanupRef.current?.();
          if (mediaRecorderRef.current?.state === "recording") mediaRecorderRef.current.stop();
          onCameraLostRef.current?.();
        }, { once: true });
      });

      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")
        ? "video/webm;codecs=vp8,opus"
        : "video/webm";
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (!e.data.size || !activeRef.current) return;
        if (!initSegmentRef.current) { initSegmentRef.current = e.data; return; }
        const blob = new Blob([initSegmentRef.current, e.data], { type: "video/webm" });
        if (isUnloadingRef.current) beaconChunk(blob);
        else uploadChunk(blob).catch(console.error);
      };

      recorder.start(CHUNK_INTERVAL_MS);
      setTimeout(() => recorder.requestData(), 0);

      if (isProctored && onFaceViolation) {
        startFaceDetection(stream, onFaceViolation, activeRef).then((cleanup) => {
          faceDetectCleanupRef.current = cleanup;
        });
      }
      return true;
    } catch {
      return false;
    }
  }, [isProctored, isAvEnabled, uploadChunk, beaconChunk, onFaceViolation]);

  // ── restartScreen: re-request screen share after user stopped it ──────────
  const restartScreen = useCallback(async (): Promise<boolean> => {
    if (screenRecorderRef.current?.state === "recording") screenRecorderRef.current.stop();
    screenStreamRef.current?.getTracks().forEach((t) => t.stop());
    screenInitSegmentRef.current = null;

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      screenStreamRef.current = stream;

      stream.getVideoTracks()[0].addEventListener("ended", () => {
        if (screenRecorderRef.current?.state === "recording") screenRecorderRef.current.stop();
        onScreenLostRef.current?.();
      }, { once: true });

      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp8")
        ? "video/webm;codecs=vp8"
        : "video/webm";
      const recorder = new MediaRecorder(stream, { mimeType });
      screenRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (!e.data.size || !activeRef.current) return;
        if (!screenInitSegmentRef.current) { screenInitSegmentRef.current = e.data; return; }
        const blob = new Blob([screenInitSegmentRef.current, e.data], { type: "video/webm" });
        if (isUnloadingRef.current) beaconScreenChunk(blob);
        else uploadScreenChunk(blob).catch(console.error);
      };

      recorder.start(CHUNK_INTERVAL_MS);
      setTimeout(() => recorder.requestData(), 0);
      return true;
    } catch {
      return false;
    }
  }, [uploadScreenChunk, beaconScreenChunk]);

  // ── completeRecording: called on submit ───────────────────────────────────
  const completeRecording = useCallback(async () => {
    activeRef.current = false;

    // Stop both recorders and wait for final chunks
    const stopRecorder = (rec: MediaRecorder | null) =>
      rec?.state === "recording"
        ? new Promise<void>((resolve) => {
            rec.addEventListener("stop", () => resolve(), { once: true });
            rec.stop();
          })
        : Promise.resolve();

    await Promise.all([
      stopRecorder(mediaRecorderRef.current),
      stopRecorder(screenRecorderRef.current),
    ]);

    streamRef.current?.getTracks().forEach((t) => t.stop());
    screenStreamRef.current?.getTracks().forEach((t) => t.stop());

    const payload: { solutionId: string; chunks: typeof completedRef.current; screenChunks?: typeof screenCompletedRef.current } = {
      solutionId,
      chunks: completedRef.current,
    };
    if (screenCompletedRef.current.length > 0) {
      payload.screenChunks = screenCompletedRef.current;
    }

    if (completedRef.current.length > 0 || screenCompletedRef.current.length > 0) {
      await post(PROCTORING_ROUTES.COMPLETE, payload).catch(console.error);
    }
  }, [solutionId]);

  return { completeRecording, restartCamera, restartScreen };
}
