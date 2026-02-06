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
  background: "linear-gradient(135deg, rgba(15, 15, 15, 0.95) 0%, rgba(20, 20, 20, 0.95) 100%)",
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
  background: "linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))",
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

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setShowError(false);

    try {
      // Validate form fields on client side
      if (!formData.name.trim()) {
        setErrorMessage("Please enter your full name");
        setShowError(true);
        setLoading(false);
        return;
      }

      if (!formData.email.trim()) {
        setErrorMessage("Please enter your email address");
        setShowError(true);
        setLoading(false);
        return;
      }

      // Call API to register user and get userId
      const response = await fetch(NEXT_PUBLIC_API_URL + "/api/v1/user/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          skillLevel: formData.skillLevel,
        }),
      });

      const data = await response.json();

      // Check if API returned success: false
      if (!data.success) {
        setErrorMessage(data.error || "Failed to register. Please try again.");
        setShowError(true);
        setLoading(false);
        return;
      }

      if (!response.ok) {
        setErrorMessage(data.error || "Failed to register. Please try again.");
        setShowError(true);
        setLoading(false);
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
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again.",
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
      <StyledAppBar position="sticky">
        <Toolbar sx={{ py: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", flex: 1 }}>
            <Image src={"/logo.png"} height={40} width={200} alt="Loog"/>
          </Box>
          <Stack direction="row" spacing={2}>
            <StyledButton variant="outlined" onClick={handleTryNow} size="small">
              Start Assessment
            </StyledButton>
            <StyledButton variant="contained" size="small">
              Sign In
            </StyledButton>
          </Stack>
        </Toolbar>
      </StyledAppBar>

      {/* Hero Section */}
      <HeroBackground>
        <Container maxWidth="lg" sx={{ py: 16, position: "relative", zIndex: 1 }}>
          {/* Hero Content */}
          <Box sx={{ textAlign: "center", mb: 10 }}>
            <Chip
              label="✨ Powered by Advanced AI"
              sx={{
                mb: 3,
                backgroundColor: "rgba(59, 130, 246, 0.1)",
                border: "1px solid rgba(59, 130, 246, 0.3)",
                color: "#60a5fa",
                fontWeight: 600,
                fontSize: "0.9rem",
                padding: "4px 8px",
              }}
            />
            <Typography
              variant="h2"
              sx={{
                mb: 3,
                fontWeight: 800,
                fontSize: { xs: "2.5rem", md: "3.5rem" },
                lineHeight: 1.2,
                color: "white",
              }}
            >
              AI-Powered Assessments
            </Typography>
            <GradientText
              variant="h3"
              sx={{
                mb: 4,
                fontSize: { xs: "1.75rem", md: "2.5rem" },
                lineHeight: 1.3,
              }}
            >
              Transform Learning with Intelligent Assessments
            </GradientText>
            <Typography
              variant="h6"
              sx={{
                mb: 6,
                color: "white",
                maxWidth: 700,
                mx: "auto",
                lineHeight: 1.7,
                fontSize: "1.125rem",
                opacity: 0.9,
              }}
            >
              Knovia AI delivers adaptive, personalized assessments that
              understand each learner. Measure progress, identify gaps, and
              unlock potential with cutting-edge AI technology.
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} justifyContent="center">
              <StyledButton
                variant="contained"
                onClick={handleGetStarted}
                size="large"
                sx={{ minWidth: 200 }}
              >
                Get Started Free →
              </StyledButton>
              <StyledButton
                variant="outlined"
                onClick={handleTryNow}
                size="large"
                sx={{ minWidth: 200 }}
              >
                🎯 Start Assessment
              </StyledButton>
            </Stack>
          </Box>

          {/* Hero Stats */}
          <Box  sx={{ mb: 12 }}>
            {stats.map((stat, idx) => (
              <Box>
                <StatCard>
                  <CardContent sx={{ textAlign: "center", py: 3 }}>
                    <Typography
                      variant="h3"
                      sx={{
                        color: stat.color,
                        fontWeight: "bold",
                        mb: 1,
                        fontSize: { xs: "2rem", md: "2.5rem" },
                      }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "white",
                        fontSize: "0.95rem",
                        opacity: 0.8,
                      }}
                    >
                      {stat.label}
                    </Typography>
                  </CardContent>
                </StatCard>
             </Box>
            ))}
         </Box>

          {/* Features Section */}
          <Box sx={{ mb: 12 }}>
            <Box sx={{ textAlign: "center", mb: 8 }}>
              <Typography
                variant="h3"
                sx={{ fontWeight: "bold", mb: 2, fontSize: { xs: "2rem", md: "2.5rem" }, color: "white" }}
              >
                Powerful Features
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: "white", maxWidth: 600, mx: "auto", opacity: 0.8 }}
              >
                Everything you need to create engaging, effective assessments
              </Typography>
            </Box>
            <Box >
              {features.map((feature, idx) => (
                <Box  key={idx}>
                  <FeatureCard>
                    <CardContent sx={{ p: 4 }}>
                      <GlowingIconBox>{feature.icon}</GlowingIconBox>
                      <Typography
                        variant="h5"
                        sx={{
                          mb: 2,
                          fontWeight: "bold",
                          fontSize: "1.25rem",
                          color: "white",
                        }}
                      >
                        {feature.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "white",
                          lineHeight: 1.7,
                          fontSize: "1rem",
                          opacity: 0.9,
                        }}
                      >
                        {feature.desc}
                      </Typography>
                    </CardContent>
                  </FeatureCard>
               </Box>
              ))}
           </Box>
          </Box>

          {/* How It Works Section */}
          <Box sx={{ mb: 12 }}>
            <Box sx={{ textAlign: "center", mb: 8 }}>
              <Typography
                variant="h3"
                sx={{ fontWeight: "bold", mb: 2, fontSize: { xs: "2rem", md: "2.5rem" }, color: "white" }}
              >
                How Knovia AI Works
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: "white", maxWidth: 600, mx: "auto", opacity: 0.9 }}
              >
                Experience intelligent assessments in three simple steps
              </Typography>
            </Box>
            <Box>
              <Box >
                <FeatureCard>
                  <CardContent sx={{ p: 4, textAlign: "center" }}>
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 24px",
                        fontSize: "2.5rem",
                        fontWeight: "bold",
                        color: "white",
                      }}
                    >
                      1
                    </Box>
                    <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold", color: "white" }}>
                      Create Your Assessment
                    </Typography>
                    <Typography variant="body1" sx={{ color: "white", opacity: 0.9, lineHeight: 1.7 }}>
                      Choose from our pre-built templates or create custom assessments tailored to your learning objectives. Our AI helps you design effective questions.
                    </Typography>
                  </CardContent>
                </FeatureCard>
             </Box>
              <Box >
                <FeatureCard>
                  <CardContent sx={{ p: 4, textAlign: "center" }}>
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 24px",
                        fontSize: "2.5rem",
                        fontWeight: "bold",
                        color: "white",
                      }}
                    >
                      2
                    </Box>
                    <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold", color: "white" }}>
                      AI Adapts in Real-Time
                    </Typography>
                    <Typography variant="body1" sx={{ color: "white", opacity: 0.9, lineHeight: 1.7 }}>
                      As learners take the assessment, our AI dynamically adjusts difficulty based on their responses, ensuring an optimal challenge level for everyone.
                    </Typography>
                  </CardContent>
                </FeatureCard>
             </Box>
              <Box >
                <FeatureCard>
                  <CardContent sx={{ p: 4, textAlign: "center" }}>
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #ec4899, #10b981)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 24px",
                        fontSize: "2.5rem",
                        fontWeight: "bold",
                        color: "white",
                      }}
                    >
                      3
                    </Box>
                    <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold", color: "white" }}>
                      Get Actionable Insights
                    </Typography>
                    <Typography variant="body1" sx={{ color: "white", opacity: 0.9, lineHeight: 1.7 }}>
                      Receive comprehensive analytics and personalized recommendations to help learners improve. Track progress over time with detailed reports.
                    </Typography>
                  </CardContent>
                </FeatureCard>
             </Box>
           </Box>
          </Box>

          {/* Benefits Section */}
          <CTASection elevation={0}>
            <Box sx={{ position: "relative", zIndex: 1 }}>
              <Typography
                variant="h3"
                sx={{
                  mb: 3,
                  textAlign: "center",
                  fontWeight: "bold",
                  fontSize: { xs: "1.75rem", md: "2.25rem" },
                  color: "white",
                }}
              >
                Why Choose Knovia AI?
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  mb: 5,
                  textAlign: "center",
                  color: "white",
                  fontSize: "1.125rem",
                  opacity: 0.9,
                }}
              >
                Join thousands of educators and institutions transforming their assessment process
              </Typography>
              <Box >
                <Box>
                  <Box sx={{ display: "flex", alignItems: "start", mb: 3 }}>
                    <Box
                      sx={{
                        minWidth: 48,
                        height: 48,
                        borderRadius: "12px",
                        background: "linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2))",
                        border: "1px solid rgba(59, 130, 246, 0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mr: 3,
                        fontSize: "1.5rem",
                      }}
                    >
                      ✓
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ mb: 1, fontWeight: "bold", color: "white" }}>
                        Save Time & Resources
                      </Typography>
                      <Typography variant="body2" sx={{ color: "white", opacity: 0.85, lineHeight: 1.6 }}>
                        Automate grading and assessment creation, reducing administrative burden by up to 70% while improving accuracy.
                      </Typography>
                    </Box>
                  </Box>
               </Box>
                <Box>
                  <Box sx={{ display: "flex", alignItems: "start", mb: 3 }}>
                    <Box
                      sx={{
                        minWidth: 48,
                        height: 48,
                        borderRadius: "12px",
                        background: "linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2))",
                        border: "1px solid rgba(59, 130, 246, 0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mr: 3,
                        fontSize: "1.5rem",
                      }}
                    >
                      ✓
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ mb: 1, fontWeight: "bold", color: "white" }}>
                        Personalized Learning Paths
                      </Typography>
                      <Typography variant="body2" sx={{ color: "white", opacity: 0.85, lineHeight: 1.6 }}>
                        AI identifies individual strengths and weaknesses, creating customized learning recommendations for each student.
                      </Typography>
                    </Box>
                  </Box>
               </Box>
                <Box>
                  <Box sx={{ display: "flex", alignItems: "start", mb: 3 }}>
                    <Box
                      sx={{
                        minWidth: 48,
                        height: 48,
                        borderRadius: "12px",
                        background: "linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2))",
                        border: "1px solid rgba(59, 130, 246, 0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mr: 3,
                        fontSize: "1.5rem",
                      }}
                    >
                      ✓
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ mb: 1, fontWeight: "bold", color: "white" }}>
                        Data-Driven Decisions
                      </Typography>
                      <Typography variant="body2" sx={{ color: "white", opacity: 0.85, lineHeight: 1.6 }}>
                        Make informed decisions with comprehensive analytics, trend analysis, and predictive insights about learner performance.
                      </Typography>
                    </Box>
                  </Box>
               </Box>
                <Box>
                  <Box sx={{ display: "flex", alignItems: "start", mb: 3 }}>
                    <Box
                      sx={{
                        minWidth: 48,
                        height: 48,
                        borderRadius: "12px",
                        background: "linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2))",
                        border: "1px solid rgba(59, 130, 246, 0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mr: 3,
                        fontSize: "1.5rem",
                      }}
                    >
                      ✓
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ mb: 1, fontWeight: "bold", color: "white" }}>
                        Scalable & Flexible
                      </Typography>
                      <Typography variant="body2" sx={{ color: "white", opacity: 0.85, lineHeight: 1.6 }}>
                        From individual educators to large institutions, our platform scales seamlessly to meet your needs without compromising quality.
                      </Typography>
                    </Box>
                  </Box>
               </Box>
             </Box>
              <Box sx={{ textAlign: "center", mt: 5 }}>
                <StyledButton variant="contained" size="large" onClick={handleTryNow}>
                  Try Demo Assessment Now →
                </StyledButton>
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    mt: 2,
                    color: "white",
                    fontSize: "0.875rem",
                    opacity: 0.7,
                  }}
                >
                  🔒 No registration required for demo • Experience AI-powered assessments instantly
                </Typography>
              </Box>
            </Box>
          </CTASection>
        </Container>
      </HeroBackground>

      {/* Assessment Sign Up Form Dialog */}
      <FormDialog open={openForm} onClose={handleCloseForm} maxWidth="sm" fullWidth>
        <DialogTitle
          sx={{
            fontWeight: "bold",
            fontSize: "1.75rem",
            pb: 1,
            mb:4,
            color:"#fff",
            borderBottom: "1px solid rgba(59, 130, 246, 0.2)",
          }}
        >
          Start Your Assessment
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {/* Error Alert */}
          {showError && (
            <Box
              sx={{
                mb: 3,
                p: 3,
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                border: "2px solid rgba(239, 68, 68, 0.3)",
                borderRadius: "12px",
                color: "#fca5a5",
              }}
            >
              <Typography sx={{ fontWeight: 600 }}>⚠️ {errorMessage}</Typography>
            </Box>
          )}

          <form onSubmit={handleFormSubmit}>
            <Stack spacing={3} sx={{pt:3}}>
              {/* Name Field */}
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                variant="outlined"
                placeholder="John Doe"
                sx={{
                  mt:4,
                  color:"#fff",
                  "& .MuiOutlinedInput-root": {
                    color: "white",
                    backgroundColor: "rgba(0, 0, 0, 0.3)",
                    borderRadius: "12px",
                    "& fieldset": {
                      borderColor: "rgba(59, 130, 246, 0.3)",
                      borderWidth: "2px",
                    },
                    "&:hover fieldset": {
                      borderColor: "rgba(59, 130, 246, 0.5)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#3b82f6",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: "rgba(156, 163, 175, 0.8)",
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#60a5fa",
                  },
                  "& .MuiOutlinedInput-input::placeholder": {
                    color: "rgba(156, 163, 175, 0.5)",
                    opacity: 1,
                  },
                  "& .MuiInputBase-input:-webkit-autofill": {
                    WebkitBoxShadow: "0 0 0 1000px rgba(0, 0, 0, 0.3) inset",
                    WebkitTextFillColor: "white",
                  },
                }}
              />

              {/* Email Field */}
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleFormChange}
                variant="outlined"
                placeholder="john@example.com"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: "white",
                    backgroundColor: "rgba(0, 0, 0, 0.3)",
                    borderRadius: "12px",
                    "& fieldset": {
                      borderColor: "rgba(59, 130, 246, 0.3)",
                      borderWidth: "2px",
                    },
                    "&:hover fieldset": {
                      borderColor: "rgba(59, 130, 246, 0.5)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#3b82f6",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: "rgba(156, 163, 175, 0.8)",
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#60a5fa",
                  },
                  "& .MuiOutlinedInput-input::placeholder": {
                    color: "rgba(156, 163, 175, 0.5)",
                    opacity: 1,
                  },
                  "& .MuiInputBase-input:-webkit-autofill": {
                    WebkitBoxShadow: "0 0 0 1000px rgba(0, 0, 0, 0.3) inset",
                    WebkitTextFillColor: "white",
                  },
                }}
              />

              {/* Skill Level Dropdown */}
              <FormControl fullWidth>
                <InputLabel
                  sx={{
                    color: "rgba(156, 163, 175, 0.8)",
                    "&.Mui-focused": {
                      color: "#60a5fa",
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
                    backgroundColor: "rgba(0, 0, 0, 0.3)",
                    borderRadius: "12px",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(59, 130, 246, 0.3)",
                      borderWidth: "2px",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(59, 130, 246, 0.5)",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#3b82f6",
                    },
                    "& .MuiSvgIcon-root": {
                      color: "#60a5fa",
                    },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        backgroundColor: "rgba(10, 10, 10, 0.98)",
                        border: "1px solid rgba(59, 130, 246, 0.3)",
                        borderRadius: "12px",
                        mt: 1,
                        "& .MuiMenuItem-root": {
                          color: "white",
                          "&:hover": {
                            backgroundColor: "rgba(59, 130, 246, 0.1)",
                          },
                          "&.Mui-selected": {
                            backgroundColor: "rgba(59, 130, 246, 0.2)",
                            "&:hover": {
                              backgroundColor: "rgba(59, 130, 246, 0.25)",
                            },
                          },
                        },
                      },
                    },
                  }}
                >
                  <MenuItem value="easy">🟢 Easy - Beginner</MenuItem>
                  <MenuItem value="medium">🟡 Medium - Intermediate</MenuItem>
                  <MenuItem value="hard">🔴 Hard - Advanced</MenuItem>
                </Select>
              </FormControl>

              {/* Submit Button */}
              <StyledButton
                variant="contained"
                type="submit"
                fullWidth
                disabled={loading}
                size="large"
                sx={{ mt: 2 }}
              >
                {loading ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1, color: "white" }} />
                    Starting Assessment...
                  </>
                ) : (
                  "Start Assessment →"
                )}
              </StyledButton>

              <Typography
                variant="caption"
                sx={{
                  textAlign: "center",
                  color: "rgba(156, 163, 175, 0.6)",
                  fontSize: "0.875rem",
                }}
              >
                🔒 Your responses are secure and private
              </Typography>
            </Stack>
          </form>
        </DialogContent>
      </FormDialog>

      {/* Footer */}
      <Box
        sx={{
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          borderTop: "1px solid rgba(59, 130, 246, 0.15)",
          py: 6,
        }}
      >
        <Container maxWidth="lg">
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={4}
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography variant="body2" sx={{ color: "white", mb: 1, opacity: 0.7 }}>
                © 2024 Knovia AI. All rights reserved.
              </Typography>
              <Typography variant="caption" sx={{ color: "white", opacity: 0.5 }}>
                Building the future of intelligent assessments
              </Typography>
            </Box>
            <Stack direction="row" spacing={4}>
              <Link
                href="#"
                sx={{
                  color: "white",
                  opacity: 0.7,
                  textDecoration: "none",
                  "&:hover": { color: "#60a5fa", opacity: 1 },
                  transition: "all 0.3s ease",
                }}
              >
                Privacy
              </Link>
              <Link
                href="#"
                sx={{
                  color: "white",
                  opacity: 0.7,
                  textDecoration: "none",
                  "&:hover": { color: "#60a5fa", opacity: 1 },
                  transition: "all 0.3s ease",
                }}
              >
                Terms
              </Link>
              <Link
                href="#"
                sx={{
                  color: "white",
                  opacity: 0.7,
                  textDecoration: "none",
                  "&:hover": { color: "#60a5fa", opacity: 1 },
                  transition: "all 0.3s ease",
                }}
              >
                Contact
              </Link>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </>
  );
}