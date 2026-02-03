import { useState } from "react";
import { Modal, Box, CircularProgress, Fade, Backdrop, Typography } from "@mui/material";

/**
 * Reusable Loading Modal Component
 * 
 * Props:
 * - isOpen (boolean): Controls modal visibility
 * - message (string): Loading message text (default: "Loading...")
 * - size (string): Modal width size - 'sm', 'md', 'lg', 'xl' (default: 'sm')
 * - spinnerSize (number): Size of the loading spinner in pixels (default: 40)
 * - spinnerColor (string): Color of the spinner (default: "#3b82f6" - blue-500)
 */
export const LoadingBox = ({
  isOpen,
  message = "Loading...",
  size = "sm",
  spinnerSize = 40,
  spinnerColor = "#3b82f6", // tailwind blue-500 equivalent
}: {
  isOpen: boolean;
  message?: string;
  size?: "sm" | "md" | "lg" | "xl";
  spinnerSize?: number;
  spinnerColor?: string;
}) => {
  const sizeMap = {
    sm: "33%",
    md: "40%",
    lg: "60%",
    xl: "80%",
  };

  return (
    <Modal
      open={isOpen}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          timeout: 500,
        },
      }}
      // Prevent closing on backdrop click or escape key
      onClose={(_, reason) => {
        if (reason === "backdropClick" || reason === "escapeKeyDown") {
          return;
        }
      }}
    >
      <Fade in={isOpen}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: sizeMap[size],
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
            outline: "none",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
          }}
        >
          {/* Spinner */}
          <CircularProgress
            size={spinnerSize}
            sx={{ color: spinnerColor }}
          />

          {/* Loading Message */}
          <Typography
            variant="h6"
            component="div"
            sx={{
              textAlign: "center",
              color: "text.primary",
            }}
          >
            {message}
          </Typography>
        </Box>
      </Fade>
    </Modal>
  );
};

/**
 * Hook for managing loading modal state
 * Returns: { isOpen, showLoading, hideLoading }
 */
export const useLoadingBox = (initialState = false) => {
  const [isOpen, setIsOpen] = useState(initialState);

  return {
    isOpen,
    showLoading: () => setIsOpen(true),
    hideLoading: () => setIsOpen(false),
    toggleLoading: () => setIsOpen((prev) => !prev),
  };
};