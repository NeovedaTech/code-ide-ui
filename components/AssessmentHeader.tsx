"use client";
import { useAssessment } from "@/context/AssesmentContext";
import { useServerSync } from "@/hooks/AssesmentApi";
import useCountdown from "@/hooks/useCountdown";
import { formatTime } from "@/utils/formatTime";
import { AppBar, Toolbar, Box, Typography, Stack, Chip } from "@mui/material";
import { styled } from "@mui/material/styles";
import TimerIcon from "@mui/icons-material/Timer";

const StyledAppBar = styled(AppBar)({
  backgroundColor: "#ffffff",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  color: "#000",
});

const StyledToolbar = styled(Toolbar)({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0 24px",
});

const LogoBox = styled(Box)({
  width: 40,
  height: 40,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "8px",
  backgroundColor: "#f5f5f5",
  "& img": {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },
});

const CenterContent = styled(Box)({
  flex: 1,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "8px",
});

const RightContent = styled(Stack)({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: "16px",
});

const TimerChip = styled(Chip)(({ theme }) => ({
  backgroundColor: "#fff3cd",
  color: "#856404",
  fontWeight: 600,
  fontSize: "14px",
  "& .MuiChip-icon": {
    color: "#856404",
  },
}));

export default function AssessmentHeader() {
  const { currentSection, currResponse } = useAssessment();
  const { data: serverSync } = useServerSync();

  const remaining = useCountdown({
    currentTime: serverSync?.serverTime as string,
    startedAt: currResponse?.startedAt as string,
    maxTime: currentSection?.maxTime as number,
  });

  if (!serverSync || !currentSection) return null;

  return (
    <StyledAppBar position="static">
      <StyledToolbar>
        {/* Left - Logo */}
        <LogoBox sx={{ paddingX: "100px" }}>
          <img src="/logo.png" style={{ width: "200px" }} alt="logo" />
        </LogoBox>

        {/* Center - Section Info */}
        <CenterContent>
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 600, color: "#666" }}
          >
            Section:
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: "#000",
              textTransform: "capitalize",
            }}
          >
            {currentSection?.type}
          </Typography>
        </CenterContent>

        {/* Right - Timer and Info */}
        <RightContent>
          {/* Raw values (hidden or optional) */}
          <Typography
            variant="caption"
            sx={{
              display: { xs: "none", sm: "block" },
              color: "#999",
              fontSize: "12px",
            }}
          >
            Server: {serverSync?.serverTime}
          </Typography>

          <Typography
            variant="caption"
            sx={{
              display: { xs: "none", sm: "block" },
              color: "#999",
              fontSize: "12px",
            }}
          >
            Max: {currentSection?.maxTime}s
          </Typography>

          {/* Formatted Timer */}
          <TimerChip
            icon={<TimerIcon />}
            label={formatTime(remaining)}
            variant="outlined"
          />
        </RightContent>
      </StyledToolbar>
    </StyledAppBar>
  );
}
