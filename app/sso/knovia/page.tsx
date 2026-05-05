"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Box, CircularProgress, Typography } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { useAuth } from "@/context/AuthContext";
import { KNOVIA_ROUTES } from "@/constants/ApiRoutes";
import { Suspense } from "react";

function KnoviaSsoHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { loginWithToken } = useAuth();

  const [error, setError] = useState("");
  const calledRef = useRef(false);

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    const token = searchParams.get("token");
    if (!token) {
      setError("Missing launch token. Please try again from Knovia.");
      return;
    }

    (async () => {
      try {
        const res = await fetch(KNOVIA_ROUTES.LAUNCH, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          setError(data.message || "SSO login failed. Please try again.");
          return;
        }

        // Set auth state from SSO response (cookie is set by backend)
        loginWithToken(data.user);

        // Redirect to assessment entry page
        const assessmentId = data.assessmentId;
        const solutionId = data.solutionId;

        if (assessmentId) {
          router.replace(
            `/user?assessmentId=${assessmentId}&solutionId=${solutionId}`
          );
        } else {
          router.replace("/");
        }
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "Network error. Please try again."
        );
      }
    })();
  }, [searchParams, router, loginWithToken]);

  if (error) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "#000",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          px: 3,
        }}
      >
        <ErrorOutlineIcon sx={{ fontSize: 48, color: "#ef4444" }} />
        <Typography
          variant="h6"
          sx={{ color: "#fff", fontWeight: 600, textAlign: "center" }}
        >
          SSO Login Failed
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: "rgba(255,255,255,0.6)", textAlign: "center", maxWidth: 400 }}
        >
          {error}
        </Typography>
        <Typography
          variant="caption"
          sx={{ color: "rgba(255,255,255,0.4)", mt: 2 }}
        >
          Please close this tab and retry from Knovia.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#000",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
      }}
    >
      <CircularProgress sx={{ color: "#3b82f6" }} />
      <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>
        Authenticating with Knovia...
      </Typography>
    </Box>
  );
}

export default function KnoviaSsoPage() {
  return (
    <Suspense
      fallback={
        <Box
          sx={{
            minHeight: "100vh",
            bgcolor: "#000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress sx={{ color: "#3b82f6" }} />
        </Box>
      }
    >
      <KnoviaSsoHandler />
    </Suspense>
  );
}
