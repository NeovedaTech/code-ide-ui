import AssesmentEntry from "@/modules/assesment/components/pages/AssesmentEntry";
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
