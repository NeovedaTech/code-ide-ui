import AssesmentEntry from "@/components/pages/AssesmentEntry";
import { Suspense } from "react";

export default function page() {
  return (
    <>
      <Suspense>
        <AssesmentEntry />
      </Suspense>
    </>
  );
}
