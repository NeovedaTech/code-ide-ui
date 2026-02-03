import { useState } from "react";
import { Modal, Box, Button, Fade, Backdrop, Typography } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

/**
 * Reusable Error Modal Component
 * 
 * Props:
 * - isOpen (boolean): Controls modal visibility
 * - onClose (function): Callback when modal closes
 * - title (string): Error title/heading (default: "Error")
 * - message (string): Error message text
 * - details (string): Optional detailed error information
 * - buttonText (string): Text for close button (default: "Close")
 * - buttonColor (string): Color for close button (default: "#dc2626" - red-600)
 * - size (string): Modal width size - 'sm', 'md', 'lg', 'xl' (default: 'sm')
 * - closeOnBackdropClick (boolean): Close modal when clicking backdrop (default: true)
 * - showIcon (boolean): Show error icon (default: true)
 * - iconColor (string): Color of the error icon (default: "#dc2626" - red-600)
 */
export const ErrorBox = ({
  isOpen = true,
  onClose,
  title = "Error",
  message,
  details,
  buttonText = "Close",
  buttonColor = "#dc2626", // tailwind red-600 equivalent
  size = "sm",
  closeOnBackdropClick = true,
  showIcon = true,
  iconColor = "#dc2626",
}: {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  details?: string;
  buttonText?: string;
  buttonColor?: string;
  size?: "sm" | "md" | "lg" | "xl";
  closeOnBackdropClick?: boolean;
  showIcon?: boolean;
  iconColor?: string;
}) => {
  const sizeMap = {
    sm: "33%",
    md: "40%",
    lg: "60%",
    xl: "80%",
  };

  const handleBackdropClick = () => {
    if (closeOnBackdropClick) {
      onClose();
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={handleBackdropClick}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          timeout: 500,
        },
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
            outline: "none",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              px: 3,
              py: 2,
              borderBottom: "1px solid",
              borderColor: "divider",
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            {showIcon && (
              <ErrorOutlineIcon
                sx={{
                  color: iconColor,
                  fontSize: 28,
                }}
              />
            )}
            <Typography
              variant="h6"
              component="h2"
              sx={{
                fontWeight: 600,
                color: "text.primary",
              }}
            >
              {title}
            </Typography>
          </Box>

          {/* Content */}
          <Box sx={{ px: 3, py: 3 }}>
            <Typography
              variant="body1"
              sx={{
                color: "text.primary",
                mb: details ? 2 : 0,
              }}
            >
              {message}
            </Typography>

            {details && (
              <Box
                sx={{
                  bgcolor: "grey.100",
                  borderRadius: 1,
                  p: 2,
                  fontFamily: "monospace",
                  fontSize: "0.875rem",
                  color: "text.secondary",
                  overflowX: "auto",
                  maxHeight: "200px",
                  overflowY: "auto",
                }}
              >
                {details}
              </Box>
            )}
          </Box>

          {/* Footer */}
          <Box
            sx={{
              px: 3,
              py: 2,
              borderTop: "1px solid",
              borderColor: "divider",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Button
              onClick={onClose}
              variant="contained"
              sx={{
                bgcolor: buttonColor,
                color: "white",
                textTransform: "none",
                "&:hover": {
                  bgcolor: buttonColor,
                  opacity: 0.9,
                },
              }}
            >
              {buttonText}
            </Button>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};

/**
 * Hook for managing error modal state
 * Returns: { isOpen, error, showError, hideError, setErrorDetails }
 */
export const useErrorBox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<{
    title?: string;
    message: string;
    details?: string;
  }>({ message: "" });

  return {
    isOpen,
    error,
    showError: (message: string, title?: string, details?: string) => {
      setError({ message, title, details });
      setIsOpen(true);
    },
    hideError: () => {
      setIsOpen(false);
      // Clear error after modal closes
      setTimeout(() => setError({ message: "" }), 300);
    },
    setErrorDetails: (message: string, title?: string, details?: string) => {
      setError({ message, title, details });
    },
  };
};