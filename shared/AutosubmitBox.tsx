import { useEffect, useState } from "react";
import { Modal, Box, Button, Fade, Backdrop } from "@mui/material";

export const AutoSubmitBox = ({
  isOpen,
  onClose,
  onSubmit,
  seconds = 5,
}: {
  isOpen: boolean;
  onClose?: () => void;
  onSubmit: () => void;
  seconds?: number;
}) => {
  const [count, setCount] = useState(seconds);

  useEffect(() => {
    if (count === 0 &&  isOpen) {
      onSubmit();
      return;
    }

    const timer = setTimeout(() => {
      setCount((c) => c - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [count]);

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          timeout: 300,
          sx: { backdropFilter: "blur(4px)" },
        },
      }}
    >
      <Fade in={isOpen} timeout={300}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "40%", // md size
            minWidth: 300, // Example minWidth
            maxWidth: 500, // Example maxWidth
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 3,
          }}
        >
          {/* Countdown Circle */}
          <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
            <Box
              sx={{
                position: "relative",
                display: "flex",
                height: 80,
                width: 80,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                border: "4px solid",
                borderColor: "primary.main",
              }}
            >
              <Box
                sx={{ fontSize: 30, fontWeight: 700, color: "primary.dark" }}
              >
                {count}
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              textAlign: "center",
              fontSize: 20,
              fontWeight: 600,
              color: "text.primary",
            }}
          >
            Auto submitting your test
          </Box>

          <Box
            sx={{
              mt: 1,
              textAlign: "center",
              fontSize: 14,
              color: "text.secondary",
            }}
          >
            Please don’t refresh or close the window.
          </Box>

          {/* Manual Submit */}
          <Button
            variant="contained"
            onClick={onSubmit}
            sx={{
              mt: 3,
              width: "100%",
              borderRadius: 2,
              backgroundColor: "primary.main",
              "&:hover": {
                backgroundColor: "primary.dark",
              },
              py: 1.5,
              fontSize: 16,
              fontWeight: 500,
            }}
          >
            Submit Now
          </Button>
        </Box>
      </Fade>
    </Modal>
  );
};
/**
 * Hook for managing modal state
 * Returns: { isOpen, openModal, closeModal }
 */
export const useAutoSubmitBox = (initialState = false) => {
  const [isOpen, setIsOpen] = useState(initialState);

  return {
    isOpen,
    openModal: () => setIsOpen(true),
    closeModal: () => setIsOpen(false),
    toggleModal: () => setIsOpen((prev) => !prev),
  };
};
