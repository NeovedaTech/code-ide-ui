"use client";
import React, { useEffect, useRef, useCallback } from "react";
import { post, get } from "@/helpers/api";
import { PROCTORING_ROUTES } from "@/constants/ApiRoutes";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

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
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, "readwrite");
      tx.objectStore(IDB_STORE).put(blob, `${solutionId}_chunk_${chunkIndex}`);
      tx.oncomplete = () => resolve();
      tx.onerror    = () => reject(tx.error);
    });
  } catch { /* silent */ }
}

async function idbRemove(solutionId: string, chunkIndex: number) {
  try {
    const db = await getDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, "readwrite");
      tx.objectStore(IDB_STORE).delete(`${solutionId}_chunk_${chunkIndex}`);
      tx.oncomplete = () => resolve();
      tx.onerror    = () => reject(tx.error);
    });
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

async function startFaceDetection(
  stream: MediaStream,
  onViolation: (type: "no_face" | "multiple_faces", detail: string) => void,
  activeRef: React.MutableRefObject<boolean>,
): Promise<() => void> {
  const DETECT_INTERVAL_MS    = 3_000;
  const CONSECUTIVE_THRESHOLD = 2;

  let detector: import("@tensorflow-models/blazeface").BlazeFaceModel;
  try {
    detector = await getFaceDetector();
  } catch (e) {
    console.warn("[FaceDetect] model load failed:", e);
    return () => {};
  }

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
      const faces = await detector.estimateFaces(video, false);

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
  initialCamStream,
  initialScreenStream,
}: {
  solutionId: string;
  assessmentId: string;
  isProctored: boolean;
  isAvEnabled: boolean;
  isScreenCapture: boolean;
  onFaceViolation?: (type: "no_face" | "multiple_faces", detail: string) => void;
  onCameraLost?: () => void;
  onScreenLost?: () => void;
  initialCamStream?: MediaStream | null;
  initialScreenStream?: MediaStream | null;
}) {
  // ── Camera / mic refs ─────────────────────────────────────────────────────
  const mediaRecorderRef     = useRef<MediaRecorder | null>(null);
  const streamRef            = useRef<MediaStream | null>(null);
  const chunkIndexRef        = useRef(0);
  const completedRef         = useRef<{ chunkIndex: number; s3Key: string }[]>([]);
  const faceDetectCleanupRef = useRef<(() => void) | null>(null);

  // ── Screen refs ───────────────────────────────────────────────────────────
  const screenRecorderRef   = useRef<MediaRecorder | null>(null);
  const screenStreamRef     = useRef<MediaStream | null>(null);
  const screenChunkIndexRef = useRef(0);
  const screenCompletedRef  = useRef<{ chunkIndex: number; s3Key: string }[]>([]);

  const camActiveRef      = useRef(false);
  const screenActiveRef   = useRef(false);
  const isUnloadingRef    = useRef(false);
  const pendingUploadsRef = useRef<Set<Promise<void>>>(new Set());

  // Pre-acquired streams from the landing page (consumed once)
  const initialCamRef    = useRef(initialCamStream ?? null);
  const initialScreenRef = useRef(initialScreenStream ?? null);

  // Stable refs for callbacks
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
      const p = uploadChunkAt(blob, idx).finally(() => pendingUploadsRef.current.delete(p));
      pendingUploadsRef.current.add(p);
      return p;
    },
    [uploadChunkAt],
  );

  const beaconChunk = useCallback(
    (blob: Blob) => {
      if (!blob.size) return;
      const idx = chunkIndexRef.current++;
      const params = new URLSearchParams({
        solutionId, assessmentId, chunkIndex: String(idx),
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
          else await idbStore(solutionId, idx, blob);
        }
      }
    },
    [solutionId, assessmentId],
  );

  const uploadScreenChunk = useCallback(
    (blob: Blob) => {
      const idx = screenChunkIndexRef.current++;
      const p = uploadScreenChunkAt(blob, idx).finally(() => pendingUploadsRef.current.delete(p));
      pendingUploadsRef.current.add(p);
      return p;
    },
    [uploadScreenChunkAt],
  );

  const beaconScreenChunk = useCallback(
    (blob: Blob) => {
      if (!blob.size) return;
      const idx = screenChunkIndexRef.current++;
      const params = new URLSearchParams({
        solutionId, assessmentId, chunkIndex: String(idx), recordingType: "screen",
      });
      navigator.sendBeacon(
        `${API_BASE}/api/v1/proctoring/relay-chunk?${params}`,
        blob,
      );
    },
    [solutionId, assessmentId],
  );

  // ── Main effect: camera/mic MediaRecorder ─────────────────────────────────
  //
  // Simplified recording: each ondataavailable blob is uploaded as-is.
  // Chunk 0 (first timeslice) naturally contains the WebM header + first cluster.
  // Chunks 1+ contain only cluster data. No init-segment prepending needed.
  //
  useEffect(() => {
    if (!solutionId || !assessmentId || (!isProctored && !isAvEnabled)) return;

    // Guard: if a recorder is already running (React StrictMode re-invoke), skip.
    if (mediaRecorderRef.current?.state === "recording") {
      camActiveRef.current = true;
      return;
    }

    camActiveRef.current   = true;
    isUnloadingRef.current = false;

    (async () => {
      // Reconnect: resume chunk index from last known state
      try {
        const session = await get<{
          recordingStatus: string;
          lastKnownChunkIndex: number;
          sessionCount: number;
          screenRecordingStatus: string;
          screenLastKnownChunkIndex: number;
        }>(PROCTORING_ROUTES.SESSION(solutionId));

        if (session.recordingStatus === "completed") return;
        if (session.lastKnownChunkIndex >= 0) {
          chunkIndexRef.current = session.lastKnownChunkIndex + 1;
        }
        if (session.screenLastKnownChunkIndex >= 0) {
          screenChunkIndexRef.current = session.screenLastKnownChunkIndex + 1;
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
        // Reuse pre-acquired stream if still alive
        const preAcquired = initialCamRef.current;
        initialCamRef.current = null;
        const alive = preAcquired?.active ? preAcquired
                    : streamRef.current?.active ? streamRef.current
                    : null;
        const stream = alive || await navigator.mediaDevices.getUserMedia({
          video: isProctored,
          audio: isAvEnabled,
        });
        if (!camActiveRef.current) { stream.getTracks().forEach((t) => t.stop()); return; }
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

        const recorder = new MediaRecorder(stream, { mimeType });
        mediaRecorderRef.current = recorder;

        // Upload each chunk directly — no init-segment manipulation
        recorder.ondataavailable = (e) => {
          if (!e.data.size || !camActiveRef.current) return;
          if (isUnloadingRef.current) {
            beaconChunk(e.data);
          } else {
            uploadChunk(e.data).catch(console.error);
          }
        };

        recorder.start(CHUNK_INTERVAL_MS);

        // Face detection
        if (isProctored && onFaceViolation) {
          startFaceDetection(stream, onFaceViolation, camActiveRef).then((cleanup) => {
            faceDetectCleanupRef.current = cleanup;
          });
        }
      } catch (e) {
        console.warn("[AV] getUserMedia failed:", e);
        // Notify parent so the re-permission modal appears
        onCameraLostRef.current?.();
      }
    })();

    return () => {
      faceDetectCleanupRef.current?.();
      faceDetectCleanupRef.current = null;
      // Stop via ref so cleanup works even after StrictMode re-run
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    };
  }, [solutionId, assessmentId, isProctored, isAvEnabled, uploadChunk, beaconChunk, onFaceViolation]);

  // ── Screen capture MediaRecorder ──────────────────────────────────────────
  useEffect(() => {
    if (!solutionId || !assessmentId || !isScreenCapture) return;

    // Guard: skip if already recording (StrictMode re-invoke)
    if (screenRecorderRef.current?.state === "recording") {
      screenActiveRef.current = true;
      return;
    }

    screenActiveRef.current = true;
    // NOTE: do NOT reset isUnloadingRef here — it is shared with the camera
    // effect and the beforeunload handler. Resetting here would race.

    (async () => {
      try {
        const preAcquired = initialScreenRef.current;
        initialScreenRef.current = null;
        const alive = preAcquired?.active ? preAcquired
                    : screenStreamRef.current?.active ? screenStreamRef.current
                    : null;
        const stream = alive || await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false,
        });
        if (!screenActiveRef.current) { stream.getTracks().forEach((t) => t.stop()); return; }
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

        // Upload each chunk directly
        recorder.ondataavailable = (e) => {
          if (!e.data.size || !screenActiveRef.current) return;
          if (isUnloadingRef.current) {
            beaconScreenChunk(e.data);
          } else {
            uploadScreenChunk(e.data).catch(console.error);
          }
        };

        recorder.start(CHUNK_INTERVAL_MS);
      } catch (e) {
        console.warn("[Screen] getDisplayMedia failed:", e);
        // Notify parent so the re-permission modal appears
        onScreenLostRef.current?.();
      }
    })();

    return () => {
      if (screenRecorderRef.current?.state === "recording") {
        screenRecorderRef.current.stop();
      }
    };
  }, [solutionId, assessmentId, isScreenCapture, uploadScreenChunk, beaconScreenChunk]);

  // ── beforeunload: flush partial chunks from both recorders ────────────────
  useEffect(() => {
    if (!solutionId) return;
    const handleUnload = () => {
      isUnloadingRef.current = true;

      // Flush partial chunk then stop — prevents a second ondataavailable
      // from the next timeslice firing after the page is unloading.
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.requestData();
        mediaRecorderRef.current.stop();
      }
      if (screenRecorderRef.current?.state === "recording") {
        screenRecorderRef.current.requestData();
        screenRecorderRef.current.stop();
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

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isProctored,
        audio: isAvEnabled,
      });
      streamRef.current = stream;
      camActiveRef.current = true;

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
        if (!e.data.size || !camActiveRef.current) return;
        if (isUnloadingRef.current) beaconChunk(e.data);
        else uploadChunk(e.data).catch(console.error);
      };

      recorder.start(CHUNK_INTERVAL_MS);

      if (isProctored && onFaceViolation) {
        startFaceDetection(stream, onFaceViolation, camActiveRef).then((cleanup) => {
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
        if (!e.data.size || !screenActiveRef.current) return;
        if (isUnloadingRef.current) beaconScreenChunk(e.data);
        else uploadScreenChunk(e.data).catch(console.error);
      };

      recorder.start(CHUNK_INTERVAL_MS);
      return true;
    } catch {
      return false;
    }
  }, [uploadScreenChunk, beaconScreenChunk]);

  // ── completeRecording: called on submit ───────────────────────────────────
  const completeRecording = useCallback(async () => {
    // Keep active refs TRUE while stopping — so the final ondataavailable
    // chunk (fired by recorder.stop()) is still captured and uploaded.
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

    // Now disable — recorders are stopped, no more ondataavailable events
    camActiveRef.current    = false;
    screenActiveRef.current = false;

    // Await all in-flight chunk uploads (including the final chunk from stop())
    await Promise.all([...pendingUploadsRef.current]).catch(() => {});

    streamRef.current?.getTracks().forEach((t) => t.stop());
    screenStreamRef.current?.getTracks().forEach((t) => t.stop());

    const payload: { solutionId: string; chunks: typeof completedRef.current; screenChunks?: typeof screenCompletedRef.current } = {
      solutionId,
      chunks: completedRef.current,
    };
    if (screenCompletedRef.current.length > 0) {
      payload.screenChunks = screenCompletedRef.current;
    }

    // Always call COMPLETE so recordingStatus is set to "completed" in the DB
    await post(PROCTORING_ROUTES.COMPLETE, payload).catch(console.error);
  }, [solutionId]);

  return { completeRecording, restartCamera, restartScreen };
}
