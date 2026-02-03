"use client";

import AssesmentAttempt from "@/components/AssesmentAttempt";
import { AssessmentProvider } from "@/context/AssesmentContext";
import { useSearchParams } from "next/navigation";

export default function AssesmentEntry() {
  const searchParams = useSearchParams();
  const assessmentId = (searchParams.get("assessmentId") as string) ?? "";
  const userId = (searchParams.get("userId") as string) ?? "";

  return (
    <>
    {/* USERCONTXT USERID={USERID} */}
      <AssessmentProvider assessmentId={assessmentId} userId={userId}>
        <AssesmentAttempt />
      </AssessmentProvider>
    </>
  );
}
