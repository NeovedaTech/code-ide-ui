"use client";
import { useAnswers } from "@/context/AnswersContext";
import { useAssessment } from "@/context/AssesmentContext";
import { useEffect, useRef, useState } from "react";

interface CountdownArgs {
  maxTime?: number; // minutes
  startedAt?: string; // ISO
  currentTime?: string; // ISO (server time)
}

export default function useCountdown({
  startedAt,
  maxTime,
  currentTime,
}: CountdownArgs) {
  const { currentSection , setAutoSubmit } = useAssessment();

  const initialiseRef = useRef(false);
  const [remaining, setRemaining] = useState(Number.MAX_SAFE_INTEGER);

  const endTimeRef = useRef<number | null>(null);
  const serverTimeRef = useRef<number | null>(null);

  // initialize refs + initial remaining
  useEffect(() => {
    if (!startedAt || !maxTime || !currentTime) return;

    endTimeRef.current = new Date(startedAt).getTime() + maxTime * 60 * 1000;

    serverTimeRef.current = new Date(currentTime).getTime();

    const diff = Math.max(
      0,
      Math.floor((endTimeRef.current - serverTimeRef.current) / 1000),
    );
    if (!initialiseRef.current) {
      initialiseRef.current = true;
    }
    setRemaining(diff);
  }, [startedAt, maxTime, currentTime]);

  // ticking interval
  useEffect(() => {
    if (!startedAt || !maxTime || !currentTime) return;
    if (!endTimeRef.current || !serverTimeRef.current) return;

    let ticks = 0;

    const interval = setInterval(() => {
      ticks += 1;

      const diff = Math.max(
        0,
        Math.floor(
          (endTimeRef.current! - (serverTimeRef.current! + ticks * 1000)) /
            1000,
        ),
      );

      setRemaining(diff);
    }, 1000);

    return () => clearInterval(interval);
  }, [startedAt, maxTime, currentTime]);

  useEffect(() => {
    if (remaining <= 0 && initialiseRef) {
      // handleSubmit();
      if (currentSection?.type === "coding") {
        // startCodeSubmission();
      }
      setAutoSubmit(true);
    }
  }, [remaining]);

  return remaining;
}
