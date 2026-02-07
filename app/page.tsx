"use client";
import { useState } from "react";
import {
  AppBar,
  Toolbar,
  Container,
  Box,
  Typography,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { NEXT_PUBLIC_API_URL } from "@/constants/config";
import Image from "next/image";

// Styled Components
const StyledAppBar = styled(AppBar)({
  backgroundColor: "rgba(0, 0, 0, 0.95)",
  backdropFilter: "blur(20px)",
  borderBottom: "1px solid rgba(59, 130, 246, 0.1)",
  boxShadow: "0 4px 30px rgba(0, 0, 0, 0.5)",
});

const StyledButton = styled(Button)(({ theme, variant }) => ({
  borderRadius: "12px",
  textTransform: "none",
  fontSize: "1rem",
  ...(variant === "contained" && {
    background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
    color: "white",
    fontWeight: 600,
    padding: "12px 36px",
    boxShadow: "0 8px 32px rgba(59, 130, 246, 0.3)",
    "&:hover": {
      background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
      transform: "translateY(-2px)",
      boxShadow: "0 12px 40px rgba(59, 130, 246, 0.4)",
    },
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  }),
}));

const HeroBackground = styled(Box)({
  minHeight: "100vh",
  background: "#000000",
  backgroundImage: `
    radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(139, 92, 246, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, rgba(236, 72, 153, 0.05) 0%, transparent 70%)
  `,
  color: "white",
  position: "relative",
  overflow: "hidden",
  display: "flex",
  alignItems: "center",
  pt: 4,
  pb: 4,
});

const FormCard = styled(Box)({
  backgroundColor: "rgba(10, 10, 10, 0.8)",
  border: "2px solid rgba(59, 130, 246, 0.3)",
  borderRadius: "20px",
  backdropFilter: "blur(30px)",
  padding: "40px",
  boxShadow: "0 24px 80px rgba(0, 0, 0, 0.8)",
});

const FormDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    backgroundColor: "rgba(10, 10, 10, 0.98)",
    border: "2px solid rgba(59, 130, 246, 0.3)",
    borderRadius: "20px",
    color: "#fff",
    backdropFilter: "blur(30px)",
    boxShadow: "0 24px 80px rgba(0, 0, 0, 0.8)",
  },
}));

const ASSESSMENT_ID_EASY = "6984415ac5f11adf882af70c";
const ASSESSMENT_ID_HARD = "69844287c5f11adf882afdb0";

export default function Page() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    skillLevel: "easy",
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showError, setShowError] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [confirmationInput, setConfirmationInput] = useState("");
  const [confirmationError, setConfirmationError] = useState("");

  const handleFormChange = (e:any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOpenConfirmDialog = async (e:any) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setErrorMessage("Please enter your full name");
      setShowError(true);
      return;
    }

    if (!formData.email.trim()) {
      setErrorMessage("Please enter your email address");
      setShowError(true);
      return;
    }

    // Reset confirmation state
    setConfirmationInput("");
    setConfirmationError("");
    setOpenConfirmDialog(true);
  };

  const handleConfirmationSubmit = async () => {
    const expectedInput = formData.skillLevel;

    if (confirmationInput.toLowerCase() !== expectedInput.toLowerCase()) {
      setConfirmationError(
        `Please type "${expectedInput}" to confirm your skill level`
      );
      return;
    }

    setLoading(true);
    setConfirmationError("");

    try {
      const response = await fetch(
        NEXT_PUBLIC_API_URL + "/api/v1/user/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            skillLevel: formData.skillLevel,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setErrorMessage(data.error || "Failed to register. Please try again.");
        setShowError(true);
        setOpenConfirmDialog(false);
        setLoading(false);
        return;
      }

      const { userId } = data;
      let selectedAssessmentId = ASSESSMENT_ID_EASY;

      if (
        formData.skillLevel === "medium" ||
        formData.skillLevel === "hard"
      ) {
        selectedAssessmentId = ASSESSMENT_ID_HARD;
      }

      const assessmentUrl = `/user?assessmentId=${selectedAssessmentId}&userId=${userId}`;
      window.location.href = assessmentUrl;

      // Reset form
      setFormData({
        name: "",
        email: "",
        skillLevel: "easy",
      });
      setOpenConfirmDialog(false);
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again."
      );
      setShowError(true);
      setLoading(false);
    }
  };

  return (
    <>
      {/* Navigation */}
      <StyledAppBar position="fixed">
        <Toolbar>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1.5rem" }}>
            Knovia AI
          </Typography>
        </Toolbar>
      </StyledAppBar>

      {/* Main Content - Hero with Form */}
      <HeroBackground>
        <Container maxWidth="xl">
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
              gap: 6,
              px:4,
              alignItems: "center",
            }}
          >
            {/* Left Content */}
            <Box>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: "2.5rem", md: "3.5rem" },
                  mb: 3,
                  background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Test Your Assessment
              </Typography>

              <Typography
                variant="h5"
                sx={{
                  fontSize: "1.25rem",
                  mb: 4,
                  color: "rgba(255, 255, 255, 0.8)",
                }}
              >
                Take our AI-powered assessment and discover your strengths and
                areas for improvement
              </Typography>

              <Typography
                sx={{
                  fontSize: "1rem",
                  mb: 6,
                  color: "rgba(255, 255, 255, 0.6)",
                  lineHeight: 1.8,
                }}
              >
                Get instant, personalized feedback powered by cutting-edge
                artificial intelligence. Our adaptive assessment adjusts to your
                skill level in real-time to provide the most accurate evaluation
                of your abilities.
              </Typography>

              {/* Benefits */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Typography sx={{ fontSize: "1.5rem" }}>⚡</Typography>
                  <Box>
                    <Typography sx={{ fontWeight: 600 }}>
                      Instant Results
                    </Typography>
                    <Typography sx={{ color: "rgba(255, 255, 255, 0.6)" }}>
                      Get real-time feedback immediately
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", gap: 2 }}>
                  <Typography sx={{ fontSize: "1.5rem" }}>🎯</Typography>
                  <Box>
                    <Typography sx={{ fontWeight: 600 }}>
                      Personalized
                    </Typography>
                    <Typography sx={{ color: "rgba(255, 255, 255, 0.6)" }}>
                      Adapts to your skill level
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", gap: 2 }}>
                  <Typography sx={{ fontSize: "1.5rem" }}>🔒</Typography>
                  <Box>
                    <Typography sx={{ fontWeight: 600 }}>Secure</Typography>
                    <Typography sx={{ color: "rgba(255, 255, 255, 0.6)" }}>
                      Enterprise-grade protection
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Right - Form */}
            <Box>
              <form
                onSubmit={handleOpenConfirmDialog}
                style={{ display: "flex", flexDirection: "column", gap: "30px" }}
              >
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                  Start Your Assessment
                </Typography>

                {/* Error Alert */}
                {showError && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    ⚠️ {errorMessage}
                  </Alert>
                )}

                {/* Name Field */}
                <TextField
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  fullWidth
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      color: "white",
                      "& fieldset": {
                        borderColor: "rgba(59, 130, 246, 0.3)",
                      },
                      "&:hover fieldset": {
                        borderColor: "rgba(59, 130, 246, 0.5)",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#3b82f6",
                      },
                    },
                    "& .MuiInputBase-input::placeholder": {
                      color: "rgba(255, 255, 255, 0.5)",
                      opacity: 1,
                    },
                    "& .MuiInputLabel-root": {
                      color: "rgba(255, 255, 255, 0.7)",
                    },
                  }}
                  placeholder="John Doe"
                />

                {/* Email Field */}
                <TextField
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  fullWidth
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      color: "white",
                      "& fieldset": {
                        borderColor: "rgba(59, 130, 246, 0.3)",
                      },
                      "&:hover fieldset": {
                        borderColor: "rgba(59, 130, 246, 0.5)",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#3b82f6",
                      },
                    },
                    "& .MuiInputBase-input::placeholder": {
                      color: "rgba(255, 255, 255, 0.5)",
                      opacity: 1,
                    },
                    "& .MuiInputLabel-root": {
                      color: "rgba(255, 255, 255, 0.7)",
                    },
                  }}
                  placeholder="you@example.com"
                />

                {/* Skill Level Dropdown */}
                <FormControl fullWidth>
                  <InputLabel
                    sx={{
                      color: "rgba(255, 255, 255, 0.7)",
                      "&.Mui-focused": {
                        color: "#3b82f6",
                      },
                    }}
                  >
                    Skill Level
                  </InputLabel>
                  <Select
                    name="skillLevel"
                    value={formData.skillLevel}
                    onChange={handleFormChange}
                    label="Skill Level"
                    sx={{
                      color: "white",
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(59, 130, 246, 0.3)",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(59, 130, 246, 0.5)",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#3b82f6",
                      },
                      "& .MuiSvgIcon-root": {
                        color: "rgba(255, 255, 255, 0.7)",
                      },
                    }}
                  >
                    <MenuItem value="easy">🟢 Easy - Beginner</MenuItem>
                    <MenuItem value="medium">🟡 Medium - Intermediate</MenuItem>
                  </Select>
                </FormControl>

                {/* Submit Button */}
                <StyledButton
                  variant="contained"
                  type="submit"
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  Continue to Confirmation →
                </StyledButton>

                {/* Privacy Note */}
                <Typography
                  sx={{
                    fontSize: "0.875rem",
                    color: "rgba(255, 255, 255, 0.5)",
                    textAlign: "center",
                    mt: 2,
                  }}
                >
                  🔒 Your responses are secure and private
                </Typography>
              </form>
            </Box>
          </Box>
        </Container>
      </HeroBackground>

      {/* Confirmation Dialog */}
      <FormDialog
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1.25rem" }}>
          Confirm Your Skill Level
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          {/* Information Text */}
          <Typography sx={{ mb: 3 }}>
            You're about to start an assessment tailored to your skill level:{" "}
            <strong>{formData.skillLevel}</strong>
          </Typography>

          <Typography sx={{ mb: 3, color: "rgba(255, 255, 255, 0.8)" }}>
            This assessment will:
          </Typography>

          <Box sx={{ mb: 3, pl: 2 }}>
            <Typography sx={{ mb: 1 }}>
              • Adapt questions to match your ability level
            </Typography>
            <Typography sx={{ mb: 1 }}>
              • Provide personalized insights on your performance
            </Typography>
            <Typography>
              • Save your results for future reference
            </Typography>
          </Box>

          <Typography sx={{ mb: 3, fontWeight: 600 }}>
            Please type "{formData.skillLevel}" below to confirm and begin.
          </Typography>

          {/* Confirmation Error Alert */}
          {confirmationError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {confirmationError}
            </Alert>
          )}

          {/* Confirmation Input Field */}
          <TextField
            fullWidth
            placeholder={`Type "${formData.skillLevel}" to confirm`}
            value={confirmationInput}
            onChange={(e) => setConfirmationInput(e.target.value)}
            variant="outlined"
            autoFocus
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleConfirmationSubmit();
              }
            }}
            sx={{
              mb: 3,
              "& .MuiOutlinedInput-root": {
                color: "white",
                "& fieldset": {
                  borderColor: "rgba(59, 130, 246, 0.3)",
                },
                "&:hover fieldset": {
                  borderColor: "rgba(59, 130, 246, 0.5)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#3b82f6",
                },
              },
              "& .MuiInputBase-input::placeholder": {
                color: "rgba(255, 255, 255, 0.5)",
                opacity: 1,
              },
            }}
          />

          <Typography
            sx={{
              fontSize: "0.875rem",
              color: "rgba(255, 255, 255, 0.5)",
              textAlign: "center",
            }}
          >
            🔒 Your responses are secure and private
          </Typography>
        </DialogContent>

        {/* Button Group */}
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setOpenConfirmDialog(false)}
            disabled={loading}
            sx={{
              borderColor: "rgba(255, 255, 255, 0.3)",
              color: "rgba(255, 255, 255, 0.7)",
              borderRadius: "12px",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.05)",
              },
            }}
            variant="outlined"
          >
            Back
          </Button>
          <StyledButton
            onClick={handleConfirmationSubmit}
            variant="contained"
            disabled={loading}
          >
            {loading ? (
              <>
                <CircularProgress
                  size={20}
                  sx={{ mr: 1, color: "white" }}
                />
                Starting...
              </>
            ) : (
              "Start Assessment →"
            )}
          </StyledButton>
        </DialogActions>
      </FormDialog>
    </>
  );
}