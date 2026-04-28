import { CodingProblem, CodingSection } from "@/types/assessment";
import ProbelmDescription from "./problems/ProbelmDescription";
import ProblemSelector from "./problems/ProblemSelector";
import { Box, Drawer, IconButton } from "@mui/material";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import ProblemRunner from "./problems/ProblemRunner";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ProblemOutputBox from "./problems/ProblemOutputBox";
import { useAnswers } from "@/modules/assesment/context/AnswersContext";
import { useAssessment } from "@/modules/assesment/context/AssesmentContext";
import { ConfirmBox } from "@/shared/ConfirmBox";

export default function AssessmentCodeInterface({
  section,
}: {
  section: CodingSection | undefined;
}) {
  const [currentProblemId, setCurrentProblemId] = useState<string | undefined>(
    section?.problems[0]?._id,
  );
  const [selectorOpen, setSelectorOpen] = useState(true);
  const [descriptionOpen, setDescriptionOpen] = useState(true);
  // const [outputOpen, setOutputOpen] = useState(true);
  // const [descriptionWidth, setDescriptionWidth] = useState(35); // percentage
  const [outputWidth, setOutputWidth] = useState(36); // percentage
  const [isResizingLeft, setIsResizingLeft] = useState(false);
  const [isResizingRight, setIsResizingRight] = useState(false);
  const [isResizingSelectorRight, setIsResizingSelectorRight] = useState(false);
  const [selectorWidth, setSelectorWidth] = useState(380); // pixels

  // Find the current problem by ID
  const currentProblem = useMemo(() => {
    if (!section?.problems || !currentProblemId) return undefined;
    return section.problems.find((p) => p._id === currentProblemId);
  }, [section?.problems, currentProblemId]);

  // Navigation helpers
  const currentIndex = useMemo(() => {
    if (!section?.problems || !currentProblemId) return 0;
    return section.problems.findIndex((p) => p._id === currentProblemId);
  }, [section?.problems, currentProblemId]);

  const totalProblems = section?.problems?.length ?? 0;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < totalProblems - 1;

  const goToPrev = useCallback(() => {
    if (hasPrev && section?.problems) {
      setCurrentProblemId(section.problems[currentIndex - 1]._id);
    }
  }, [hasPrev, section?.problems, currentIndex]);

  const goToNext = useCallback(() => {
    if (hasNext && section?.problems) {
      setCurrentProblemId(section.problems[currentIndex + 1]._id);
    }
  }, [hasNext, section?.problems, currentIndex]);

  const goToNextUnsubmitted = useCallback(() => {
    if (!section?.problems) return;
    const next = section.problems.find(
      (p, i) => i > currentIndex && !currResponse?.codingAnswers[0]?.[p._id],
    );
    if (next) setCurrentProblemId(next._id);
    else if (hasNext) goToNext();
  }, [section?.problems, currentIndex, currResponse, hasNext, goToNext]);

  // const handleMouseDownLeft = (e: React.MouseEvent) => {
  //   e.preventDefault();
  //   setIsResizingLeft(true);
  // };

  const { isSectionDone, currResponse } = useAssessment();

  const isCurrentSubmitted = !!(currentProblemId && currResponse?.codingAnswers[0]?.[currentProblemId]);
  const submittedCount = useMemo(() => {
    if (!section?.problems || !currResponse?.codingAnswers[0]) return 0;
    return section.problems.filter((p) => currResponse.codingAnswers[0][p._id]).length;
  }, [section?.problems, currResponse]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const initializeRef = useRef(false);
  useEffect(() => {
    if (initializeRef.current) return;
    if (isSectionDone) {
      initializeRef.current = true;
      setIsOpen(true);
    }
  }, [isSectionDone]);
  const handleMouseDownRight = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingRight(true);
  };

  const handleMouseDownSelectorRight = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingSelectorRight(true);
  };

  const { handleSubmit } = useAnswers();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingSelectorRight) {
        const newWidth = e.clientX;
        if (newWidth >= 250 && newWidth <= 600) {
          setSelectorWidth(newWidth);
        }
      }

      if (isResizingLeft) {
        const containerLeft = selectorWidth;
        const containerWidth = window.innerWidth - containerLeft;
        const newWidth = ((e.clientX - containerLeft) / containerWidth) * 100;

        if (newWidth >= 20 && newWidth <= 50) {
          // setDescriptionWidth(newWidth);
        }
      }

      if (isResizingRight) {
        const containerRight = window.innerWidth;
        const containerLeft = selectorWidth;
        const totalWidth = containerRight - containerLeft;
        const newWidth = ((containerRight - e.clientX) / totalWidth) * 100;

        if (newWidth >= 15 && newWidth <= 60) {
          setOutputWidth(newWidth);
        }
      }
    };

    const handleMouseUp = () => {
      setIsResizingLeft(false);
      setIsResizingRight(false);
      setIsResizingSelectorRight(false);
    };

    if (isResizingLeft || isResizingRight || isResizingSelectorRight) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizingLeft, isResizingRight, isResizingSelectorRight, selectorWidth]);

  return (
    <Box
      sx={{
        display: "flex",
        height: "calc(100vh - 64px)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Problem Selector Drawer - MOVED OUTSIDE */}
      <Drawer
        variant="persistent"
        anchor="left"
        open={selectorOpen}
        sx={{
          width: selectorOpen ? selectorWidth : 0,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: selectorWidth,
            boxSizing: "border-box",
            position: "relative",
            height: "100%",
            border: "none",
            boxShadow: "2px 0 8px rgba(0,0,0,0.1)",
          },
        }}
      >
        <Box sx={{ position: "relative", height: "100%" }}>
          <IconButton
            onClick={() => setSelectorOpen(false)}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              zIndex: 10,
              backgroundColor: "white",
              boxShadow: 1,
              "&:hover": {
                backgroundColor: "grey.100",
              },
            }}
          >
            <ChevronLeftIcon />
          </IconButton>
          <ProblemSelector
            problems={section?.problems as CodingProblem[]}
            setProblemId={setCurrentProblemId}
            selectedId={currentProblemId}
          />
        </Box>
      </Drawer>

      {/* Selector Resizer Handle */}
      {selectorOpen && (
        <Box
          onMouseDown={handleMouseDownSelectorRight}
          sx={{
            width: "6px",
            cursor: "col-resize",
            backgroundColor: isResizingSelectorRight ? "#3b82f6" : "#e5e7eb",
            transition: "background-color 0.2s",
            "&:hover": {
              backgroundColor: "#93c5fd",
            },
            position: "relative",
            zIndex: 10,
            flexShrink: 0,
          }}
        >
          {/* Visual indicator dots */}
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              pointerEvents: "none",
            }}
          >
            <Box
              sx={{
                width: "3px",
                height: "3px",
                borderRadius: "50%",
                backgroundColor: isResizingSelectorRight ? "white" : "#9ca3af",
              }}
            />
            <Box
              sx={{
                width: "3px",
                height: "3px",
                borderRadius: "50%",
                backgroundColor: isResizingSelectorRight ? "white" : "#9ca3af",
              }}
            />
            <Box
              sx={{
                width: "3px",
                height: "3px",
                borderRadius: "50%",
                backgroundColor: isResizingSelectorRight ? "white" : "#9ca3af",
              }}
            />
          </Box>
        </Box>
      )}

      <Box
        sx={{
          display: "flex",
          flex: 1,
          overflow: "hidden",
          transition: "margin-left 0.3s ease",
          gap: 0,
        }}
      >
        {/* Toggle Button when drawer is closed */}
        {!selectorOpen && (
          <IconButton
            onClick={() => setSelectorOpen(true)}
            sx={{
              position: "absolute",
              left: 8,
              top: 8,
              zIndex: 10,
              backgroundColor: "white",
              boxShadow: 2,
              "&:hover": {
                backgroundColor: "grey.100",
              },
            }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Main Content Area */}

        {/* Problem Description Panel - LEFT */}
        {descriptionOpen && (
          <>
            {/* <Box
              sx={{
                width: `${descriptionWidth}%`,
                height: "100%",
                overflow: "auto",
                borderRight: "1px solid #e5e7eb",
                position: "relative",
                backgroundColor: "white",
              }}
            >
              <ProbelmDescription problem={currentProblem as CodingProblem} />
            </Box> */}
          </>
        )}

        {/* Problem Runner Panel - CENTER */}
        <Box
          sx={{
            flex: 1,
            height: "100%",
            overflow: "hidden",
            backgroundColor: "white",
            display: "flex",
            flexDirection: "column",
            position: "relative",
            minWidth: 0,
          }}
        >
          {/* Toggle Description Button */}
          {!descriptionOpen && (
            <IconButton
              onClick={() => setDescriptionOpen(true)}
              sx={{
                position: "absolute",
                left: 8,
                top: 8,
                zIndex: 10,
                backgroundColor: "white",
                boxShadow: 2,
                "&:hover": {
                  backgroundColor: "grey.100",
                },
              }}
            >
              <ChevronRightIcon />
            </IconButton>
          )}

          <ProblemRunner
            sectionId={section?.sectionId as string}
            problem={currentProblem as CodingProblem}
            problemIndex={currentIndex}
            totalProblems={totalProblems}
            hasPrev={hasPrev}
            hasNext={hasNext}
            isSubmitted={isCurrentSubmitted}
            submittedCount={submittedCount}
            onPrev={goToPrev}
            onNext={goToNext}
            onNextUnsubmitted={goToNextUnsubmitted}
          />
        </Box>

        {/* Right Resizer Hand/le */}
        {/* {outputOpen && (/ */}
        <Box
          onMouseDown={handleMouseDownRight}
          sx={{
            width: "6px",
            cursor: "col-resize",
            backgroundColor: isResizingRight ? "#3b82f6" : "#e5e7eb",
            transition: "background-color 0.2s",
            "&:hover": {
              backgroundColor: "#93c5fd",
            },
            position: "relative",
            zIndex: 10,
            flexShrink: 0,
          }}
        >
          {/* Visual indicator dots */}
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              pointerEvents: "none",
            }}
          >
            <Box
              sx={{
                width: "3px",
                height: "3px",
                borderRadius: "50%",
                backgroundColor: isResizingRight ? "white" : "#9ca3af",
              }}
            />
            <Box
              sx={{
                width: "3px",
                height: "3px",
                borderRadius: "50%",
                backgroundColor: isResizingRight ? "white" : "#9ca3af",
              }}
            />
            <Box
              sx={{
                width: "3px",
                height: "3px",
                borderRadius: "50%",
                backgroundColor: isResizingRight ? "white" : "#9ca3af",
              }}
            />
          </Box>
        </Box>
        {/* )} */}

        {/* Output Panel - RIGHT */}
        {/* {outputOpen && ( */}
        <Box
          sx={{
            width: `${outputWidth}%`,
            height: "100%",
            borderLeft: "1px solid #e5e7eb",
            backgroundColor: "white",
            overflow: "auto",
            position: "relative",
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <ProblemOutputBox />
        </Box>
        {/* )} */}
      </Box>

      {/* Overlay when resizing to prevent interference */}
      {(isResizingLeft || isResizingRight) && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            cursor: "col-resize",
          }}
        />
      )}
      <ConfirmBox
        title="Submit Section"
        content="You're all problems are submitted ? Do you wish to submit section ?"
        cancelText="Review Once"
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleSubmit}
      />
      {isSectionDone && (
        <div
          onClick={() => setIsOpen(true)}
          className="animate-pulse cursor-pointer ease-in-out absolute z-[999] right-5 bottom-5 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg"
        >
          Submit Section
        </div>
      )}
    </Box>
  );
}
