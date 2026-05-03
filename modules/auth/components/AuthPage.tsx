"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Card,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useAuth } from "@/context/AuthContext";

const Background = styled(Box)({
  minHeight: "100vh",
  background: "#000000",
  backgroundImage: `
    radial-gradient(circle at 10% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 40%),
    radial-gradient(circle at 90% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 40%)
  `,
  display: "flex",
  alignItems: "center",
  color: "white",
});

const GlassCard = styled(Card)({
  backgroundColor: "rgba(15, 15, 15, 0.7)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  borderRadius: "24px",
  backdropFilter: "blur(20px)",
  color: "white",
});

const StyledTextField = styled(TextField)({
  marginBottom: "16px",
  "& .MuiOutlinedInput-root": {
    color: "white",
    borderRadius: "12px",
    backgroundColor: "rgba(255,255,255,0.05)",
    "& fieldset": { borderColor: "rgba(255,255,255,0.15)" },
    "&:hover fieldset": { borderColor: "rgba(59,130,246,0.4)" },
    "&.Mui-focused fieldset": { borderColor: "#3b82f6" },
  },
  "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.5)" },
  "& .MuiInputLabel-root.Mui-focused": { color: "#3b82f6" },
});

const SubmitButton = styled(Button)({
  borderRadius: "12px",
  textTransform: "none",
  fontSize: "1rem",
  fontWeight: 600,
  padding: "12px 36px",
  background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
  color: "white",
  boxShadow: "0 8px 32px rgba(59, 130, 246, 0.3)",
  "&:hover": {
    background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
    boxShadow: "0 12px 40px rgba(59, 130, 246, 0.4)",
  },
  "&:disabled": { opacity: 0.6 },
});

export default function AuthPage() {
  const { login, register, user, isLoading } = useAuth();
  const router = useRouter();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  useEffect(() => {
    if (!isLoading && user) router.replace("/");
  }, [user, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (isLoginMode) {
        await login(form.email, form.password);
      } else {
        await register(form.name, form.email, form.password);
      }
      router.replace("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Background sx={{ justifyContent: "center" }}>
        <CircularProgress sx={{ color: "#3b82f6" }} />
      </Background>
    );
  }

  return (
    <Background>
      <Container maxWidth="sm">
        <GlassCard sx={{ p: 5 }}>
          <Typography variant="h4" fontWeight={800} textAlign="center" mb={1}>
            {isLoginMode ? "Welcome Back" : "Start Journey"}
          </Typography>
          <Typography variant="body1" textAlign="center" color="rgba(255,255,255,0.5)" mb={4}>
            {isLoginMode ? "Sign in to access your assessments" : "Create an account to begin testing"}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: "12px" }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            {!isLoginMode && (
              <StyledTextField
                fullWidth
                label="Full Name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            )}
            <StyledTextField
              fullWidth
              label="Email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <StyledTextField
              fullWidth
              label="Password"
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              sx={{ mb: 4 }}
            />
            <SubmitButton variant="contained" fullWidth type="submit" disabled={loading}>
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : isLoginMode ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </SubmitButton>
          </form>

          <Button
            fullWidth
            sx={{ mt: 2, color: "rgba(255,255,255,0.5)", textTransform: "none" }}
            onClick={() => { setIsLoginMode(!isLoginMode); setError(""); }}
          >
            {isLoginMode ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </Button>
        </GlassCard>
      </Container>
    </Background>
  );
}
