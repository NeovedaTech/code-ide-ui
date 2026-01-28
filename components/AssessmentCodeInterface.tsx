import { CodingProblem, CodingSection } from "@/types/assessment";
import ProbelmDescription from "./problems/ProbelmDescription";
import ProblemSelector from "./problems/ProblemSelector";
import { Box, Drawer, IconButton } from "@mui/material";
import { useState, useMemo, useEffect } from "react";
import ProblemRunner from "./problems/ProblemRunner";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ProblemOutputBox from "./problems/ProblemOutputBox";
import { useAnswers } from "@/context/AnswersContext";

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
  const [outputOpen, setOutputOpen] = useState(true);
  const [descriptionWidth, setDescriptionWidth] = useState(35); // percentage
  const [outputWidth, setOutputWidth] = useState(30); // percentage
  const [isResizingLeft, setIsResizingLeft] = useState(false);
  const [isResizingRight, setIsResizingRight] = useState(false);

  // Find the current problem by ID
 
  const currentProblem = useMemo(() => {
    if (!section?.problems || !currentProblemId) return undefined;
    return section.problems.find((p) => p._id === currentProblemId);
  }, [section?.problems, currentProblemId]);

  const handleMouseDownLeft = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingLeft(true);
  };

  const handleMouseDownRight = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingRight(true);
  };

  const { showOutputWindow, openOutputWindow, closeOutputWindow } = useAnswers();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingLeft) {
        const containerLeft = selectorOpen ? 380 : 0;
        const containerWidth = window.innerWidth - containerLeft;
        const newWidth = ((e.clientX - containerLeft) / containerWidth) * 100;

        if (newWidth >= 20 && newWidth <= 50) {
          setDescriptionWidth(newWidth);
        }
      }

      if (isResizingRight) {
        const containerRight = window.innerWidth;
        const containerLeft = selectorOpen ? 380 : 0;
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
    };

    if (isResizingLeft || isResizingRight) {
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
  }, [isResizingLeft, isResizingRight, selectorOpen]);

  const drawerWidth = 380;

  return (
    <Box
      sx={{
        display: "flex",
        height: "calc(100vh - 64px)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Problem Selector Drawer */}
      <Drawer
        variant="persistent"
        anchor="left"
        open={selectorOpen}
        sx={{
          width: selectorOpen ? drawerWidth : 0,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
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
      <Box
        sx={{
          display: "flex",
          flex: 1,
          overflow: "hidden",
          transition: "margin-left 0.3s ease",
          gap: 0,
        }}
      >
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

            {/* Left Resizer Handle */}
            <Box
              onMouseDown={handleMouseDownLeft}
              sx={{
                width: "6px",
                cursor: "col-resize",
                backgroundColor: isResizingLeft ? "#3b82f6" : "#e5e7eb",
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
                    backgroundColor: isResizingLeft ? "white" : "#9ca3af",
                  }}
                />
                <Box
                  sx={{
                    width: "3px",
                    height: "3px",
                    borderRadius: "50%",
                    backgroundColor: isResizingLeft ? "white" : "#9ca3af",
                  }}
                />
                <Box
                  sx={{
                    width: "3px",
                    height: "3px",
                    borderRadius: "50%",
                    backgroundColor: isResizingLeft ? "white" : "#9ca3af",
                  }}
                />
              </Box>
            </Box>
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
          />
        </Box>

        {/* Right Resizer Handle */}
        {outputOpen && (
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
        )}

        {/* Output Panel - RIGHT */}
        {outputOpen && (
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
            {/* Toggle Output Button */}
            <IconButton
              onClick={() => setOutputOpen(false)}
              sx={{
                position: "absolute",
                right: 4,
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

            <ProblemOutputBox />
          </Box>
        )}

        {/* Toggle Output Button when closed */}
        {!outputOpen && (
          <IconButton
            onClick={() => setOutputOpen(true)}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              zIndex: 10,
              backgroundColor: "white",
              boxShadow: 2,
              "&:hover": {
                backgroundColor: "grey.100",
              },
            }}
          >
            <ChevronLeftIcon />
          </IconButton>
        )}
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
    </Box>
  );
}