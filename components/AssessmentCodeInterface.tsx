import { CodingProblem, CodingSection } from "@/types/assessment";
import ProbelmDescription from "./problems/ProbelmDescription";
import ProblemEditor from "./problems/ProblemEditor";
import ProblemSelector from "./problems/ProblemSelector";
import { Box } from "@mui/system";
import { useState, useMemo } from "react";
import ProblemRunner from "./problems/ProblemRunner";

export default function AssessmentCodeInterface({
  section,
}: {
  section: CodingSection | undefined;
}) {
  const [currentProblemId, setCurrentProblemId] = useState<string | undefined>(
    section?.problems[0]?._id
  );

  // Find the current problem by ID
  const currentProblem = useMemo(() => {
    if (!section?.problems || !currentProblemId) return undefined;
    return section.problems.find((p) => p._id === currentProblemId);
  }, [section?.problems, currentProblemId]);

  return (
    <Box sx={{ display: "flex", height: "calc(100vh - 64px)" }}>
      <ProbelmDescription problem={currentProblem as CodingProblem} />
      <ProblemRunner problem={currentProblem as CodingProblem} />
      <ProblemSelector
        problems={section?.problems as CodingProblem[]}
        setProblemId={setCurrentProblemId}
        selectedId={currentProblemId}
      />
    </Box>
  );
}