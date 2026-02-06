"use client";
import { useState } from "react";
import {
  AppBar,
  Toolbar,
  Button,
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Paper,
  Link,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Chip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { NEXT_PUBLIC_API_URL } from "@/constants/config";
import Image from "next/image";

// Styled Components - Enhanced Dark Mode
const GradientText = styled(Typography)(({ theme }) => ({
  background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)",
  backgroundClip: "text",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  fontWeight: "bold",
}));

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
  ...(variant === "outlined" && {
    borderColor: "rgba(59, 130, 246, 0.4)",
    borderWidth: "2px",
    color: "#60a5fa",
    fontWeight: 600,
    padding: "10px 32px",
    "&:hover": {
      backgroundColor: "rgba(59, 130, 246, 0.1)",
      borderColor: "rgba(59, 130, 246, 0.6)",
      borderWidth: "2px",
    },
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
});

const FeatureCard = styled(Card)(({ theme }) => ({
  backgroundColor: "rgba(15, 15, 15, 0.8)",
  border: "1px solid rgba(59, 130, 246, 0.2)",
  borderRadius: "16px",
  backdropFilter: "blur(20px)",
  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "3px",
    background: "linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899)",
    opacity: 0,
    transition: "opacity 0.4s ease",
  },
  "&:hover": {
    borderColor: "rgba(59, 130, 246, 0.5)",
    transform: "translateY(-8px)",
    boxShadow: "0 20px 60px rgba(59, 130, 246, 0.2)",
    "&::before": {
      opacity: 1,
    },
  },
}));

const StatCard = styled(Card)({
  backgroundColor: "rgba(10, 10, 10, 0.9)",
  border: "1px solid rgba(59, 130, 246, 0.15)",
  borderRadius: "16px",
  backdropFilter: "blur(20px)",
  transition: "all 0.3s ease",
  "&:hover": {
    borderColor: "rgba(59, 130, 246, 0.4)",
    transform: "scale(1.05)",
    boxShadow: "0 12px 40px rgba(0, 0, 0, 0.5)",
  },
});

const CTASection = styled(Paper)(({ theme }) => ({
  background:
    "linear-gradient(135deg, rgba(15, 15, 15, 0.95) 0%, rgba(20, 20, 20, 0.95) 100%)",
  border: "2px solid rgba(59, 130, 246, 0.3)",
  borderRadius: "24px",
  backdropFilter: "blur(20px)",
  padding: theme.spacing(8),
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      radial-gradient(circle at 30% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 70% 50%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)
    `,
  },
}));

const FormDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    backgroundColor: "rgba(10, 10, 10, 0.98)",
    border: "2px solid rgba(59, 130, 246, 0.3)",
    borderRadius: "20px",
    color:"#fff",
    backdropFilter: "blur(30px)",
    boxShadow: "0 24px 80px rgba(0, 0, 0, 0.8)",
  },
}));

const GlowingIconBox = styled(Box)({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "64px",
  height: "64px",
  borderRadius: "16px",
  background:
    "linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))",
  border: "1px solid rgba(59, 130, 246, 0.3)",
  fontSize: "2rem",
  marginBottom: "16px",
  transition: "all 0.3s ease",
});

const features = [
  {
    icon: "🧠",
    title: "Adaptive Learning",
    desc: "AI adjusts difficulty in real-time based on learner performance",
    color: "#3b82f6",
  },
  {
    icon: "⚡",
    title: "Instant Feedback",
    desc: "Immediate insights help learners understand their strengths",
    color: "#8b5cf6",
  },
  {
    icon: "📊",
    title: "Advanced Analytics",
    desc: "Detailed reports reveal learning patterns and progress",
    color: "#ec4899",
  },
  {
    icon: "🛡️",
    title: "Secure & Compliant",
    desc: "Enterprise-grade security with full data protection",
    color: "#10b981",
  },
  {
    icon: "👥",
    title: "Collaboration Tools",
    desc: "Enable seamless group assessments and peer learning",
    color: "#f59e0b",
  },
  {
    icon: "🚀",
    title: "Lightning Fast",
    desc: "Powered by cutting-edge AI for instant responses",
    color: "#06b6d4",
  },
];

const stats = [
  { value: "94%", label: "Assessment Accuracy", color: "#3b82f6" },
  { value: "35%", label: "Faster Learning Growth", color: "#8b5cf6" },
  { value: "99.5%", label: "Uptime Guarantee", color: "#ec4899" },
];

const ASSESSMENT_ID_EASY = "6984415ac5f11adf882af70c";
const ASSESSMENT_ID_HARD = "69844287c5f11adf882afdb0";

export default function Page() {
  const [email, setEmail] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    skillLevel: "easy",
  });
  const [loading, setLoading] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showError, setShowError] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [confirmationInput, setConfirmationInput] = useState("");
  const [confirmationError, setConfirmationError] = useState("");

  const handleTryNow = () => {
    setOpenForm(true);
    setErrorMessage("");
    setShowError(false);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setErrorMessage("");
    setShowError(false);
  };

  const handleFormChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOpenConfirmDialog = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form fields on client side
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

    // Open confirmation dialog instead of submitting directly
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
      // Call API to register user and get userId
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

      // Check if API returned success: false
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

      // Select assessment ID based on skill level
      let selectedAssessmentId = ASSESSMENT_ID_EASY;
      if (
        formData.skillLevel === "medium" ||
        formData.skillLevel === "hard"
      ) {
        selectedAssessmentId = ASSESSMENT_ID_HARD;
      }

      // Navigate to assessment URL with userId and selected assessment ID
      const assessmentUrl = `/user?assessmentId=${selectedAssessmentId}&userId=${userId}`;
      window.location.href = assessmentUrl;

      // Reset form
      setFormData({
        name: "",
        email: "",
        skillLevel: "easy",
      });
      setOpenForm(false);
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

  const handleGetStarted = () => {
    setOpenForm(true);
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
          <Box sx={{ display: "flex", gap: 2 }}>
            <StyledButton variant="outlined">Start Assessment</StyledButton>
            <StyledButton variant="outlined">Sign In</StyledButton>
          </Box>
        </Toolbar>
      </StyledAppBar>

      {/* Hero Section */}
      <HeroBackground>
        <Container maxWidth="lg" sx={{ pt: 12, pb: 8 }}>
          {/* Hero Content */}
          <Box sx={{ textAlign: "center", mb: 12 }}>
            <GradientText variant="h2" sx={{ mb: 3, fontSize: "3.5rem" }}>
              AI-Powered Assessments
            </GradientText>
            <Typography
              variant="h5"
              sx={{
                color: "rgba(255, 255, 255, 0.8)",
                mb: 4,
                maxWidth: "600px",
                mx: "auto",
              }}
            >
              Transform Learning with Intelligent Assessments
            </Typography>
            <Typography
              sx={{
                color: "rgba(255, 255, 255, 0.6)",
                mb: 6,
                maxWidth: "700px",
                mx: "auto",
                fontSize: "1.1rem",
                lineHeight: 1.8,
              }}
            >
              Knovia AI delivers adaptive, personalized assessments that
              understand each learner. Measure progress, identify gaps, and
              unlock potential with cutting-edge AI technology.
            </Typography>
            <Box sx={{ display: "flex", gap: 3, justifyContent: "center" }}>
              <StyledButton
                variant="contained"
                onClick={handleGetStarted}
                sx={{ fontSize: "1.1rem" }}
              >
                Get Started Free →
              </StyledButton>
              <Button
                variant="outlined"
                sx={{
                  borderColor: "rgba(255, 255, 255, 0.3)",
                  color: "white",
                  borderRadius: "12px",
                  padding: "12px 36px",
                  fontSize: "1rem",
                  fontWeight: 600,
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    borderColor: "rgba(255, 255, 255, 0.5)",
                  },
                }}
              >
                🎯 Start Assessment
              </Button>
            </Box>
          </Box>

          {/* Hero Stats */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(3, 1fr)",
              },
              gap: 4,
              mb: 8,
            }}
          >
            {stats.map((stat, idx) => (
              <StatCard key={idx}>
                <CardContent sx={{ textAlign: "center", py: 4 }}>
                  <Typography
                    variant="h4"
                    sx={{
                      color: stat.color,
                      fontWeight: 700,
                      mb: 1,
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
                    {stat.label}
                  </Typography>
                </CardContent>
              </StatCard>
            ))}
          </Box>
        </Container>
      </HeroBackground>

      {/* Features Section */}
      <Box
        sx={{
          background: "#000000",
          py: 12,
          backgroundImage: `
            radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 80% 50%, rgba(139, 92, 246, 0.05) 0%, transparent 50%)
          `,
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 12 }}>
            <GradientText variant="h3" sx={{ mb: 2 }}>
              Powerful Features
            </GradientText>
            <Typography sx={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "1.1rem" }}>
              Everything you need to create engaging, effective assessments
            </Typography>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
              },
              gap: 4,
            }}
          >
            {features.map((feature, idx) => (
              <FeatureCard key={idx}>
                <CardContent sx={{ p: 4 }}>
                  <GlowingIconBox>{feature.icon}</GlowingIconBox>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      mb: 2,
                      color: "white",
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography sx={{ color: "rgba(255, 255, 255, 0.6)" }}>
                    {feature.desc}
                  </Typography>
                </CardContent>
              </FeatureCard>
            ))}
          </Box>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Box sx={{ background: "#000000", py: 12 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 12 }}>
            <GradientText variant="h3" sx={{ mb: 2 }}>
              How Knovia AI Works
            </GradientText>
            <Typography sx={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "1.1rem" }}>
              Experience intelligent assessments in three simple steps
            </Typography>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(3, 1fr)",
              },
              gap: 6,
            }}
          >
            {[
              {
                num: "1",
                title: "Create Your Assessment",
                desc: "Choose from our pre-built templates or create custom assessments tailored to your learning objectives. Our AI helps you design effective questions.",
              },
              {
                num: "2",
                title: "AI Adapts in Real-Time",
                desc: "As learners take the assessment, our AI dynamically adjusts difficulty based on their responses, ensuring an optimal challenge level for everyone.",
              },
              {
                num: "3",
                title: "Get Actionable Insights",
                desc: "Receive comprehensive analytics and personalized recommendations to help learners improve. Track progress over time with detailed reports.",
              },
            ].map((step, idx) => (
              <Card
                key={idx}
                sx={{
                  backgroundColor: "rgba(15, 15, 15, 0.8)",
                  border: "1px solid rgba(59, 130, 246, 0.2)",
                  borderRadius: "16px",
                  backdropFilter: "blur(20px)",
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Typography
                    sx={{
                      fontSize: "3rem",
                      fontWeight: 700,
                      color: "#3b82f6",
                      mb: 2,
                    }}
                  >
                    {step.num}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                    {step.title}
                  </Typography>
                  <Typography sx={{ color: "rgba(255, 255, 255, 0.6)" }}>
                    {step.desc}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Benefits Section */}
      <Box
        sx={{
          background: "#000000",
          py: 12,
          backgroundImage: `
            radial-gradient(circle at 30% 30%, rgba(236, 72, 153, 0.05) 0%, transparent 50%)
          `,
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 12 }}>
            <GradientText variant="h3" sx={{ mb: 2 }}>
              Why Choose Knovia AI?
            </GradientText>
            <Typography sx={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "1.1rem" }}>
              Join thousands of educators and institutions transforming their
              assessment process
            </Typography>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(2, 1fr)",
              },
              gap: 4,
              mb: 8,
            }}
          >
            {[
              {
                title: "Save Time & Resources",
                desc: "Automate grading and assessment creation, reducing administrative burden by up to 70% while improving accuracy.",
              },
              {
                title: "Personalized Learning Paths",
                desc: "AI identifies individual strengths and weaknesses, creating customized learning recommendations for each student.",
              },
              {
                title: "Data-Driven Decisions",
                desc: "Make informed decisions with comprehensive analytics, trend analysis, and predictive insights about learner performance.",
              },
              {
                title: "Scalable & Flexible",
                desc: "From individual educators to large institutions, our platform scales seamlessly to meet your needs without compromising quality.",
              },
            ].map((benefit, idx) => (
              <Card
                key={idx}
                sx={{
                  backgroundColor: "rgba(15, 15, 15, 0.8)",
                  border: "1px solid rgba(59, 130, 246, 0.2)",
                  borderRadius: "16px",
                  backdropFilter: "blur(20px)",
                  p: 2,
                }}
              >
                <CardContent>
                  <Typography sx={{ color: "#10b981", mb: 1 }}>
                    ✓
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                    {benefit.title}
                  </Typography>
                  <Typography sx={{ color: "rgba(255, 255, 255, 0.6)" }}>
                    {benefit.desc}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ background: "#000000", py: 12 }}>
        <Container maxWidth="md">
          <CTASection>
            <Box sx={{ position: "relative", zIndex: 1, textAlign: "center" }}>
              <GradientText variant="h3" sx={{ mb: 3 }}>
                Try Demo Assessment Now →
              </GradientText>
              <Typography
                sx={{
                  color: "rgba(255, 255, 255, 0.7)",
                  mb: 6,
                  fontSize: "1.1rem",
                }}
              >
                🔒 No registration required for demo • Experience AI-powered
                assessments instantly
              </Typography>
              <StyledButton variant="contained" onClick={handleGetStarted}>
                Start Your Assessment
              </StyledButton>
            </Box>
          </CTASection>
        </Container>
      </Box>

      {/* Assessment Sign Up Form Dialog */}
      <FormDialog open={openForm} onClose={handleCloseForm} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: "1.5rem", fontWeight: 700, pb: 1 }}>
          Start Your Assessment
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleOpenConfirmDialog} sx={{ mt: 2 }}>
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
              sx={{ py: 1.5 }}
            >
              Continue to Confirmation →
            </StyledButton>

            <Typography
              sx={{
                textAlign: "center",
                mt: 2,
                color: "rgba(255, 255, 255, 0.5)",
                fontSize: "0.9rem",
              }}
            >
              🔒 Your responses are secure and private
            </Typography>
          </Box>
        </DialogContent>
      </FormDialog>

      {/* Confirmation Dialog */}
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
            {/* Instructions */}
            <Box
              sx={{
                backgroundColor: "rgba(59, 130, 246, 0.1)",
                border: "1px solid rgba(59, 130, 246, 0.3)",
                borderRadius: "12px",
                p: 3,
                mb: 4,
              }}
            >
              <Typography sx={{ color: "rgba(255, 255, 255, 0.8)", mb: 1 }}>
                You selected:{" "}
                <span
                  style={{
                    fontWeight: 700,
                    color: "#60a5fa",
                    textTransform: "capitalize",
                  }}
                >
                  {formData.skillLevel}
                </span>
              </Typography>
              <Typography sx={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "0.95rem" }}>
                Please type "{formData.skillLevel}" below to confirm and begin your
                assessment.
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

      {/* Footer */}
      <Box
        sx={{
          background: "#000000",
          borderTop: "1px solid rgba(59, 130, 246, 0.1)",
          py: 8,
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(4, 1fr)",
              },
              gap: 4,
              mb: 6,
            }}
          >
            <Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, mb: 2, color: "white" }}
              >
                Knovia AI
              </Typography>
              <Typography sx={{ color: "rgba(255, 255, 255, 0.6)" }}>
                Building the future of intelligent assessments
              </Typography>
            </Box>
            {[
              { label: "Product", links: ["Features", "Pricing", "Blog"] },
              { label: "Company", links: ["About", "Careers", "Contact"] },
              { label: "Legal", links: ["Privacy", "Terms", "Security"] },
            ].map((col, idx) => (
              <Box key={idx}>
                <Typography
                  sx={{
                    fontWeight: 700,
                    mb: 2,
                    color: "rgba(255, 255, 255, 0.8)",
                  }}
                >
                  {col.label}
                </Typography>
                {col.links.map((link, i) => (
                  <Link
                    key={i}
                    href="#"
                    sx={{
                      display: "block",
                      color: "rgba(255, 255, 255, 0.6)",
                      textDecoration: "none",
                      mb: 1,
                      "&:hover": { color: "#60a5fa" },
                    }}
                  >
                    {link}
                  </Link>
                ))}
              </Box>
            ))}
          </Box>

          <Box
            sx={{
              borderTop: "1px solid rgba(59, 130, 246, 0.1)",
              pt: 4,
              textAlign: "center",
              color: "rgba(255, 255, 255, 0.5)",
            }}
          >
            <Typography>
              © 2024 Knovia AI. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </>
  );
}