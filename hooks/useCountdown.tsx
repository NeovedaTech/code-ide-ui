"use client";
import { useEffect, useRef, useState } from "react";

interface CountdownArgs {
  maxTime?: number; // seconds
  startedAt?: string; // ISO string like "2026-01-26T19:01:19.451Z"
  currentTime?: string; // ISO string like "2026-01-26T19:01:19.451Z"
}

export default function useCountdown({ startedAt, maxTime, currentTime }: CountdownArgs) {
  const [remaining, setRemaining] = useState<number>(0);
  const endTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!startedAt || !maxTime) return;

    if (!endTimeRef.current) {
      const startedAtMs = new Date(startedAt).getTime();
      const now = currentTime ? new Date(currentTime).getTime() : Date.now();

      endTimeRef.current = startedAtMs + maxTime * 1000 * 60;

      const shouldRemain = Math.floor((endTimeRef.current - now) / 1000);

      if (shouldRemain < 0) {
        console.warn(
          "⚠️ Test has already expired by",
          Math.abs(shouldRemain),
          "seconds",
        );
      }
    }

    const tick = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((endTimeRef.current! - now) / 1000));
      setRemaining(diff);
    };

    tick(); // immediate update
    const interval = setInterval(tick, 1000);

    return () => clearInterval(interval);
  }, [startedAt, maxTime]);

  return remaining;
}
