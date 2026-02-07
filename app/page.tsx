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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
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

  const handleFormChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOpenConfirmDialog = async (e: React.FormEvent) => {
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

      if (!data.success) {
        setErrorMessage(data.error || "Failed to register. Please try again.");
        setShowError(true);
        setLoading(false);
        setOpenConfirmDialog(false);
        return;
      }

      if (!response.ok) {
        setErrorMessage(data.error || "Failed to register. Please try again.");
        setShowError(true);
        setLoading(false);
        setOpenConfirmDialog(false);
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Navigation */}
      <StyledAppBar>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Image
              src="/logo.png"
              alt="Knovia AI"
              width={32}
              height={32}
              priority
            />
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, fontSize: "1.25rem" }}
            >
              Knovia AI
            </Typography>
          </Box>
        </Toolbar>
      </StyledAppBar>

      {/* Main Content - Hero with Form */}
      <HeroBackground>
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
              gap: 6,
              alignItems: "center",
            }}
          >
            {/* Left Content */}
            <Box>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 700,
                  mb: 3,
                  fontSize: { xs: "2.5rem", md: "3.5rem" },
                  background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Test Your Assessment
              </Typography>
              <Typography
                sx={{
                  color: "rgba(255, 255, 255, 0.8)",
                  mb: 3,
                  fontSize: "1.2rem",
                  lineHeight: 1.7,
                }}
              >
                Take our AI-powered assessment and discover your strengths and areas for improvement
              </Typography>
              <Typography
                sx={{
                  color: "rgba(255, 255, 255, 0.6)",
                  mb: 6,
                  fontSize: "1rem",
                  lineHeight: 1.8,
                }}
              >
                Get instant, personalized feedback powered by cutting-edge artificial intelligence. Our adaptive assessment adjusts to your skill level in real-time to provide the most accurate evaluation of your abilities.
              </Typography>

              {/* Benefits */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                  <Typography sx={{ fontSize: "1.5rem" }}>⚡</Typography>
                  <Box>
                    <Typography sx={{ fontWeight: 600, color: "white", mb: 0.5 }}>
                      Instant Results
                    </Typography>
                    <Typography sx={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "0.9rem" }}>
                      Get real-time feedback immediately
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                  <Typography sx={{ fontSize: "1.5rem" }}>🎯</Typography>
                  <Box>
                    <Typography sx={{ fontWeight: 600, color: "white", mb: 0.5 }}>
                      Personalized
                    </Typography>
                    <Typography sx={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "0.9rem" }}>
                      Adapts to your skill level
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                  <Typography sx={{ fontSize: "1.5rem" }}>🔒</Typography>
                  <Box>
                    <Typography sx={{ fontWeight: 600, color: "white", mb: 0.5 }}>
                      Secure
                    </Typography>
                    <Typography sx={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "0.9rem" }}>
                      Enterprise-grade protection
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Right - Form */}
            <FormCard  onSubmit={handleOpenConfirmDialog}>
              <Typography sx={{ fontSize: "1.5rem", fontWeight: 700, mb: 4, color: "white" }}>
                Start Your Assessment
              </Typography>

              {/* Error Alert */}
              {showError && (
                <Box
                  sx={{
                    backgroundColor: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    borderRadius: "12px",
                    p: 2,
                    mb: 3,
                    color: "#fca5a5",
                  }}
                >
                  ⚠️ {errorMessage}
                </Box>
              )}

              {/* Name Field */}
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                variant="outlined"
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
                  "& .MuiInputLabel-root": {
                    color: "rgba(255, 255, 255, 0.7)",
                  },
                }}
              />

              {/* Email Field */}
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleFormChange}
                variant="outlined"
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
                  "& .MuiInputLabel-root": {
                    color: "rgba(255, 255, 255, 0.7)",
                  },
                }}
              />

              {/* Skill Level Dropdown */}
              <FormControl fullWidth sx={{ mb: 3 }}>
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
                  <MenuItem
                    value="easy"
                    sx={{
                      backgroundColor: "rgba(10, 10, 10, 0.95)",
                      color: "white",
                      "&:hover": {
                        backgroundColor: "rgba(59, 130, 246, 0.2)",
                      },
                    }}
                  >
                    🟢 Easy - Beginner
                  </MenuItem>
                  <MenuItem
                    value="medium"
                    sx={{
                      backgroundColor: "rgba(10, 10, 10, 0.95)",
                      color: "white",
                      "&:hover": {
                        backgroundColor: "rgba(59, 130, 246, 0.2)",
                      },
                    }}
                  >
                    🟡 Medium - Intermediate
                  </MenuItem>
                  <MenuItem
                    value="hard"
                    sx={{
                      backgroundColor: "rgba(10, 10, 10, 0.95)",
                      color: "white",
                      "&:hover": {
                        backgroundColor: "rgba(59, 130, 246, 0.2)",
                      },
                    }}
                  >
                    🔴 Hard - Advanced
                  </MenuItem>
                </Select>
              </FormControl>

              {/* Submit Button */}
              <StyledButton
                type="submit"
                variant="contained"
                fullWidth
                sx={{ py: 1.5, mb: 2 }}
              >
                Continue to Confirmation →
              </StyledButton>

              <Typography
                sx={{
                  textAlign: "center",
                  color: "rgba(255, 255, 255, 0.5)",
                  fontSize: "0.85rem",
                }}
              >
                🔒 Your responses are secure and private
              </Typography>
            </FormCard>
          </Box>
        </Container>
      </HeroBackground>

      {/* Confirmation Dialog with Text */}
      <FormDialog
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontSize: "1.5rem", fontWeight: 700, pb: 1 }}>
          Confirm Your Skill Level
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {/* Information Text */}
            <Box
              sx={{
                backgroundColor: "rgba(59, 130, 246, 0.05)",
                border: "1px solid rgba(59, 130, 246, 0.3)",
                borderRadius: "12px",
                p: 3,
                mb: 4,
              }}
            >
              <Typography sx={{ color: "rgba(255, 255, 255, 0.8)", mb: 2 }}>
                You're about to start an assessment tailored to your skill level:
              </Typography>
              <Typography
                sx={{
                  fontWeight: 700,
                  color: "#60a5fa",
                  textTransform: "capitalize",
                  mb: 2,
                  fontSize: "1.1rem",
                }}
              >
                {formData.skillLevel}
              </Typography>
              <Typography sx={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "0.95rem", mb: 2 }}>
                This assessment will:
              </Typography>
              <Box component="ul" sx={{ color: "rgba(255, 255, 255, 0.6)", pl: 2, mb: 2 }}>
                <Typography component="li" sx={{ mb: 1 }}>
                  Adapt questions to match your ability level
                </Typography>
                <Typography component="li" sx={{ mb: 1 }}>
                  Take approximately 15-30 minutes to complete
                </Typography>
                <Typography component="li" sx={{ mb: 1 }}>
                  Provide personalized insights on your performance
                </Typography>
                <Typography component="li">
                  Save your results for future reference
                </Typography>
              </Box>
              <Typography sx={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "0.9rem" }}>
                Please type "{formData.skillLevel}" below to confirm and begin.
              </Typography>
            </Box>

            {/* Confirmation Error Alert */}
            {confirmationError && (
              <Box
                sx={{
                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  borderRadius: "12px",
                  p: 2,
                  mb: 3,
                  color: "#fca5a5",
                }}
              >
                {confirmationError}
              </Box>
            )}

            {/* Confirmation Input Field */}
            <TextField
              fullWidth
              placeholder={`Type "${formData.skillLevel}" here`}
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

            {/* Button Group */}
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setOpenConfirmDialog(false)}
                sx={{
                  borderColor: "rgba(255, 255, 255, 0.3)",
                  color: "rgba(255, 255, 255, 0.7)",
                  borderRadius: "12px",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                  },
                }}
              >
                Back
              </Button>
              <StyledButton
                fullWidth
                variant="contained"
                onClick={handleConfirmationSubmit}
                disabled={loading}
              >
                {loading ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CircularProgress size={20} sx={{ color: "white" }} />
                    Starting...
                  </Box>
                ) : (
                  "Start Assessment →"
                )}
              </StyledButton>
            </Box>

            <Typography
              sx={{
                textAlign: "center",
                mt: 3,
                color: "rgba(255, 255, 255, 0.5)",
                fontSize: "0.85rem",
              }}
            >
              🔒 Your responses are secure and private
            </Typography>
          </Box>
        </DialogContent>
      </FormDialog>
    </>
  );
}