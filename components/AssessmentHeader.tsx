"use client";

import { useAnswers } from "@/context/AnswersContext";
import { useAssessment } from "@/context/AssesmentContext";
import { useServerSync } from "@/hooks/AssesmentApi";
import useCountdown from "@/hooks/useCountdown";
import { formatTime } from "@/utils/formatTime";
import {  useState } from "react";

export default function AssessmentHeader() {
  const { currentSection, currResponse } = useAssessment();
  const { data: serverSync } = useServerSync();
  // ✅ Hooks must always run
  const remaining = useCountdown({
    currentTime: serverSync?.serverTime,
    startedAt: currResponse?.startedAt,
    maxTime: currentSection?.maxTime,
  });


  // Guard rendering only (safe)
  if (!serverSync || !currentSection || !currResponse) return null;

  const isUrgent = remaining < 300;   // < 5 min
  const isCritical = remaining < 60;  // < 1 min

  return (
    <header className="bg-[#020817] border-b border-slate-700">
      <div className="flex items-center justify-between px-6 py-2.5">
        {/* Left - Logo */}
        <div className="flex items-center gap-6">
          <div className="flex items-center px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-md border border-white/20">
            <img
              src="/logo.png"
              alt="Assessment Platform"
              className="h-6 w-auto object-contain"
            />
          </div>
        </div>

        {/* Right - Timer */}
        <div className="flex items-center gap-4">
          <div className="h-8 w-px bg-slate-600" />

          <div
            className={`flex items-center gap-3 px-4 py-1.5 rounded-md border-2 transition-all ${isCritical
              ? "bg-red-500/10 border-red-500"
              : isUrgent
                ? "bg-amber-500/10 border-amber-500"
                : "bg-blue-500/10 border-blue-500"
              }`}
          >
            <svg
              className={`w-5 h-5 ${isCritical
                ? "text-red-400"
                : isUrgent
                  ? "text-amber-400"
                  : "text-blue-400"
                }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase text-white tracking-wider">
                Time:
              </span>

              <span
                className={`text-md font-bold tabular-nums ${isCritical
                  ? "text-red-100 animate-pulse"
                  : isUrgent
                    ? "text-amber-100"
                    : "text-blue-100"
                  }`}
              >
                {formatTime(Math.max(0, (remaining)))}
              </span>
            </div>
          </div>

          
        </div>
      </div>
    </header>
  );
}
