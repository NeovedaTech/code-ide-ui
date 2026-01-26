// AssesmentInstructions.tsx
"use client";

import { COLORS } from "@/constants/colors";
import { useAssessment } from "@/context/AssesmentContext";
import { useStartTest } from "@/hooks/AssesmentApi";
import { StartOutlined, Sync } from "@mui/icons-material";
import {
  Box,
  Container,
  Typography,
  Alert,
  AlertTitle,
  Button,
  Stack,
  Divider,
} from "@mui/material";
import {
  AlertCircle,
  Shield,
  Clock,
  CheckCircle2,
  RocketIcon,
  WifiSync,
} from "lucide-react";

interface AssessmentInstructionsProps {}

export default function AssesmentInstructions({}: AssessmentInstructionsProps) {
  const { solutionId } = useAssessment();
  const startTest = useStartTest();
  const onStartAssessment = () => {
    startTest.mutate({
      solutionId: solutionId,
    });
  };
  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: COLORS.neutral.bg,
        py: 6,
      }}
    >
      <Container maxWidth="md">
        {/* Header Section */}
        <Box sx={{ mb: 6 }}>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 800,
              color: COLORS.neutral.text,
              mb: 2,
            }}
          >
            Assessment Instructions
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: COLORS.neutral.textTertiary,
              fontSize: "1.1rem",
              lineHeight: 1.6,
            }}
          >
            Please carefully review all guidelines and requirements before
            proceeding with the assessment.
          </Typography>
        </Box>

        {/* Main Content Box */}
        <Box
          sx={{
            backgroundColor: COLORS.neutral.white,
            borderRadius: 2,
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            overflow: "hidden",
          }}
        >
          {/* Content Container */}
          <Box sx={{ p: 6 }}>
            <Stack spacing={6}>
              {/* Section 1: Overview */}
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: COLORS.neutral.text,
                    mb: 2,
                    fontSize: "1.1rem",
                  }}
                >
                  Assessment Overview
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: COLORS.neutral.textSecondary,
                    lineHeight: 1.8,
                    fontSize: "0.95rem",
                  }}
                >
                  This assessment comprises multiple sections, each containing
                  distinct question types and specific time constraints.
                  Candidates must complete each section within the designated
                  time limit. Sections cannot be revisited after progression to
                  the next section.
                </Typography>
              </Box>

              <Divider />

              {/* Section 2: Code of Conduct */}
              <Box>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}
                >
                  <Shield size={24} style={{ color: COLORS.primary.main }} />
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: COLORS.neutral.text,
                      fontSize: "1.1rem",
                    }}
                  >
                    Code of Conduct
                  </Typography>
                </Box>

                <Stack spacing={3}>
                  {/* Rule 1 */}
                  <Box
                    sx={{
                      pl: 4,
                      borderLeft: `3px solid ${COLORS.primary.main}`,
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 700,
                        color: COLORS.neutral.text,
                        mb: 1,
                        fontSize: "0.95rem",
                      }}
                    >
                      Window and Tab Management
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: COLORS.neutral.textSecondary,
                        lineHeight: 1.7,
                        fontSize: "0.9rem",
                      }}
                    >
                      Switching between browser tabs or opening additional
                      windows is strictly prohibited. The system will
                      automatically submit your assessment upon detection of tab
                      switching or loss of window focus.
                    </Typography>
                  </Box>

                  {/* Rule 2 */}
                  <Box
                    sx={{
                      pl: 4,
                      borderLeft: `3px solid ${COLORS.primary.main}`,
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 700,
                        color: COLORS.neutral.text,
                        mb: 1,
                        fontSize: "0.95rem",
                      }}
                    >
                      Developer Tools and Inspection
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: COLORS.neutral.textSecondary,
                        lineHeight: 1.7,
                        fontSize: "0.9rem",
                      }}
                    >
                      Opening browser developer tools (F12, Ctrl+Shift+I,
                      Right-click → Inspect) or attempting to access page source
                      code is not permitted. Any violation will result in
                      immediate assessment termination and automatic submission.
                    </Typography>
                  </Box>

                  {/* Rule 3 */}
                  <Box
                    sx={{
                      pl: 4,
                      borderLeft: `3px solid ${COLORS.primary.main}`,
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 700,
                        color: COLORS.neutral.text,
                        mb: 1,
                        fontSize: "0.95rem",
                      }}
                    >
                      Copy and Paste Restrictions
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: COLORS.neutral.textSecondary,
                        lineHeight: 1.7,
                        fontSize: "0.9rem",
                      }}
                    >
                      Copy-paste functionality is disabled throughout the
                      assessment. All responses must be composed or selected
                      directly within the assessment platform using native input
                      mechanisms.
                    </Typography>
                  </Box>

                  {/* Rule 4 */}
                  <Box
                    sx={{
                      pl: 4,
                      borderLeft: `3px solid ${COLORS.primary.main}`,
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 700,
                        color: COLORS.neutral.text,
                        mb: 1,
                        fontSize: "0.95rem",
                      }}
                    >
                      Full Screen Mode
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: COLORS.neutral.textSecondary,
                        lineHeight: 1.7,
                        fontSize: "0.9rem",
                      }}
                    >
                      The assessment must be completed in full screen mode.
                      Exiting full screen or minimizing the window will trigger
                      automatic submission.
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              <Divider />

              {/* Section 3: Time Management */}
              <Box>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}
                >
                  <Clock size={24} style={{ color: COLORS.secondary.main }} />
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: COLORS.neutral.text,
                      fontSize: "1.1rem",
                    }}
                  >
                    Time Management
                  </Typography>
                </Box>

                <Stack spacing={2}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: COLORS.neutral.textSecondary,
                      lineHeight: 1.8,
                      fontSize: "0.95rem",
                    }}
                  >
                    Each section is allocated a specific time limit. The
                    countdown timer will be visible at all times. Upon
                    completion of the time limit:
                  </Typography>

                  <Box sx={{ pl: 3 }}>
                    <Stack spacing={1.5}>
                      <Box sx={{ display: "flex", gap: 2 }}>
                        <CheckCircle2
                          size={20}
                          style={{
                            color: COLORS.success.main,
                            flexShrink: 0,
                            marginTop: "2px",
                          }}
                        />
                        <Typography
                          variant="body2"
                          sx={{
                            color: COLORS.neutral.textSecondary,
                            fontSize: "0.9rem",
                          }}
                        >
                          Automatic progression to the next section occurs
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", gap: 2 }}>
                        <CheckCircle2
                          size={20}
                          style={{
                            color: COLORS.success.main,
                            flexShrink: 0,
                            marginTop: "2px",
                          }}
                        />
                        <Typography
                          variant="body2"
                          sx={{
                            color: COLORS.neutral.textSecondary,
                            fontSize: "0.9rem",
                          }}
                        >
                          All unsaved responses in the current section are
                          retained
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", gap: 2 }}>
                        <CheckCircle2
                          size={20}
                          style={{
                            color: COLORS.success.main,
                            flexShrink: 0,
                            marginTop: "2px",
                          }}
                        />
                        <Typography
                          variant="body2"
                          sx={{
                            color: COLORS.neutral.textSecondary,
                            fontSize: "0.9rem",
                          }}
                        >
                          Returning to previous sections is not permitted
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                </Stack>
              </Box>

              <Divider />

              {/* Section 4: Response Management */}
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: COLORS.neutral.text,
                    mb: 2,
                    fontSize: "1.1rem",
                  }}
                >
                  Response Management
                </Typography>

                <Stack spacing={2}>
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <CheckCircle2
                      size={20}
                      style={{
                        color: COLORS.success.main,
                        flexShrink: 0,
                        marginTop: "2px",
                      }}
                    />
                    <Typography
                      variant="body2"
                      sx={{
                        color: COLORS.neutral.textSecondary,
                        fontSize: "0.9rem",
                      }}
                    >
                      All responses are automatically saved at regular intervals
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <CheckCircle2
                      size={20}
                      style={{
                        color: COLORS.success.main,
                        flexShrink: 0,
                        marginTop: "2px",
                      }}
                    />
                    <Typography
                      variant="body2"
                      sx={{
                        color: COLORS.neutral.textSecondary,
                        fontSize: "0.9rem",
                      }}
                    >
                      Manual saving is not required; however, explicit
                      submission confirms completion
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <CheckCircle2
                      size={20}
                      style={{
                        color: COLORS.success.main,
                        flexShrink: 0,
                        marginTop: "2px",
                      }}
                    />
                    <Typography
                      variant="body2"
                      sx={{
                        color: COLORS.neutral.textSecondary,
                        fontSize: "0.9rem",
                      }}
                    >
                      Once submitted, responses cannot be edited or withdrawn
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              <Divider />

              {/* Section 5: Technical Requirements */}
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: COLORS.neutral.text,
                    mb: 2,
                    fontSize: "1.1rem",
                  }}
                >
                  Technical Requirements
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: COLORS.neutral.textSecondary,
                    lineHeight: 1.8,
                    fontSize: "0.95rem",
                  }}
                >
                  Ensure stable internet connectivity, use a compatible modern
                  browser, and close unnecessary applications to maintain
                  optimal performance throughout the assessment.
                </Typography>
              </Box>

              <Divider />

              {/* Section 6: Acknowledgment */}
              <Alert
                severity="info"
                icon={<AlertCircle size={24} />}
                sx={{
                  backgroundColor: COLORS.primary.lighter,
                  border: `1px solid ${COLORS.primary.light}`,
                  "& .MuiAlert-icon": {
                    color: COLORS.primary.main,
                  },
                  borderRadius: 1.5,
                }}
              >
                <AlertTitle
                  sx={{ fontWeight: 700, color: COLORS.primary.main, mb: 1 }}
                >
                  Acknowledgment of Terms
                </AlertTitle>
                <Typography
                  variant="body2"
                  sx={{ color: COLORS.primary.main, fontSize: "0.9rem" }}
                >
                  By clicking "Start Assessment," I acknowledge that I have
                  read, understood, and agree to comply with all instructions
                  and guidelines outlined above. I understand that any violation
                  of these terms may result in assessment termination,
                  invalidation of my responses, and potential disciplinary
                  action.
                </Typography>
              </Alert>
            </Stack>
          </Box>

          {/* Footer Section */}
          <Box
            sx={{
              backgroundColor: COLORS.neutral.bg,
              p: 4,
              display: "flex",
              gap: 2,
              borderTop: `1px solid ${COLORS.neutral.border}`,
            }}
          >
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={onStartAssessment}
              fullWidth
              endIcon={
                <>
                  {startTest.isPending ? (
                    <Sync
                      sx={{
                        animation: "spin 1s linear infinite",
                      }}
                      color="inherit"
                    />
                  ) : (
                    <StartOutlined />
                  )}
                </>
              }
              sx={{
                textTransform: "none",
                fontWeight: 600,
                fontSize: "1rem",
                py: 1.75,
                backgroundColor: COLORS.primary.main,
                "&:hover": {
                  backgroundColor: COLORS.primary.dark,
                },
              }}
            >
              {startTest.isPending ? "Starting..." : "Start Assessment"}
            </Button>
          </Box>
        </Box>

        {/* Disclaimer */}
        <Typography
          variant="caption"
          sx={{
            display: "block",
            mt: 3,
            textAlign: "center",
            color: COLORS.neutral.textTertiary,
            fontSize: "0.85rem",
          }}
        >
          This assessment is monitored for integrity and authenticity. All
          activities are logged and tracked for verification purposes.
        </Typography>
      </Container>
    </Box>
  );
}
