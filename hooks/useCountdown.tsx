"use client";
import { useEffect, useRef, useState } from "react";

interface CountdownArgs {
  maxTime?: number;    // minutes
  startedAt?: string; // ISO
  currentTime?: string; // ISO (server time)
}

export default function useCountdown({
  startedAt,
  maxTime,
  currentTime,
}: CountdownArgs) {
  const [remaining, setRemaining] = useState(0);
  const endTimeRef = useRef<number | null>(null);
  const serverTimeRef = useRef<number | null>(null);

  // initialize endTime and initial server time
  useEffect(() => {
    if (!startedAt || !maxTime || !currentTime) return;

    endTimeRef.current = new Date(startedAt).getTime() + maxTime * 60 * 1000;
    serverTimeRef.current = new Date(currentTime).getTime();

    // compute initial remaining
    const diff = Math.max(0, Math.floor(endTimeRef.current - serverTimeRef.current) / 1000);
    setRemaining(Number(diff.toFixed(0)));
  }, [startedAt, maxTime, currentTime]);

  // interval to tick every second
  useEffect(() => {
    if (!endTimeRef.current || serverTimeRef.current === null) return;

    let ticks = 0; // number of seconds elapsed
    const interval = setInterval(() => {
      ticks += 1;
      const diff = Math.max(
        0,
        Math.floor((endTimeRef.current! - (serverTimeRef.current! + ticks * 1000)) / 1000)
      );
      setRemaining(Number(diff));
    }, 1000);

    return () => clearInterval(interval);
  }, [endTimeRef.current, serverTimeRef.current]);

  return remaining;
}
